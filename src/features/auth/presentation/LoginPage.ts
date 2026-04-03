import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';
import { Router } from '@src/core/Router';

// 아이콘 임포트
import googleIcon from '@assets/icons/google.svg';

export default class LoginPage extends Component<ComponentProps> {
  init() {
    this.subscribe(authStore);
  }

  setEvent() {
    this.addEvent('click', '.login-submit-btn', this.handleLogin.bind(this));
    this.addEvent('click', '.google-login-btn', this.handleGoogleLogin.bind(this));
    this.addEvent('click', '.logout-btn', this.handleLogout.bind(this));
    this.addEvent('click', '.go-main-btn', this.handleGoMain.bind(this));
  }

  handleLogin() {
    authStore.login('사용자');
    Router.getInstance().navigate('/');
  }

  handleGoogleLogin() {
    console.log('Google Login Clicked');
  }

  handleLogout() {
    authStore.logout();
  }

  handleGoMain() {
    Router.getInstance().navigate('/');
  }

  render() {
    const { isLoggedIn, user, isDarkMode } = authStore.getState();

    return jsx`
      <div class="login-wrapper ${isDarkMode ? 'dark-mode' : ''}">
        <div class="login-card">
          <h1>Vanilla Reminder</h1>
          <p class="subtitle">매일의 기록을 더 가볍게</p>

          ${
            isLoggedIn
              ? jsx`
                  <div class="login-form">
                    <p class="status-msg"><strong>${
                      user?.name
                    }</strong>님, 환영합니다! 🎉</p>
                    <button class="login-button logout-btn">로그아웃</button>
                  </div>
                `
              : jsx`
                  <div class="login-form">
                    <input type="text" class="login-input" placeholder="아이디" />
                    <input type="password" class="login-input" placeholder="비밀번호" />
                    <button class="login-button login-submit-btn">로그인</button>
                    
                    <div class="divider">또는</div>

                    <div class="social-buttons">
                      <button class="btn-social google-login-btn">
                        <img src="${googleIcon}" alt="Google" />
                        Google로 계속하기
                      </button>
                    </div>
                  </div>
                `
          }

          <button class="go-main-button go-main-btn">
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    `;
  }
}
