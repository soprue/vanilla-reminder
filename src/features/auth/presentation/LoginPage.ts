import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';
import { Router } from '@src/core/Router';

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

  handleGoMain() {
    Router.getInstance().navigate('/');
  }

  render() {
    const { isLoggedIn, user } = authStore.getState();

    return jsx`
      <div class="login-wrapper">
        <div class="login-card">
          <h1>Vanilla Reminder</h1>
          ${
            isLoggedIn
              ? jsx`
                  <div>
                    <p class="status-msg"><strong>${user?.name}</strong>님, 환영합니다! 🎉</p>
                    <button class="logout-button" onclick="${this.handleLogout.bind(
                      this
                    )}">로그아웃</button>
                  </div>
                `
              : jsx`
                  <div class="login-form">
                    <input type="text" class="login-input" placeholder="아이디" />
                    <input type="password" class="login-input" placeholder="비밀번호" />
                    <button class="login-button" onclick="${this.handleLogin.bind(
                      this
                    )}">로그인</button>
                    <p class="status-msg">일정을 관리하려면 로그인이 필요합니다.</p>
                  </div>
                `
          }
          <button class="go-main-button" onclick="${this.handleGoMain.bind(
            this
          )}">메인 페이지로 돌아가기</button>
        </div>
      </div>
    `;
  }
}

