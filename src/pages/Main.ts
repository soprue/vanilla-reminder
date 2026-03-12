import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';

interface MainPageState {
  count: number;
  showList: boolean;
}

export default class MainPage extends Component<ComponentProps, MainPageState> {
  private router: Router;

  constructor(props: ComponentProps) {
    super(props);
    this.state = { count: 1, showList: false };
    this.router = Router.getInstance();
  }

  goToLogin() {
    this.router.navigate('/login');
  }

  incrementCount() {
    this.setState({ count: this.state.count + 1 });
  }

  toggleList() {
    this.setState({ showList: !this.state.showList });
  }

  render() {
    const count = this.state?.count ?? 0;
    const showList = this.state?.showList ?? false;
    const items = ['Apple', 'Banana', 'Cherry'];

    const contents = jsx`
      <div>
        <button onclick="${() => this.goToLogin()}">Go to Login</button>
        <div>
          <p>Count: ${count}</p>
          <button onclick="${() => this.incrementCount()}">
            Click me!
          </button>
        </div>
        <div>
          <button onclick="${() => this.toggleList()}">
            ${showList ? 'Hide' : 'Show'} List
          </button>
          ${
            showList
              ? jsx`<ul>${items.map((item) => `<li>${item}</li>`)}</ul>`
              : null
          }
        </div>
      </div>
    `;

    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = '';
      element.appendChild(contents);
    }
  }
}
