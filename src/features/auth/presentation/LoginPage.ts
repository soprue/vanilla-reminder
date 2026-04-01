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

  handleLogin() {
    // 실제 입력값을 가져오는 로직은 나중에 추가
    authStore.login('사용자');
    Router.getInstance().navigate('/');
  }

  handleGoogleLogin() {
    console.log('Google Login Clicked');
    // 구글 로그인 연동 로직 자리
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
          <p class="subtitle">매일의 기록을 더 가볍게</p>

          ${
            isLoggedIn
              ? jsx`
                  <div class="login-form">
                    <p class="status-msg"><strong>${
                      user?.name
                    }</strong>님, 환영합니다! 🎉</p>
                    <button class="login-button" onclick="${this.handleLogout.bind(
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
                    
                    <div class="divider">또는</div>

                    <div class="social-buttons">
                      <button class="btn-social" onclick="${this.handleGoogleLogin.bind(
                        this
                      )}">
                        <img src="${googleIcon}" alt="Google" />
                        Google로 계속하기
                      </button>
                    </div>
                  </div>
                `
          }

          <button class="go-main-button" onclick="${this.handleGoMain.bind(
            this
          )}">
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    `;
  }
}
