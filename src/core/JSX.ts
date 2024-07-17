const TEMP = {
  PREFIX: 'tempindex:',
  REGEX: /tempindex:(\d+):/,
  SEPARATOR_REGEX_G: /(tempindex:\d+:)/g,
};

type JsxArg = Node | string | null | boolean | JsxArg[];

/**
 * 속성 이름에 따라 요소에 이벤트 핸들러를 바인딩합니다.
 * @param {string} name - 속성의 이름입니다.
 * @param {any} value - 이벤트 리스너 함수입니다.
 * @param {Element} element - 이벤트 핸들러가 바인딩 될 DOM 요소입니다.
 */
function bindEventHandler(name: string, value: any, element: Element) {
  if (typeof value === 'function') {
    element.addEventListener(name.replace('on', '').toLowerCase(), value);
    element.removeAttribute(name);
  }
}

/**
 * 문자열을 사용해 DocumentFragment를 생성합니다.
 * @param {string} [str] - DocumentFragment에 추가될 텍스트입니다.
 * @returns {DocumentFragment} 생성된 DocumentFragment를 반환합니다.
 */
function createTextFragment(str?: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (str) fragment.appendChild(document.createTextNode(str));
  return fragment;
}

/**
 * JsxArg 타입의 인자를 Node로 변환하여 DocumentFragment에 추가합니다.
 * @param {JsxArg} arg - 변환될 JsxArg 인자입니다.
 * @returns {DocumentFragment} Node 요소가 포함된 DocumentFragment를 반환합니다.
 */
function convertJsxArgToNode(arg: JsxArg): DocumentFragment {
  const fragment = document.createDocumentFragment();

  if (arg instanceof Node) {
    fragment.appendChild(arg);
  } else if (Array.isArray(arg)) {
    arg.forEach((item) => {
      if (item instanceof Node) {
        fragment.appendChild(item);
      } else {
        let container = document.createElement('div');
        container.innerHTML = item as string;
        while (container.firstChild) {
          fragment.appendChild(container.firstChild);
        }
      }
    });
  } else if (arg !== null && arg !== false) {
    fragment.appendChild(createTextFragment(String(arg)));
  }

  return fragment;
}

/**
 * 텍스트 노드를 처리하여 템플릿 변수를 실제 값으로 대체합니다.
 * @param {Node} node - 처리될 텍스트 노드입니다.
 * @param {JsxArg[]} args - 템플릿 변수에 해당하는 실제 값들의 배열입니다.
 */
function processTextNode(node: Node, args: JsxArg[]): void {
  if (
    node.nodeType !== Node.TEXT_NODE ||
    !node.nodeValue?.includes(TEMP.PREFIX)
  )
    return;

  const texts = node.nodeValue.split(TEMP.SEPARATOR_REGEX_G);
  const fragment = document.createDocumentFragment();

  texts.forEach((text) => {
    const tempindex = TEMP.REGEX.exec(text)?.[1];
    if (!tempindex) {
      fragment.appendChild(document.createTextNode(text));
    } else {
      fragment.appendChild(convertJsxArgToNode(args[Number(tempindex)]));
    }
  });

  node.parentNode?.replaceChild(fragment, node);
}

/**
 * TemplateStringsArray와 관련 인자들을 사용하여 JSX 형태의 Element를 생성합니다.
 * @param {TemplateStringsArray} strings - 문자열 리터럴 배열입니다.
 * @param {...any[]} args - 각 문자열 리터럴 사이에 삽입될 인자들입니다.
 * @returns {Element} 생성된 Element를 반환합니다.
 */
const jsx = (strings: TemplateStringsArray, ...args: any[]): Element => {
  let template = document.createElement('div');

  template.innerHTML = strings
    .map((str, i) => `${str}${i < args.length ? `${TEMP.PREFIX}${i}:` : ''}`)
    .join('');

  let walker = document.createNodeIterator(template, NodeFilter.SHOW_ALL);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node, args);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let element = node as Element;
      Array.from(element.attributes).forEach(({ name, value }) => {
        if (value.includes(TEMP.PREFIX)) {
          const match = TEMP.REGEX.exec(value);
          if (match)
            bindEventHandler(name, args[parseInt(match[1], 10)], element);
        }
      });
    }
  }

  return template;
};

export default jsx;
