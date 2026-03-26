import { Component, ComponentProps } from '@core/Component';
import jsx, { createDOM } from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';

export default class LoginPage extends Component<ComponentProps> {
  init() {
    this.subscribe(authStore);
  }

  handleLogin() {
    authStore.login('홍길동');
  }

  handleLogout() {
    authStore.logout();
  }

  render() {
    const { isLoggedIn, user } = authStore.getState();

    return jsx`
          <div>
            <h1>Login Page</h1>
            ${
              isLoggedIn
                ? jsx`<div><p>${
                    user?.name
                  }님 환영합니다.</p><button onclick="${this.handleLogout.bind(
                    this
                  )}">로그아웃</button></div>`
                : jsx`<div><p>로그인이 필요합니다.</p><button onclick="${this.handleLogin.bind(
                    this
                  )}">로그인</button></div>`
            }
          </div>
    `;
  }
}
