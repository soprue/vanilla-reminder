import { Component } from '@core/Component';

export default class LoginPage extends Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = `
          <div>
            <h1>Login Page</h1>
          </div>
        `;
    }
  }
}
