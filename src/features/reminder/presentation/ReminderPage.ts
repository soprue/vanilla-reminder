import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';

// 아이콘 임포트
import halfmoonIcon from '@assets/icons/halfmoon.svg';
import sunlightIcon from '@assets/icons/sunlight.svg';
import logoutIcon from '@assets/icons/logout.svg';
import plusIcon from '@assets/icons/plus.svg';
import cancelIcon from '@assets/icons/cancel.svg';

interface Reminder {
  id: number;
  category: string;
  text: string;
  time?: string;
  done: boolean;
}

interface ReminderState {
  isDarkMode: boolean;
  reminders: Reminder[];
  addingCategory: string | null; // 현재 입력 중인 카테고리 (없으면 null)
}

export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private router!: Router;

  init() {
    this.state = {
      isDarkMode: false,
      addingCategory: null,
      reminders: [
        { id: 1, category: 'Everyday', text: '약 먹기', time: '2:00 PM', done: true },
        { id: 2, category: 'Everyday', text: '알고리즘 문제 풀기', time: '4:00 PM', done: false },
        { id: 3, category: 'Everyday', text: '산책하기', time: '6:00 PM', done: false },
        { id: 4, category: 'To Do', text: '책 반납하기', time: 'All Day', done: false },
        { id: 5, category: 'To Do', text: '편의점 택배 보내고 오기', time: '4:00 PM', done: false },
      ],
    };
    this.router = Router.getInstance();
    this.subscribe(authStore);
  }

  // 입력 모드 설정
  setAddingCategory(category: string | null) {
    this.setState({ addingCategory: category });
  }

  // 리마인더 추가 로직
  addReminder(e: KeyboardEvent, category: string) {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;

      const newReminder: Reminder = {
        id: Date.now(),
        category,
        text,
        done: false,
      };

      this.setState({
        reminders: [...this.state.reminders, newReminder],
        addingCategory: null,
      });
    }
  }

  toggleReminder(id: number) {
    const newReminders = this.state.reminders.map((r) =>
      r.id === id ? { ...r, done: !r.done } : r
    );
    this.setState({ reminders: newReminders });
  }

  handleLogout() {
    authStore.logout();
    this.router.navigate('/login');
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.state.isDarkMode });
  }

  // 렌더링 이후 실행되는 생명주기 메서드
  componentDidUpdate() {
    // 입력 모드일 경우 해당 인풋창을 찾아 강제로 포커스를 줍니다.
    if (this.state.addingCategory) {
      const input = this.target.querySelector('.reminder-inline-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  }

  render() {
    const { isDarkMode, reminders, addingCategory } = this.state;

    // 섹션 렌더링 함수
    const renderSection = (title: string, category: string) => {
      const sectionReminders = reminders.filter((r) => r.category === category);
      const isEditing = addingCategory === category;

      return jsx`
        <section class="section-card">
          <h2 class="section-title">${title}</h2>
          
          <!-- 기존 리스트 항목들 -->
          ${sectionReminders.map(
            (item) => jsx`
            <div class="reminder-row">
              <div 
                class="checkbox-rect ${item.done ? 'done' : ''}" 
                onclick="${() => this.toggleReminder(item.id)}"
                style="display: flex; justify-content: center; align-items: center;"
              >
                ${item.done ? jsx`<img src="${cancelIcon}" alt="check" style="width: 7px; height: 7px;" />` : ''}
              </div>
              <div class="item-content" onclick="${() => this.toggleReminder(item.id)}" style="cursor: pointer;">
                <p class="text-main ${item.done ? 'text-done' : ''}">${item.text}</p>
                ${item.time ? jsx`<span class="text-time ${item.done ? 'text-done' : ''}">${item.time}</span>` : ''}
              </div>
            </div>
          `
          )}
          
          <!-- 추가 입력 필드 또는 '눌러서 추가하기' 버튼 -->
          ${
            isEditing
              ? jsx`
                  <div class="reminder-row">
                    <div class="checkbox-rect"></div>
                    <div class="item-content">
                      <input 
                        type="text" 
                        class="reminder-inline-input" 
                        placeholder="할 일을 입력하세요..."
                        onkeydown="${(e: KeyboardEvent) => this.addReminder(e, category)}"
                        onblur="${() => this.setAddingCategory(null)}"
                        autoFocus
                      />
                    </div>
                  </div>
                `
              : jsx`
                  <div class="reminder-row" onclick="${() => this.setAddingCategory(category)}" style="cursor: pointer;">
                    <div class="checkbox-rect done" style="border-style: dashed;"></div>
                    <div class="item-content">
                      <p class="text-main text-done">눌러서 추가하기</p>
                    </div>
                  </div>
                `
          }

        </section>
      `;
    };

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        <aside class="sidemenu">
          <div class="logo-img"></div>
          <div class="sidemenu-buttons">
            <div class="icon-circle" onclick="${this.toggleDarkMode.bind(this)}">
              <img src="${isDarkMode ? sunlightIcon : halfmoonIcon}" alt="theme" />
            </div>
            <div class="icon-circle" onclick="${this.handleLogout.bind(this)}">
              <img src="${logoutIcon}" alt="logout" />
            </div>
          </div>
        </aside>

        <div class="reminder-list-wrapper">
          ${[
            renderSection('Everyday', 'Everyday'),
            renderSection('To Do', 'To Do'),
            renderSection('Work', 'Work')
          ]}

          <button class="plus-btn-container">
            <img src="${plusIcon}" alt="add" />
          </button>
        </div>
      </div>
    `;
  }
}
