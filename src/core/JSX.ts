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

      // 텍스트 속의 번호표를 실제 객체로 분리하여 배열로 반환
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
      if (val.startsWith(REF_PREFIX)) {
        const index = parseInt(val.replace(REF_PREFIX, '').replace('__', ''));
        val = args[index];
      }
      props[attr.name] = val;
    });

    const children = Array.from(node.childNodes).map(domToVNode).flat().filter(c => c !== null && c !== '');
    return h(element.tagName.toLowerCase(), props, ...children);
  };

  const restoredNodes = Array.from(doc.body.childNodes).map(domToVNode).flat().filter(n => n !== null && n !== '');

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

  if (typeof newNode === 'object' && newNode.type !== Fragment) {
    updateAttributes($child as HTMLElement, oldNode.props, newNode.props);
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const max = Math.max(newChildren.length, oldChildren.length);
    for (let i = 0; i < max; i++) {
      updateDOM($child, newChildren[i], oldChildren[i], i);
    }
  }
}

function updateAttributes($el: HTMLElement, oldProps: any, newProps: any) {
  const allProps = { ...oldProps, ...newProps };
  Object.keys(allProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith('on')) {
        const name = key.toLowerCase().substring(2);
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
