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
    children: children.flat().filter((child) => child !== null && child !== undefined && child !== false),
  };
}

/**
 * VNode 설계도를 바탕으로 실제 DOM 노드를 생성하는 기술자 함수
 * @param vNode 변환할 가상 노드
 */
export function createDOM(vNode: VNodeChild): Node {
  // 1. 단순한 글자나 숫자면? -> 텍스트 노드(TextNode) 생성
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    return document.createTextNode(String(vNode));
  }

  // 2. 만약 비어있는 값(null, undefined, boolean)이라면? -> 빈 텍스트 노드 생성
  if (vNode === null || vNode === undefined || typeof vNode === 'boolean') {
    return document.createTextNode('');
  }

  // 3. 태그 이름(type)이 글자(div, h1 등)인 경우
  if (typeof vNode.type === 'string') {
    // 뼈대 엘리먼트 생성
    const $el = document.createElement(vNode.type);

    // 속성(Props) 입히기
    Object.entries(vNode.props).forEach(([key, value]) => {
      // 이벤트 핸들러 처리 (on으로 시작하는 경우, 예: onclick)
      if (key.startsWith('on') && typeof value === 'function') {
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
  return document.createTextNode('');
}
