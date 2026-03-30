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
        <!-- Sidemenu -->
        <aside class="sidemenu">
          <div class="logo-img"></div>
          <div class="sidemenu-buttons">
            <div class="icon-circle" onclick="${this.toggleDarkMode.bind(
              this
            )}">
              <img src="${isDarkMode ? sunlightIcon : halfmoonIcon}" alt="theme" />
            </div>
            <div class="icon-circle" onclick="${this.handleLogout.bind(
              this
            )}">
              <img src="${logoutIcon}" alt="logout" />
            </div>
          </div>
        </aside>

        <!-- Main List Area (Scrollable) -->
        <div class="reminder-list-wrapper">
          
          <!-- Everyday Section -->
          <section class="section-card">
            <h2 class="section-title">Everyday</h2>
            
            <div class="reminder-row">
              <div class="checkbox-rect done"></div>
              <div class="item-content">
                <p class="text-main text-done">약 먹기</p>
                <span class="text-time text-done">2:00 PM</span>
              </div>
            </div>

            <div class="reminder-row">
              <div class="checkbox-rect"></div>
              <div class="item-content">
                <p class="text-sub">알고리즘 문제 풀기</p>
                <span class="text-time">4:00 PM</span>
              </div>
            </div>

            <div class="reminder-row">
              <div class="checkbox-rect"></div>
              <div class="item-content">
                <p class="text-sub">산책하기</p>
                <span class="text-time">6:00 PM</span>
              </div>
            </div>
          </section>

          <!-- To Do Section -->
          <section class="section-card">
            <h2 class="section-title">To Do</h2>
            
            <div class="reminder-row">
              <div class="checkbox-rect"></div>
              <div class="item-content">
                <p class="text-main">책 반납하기</p>
                <span class="text-time">All Day</span>
              </div>
            </div>

            <div class="reminder-row">
              <div class="checkbox-rect"></div>
              <div class="item-content">
                <p class="text-sub">편의점 택배 보내고 오기</p>
                <span class="text-time">4:00 PM</span>
              </div>
            </div>
          </section>

          <!-- Work Section -->
          <section class="section-card">
            <h2 class="section-title">Work</h2>
            <div class="reminder-row">
              <div class="checkbox-rect done"></div>
              <div class="item-content">
                <p class="text-main text-done">눌러서 추가하기</p>
              </div>
            </div>
          </section>

          <!-- Plus Button (Naturally placed at the end) -->
          <button class="plus-btn-container">+</button>
        </div>
      </div>
    `;
  }
}
