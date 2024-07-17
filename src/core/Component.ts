export interface ComponentProps {
  [key: string]: any;
}

export interface ComponentState {
  [key: string]: any;
}

export class Component {
  props: ComponentProps;
  state: ComponentState;

  constructor(props: ComponentProps) {
    this.props = props;
    this.state = {};
    this.componentWillMount();
    this.render();
    this.componentDidMount();
  }

  setState(newState: ComponentState) {
    this.componentWillUpdate();
    for (let key in newState) {
      if (newState.hasOwnProperty(key)) {
        this.state[key] = newState[key];
      }
    }
    this.render();
    this.componentDidUpdate();
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
