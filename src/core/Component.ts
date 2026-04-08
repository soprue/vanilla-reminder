import { updateDOM, VNodeChild } from './JSX';
import { Store } from './Store';

export interface ComponentProps {
  [key: string]: unknown;
}

export type ComponentState = object;

/**
 * 프레임워크의 모든 UI 컴포넌트가 상속받는 최상위 베이스 클래스입니다.
 * 상태 관리, 가상 DOM 기반 리렌더링, 생명주기 메서드를 제공합니다.
 */
export class Component<
  P extends ComponentProps = ComponentProps,
  S extends ComponentState = ComponentState
> {
  protected target: HTMLElement;
  protected props: P;
  protected state: S;
  private oldVNode: VNodeChild;
  private unsubs: (() => void)[] = [];
  private eventHandlers: Array<{ eventType: string; handler: (event: Event) => void; useCapture: boolean }> = [];

  constructor(target: HTMLElement, props: P) {
    this.target = target;
    this.props = props;
    this.state = {} as S;

    this.init();
    this.componentWillMount();
    this.mount();
    this.setEvent(); // 이벤트 위임 등록 추가
    this.componentDidMount();
  }

  /**
   * 컴포넌트 초기화 로직을 수행합니다. (주로 초기 state 설정)
   * constructor 실행 시 가장 먼저 호출됩니다.
   */
  init() {}

  /**
   * 이벤트 위임 방식으로 이벤트를 등록합니다.
   * 자식 클래스에서 오버라이드하여 addEvent를 사용합니다.
   */
  setEvent() {}

  /**
   * 이벤트를 위임 등록하는 헬퍼 메서드
   * @param eventType 이벤트 종류 (click, input, keydown 등)
   * @param selector 대상 요소 선택자
   * @param callback 실행할 콜백 함수
   * @param useCapture 캡처링 사용 여부 (기본값 false)
   */
  addEvent(eventType: string, selector: string, callback: Function, useCapture = false) {
    const handler = (event: Event) => {
      const target = event.target as HTMLElement;
      const closest = target.closest(selector);
      if (closest) {
        callback(event);
      }
    };
    this.target.addEventListener(eventType, handler, useCapture);
    this.eventHandlers.push({ eventType, handler, useCapture });
  }

  /**
   * 전역 스토어를 구독합니다. 스토어 상태 변경 시 자동으로 컴포넌트가 리렌더링됩니다.
   * @param store 구독할 Store 인스턴스
   */
  subscribe(store: Store<any>) {
    const unsub = store.subscribe(() => {
      this.setState({} as Partial<S>);
    });
    this.unsubs.push(unsub);
  }

  /**
   * 컴포넌트의 상태를 업데이트하고 UI를 부분적으로 다시 그립니다.
   * @param newState 업데이트할 상태의 일부
   * @param callback 렌더링 완료 후 실행될 콜백 함수
   */
  setState(newState: Partial<S>, callback?: () => void) {
    this.componentWillUpdate();

    this.state = { ...this.state, ...newState };

    const newVNode = this.render();
    if (newVNode) {
      updateDOM(this.target, newVNode, this.oldVNode);
      this.oldVNode = newVNode;
    }

    this.componentDidUpdate();
    if (callback) callback();
  }

  /**
   * 컴포넌트를 명시적으로 제거하고 자원을 해제합니다.
   * 등록된 모든 전역 상태 구독을 취소합니다.
   */
  unmount() {
    this.componentWillUnmount();
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    
    // 등록된 모든 이벤트 핸들러 제거
    this.eventHandlers.forEach(({ eventType, handler, useCapture }) => {
      this.target.removeEventListener(eventType, handler, useCapture);
    });
    this.eventHandlers = [];

    this.target.innerHTML = '';
  }

  /**
   * 실제 DOM에 컴포넌트의 초기 UI를 부착하는 내부 메서드입니다.
   */
  private mount() {
    this.target.innerHTML = '';
    const newVNode = this.render();

    if (newVNode) {
      updateDOM(this.target, newVNode, undefined);
      this.oldVNode = newVNode;
    }
  }

  /**
   * 컴포넌트의 UI 구조를 정의합니다. 
   * 자식 클래스에서 반드시 구현하여 jsx`...` 형태의 VNode를 반환해야 합니다.
   */
  render(): VNodeChild {
    return null;
  }

  /* -------------------------------------------------------------------------- */
  /* 생명주기 메서드 (Lifecycle Hooks)                                            */
  /* 자식 클래스에서 필요에 따라 오버라이드하여 사용합니다.                             */
  /* -------------------------------------------------------------------------- */

  /** 마운트 직전에 실행됩니다. */
  componentWillMount() {}

  /** 실제 DOM에 부착된 직후 실행됩니다. (이벤트 바인딩, API 호출 등) */
  componentDidMount() {}

  /** 상태 변경으로 인한 업데이트 직전에 실행됩니다. */
  componentWillUpdate() {}

  /** 업데이트 및 리렌더링이 완료된 직후 실행됩니다. */
  componentDidUpdate() {}

  /** 컴포넌트가 제거되기 직전에 실행됩니다. (정리 작업 등) */
  componentWillUnmount() {}
}
