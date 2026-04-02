import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';

// 부품 컴포넌트 임포트
import { Sidebar } from './components/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import plusIcon from '@assets/icons/plus.svg';

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
  addingCategory: string | null;
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

  componentDidUpdate() {
    if (this.state.addingCategory) {
      const input = this.target.querySelector('.reminder-inline-input') as HTMLInputElement;
      if (input) input.focus();
    }
  }

  toggleReminder(id: number) {
    this.setState({
      reminders: this.state.reminders.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      ),
    });
  }

  setAddingCategory(category: string | null) {
    this.setState({ addingCategory: category });
  }

  addReminder(e: KeyboardEvent, category: string) {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;

      this.setState({
        reminders: [
          ...this.state.reminders,
          { id: Date.now(), category, text, done: false },
        ],
        addingCategory: null,
      });
    }
  }

  handleLogout() {
    authStore.logout();
    this.router.navigate('/login');
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.state.isDarkMode });
  }

  render() {
    const { isDarkMode, reminders, addingCategory } = this.state;

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        ${Sidebar({
          isDarkMode,
          onToggleTheme: this.toggleDarkMode.bind(this),
          onLogout: this.handleLogout.bind(this),
        })}

        <div class="reminder-list-wrapper">
          <!-- 섹션들만 모아놓는 컨테이너 (렌더링 안정성 확보) -->
          <div class="sections-container">
            ${ReminderSection({
              title: 'Everyday',
              category: 'Everyday',
              items: reminders.filter((r) => r.category === 'Everyday'),
              isEditing: addingCategory === 'Everyday',
              onToggleItem: this.toggleReminder.bind(this),
              onSetEditing: this.setAddingCategory.bind(this),
              onAddItem: this.addReminder.bind(this),
            })}

            ${ReminderSection({
              title: 'To Do',
              category: 'To Do',
              items: reminders.filter((r) => r.category === 'To Do'),
              isEditing: addingCategory === 'To Do',
              onToggleItem: this.toggleReminder.bind(this),
              onSetEditing: this.setAddingCategory.bind(this),
              onAddItem: this.addReminder.bind(this),
            })}

            ${ReminderSection({
              title: 'Work',
              category: 'Work',
              items: reminders.filter((r) => r.category === 'Work'),
              isEditing: addingCategory === 'Work',
              onToggleItem: this.toggleReminder.bind(this),
              onSetEditing: this.setAddingCategory.bind(this),
              onAddItem: this.addReminder.bind(this),
            })}
          </div>

          <button class="plus-btn-container">
            <img src="${plusIcon}" alt="add" />
          </button>
        </div>
      </div>
    `;
  }
}
