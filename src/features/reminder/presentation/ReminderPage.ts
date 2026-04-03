import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';
import { Category, CATEGORIES } from '@src/shared/constants/category';

// 부품 컴포넌트 임포트
import { Sidebar } from './components/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import plusIcon from '@assets/icons/plus.svg';

interface Reminder {
  id: number;
  category: Category;
  text: string;
  time?: string;
  done: boolean;
}

interface ReminderState {
  addingCategory: Category | null;
  reminders: Reminder[];
}

export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private router!: Router;

  init() {
    this.state = {
      addingCategory: null,
      reminders: [
        { id: 1, category: Category.EVERYDAY, text: '약 먹기', time: '2:00 PM', done: true },
        { id: 2, category: Category.EVERYDAY, text: '알고리즘 문제 풀기', time: '4:00 PM', done: false },
        { id: 3, category: Category.EVERYDAY, text: '산책하기', time: '6:00 PM', done: false },
        { id: 4, category: Category.TODO, text: '책 반납하기', time: 'All Day', done: false },
        { id: 5, category: Category.TODO, text: '편의점 택배 보내고 오기', time: '4:00 PM', done: false },
      ],
    };
    this.router = Router.getInstance();
    this.subscribe(authStore);
  }

  setEvent() {
    this.addEvent('click', '.theme-toggle-btn', this.toggleDarkMode.bind(this));
    this.addEvent('click', '.logout-btn', this.handleLogout.bind(this));
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

  setAddingCategory(category: Category | null) {
    this.setState({ addingCategory: category });
  }

  addReminder(e: KeyboardEvent, category: Category) {
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
    authStore.toggleDarkMode();
  }

  render() {
    const { reminders, addingCategory } = this.state;
    const { isDarkMode } = authStore.getState();

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        ${Sidebar({ isDarkMode })}

        <div class="reminder-list-wrapper">
          <div class="sections-container">
            ${CATEGORIES.map((cat) => 
              ReminderSection({
                title: cat.title,
                category: cat.value,
                items: reminders.filter((r) => r.category === cat.value),
                isEditing: addingCategory === cat.value,
                onToggleItem: this.toggleReminder.bind(this),
                onSetEditing: this.setAddingCategory.bind(this),
                onAddItem: this.addReminder.bind(this),
              })
            )}
          </div>

          <button class="plus-btn-container">
            <img src="${plusIcon}" alt="add" />
          </button>
        </div>
      </div>
    `;
  }
}
