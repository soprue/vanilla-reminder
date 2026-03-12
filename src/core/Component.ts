export interface ComponentProps {
  [key: string]: unknown;
}

export interface ComponentState {
  [key: string]: unknown;
}

export class Component<P = ComponentProps, S = ComponentState> {
  props: P;
  state: S;

  constructor(props: P) {
    this.props = props;
    this.state = {} as S; // 초기 상태 설정
    this.componentWillMount();
    this.render();
    this.componentDidMount();
  }

  setState(newState: Partial<S>, callback?: () => void) {
    this.componentWillUpdate();
    this.state = { ...this.state, ...newState };

    Promise.resolve().then(() => {
      this.render();
      this.componentDidUpdate();
      if (callback) callback();
    });
  }

  componentWillMount() {
    // 컴포넌트가 마운트 되기 전 호출
  }

  componentDidMount() {
    // 컴포넌트가 마운트 된 후 호출
  }

  componentWillUpdate() {
    // 컴포넌트가 업데이트 되기 전 호출
  }

  componentDidUpdate() {
    // 컴포넌트가 업데이트 된 후 호출
  }

  componentWillUnmount() {
    // 컴포넌트가 언마운트 되기 전에 호출
    // 여기에 리소스 해제 로직 추가
  }

  render() {
    // UI 렌더링 함수
  }
}
