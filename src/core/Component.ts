import { updateDOM, VNodeChild } from './JSX';
import { Store } from './Store';

export interface ComponentProps {
  [key: string]: unknown;
}

export type ComponentState = object;

/**
 * 모든 컴포넌트의 기반이 되는 최상위 클래스
 */
export class Component<
  P extends ComponentProps = ComponentProps,
  S extends ComponentState = ComponentState
> {
  target: HTMLElement;
  props: P;
  state: S;
  private oldVNode: VNodeChild;
  private unsubs: (() => void)[] = [];

  constructor(target: HTMLElement, props: P) {
    this.target = target;
    this.props = props;
    this.state = {} as S;

    // 1. 초기화 로직 실행
    this.init();

    // 2. 마운트 시작 전 생명 주기 호출
    this.componentWillMount();

    // 3. 최초 렌더링 실행
    this.mount();

    // 4. 마운트 완료 후 생명 주기 호출
    this.componentDidMount();
  }

  /**
   * 컴포넌트 초기 설정 (State 초기화 등)
   */
  init() {}

  /**
   * 전역 스토어를 구독함. 상태가 변하면 리렌더링됨.
   */
  subscribe(store: Store<any>) {
    const unsub = store.subscribe(() => {
      // 단순히 리렌더링을 트리거하기 위해 빈 객체로 setState 호출
      this.setState({} as Partial<S>);
    });
    this.unsubs.push(unsub);
  }

  /**
   * 실제 DOM에 컴포넌트를 부착하는 내부 메서드
   */
  private mount() {
    // 기존 내용을 비우고 새로 그림
    this.target.innerHTML = '';
    const newVNode = this.render();

    if (newVNode) {
      updateDOM(this.target, newVNode, undefined);
      this.oldVNode = newVNode;
    }
  }

  /**
   * 상태를 변경하고 UI를 업데이트함
   */
  setState(newState: Partial<S>, callback?: () => void) {
    // 업데이트 전 생명 주기
    this.componentWillUpdate();

    this.state = { ...this.state, ...newState };

    // 가상 DOM 비교 및 부분 업데이트
    const newVNode = this.render();
    if (newVNode) {
      updateDOM(this.target, newVNode, this.oldVNode);
      this.oldVNode = newVNode;
    }

    // 업데이트 완료 후 생명 주기
    this.componentDidUpdate();
    if (callback) callback();
  }

  /**
   * 컴포넌트를 명시적으로 제거할 때 호출
   */
  unmount() {
    console.log(`🧹 [Component] ${this.constructor.name} 언마운트 및 청소 시작`);
    this.componentWillUnmount();
    // 구독 해제 처리
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    this.target.innerHTML = "";
  }

  // --- 생명 주기 메서드 (자식에서 오버라이드하여 사용) ---

  componentWillMount() {}
  componentDidMount() {}
  componentWillUpdate() {}
  componentDidUpdate() {}
  componentWillUnmount() {}

  /**
   * UI 구조를 정의하는 핵심 메서드.
   * 자식 컴포넌트에서 반드시 오버라이드하여 jsx`...`를 반환해야 합니다.
   */
  render(): VNodeChild {
    return null;
  }
}
