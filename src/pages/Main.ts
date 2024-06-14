import { Component, ComponentProps } from '../Component';

export default class MainPage extends Component {
  constructor(props: ComponentProps) {
    super(props);
    this.state = { count: 0 };
  }

  componentWillMount() {
    console.log('MyComponent will mount');
  }

  componentDidMount() {
    console.log('MyComponent did mount');
  }

  componentWillUpdate() {
    console.log('MyComponent will update');
  }

  componentDidUpdate() {
    console.log('MyComponent did update');
  }

  setState(newState: any) {
    this.componentWillUpdate();
    this.state = { ...this.state, ...newState };
    this.render();
    this.componentDidUpdate();
  }

  render() {
    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = `
        <div>
          <p>Count: ${this.state.count}</p>
          <button id="increment">Click me!</button>
        </div>
      `;
      document.getElementById('increment')?.addEventListener('click', () => {
        this.setState({ count: this.state.count + 1 });
      });
    }
  }
}
