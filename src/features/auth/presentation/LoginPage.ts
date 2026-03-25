import { Component, ComponentProps } from '@core/Component';
import jsx, { createDOM } from '@core/JSX';

export default class LoginPage extends Component<ComponentProps> {
  constructor(target: HTMLElement, props: ComponentProps) {
    super(target, props);
  }

  render() {
    return jsx`
          <div>
            <h1>Login Page</h1>
          </div>
    `;
  }
}
