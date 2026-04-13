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
  editingSectionId: string | null; // 수정 중인 섹션 ID
  searchQuery: string;
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
      editingSectionId: null,
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
    if ((this.state.addingSectionId || this.state.editingItemId || this.state.editingSectionId) && !this.state.showTimePopover) {
      const input = this.target.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
      if (input) {
        input.focus();
        // 텍스트 끝으로 커서 이동
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

  handleUpdateSectionTitle(sectionId: string, title: string) {
    if (title.trim()) {
      reminderStore.updateSectionTitle(sectionId, title);
    }
    this.setState({ editingSectionId: null });
  }

  setEditingSectionId(sectionId: string | null) {
    this.setState({ 
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    });
  }

  setAddingSection(sectionId: string | null) {
    this.setState({ 
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
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
    const { addingSectionId, editingItemId, editingSectionId, searchQuery, showTimePopover, selectedTime, pickerAMPM, pickerHour, pickerMinute } = this.state;
    const { isDarkMode } = themeStore.getState();
    const { sections } = reminderStore.getState();

    // 1. 검색어로 아이템 필터링
    const sectionsWithMatches = sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }));

    // 2. 검색 중인지, 실제로 매칭되는 아이템이 있는지 확인
    const isSearching = searchQuery.trim().length > 0;
    const hasAnyMatches = sectionsWithMatches.some(s => s.items.length > 0);

    // 3. 렌더링할 섹션 결정
    const visibleSections = sectionsWithMatches.filter(section => {
      if (!isSearching) return true; // 검색 안 할 때는 모든 섹션(Work 포함) 표시
      return section.items.length > 0; // 검색 중일 때는 매칭된 아이템이 있는 섹션만 표시
    });

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
              isSearching && !hasAnyMatches
                ? jsx`
                  <div class="empty-search-state">
                    <p class="empty-message">"${searchQuery}"에 대한 검색 결과가 없습니다.</p>
                  </div>
                `
                : visibleSections.map((section) =>
                    ReminderSection({
                      title: section.title,
                      category: section.id,
                      items: section.items,
                      addingSectionId: addingSectionId,
                      editingItemId: editingItemId,
                      isEditingTitle: editingSectionId === section.id,
                      showTimePopover: showTimePopover,
                      selectedTime: selectedTime,
                      pickerState: { ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute },
                      onToggleItem: (reminderId: number) => this.handleToggleReminder(section.id, reminderId),
                      onDeleteItem: (reminderId: number) => this.handleDeleteReminder(section.id, reminderId),
                      onUpdateItem: (reminderId: number, text: string) => this.handleUpdateReminder(section.id, reminderId, text),
                      onSetAddingSection: (id: string | null) => this.setAddingSection(id),
                      onSetEditingItem: (id: number | null) => this.setEditingItemId(id),
                      onUpdateSectionTitle: (title: string) => this.handleUpdateSectionTitle(section.id, title),
                      onSetEditingSection: (id: string | null) => this.setEditingSectionId(id),
                      onToggleTimePopover: () => this.toggleTimePopover(),
                      onUpdatePicker: (key: any, val: any) => this.updatePickerTime(key, val),
                      onSetAllDay: () => this.setAllDay(),
                      onAddItem: (e: KeyboardEvent) => this.handleAddReminder(e, section.id),
                      onDeleteSection: () => this.handleDeleteSection(section.id),
                    })
                  )
            }
          </div>

          ${
            !isSearching ? jsx`
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
