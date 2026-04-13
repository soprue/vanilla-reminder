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
  editingItemId: number | null; // 수정 중인 항목 ID
  searchQuery: string; // 검색어 상태 추가
  showTimePopover: boolean;
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
      editingItemId: null,
      searchQuery: '',
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
    // 추가 모드 또는 수정 모드일 때 포커스 처리
    if ((this.state.addingSectionId || this.state.editingItemId) && !this.state.showTimePopover) {
      const input = this.target.querySelector('.reminder-inline-input') as HTMLInputElement;
      if (input) {
        input.focus();
        // 텍스트 끝으로 커서 이동 (수정 모드일 때 유용)
        const val = input.value;
        input.value = '';
        input.value = val;
      }
    }
  }

  handleToggleReminder(sectionId: string, reminderId: number) {
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  handleDeleteReminder(sectionId: string, reminderId: number) {
    reminderStore.deleteReminder(sectionId, reminderId);
  }

  handleUpdateReminder(sectionId: string, reminderId: number, text: string) {
    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, this.state.selectedTime);
    }
    this.setState({ editingItemId: null });
  }

  setEditingItemId(reminderId: number | null) {
    if (reminderId === null) {
      this.setState({ editingItemId: null });
      return;
    }

    // 수정할 아이템을 찾아 현재 시간을 상태에 동기화
    const { sections } = reminderStore.getState();
    let foundItem = null;
    for (const section of sections) {
      foundItem = section.items.find((it: any) => it.id === reminderId);
      if (foundItem) break;
    }

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

      this.setState({ 
        editingItemId: reminderId,
        addingSectionId: null, // 추가 모드 해제
        selectedTime: time,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute,
        showTimePopover: false
      });
    }
  }

  setAddingSection(sectionId: string | null) {
    this.setState({ 
      addingSectionId: sectionId,
      editingItemId: null, // 추가 모드 시 수정 모드 해제
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

  handleSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.setState({ searchQuery: target.value });
  }

  handleLogout() {
    authStore.logout();
    this.router.navigate('/login');
  }

  toggleDarkMode() {
    themeStore.toggleDarkMode();
  }

  render() {
    const { addingSectionId, editingItemId, searchQuery, showTimePopover, selectedTime, pickerAMPM, pickerHour, pickerMinute } = this.state;
    const { isDarkMode } = themeStore.getState();
    const { sections } = reminderStore.getState();

    // 검색어에 따른 필터링 로직
    const filteredSections = sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0 || (section.id === addingSectionId && !searchQuery));

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        ${Sidebar({
          isDarkMode,
          onToggleTheme: this.toggleDarkMode.bind(this),
          onLogout: this.handleLogout.bind(this),
        })}

        <div class="reminder-list-wrapper">
          <div class="search-bar-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="검색어를 입력하세요..." 
              value="${searchQuery}"
              oninput="${this.handleSearch.bind(this)}"
            />
          </div>

          <div class="sections-container">
            ${
              filteredSections.length > 0
                ? filteredSections.map((section) =>
                    ReminderSection({
                      title: section.title,
                      category: section.id,
                      items: section.items,
                      addingSectionId: addingSectionId,
                      editingItemId: editingItemId,
                      showTimePopover: showTimePopover,
                      selectedTime: selectedTime,
                      pickerState: { ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute },
                      onToggleItem: (reminderId: number) => this.handleToggleReminder(section.id, reminderId),
                      onDeleteItem: (reminderId: number) => this.handleDeleteReminder(section.id, reminderId),
                      onUpdateItem: (reminderId: number, text: string) => this.handleUpdateReminder(section.id, reminderId, text),
                      onSetAddingSection: (id: string | null) => this.setAddingSection(id),
                      onSetEditingItem: (id: number | null) => this.setEditingItemId(id),
                      onToggleTimePopover: () => this.toggleTimePopover(),
                      onUpdatePicker: (key: any, val: any) => this.updatePickerTime(key, val),
                      onSetAllDay: () => this.setAllDay(),
                      onAddItem: (e: KeyboardEvent) => this.handleAddReminder(e, section.id),
                      onDeleteSection: () => this.handleDeleteSection(section.id),
                    })
                  )
                : jsx`
                  <div class="empty-search-state">
                    <p class="empty-message">"${searchQuery}"에 대한 검색 결과가 없습니다.</p>
                  </div>
                `
            }
          </div>

          ${
            !searchQuery ? jsx`
              <button class="plus-btn-container" onclick="${() => reminderStore.addSection('New Section')}">
                <img src="${plusIcon}" alt="add" />
              </button>
            ` : ''
          }
        </div>
      </div>
    `;
  }
}
