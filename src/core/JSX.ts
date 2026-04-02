export const Fragment = Symbol('Fragment');

export type VNodeType = string | Function | typeof Fragment;

export interface VNode {
  type: VNodeType;
  props: Record<string, any>;
  children: any[];
}

export type VNodeChild = VNode | string | number | boolean | null | undefined;

const REF_PREFIX = '__VAL_REF_';

export function h(type: VNodeType, props: Record<string, any> | null, ...children: any[]): VNode {
  return {
    type,
    props: props || {},
    children: children.flat().filter(c => c !== null && c !== undefined && c !== false),
  };
}

export function jsx(strings: TemplateStringsArray, ...args: any[]): VNode {
  const htmlString = strings.reduce((acc, str, i) => {
    const replacement = i < args.length ? `${REF_PREFIX}${i}__` : '';
    return acc + str + replacement;
  }, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const domToVNode = (node: Node): any => {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.nodeValue || '';
      if (!content.includes(REF_PREFIX)) return content;

      const regex = new RegExp(`(${REF_PREFIX}[0-9]+__)`, 'g');
      return content.split(regex).map(part => {
        if (part.startsWith(REF_PREFIX)) {
          const index = parseInt(part.replace(REF_PREFIX, '').replace('__', ''));
          return args[index];
        }
        return part;
      }).filter(p => p !== '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const props: Record<string, any> = {};
    Array.from(element.attributes).forEach(attr => {
      let val: any = attr.value;
      const regex = new RegExp(`${REF_PREFIX}([0-9]+)__`, 'g');
      
      const matches = val.match(regex);
      if (matches && matches.length === 1 && matches[0] === val) {
        const index = parseInt(matches[0].replace(REF_PREFIX, '').replace('__', ''));
        val = args[index];
      } else if (matches) {
        val = val.replace(regex, (match: string) => {
          const index = parseInt(match.replace(REF_PREFIX, '').replace('__', ''));
          return args[index];
        });
      }
      props[attr.name] = val;
    });

    const children = Array.from(node.childNodes).map(domToVNode).flat().filter(c => c !== null && c !== '');
    return h(element.tagName.toLowerCase(), props, ...children);
  };

  // 공백만 있는 텍스트 노드는 제거하여 단일 루트 유지를 보장함
  const restoredNodes = Array.from(doc.body.childNodes)
    .map(domToVNode)
    .flat()
    .filter(n => {
      if (typeof n === 'string' && n.trim() === '') return false;
      return n !== null && n !== '';
    });

  if (restoredNodes.length === 1 && typeof restoredNodes[0] === 'object' && !Array.isArray(restoredNodes[0])) {
    return restoredNodes[0] as VNode;
  }
  return h(Fragment, null, ...restoredNodes);
}

export default jsx;

export function createDOM(vNode: any): Node {
  if (typeof vNode === 'string' || typeof vNode === 'number') return document.createTextNode(String(vNode));
  if (!vNode || typeof vNode === 'boolean') return document.createTextNode('');
  
  if (vNode.type === Fragment) {
    const frag = document.createDocumentFragment();
    vNode.children.forEach((c: any) => frag.appendChild(createDOM(c)));
    return frag;
  }

  const $el = document.createElement(vNode.type);
  Object.entries(vNode.props || {}).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      $el.addEventListener(key.toLowerCase().substring(2), value as EventListener);
    } else {
      $el.setAttribute(key === 'className' ? 'class' : key, String(value));
    }
  });

  vNode.children.forEach((c: any) => $el.appendChild(createDOM(c)));
  return $el;
}

export function updateDOM($parent: Node, newNode: any, oldNode: any, index = 0) {
  const $child = $parent.childNodes[index];

  if (oldNode === undefined) {
    if (newNode) $parent.appendChild(createDOM(newNode));
    return;
  }

  if (!newNode) {
    if ($child) $parent.removeChild($child);
    return;
  }

  if (isChanged(newNode, oldNode)) {
    $parent.replaceChild(createDOM(newNode), $child);
    return;
  }

  if (typeof newNode === 'object') {
    // Fragment와 일반 요소를 구분하여 자식 업데이트 대상 결정
    const isFrag = newNode.type === Fragment;
    const $target = isFrag ? $parent : ($child as HTMLElement);

    if (!isFrag) {
      updateAttributes($target, oldNode.props, newNode.props);
    }

    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const max = Math.max(newChildren.length, oldChildren.length);
    
    for (let i = 0; i < max; i++) {
      // Fragment인 경우 인덱스 계산이 복잡할 수 있으나, 현재 구조에서는 단일 루트를 선호함
      updateDOM($target, newChildren[i], oldChildren[i], i);
    }
  }
}

function updateAttributes($target: Node, oldProps: any, newProps: any) {
  if (!($target instanceof HTMLElement)) return;
  const $el = $target;
  const allProps = { ...oldProps, ...newProps };
  Object.keys(allProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      const name = key.toLowerCase().startsWith('on') ? key.toLowerCase().substring(2) : key;
      if (key.toLowerCase().startsWith('on')) {
        if (oldProps[key]) $el.removeEventListener(name, oldProps[key]);
        if (newProps[key]) $el.addEventListener(name, newProps[key]);
      } else if (!(key in newProps)) {
        $el.removeAttribute(key === 'className' ? 'class' : key);
      } else {
        $el.setAttribute(key === 'className' ? 'class' : key, String(newProps[key]));
      }
    }
  });
}

function isChanged(n1: any, n2: any) {
  if (typeof n1 !== typeof n2) return true;
  if (typeof n1 === 'string' || typeof n1 === 'number') return n1 !== n2;
  return n1.type !== n2.type;
}
