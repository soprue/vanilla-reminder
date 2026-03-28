import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';

// 아이콘 임포트
import halfmoonIcon from '@assets/icons/halfmoon.svg';
import sunlightIcon from '@assets/icons/sunlight.svg';
import logoutIcon from '@assets/icons/logout.svg';

interface ReminderState {
  isDarkMode: boolean;
}

export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private router!: Router;

  init() {
    this.state = { isDarkMode: false };
    this.router = Router.getInstance();
    this.subscribe(authStore);
  }

  handleLogout() {
    authStore.logout();
    this.router.navigate('/login');
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.state.isDarkMode });
  }

  render() {
    const { isDarkMode } = this.state;
return jsx`
  <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
    <!-- Sidemenu (Fixed) -->
    <aside class="sidemenu">
      <div class="sidemenu-bar"></div>
      <div class="logo-img"></div>
      <div class="sidemenu-buttons">
        <div class="icon-circle" style="top: 0px; left: 0px;" onclick="${this.toggleDarkMode.bind(
          this
        )}">
          <img src="${isDarkMode ? sunlightIcon : halfmoonIcon}" alt="theme-icon" />
        </div>
        <div class="icon-circle" style="top: 42px; left: 0px;" onclick="${this.handleLogout.bind(
          this
        )}">
          <img src="${logoutIcon}" alt="logout-icon" />
        </div>
      </div>
    </aside>

    <!-- Scrollable Content -->
    <main class="main-content">
      <!-- Everyday -->
      <div class="section-bg everyday-bg"></div>
      <p class="section-title" style="left: 105px; top: 44px;">Everyday</p>

      <!-- 약 먹기 -->
      <div class="checkbox-rect checkbox-done" style="left: 105px; top: 89px;"></div>
      <div class="icon-cancel"></div>
      <p class="text-base text-main text-done" style="left: 129px; top: 88px;">약 먹기</p>
      <p class="text-base text-time text-done" style="left: 130px; top: 111px;">2:00 PM</p>

      <!-- 알고리즘 -->
      <div class="checkbox-rect" style="left: 105px; top: 142px;"></div>
      <p class="text-base text-sub" style="left: 129px; top: 141px;">알고리즘 문제 풀기</p>
      <p class="text-base text-time" style="left: 129px; top: 162px;">4:00 PM</p>

      <!-- 산책하기 -->
      <div class="checkbox-rect" style="left: 105px; top: 194px;"></div>
      <p class="text-base text-sub" style="left: 129px; top: 193px;">산책하기</p>
      <p class="text-base text-time" style="left: 129px; top: 214px;">6:00 PM</p>

      <!-- To Do -->
      <div class="section-bg todo-bg"></div>
      <p class="section-title" style="left: 105px; top: 292px;">To Do</p>

      <div class="checkbox-rect" style="left: 105px; top: 337px;"></div>
      <p class="text-base text-main" style="left: 129px; top: 336px;">책 반납하기</p>
      <p class="text-base text-time" style="left: 129px; top: 359px;">All Day</p>

      <div class="checkbox-rect" style="left: 105px; top: 390px;"></div>
      <p class="text-base text-sub" style="left: 129px; top: 389px;">편의점 택배 보내고 오기</p>
      <p class="text-base text-time" style="left: 129px; top: 410px;">4:00 PM</p>

      <!-- Work -->
      <div class="section-bg work-bg"></div>
      <p class="section-title" style="left: 105px; top: 493px;">Work</p>
      <div class="icon-minus"></div>

      <div class="checkbox-rect checkbox-done" style="left: 105px; top: 538px;"></div>
      <p class="text-base text-main text-done" style="left: 129px; top: 537px;">눌러서 추가하기</p>
    </main>

    <!-- Plus Button (Fixed) -->
    <button class="plus-btn-container" style="z-index: 150;">+</button>
  </div>
`;

  }
}
