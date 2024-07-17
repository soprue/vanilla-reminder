import { Router } from '@core/Router';
import { Component, ComponentProps } from '@core/Component';

export default class MainPage extends Component {
  constructor(props: ComponentProps) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    document.getElementById('root')?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.id === 'go-to-login') {
        const router = Router.getInstance();
        router.navigate('/login');
      } else if (target.id === 'increment') {
        this.setState({ count: this.state.count + 1 });
      }
    });
  }

  render() {
    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = `
        <div>
          <button id="go-to-login">Go to Login</button>
        </div>
        <div>
          <p>Count: ${this.state.count}</p>
          <button id="increment">Click me!</button>
        </div>
      `;
    }
  }
}
