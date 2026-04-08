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
  addingSectionId: string | null;
  showTimePopover: boolean; // 모달에서 다시 팝오버로 이름 변경
  selectedTime: string;
  pickerAMPM: 'AM' | 'PM';
  pickerHour: string;
  pickerMinute: string;
}

/**
 * 리마인더 메인 페이지 컴포넌트
 */
export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private router!: Router;

  init() {
    this.state = {
      addingSectionId: null,
      showTimePopover: false,
      selectedTime: 'All Day',
      pickerAMPM: 'AM',
      pickerHour: '09',
      pickerMinute: '00',
    };
    this.router = Router.getInstance();
    
    this.subscribe(authStore);
    this.subscribe(themeStore);
    this.subscribe(reminderStore);
  }

  componentDidUpdate() {
    if (this.state.addingSectionId && !this.state.showTimePopover) {
      const input = this.target.querySelector('.reminder-inline-input') as HTMLInputElement;
      if (input) input.focus();
    }
  }

  handleToggleReminder(sectionId: string, reminderId: number) {
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  handleDeleteReminder(sectionId: string, reminderId: number) {
    reminderStore.deleteReminder(sectionId, reminderId);
  }

  setAddingSection(sectionId: string | null) {
    this.setState({ 
      addingSectionId: sectionId,
      showTimePopover: false,
      selectedTime: 'All Day'
    });
  }

  toggleTimePopover() {
    this.setState({ showTimePopover: !this.state.showTimePopover });
  }

  updatePickerTime(key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) {
    const newState = { ...this.state, [key]: value };
    const formattedTime = `${newState.pickerHour}:${newState.pickerMinute} ${newState.pickerAMPM}`;
    this.setState({ 
      [key]: value,
      selectedTime: formattedTime 
    } as any);
  }

  setAllDay() {
    this.setState({ 
      selectedTime: 'All Day',
      showTimePopover: false 
    });
  }

  /**
   * 실제 리마인더 데이터 추가
   */
  handleAddReminder(e: KeyboardEvent, sectionId: string) {
    const input = e.target as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    reminderStore.addReminder(sectionId, text, this.state.selectedTime);
    this.setAddingSection(null);
  }

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
    const { addingSectionId, showTimePopover, selectedTime, pickerAMPM, pickerHour, pickerMinute } = this.state;
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
                category: section.id,
                items: section.items,
                isEditing: addingSectionId === section.id,
                showTimePopover: showTimePopover,
                selectedTime: selectedTime,
                pickerState: { ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute },
                onToggleItem: (reminderId: number) => this.handleToggleReminder(section.id, reminderId),
                onDeleteItem: (reminderId: number) => this.handleDeleteReminder(section.id, reminderId),
                onSetEditing: (id: string | null) => this.setAddingSection(id),
                onToggleTimePopover: () => this.toggleTimePopover(),
                onUpdatePicker: (key: any, val: any) => this.updatePickerTime(key, val),
                onSetAllDay: () => this.setAllDay(),
                onAddItem: (e: KeyboardEvent) => this.handleAddReminder(e, section.id),
                onDeleteSection: () => this.handleDeleteSection(section.id),
              })
            )}
          </div>

          <button class="plus-btn-container" onclick="${() => reminderStore.addSection('New Section')}">
            <img src="${plusIcon}" alt="add" />
          </button>
        </div>
      </div>
    `;
  }
}
