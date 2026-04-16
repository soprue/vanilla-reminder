import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { Router } from '@core/Router';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 리마인더 페이지의 모든 비즈니스 로직을 담당하는 서비스 클래스
 */
export class ReminderService {
  private static instance: ReminderService;
  private component: any = null;

  private constructor() {}

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  /**
   * 컴포넌트 참조 설정 (상태 업데이트를 위해 필요)
   */
  setComponent(component: any) {
    this.component = component;
  }

  /* -------------------------------------------------------------------------- */
  /* 리마인더 관련 액션                                                           */
  /* -------------------------------------------------------------------------- */

  handleToggleReminder(sectionId: string, reminderId: number) {
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  handleDeleteReminder(sectionId: string, reminderId: number) {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      reminderStore.deleteReminder(sectionId, reminderId);
    }
  }

  handleUpdateReminder(sectionId: string, reminderId: number, text: string) {
    if (!this.component) return;
    const { editingItemId, selectedTime } = this.component.state;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, selectedTime);
    }
    this.component.setState({ editingItemId: null });
  }

  handleAddReminder(e: KeyboardEvent, sectionId: string) {
    if (!this.component) return;
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
    if (!this.component || this.component.state.editingSectionId !== sectionId) return;

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
    reminderStore.addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
  }

  /* -------------------------------------------------------------------------- */
  /* 상태 제어 (UI State)                                                        */
  /* -------------------------------------------------------------------------- */

  setEditingItemId(reminderId: number | null) {
    if (!this.component) return;
    if (reminderId === null) {
      this.component.setState({ editingItemId: null });
      return;
    }

    const { sections } = reminderStore.getState();
    const foundItem = sections.flatMap(s => s.items).find(it => it.id === reminderId);

    if (foundItem) {
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      if (foundItem.time instanceof Date) {
        const h = foundItem.time.getHours();
        const m = foundItem.time.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour);
        minute = String(m).padStart(2, '0');
      }

      this.component.setState({ 
        editingItemId: reminderId,
        addingSectionId: null,
        editingSectionId: null,
        selectedTime: foundItem.time,
        isAllDay: foundItem.isAllDay,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute,
        showTimePopover: false
      });
    }
  }

  setEditingSectionId(sectionId: string | null) {
    if (!this.component) return;
    this.component.setState({ 
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    });
  }

  setAddingSection(sectionId: string | null) {
    if (!this.component) return;
    this.component.setState({ 
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM,
      pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
      pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE
    });
  }

  handleSearch(e: Event) {
    if (!this.component) return;
    const target = e.target as HTMLInputElement;
    this.component.setState({ searchQuery: target.value });
  }

  /* -------------------------------------------------------------------------- */
  /* 기타 전역 액션                                                               */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /* 알림 시스템                                                                */
  /* -------------------------------------------------------------------------- */

  /**
   * 알림 모니터링 시작
   */
  startMonitoring() {
    // 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 1분마다 체크
    setInterval(() => this.checkNotifications(), 60000);
    // 시작 시에도 한 번 체크
    this.checkNotifications();
  }

  private checkNotifications() {
    const { sections } = reminderStore.getState();
    const allItems = sections.flatMap(s => s.items.map(item => ({ ...item, sectionId: s.id })));
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 1. 밤 9시 확인 알림 (21:00)
    if (currentHour === 21 && currentMinute === 0) {
      const unfinishedItems = allItems.filter(item => !item.done);
      if (unfinishedItems.length > 0) {
        const itemNames = unfinishedItems.map(it => it.text).join(', ');
        this.sendNotification('오늘 마무리 하셨나요?', `아직 남은 할 일이 있어요: ${itemNames}`);
      }
    }

    // 2. 개별 리마인더 알림
    allItems.forEach(item => {
      if (item.time instanceof Date && !item.notified && !item.done) {
        const itemHour = item.time.getHours();
        const itemMinute = item.time.getMinutes();

        // 현재 시간이 설정 시간보다 지났거나 같으면 알림
        if (currentHour > itemHour || (currentHour === itemHour && currentMinute >= itemMinute)) {
          this.sendNotification('리마인더 알림', item.text);
          reminderStore.markAsNotified(item.sectionId, item.id);
        }
      }
    });
  }

  private sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: './assets/logo.webp' });
    }
  }

  handleLogout() {
    authStore.logout();
    Router.getInstance().navigate('/login');
  }

  toggleDarkMode() {
    themeStore.toggleDarkMode();
  }

  toggleTimePopover() {
    if (!this.component) return;
    this.component.setState({ showTimePopover: !this.component.state.showTimePopover });
  }

  updatePickerTime(key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) {
    if (!this.component) return;
    const newState = { ...this.component.state, [key]: value };
    
    // Date 객체 생성 (오늘 날짜 기준)
    const date = new Date();
    let h = parseInt(newState.pickerHour);
    if (newState.pickerAMPM === 'PM' && h < 12) h += 12;
    if (newState.pickerAMPM === 'AM' && h === 12) h = 0;
    
    date.setHours(h, parseInt(newState.pickerMinute), 0, 0);

    this.component.setState({ 
      [key]: value,
      selectedTime: date,
      isAllDay: false
    } as any);
  }

  setAllDay() {
    if (!this.component) return;
    this.component.setState({ 
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    });
  }
}

export const reminderService = ReminderService.getInstance();
