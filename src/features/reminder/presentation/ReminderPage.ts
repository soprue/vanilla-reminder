import { Component, ComponentProps } from '@core/Component';
import { Router } from '@core/Router';
import jsx from '@core/JSX';
import { authStore } from '@src/shared/store/AuthStore';
import { themeStore } from '@src/shared/store/ThemeStore';
import { reminderStore } from '@src/shared/store/ReminderStore';
import { Reminder } from '@src/shared/types/reminder';

// 부품 컴포넌트 임포트
import { Sidebar } from './components/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import plusIcon from '@assets/icons/plus.svg';

interface ReminderState {
  addingSectionId: string | null; // 현재 입력 중인 섹션의 ID
}

/**
 * 리마인더 메인 페이지 컴포넌트
 */
export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private router!: Router;

  init() {
    this.state = {
      addingSectionId: null,
    };
    this.router = Router.getInstance();
    
    // 전역 스토어 구독
    this.subscribe(authStore);
    this.subscribe(themeStore);
    this.subscribe(reminderStore);
  }

  componentDidUpdate() {
    // 입력 모드일 경우 해당 인풋창을 찾아 강제로 포커스를 줍니다.
    if (this.state.addingSectionId) {
      const input = this.target.querySelector('.reminder-inline-input') as HTMLInputElement;
      if (input) input.focus();
    }
  }

  /**
   * 리마인더 항목 완료 토글
   */
  handleToggleReminder(sectionId: string, reminderId: number) {
    console.log(`[ReminderPage] handleToggleReminder - Section: ${sectionId}, ID: ${reminderId}`);
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  /**
   * 새로운 리마인더 추가 모드 진입/해제
   */
  setAddingSection(sectionId: string | null) {
    this.setState({ addingSectionId: sectionId });
  }

  /**
   * 실제 리마인더 데이터 추가
   */
  handleAddReminder(e: KeyboardEvent, sectionId: string) {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const text = input.value.trim();
      if (!text) return;

      reminderStore.addReminder(sectionId, text);
      this.setAddingSection(null);
    }
  }

  /**
   * 섹션 삭제
   */
  handleDeleteSection(sectionId: string) {
    if (confirm('이 섹션을 삭제하시겠습니까?')) {
      reminderStore.deleteSection(sectionId);
    }
  }

  handleLogout() {
    authStore.logout();
    this.router.navigate('/login');
  }

  toggleDarkMode() {
    themeStore.toggleDarkMode();
  }

  render() {
    const { addingSectionId } = this.state;
    const { isDarkMode } = themeStore.getState();
    const { sections } = reminderStore.getState();

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        ${Sidebar({
          isDarkMode,
          onToggleTheme: this.toggleDarkMode.bind(this),
          onLogout: this.handleLogout.bind(this),
        })}

        <div class="reminder-list-wrapper">
          <div class="sections-container">
            ${sections.map((section) =>
              ReminderSection({
                title: section.title,
                category: section.id, // 내부적으로 category 대신 id 사용
                items: section.items,
                isEditing: addingSectionId === section.id,
                onToggleItem: (reminderId: number) => this.handleToggleReminder(section.id, reminderId),
                onSetEditing: (id: string | null) => this.setAddingSection(id),
                onAddItem: (e: KeyboardEvent) => this.handleAddReminder(e, section.id),
                onDeleteSection: () => this.handleDeleteSection(section.id),
              })
            )}
          </div>

          <button class="plus-btn-container" onclick="${() => alert('새 섹션 추가 기능은 곧 구현됩니다!')}">
            <img src="${plusIcon}" alt="add" />
          </button>
        </div>
      </div>
    `;
  }
}
