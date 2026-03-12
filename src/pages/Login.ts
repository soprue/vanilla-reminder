import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';

export default class LoginPage extends Component<ComponentProps> {
  constructor(props: ComponentProps) {
    super(props);
  }

  render() {
    const contents = jsx`
          <div>
            <h1>Login Page</h1>
          </div>
    `;
    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = '';
      element.appendChild(contents);
    }
  }
}
