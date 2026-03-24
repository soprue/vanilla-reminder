export type VNodeType = string | Function;

export interface VNode {
  type: VNodeType;
  props: Record<string, any>;
  children: VNodeChild[];
}

export type VNodeChild = VNode | string | number | boolean | null | undefined;

/**
 * 가상 노드(VNode)를 생성하는 함수 (Hyperscript)
 * @param type 태그 이름 또는 컴포넌트 클래스
 * @param props 속성 객체
 * @param children 자식 요소들
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
        (child) => child !== null && child !== undefined && child !== false,
      ),
  };
}

/**
 * VNode 설계도를 바탕으로 실제 DOM 노드를 생성하는 기술자 함수
 * @param vNode 변환할 가상 노드
 */
export function createDOM(vNode: VNodeChild): Node {
  // 1. 단순한 글자나 숫자면? -> 텍스트 노드(TextNode) 생성
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 2. 만약 비어있는 값(null, undefined, boolean)이라면? -> 빈 텍스트 노드 생성
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 3. 태그 이름(type)이 글자(div, h1 등)인 경우
  if (typeof vNode.type === "string") {
    // 뼈대 엘리먼트 생성
    const $el = document.createElement(vNode.type);

    // 속성(Props) 입히기
    Object.entries(vNode.props).forEach(([key, value]) => {
      // 이벤트 핸들러 처리 (on으로 시작하는 경우, 예: onclick)
      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.toLowerCase().substring(2); // 'onclick' -> 'click'
        $el.addEventListener(eventName, value);
      } else {
        $el.setAttribute(key, value);
      }
    });

    // 자식들(Children)을 하나씩 진짜 DOM으로 만들어서 내 품에 안기기 (재귀)
    vNode.children.forEach((child) => {
      $el.appendChild(createDOM(child));
    });

    return $el;
  }

  // 4. 만약 type이 함수(컴포넌트)라면? (나중에 구현할 단계입니다)
  return document.createTextNode("");
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

  // 1. 노드가 새로 추가된 경우
  if (oldVNode === undefined) {
    $parent.appendChild(createDOM(newVNode));
    return;
  }

  // 2. 노드가 삭제된 경우
  if (newVNode === undefined) {
    $parent.removeChild($child);
    return;
  }

  // 3. 노드 타입이 변경된 경우 (완전히 다른 태그나 텍스트)
  if (isChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createDOM(newVNode), $child);
    return;
  }

  // 4. 같은 타입의 엘리먼트인 경우, 자식들을 비교
  if (
    typeof newVNode === "object" &&
    newVNode !== null &&
    typeof oldVNode === "object" &&
    oldVNode !== null
  ) {
    // 속성 업데이트 추가
    updateAttributes($child as HTMLElement, oldVNode.props, newVNode.props);

    const newChildren = newVNode.children;
    const oldChildren = oldVNode.children;
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateDOM($child, newChildren[i], oldChildren[i], i);
    }
  }
}

/**
 * 속성 업데이트 (이벤트 핸들러 포함)
 */
function updateAttributes(
  $el: HTMLElement,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  // 이전 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key.startsWith("on")) {
        const eventName = key.toLowerCase().substring(2);
        $el.removeEventListener(eventName, oldProps[key]);
      } else {
        $el.removeAttribute(key);
      }
    }
  });

  // 새로운 속성 설정
  Object.keys(newProps).forEach((key) => {
    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith("on")) {
        const eventName = key.toLowerCase().substring(2);
        if (oldProps[key]) {
          $el.removeEventListener(eventName, oldProps[key]);
        }
        $el.addEventListener(eventName, newProps[key]);
      } else {
        $el.setAttribute(key, newProps[key]);
      }
    }
  });
}

/**
 * 두 노드가 변경되었는지 확인하는 헬퍼 함수입니다.
 * 1. 데이터 타입이 다르면 변경됨 (true)
 * 2. 문자열이나 숫자인데 값이 다르면 변경됨 (true)
 * 3. 객체(VNode)인데 태그 이름(type)이 다르면 변경됨 (true)
 */
function isChanged(node1: VNodeChild, node2: VNodeChild) {
  if (typeof node1 !== typeof node2) return true;

  if (typeof node1 === "string" || typeof node1 === "number")
    return node1 !== node2;

  if (
    typeof node1 === "object" &&
    node1 !== null &&
    typeof node2 === "object" &&
    node2 !== null
  )
    return node1.type !== node2.type;

  return false;
}
