export const Fragment = Symbol('Fragment');

export type VNodeType = string | Function | typeof Fragment;

export interface VNode {
  type: VNodeType;
  props: Record<string, any>;
  children: VNodeChild[];
}

export type VNodeChild = VNode | string | number | boolean | null | undefined;

/**
 * 가상 노드(VNode)를 생성하는 함수 (Hyperscript)
 */
export function h(
  type: VNodeType,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode {
  return {
    type,
    props: props || {},
    children: children
      .flat()
      .filter(
        (child) => child !== null && child !== undefined && child !== false
      ),
  };
}

/**
 * 템플릿 리터럴을 VNode로 변환하는 태그 함수
 */
export function jsx(strings: TemplateStringsArray, ...args: any[]): VNode {
  const REF_PREFIX = '__VAL_REF_';

  // 1. Placeholder 전략: 함수, VNode, 배열을 토큰으로 치환
  const htmlString = strings.reduce((acc, str, i) => {
    const arg = args[i];
    let replacement = '';

    if (arg === undefined || arg === null || arg === false) {
      replacement = '';
    } else if (typeof arg === 'string' || typeof arg === 'number') {
      replacement = String(arg);
    } else {
      // 객체나 함수는 참조 번호를 달아 토큰화
      replacement = `${REF_PREFIX}${i}__`;
    }

    return acc + str + replacement;
  }, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // 2. 모든 루트 노드 읽기
  const nodes = Array.from(doc.body.childNodes)
    .map(domToVNode)
    .filter((node) => node !== null && node !== '');

  if (nodes.length === 0) return h(Fragment, null);

  // 3. 토큰을 실제 값(함수, VNode, 배열)으로 복구
  const restoreReferences = (node: VNodeChild): VNodeChild => {
    if (typeof node !== 'object' || node === null) {
      // 텍스트 노드 내의 토큰 복구 (자식으로 들어온 경우)
      if (typeof node === 'string' && node.trim().startsWith(REF_PREFIX)) {
        const index = parseInt(node.replace(REF_PREFIX, '').replace('__', ''));
        return args[index];
      }
      return node;
    }

    const vNode = node as VNode;

    // Props 내의 토큰 복구 (이벤트 핸들러 등)
    Object.entries(vNode.props).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().startsWith(REF_PREFIX)) {
        const index = parseInt(value.replace(REF_PREFIX, '').replace('__', ''));
        vNode.props[key] = args[index];
      }
    });

    // 자식 노드 내의 토큰 복구 (재귀)
    vNode.children = vNode.children
      .map((child) => {
        if (typeof child === "string" && child.trim().startsWith(REF_PREFIX)) {
          const index = parseInt(
            child.trim().replace(REF_PREFIX, "").replace("__", ""),
          );
          return args[index]; // VNode나 배열이 돌아옴
        }
        if (typeof child === "object" && child !== null) {
          return restoreReferences(child);
        }
        return child;
      })
      .flat() // 배열로 들어온 자식들(map 등)을 펼침
      .filter((c) => c !== null && c !== undefined && c !== false);

    return vNode;
  };

  const restoredNodes = nodes.map(restoreReferences);

  // 4. 루트가 여러 개면 Fragment로 감싸고, 하나면 그대로 반환
  if (restoredNodes.length === 1 && typeof restoredNodes[0] === 'object') {
    return restoredNodes[0] as VNode;
  }

  return h(Fragment, null, ...restoredNodes);
}

/**
 * 실제 DOM 노드를 가상 노드(VNode)로 변환하는 내부 함수
 */
function domToVNode(node: Node): VNodeChild {
  if (node.nodeType === Node.TEXT_NODE) {
    // 공백 손실을 방지하기 위해 trim()을 제거하되,
    // 의미 없는 줄바꿈만 있는 노드는 null로 필터링 (나중에 filter에서 걸러짐)
    const content = node.nodeValue;
    return content && content.replace(/\s/g, '').length > 0 ? content : '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const props: Record<string, any> = {};

  Array.from(element.attributes).forEach((attr) => {
    props[attr.name] = attr.value;
  });

  const children = Array.from(element.childNodes)
    .map(domToVNode)
    .filter((child) => child !== null && child !== '');

  return h(element.tagName.toLowerCase(), props, ...children);
}

export default jsx;

/**
 * VNode를 실제 DOM 노드로 생성
 */
export function createDOM(vNode: VNodeChild): Node {
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    return document.createTextNode(String(vNode));
  }

  if (vNode === null || vNode === undefined || typeof vNode === 'boolean') {
    return document.createTextNode('');
  }

  // Fragment 처리: DocumentFragment 사용
  if (vNode.type === Fragment) {
    const $fragment = document.createDocumentFragment();
    vNode.children.forEach((child) => {
      $fragment.appendChild(createDOM(child));
    });
    return $fragment;
  }

  if (typeof vNode.type === 'string') {
    const $el = document.createElement(vNode.type);

    Object.entries(vNode.props).forEach(([key, value]) => {
      // 이벤트 핸들러 처리
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.toLowerCase().substring(2);
        $el.addEventListener(eventName, value);
      } else {
        $el.setAttribute(key === 'className' ? 'class' : key, value);
      }
    });

    vNode.children.forEach((child) => {
      $el.appendChild(createDOM(child));
    });

    return $el;
  }

  return document.createTextNode('');
}

/**
 * 가상 DOM 비교 및 실제 DOM 반영 (Reconciliation)
 */
export function updateDOM(
  $parent: Node,
  newVNode: VNodeChild,
  oldVNode: VNodeChild,
  index = 0
) {
  const $child = $parent.childNodes[index];

  if (oldVNode === undefined) {
    $parent.appendChild(createDOM(newVNode));
    return;
  }

  if (newVNode === undefined) {
    $parent.removeChild($child);
    return;
  }

  if (isChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createDOM(newVNode), $child);
    return;
  }

  if (
    typeof newVNode === 'object' &&
    newVNode !== null &&
    typeof oldVNode === 'object' &&
    oldVNode !== null
  ) {
    // Fragment는 실제 엘리먼트가 없으므로 속성 업데이트 제외
    if (newVNode.type !== Fragment) {
      updateAttributes($child as HTMLElement, oldVNode.props, newVNode.props);
    }

    const newChildren = newVNode.children;
    const oldChildren = oldVNode.children;
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      // Fragment의 경우 $parent를 직접 부모로 사용 (단순 구현)
      const targetParent = newVNode.type === Fragment ? $parent : $child;
      updateDOM(targetParent, newChildren[i], oldChildren[i], i);
    }
  }
}

function updateAttributes(
  $el: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        const eventName = key.toLowerCase().substring(2);
        $el.removeEventListener(eventName, oldProps[key]);
      } else {
        $el.removeAttribute(key === 'className' ? 'class' : key);
      }
    }
  });

  Object.keys(newProps).forEach((key) => {
    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith('on')) {
        const eventName = key.toLowerCase().substring(2);
        if (oldProps[key]) $el.removeEventListener(eventName, oldProps[key]);
        $el.addEventListener(eventName, newProps[key]);
      } else {
        $el.setAttribute(key === 'className' ? 'class' : key, newProps[key]);
      }
    }
  });
}

function isChanged(node1: VNodeChild, node2: VNodeChild) {
  if (typeof node1 !== typeof node2) return true;
  if (typeof node1 === 'string' || typeof node1 === 'number')
    return node1 !== node2;
  if (
    typeof node1 === 'object' &&
    node1 !== null &&
    typeof node2 === 'object' &&
    node2 !== null
  )
    return node1.type !== node2.type;
  return false;
}
