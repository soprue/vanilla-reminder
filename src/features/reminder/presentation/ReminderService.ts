import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { Router } from '@core/Router';

/**
 * 리마인더 페이지의 모든 비즈니스 로직을 담당하는 서비스 클래스
 * ReminderPage 컴포넌트를 경량화하기 위해 사용합니다.
 */
export class ReminderService {
  private component: any;

  constructor(component: any) {
    this.component = component;
  }

  /* -------------------------------------------------------------------------- */
  /* 리마인더 관련 액션                                                           */
  /* -------------------------------------------------------------------------- */

  handleToggleReminder(sectionId: string, reminderId: number) {
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  handleDeleteReminder(sectionId: string, reminderId: number) {
    reminderStore.deleteReminder(sectionId, reminderId);
  }

  handleUpdateReminder(sectionId: string, reminderId: number, text: string) {
    const { editingItemId, selectedTime } = this.component.state;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, selectedTime);
    }
    this.component.setState({ editingItemId: null });
  }

  handleAddReminder(e: KeyboardEvent, sectionId: string) {
    const { addingSectionId, selectedTime } = this.component.state;
    if (addingSectionId !== sectionId) return;

    const input = e.target as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    reminderStore.addReminder(sectionId, text, selectedTime);
    this.setAddingSection(null);
  }

  /* -------------------------------------------------------------------------- */
  /* 섹션 관련 액션                                                               */
  /* -------------------------------------------------------------------------- */

  handleUpdateSectionTitle(sectionId: string, title: string) {
    if (this.component.state.editingSectionId !== sectionId) return;

    if (title.trim()) {
      reminderStore.updateSectionTitle(sectionId, title);
    }
    this.component.setState({ editingSectionId: null });
  }

  handleDeleteSection(sectionId: string) {
    if (confirm('이 섹션을 삭제하시겠습니까?')) {
      reminderStore.deleteSection(sectionId);
    }
  }

  addSection() {
    reminderStore.addSection('New Section');
  }

  /* -------------------------------------------------------------------------- */
  /* 상태 제어 (UI State)                                                        */
  /* -------------------------------------------------------------------------- */

  setEditingItemId(reminderId: number | null) {
    if (reminderId === null) {
      this.component.setState({ editingItemId: null });
      return;
    }

    const { sections } = reminderStore.getState();
    const foundItem = sections.flatMap(s => s.items).find(it => it.id === reminderId);

    if (foundItem) {
      const time = foundItem.time || 'All Day';
      let ampm: 'AM' | 'PM' = 'AM';
      let hour = '09';
      let minute = '00';

      if (time !== 'All Day') {
        const [t, p] = time.split(' ');
        const [h, m] = t.split(':');
        ampm = (p as 'AM' | 'PM') || 'AM';
        hour = h || '09';
        minute = m || '00';
      }

      this.component.setState({ 
        editingItemId: reminderId,
        addingSectionId: null,
        editingSectionId: null,
        selectedTime: time,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute,
        showTimePopover: false
      });
    }
  }

  setEditingSectionId(sectionId: string | null) {
    this.component.setState({ 
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    });
  }

  setAddingSection(sectionId: string | null) {
    this.component.setState({ 
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
      showTimePopover: false,
      selectedTime: 'All Day'
    });
  }

  handleSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.component.setState({ searchQuery: target.value });
  }

  /* -------------------------------------------------------------------------- */
  /* 기타 전역 액션                                                               */
  /* -------------------------------------------------------------------------- */

  handleLogout() {
    authStore.logout();
    Router.getInstance().navigate('/login');
  }

  toggleDarkMode() {
    themeStore.toggleDarkMode();
  }

  toggleTimePopover() {
    this.component.setState({ showTimePopover: !this.component.state.showTimePopover });
  }

  updatePickerTime(key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) {
    const newState = { ...this.component.state, [key]: value };
    const formattedTime = `${newState.pickerHour}:${newState.pickerMinute} ${newState.pickerAMPM}`;
    this.component.setState({ 
      [key]: value,
      selectedTime: formattedTime 
    } as any);
  }

  setAllDay() {
    this.component.setState({ 
      selectedTime: 'All Day',
      showTimePopover: false 
    });
  }
}
