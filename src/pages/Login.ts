import { Component } from '@src/Component';

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
            <button id="login-google">Login with Google</button>
          </div>
        `;
      document.getElementById('login-google')?.addEventListener('click', () => {
        // 여기에 구글 로그인 로직을 구현
        console.log('Google 로그인 시도');
      });
    }
  }
}
