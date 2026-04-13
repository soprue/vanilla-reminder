import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';

// 부품 컴포넌트 및 서비스 임포트
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { ReminderService } from './ReminderService';
import plusIcon from '@assets/icons/plus.svg';

interface ReminderState {
  addingSectionId: string | null;
  editingItemId: number | null;
  editingSectionId: string | null;
  searchQuery: string;
  showTimePopover: boolean;
  selectedTime: string;
  pickerAMPM: 'AM' | 'PM';
  pickerHour: string;
  pickerMinute: string;
}

/**
 * 리마인더 메인 페이지 컴포넌트
 * UI 구조와 데이터 구독을 담당하며, 복잡한 로직은 ReminderService에 위임합니다.
 */
export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  private service!: ReminderService;

  init() {
    this.service = new ReminderService(this);
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
    
    this.subscribe(authStore);
    this.subscribe(themeStore);
    this.subscribe(reminderStore);
  }

  componentDidUpdate() {
    // 추가/수정 모드 시 자동 포커스 처리
    const input = this.target.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (this.state.addingSectionId || this.state.editingItemId || this.state.editingSectionId) && !this.state.showTimePopover) {
      input.focus();
      const val = input.value;
      input.value = ''; input.value = val; // 커서를 끝으로 이동
    }
  }

  render() {
    const { addingSectionId, editingItemId, editingSectionId, searchQuery, showTimePopover, selectedTime, pickerAMPM, pickerHour, pickerMinute } = this.state;
    const { isDarkMode } = themeStore.getState();
    const { sections } = reminderStore.getState();
    const isSaving = reminderStore.isSaving;

    const isEditingAny = !!(addingSectionId || editingItemId || editingSectionId);
    const isSearching = searchQuery.trim().length > 0;

    // 검색 필터링 로직
    const sectionsWithMatches = sections.map(s => ({
      ...s, items: s.items.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
    }));
    const hasAnyMatches = sectionsWithMatches.some(s => s.items.length > 0);
    const visibleSections = sectionsWithMatches.filter(s => isEditingAny || !isSearching || s.items.length > 0);

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        ${Sidebar({
          isDarkMode,
          onToggleTheme: this.service.toggleDarkMode.bind(this.service),
          onLogout: this.service.handleLogout.bind(this.service),
        })}

        <div class="reminder-list-wrapper">
          <div class="search-bar-container" style="position: relative;">
            <input type="text" class="search-input" placeholder="검색어를 입력하세요..." value="${searchQuery}" oninput="${this.service.handleSearch.bind(this.service)}" />
            <div class="save-indicator ${!isSaving ? 'saved' : ''}">${isSaving ? '저장 중...' : '저장됨'}</div>
          </div>

          <div class="sections-container">
            ${isSearching && !hasAnyMatches && !isEditingAny
              ? jsx`<div class="empty-search-state"><p class="empty-message">"${searchQuery}"에 대한 검색 결과가 없습니다.</p></div>`
              : visibleSections.map((section) => ReminderSection({
                  title: section.title,
                  category: section.id,
                  items: section.items,
                  addingSectionId,
                  editingItemId,
                  isEditingTitle: editingSectionId === section.id,
                  showTimePopover,
                  selectedTime,
                  pickerState: { ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute },
                  onToggleItem: (id: number) => this.service.handleToggleReminder(section.id, id),
                  onDeleteItem: (id: number) => this.service.handleDeleteReminder(section.id, id),
                  onUpdateItem: (id: number, text: string) => this.service.handleUpdateReminder(section.id, id, text),
                  onSetAddingSection: (id: string | null) => this.service.setAddingSection(id),
                  onSetEditingItem: (id: number | null) => this.service.setEditingItemId(id),
                  onUpdateSectionTitle: (title: string) => this.service.handleUpdateSectionTitle(section.id, title),
                  onSetEditingSection: (id: string | null) => this.service.setEditingSectionId(id),
                  onToggleTimePopover: () => this.service.toggleTimePopover(),
                  onUpdatePicker: (k: any, v: any) => this.service.updatePickerTime(k, v),
                  onSetAllDay: () => this.service.setAllDay(),
                  onAddItem: (e: KeyboardEvent) => this.service.handleAddReminder(e, section.id),
                  onDeleteSection: () => this.service.handleDeleteSection(section.id),
                }))
            }
          </div>

          ${!isSearching && !isEditingAny ? jsx`
            <button class="plus-btn-container" onclick="${() => this.service.addSection()}">
              <img src="${plusIcon}" alt="add" />
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }
}
