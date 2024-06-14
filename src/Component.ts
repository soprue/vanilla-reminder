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
    this.state = { ...this.state, ...newState };
    this.componentWillUpdate();
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

  render() {
    // UI 렌더링 함수
  }
}
