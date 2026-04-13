import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import { reminderService } from '../ReminderService';
import minusSquareIcon from '@assets/icons/minusSquare.svg';
import clockIcon from '@assets/icons/clock.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  addingSectionId: string | null;
  editingItemId: number | null;
  isEditingTitle: boolean;
  showTimePopover: boolean;
  selectedTime: string;
  pickerState: { ampm: string; hour: string; minute: string };
}

/**
 * 섹션 헤더 (타이틀 및 삭제 버튼)
 */
const SectionHeader = ({ title, category, isEditingTitle, isFixed }: any) => {
  if (isEditingTitle && !isFixed) {
    return jsx`
      <div class="section-header">
        <input 
          type="text" class="section-title-input" value="${title}"
          onkeydown="${(e: KeyboardEvent) => {
            if (e.key === 'Enter') reminderService.handleUpdateSectionTitle(category, (e.target as HTMLInputElement).value);
            else if (e.key === 'Escape') reminderService.setEditingSectionId(null);
          }}"
          onblur="${(e: FocusEvent) => setTimeout(() => reminderService.handleUpdateSectionTitle(category, (e.target as HTMLInputElement).value), 100)}"
        />
      </div>
    `;
  }

  return jsx`
    <div class="section-header">
      <h2 class="section-title ${!isFixed ? 'editable' : ''}" 
          onclick="${() => !isFixed && reminderService.setEditingSectionId(category)}" 
          title="${!isFixed ? '클릭하여 이름 수정' : ''}">${title}</h2>
      ${!isFixed ? jsx`<button class="section-delete-btn" onclick="${() => reminderService.handleDeleteSection(category)}" title="섹션 삭제"><img src="${minusSquareIcon}" alt="delete" /></button>` : ''}
    </div>
  `;
};

/**
 * 섹션 푸터 (아이템 추가 폼)
 */
const SectionFooter = ({ category, isAdding, showTimePopover, selectedTime, pickerState }: any) => {
  if (!isAdding) {
    return jsx`
      <div class="section-footer">
        <div class="reminder-row" onclick="${() => reminderService.setAddingSection(category)}" style="cursor: pointer;">
          <div class="checkbox-rect done" style="border-style: dashed;"></div>
          <div class="item-content"><p class="text-main text-done">눌러서 추가하기</p></div>
        </div>
      </div>
    `;
  }

  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  return jsx`
    <div class="section-footer">
      <form class="input-area-wrapper" onsubmit="${(e: Event) => e.preventDefault()}">
        <div class="input-container">
          <div class="checkbox-rect"></div>
          <input type="text" class="reminder-inline-input" placeholder="할 일을 입력하세요..."
            onkeydown="${(e: KeyboardEvent) => e.key === 'Enter' && reminderService.handleAddReminder(e, category)}"
            onblur="${(e: FocusEvent) => {
              const container = (e.target as HTMLElement).closest('.input-area-wrapper');
              if (container && container.contains(e.relatedTarget as Node)) return;
              setTimeout(() => reminderService.setAddingSection(null), 200);
            }}"
          />
          <button type="button" class="time-badge ${selectedTime !== 'All Day' ? 'active' : ''}" onclick="${() => reminderService.toggleTimePopover()}">
            <img src="${clockIcon}" alt="time" class="time-icon" />
            <span class="time-text">${selectedTime === 'All Day' ? '' : selectedTime}</span>
          </button>
        </div>

        ${showTimePopover ? jsx`
          <div class="time-popover-box">
            <div class="popover-all-day" onclick="${(e: Event) => { e.stopPropagation(); reminderService.setAllDay(); }}">☀️ All Day 로 설정</div>
            <div class="mini-picker-columns">
              <div class="mini-column">
                <div class="mini-item"></div>
                ${ampmOptions.map(opt => jsx`<div class="mini-item ${pickerState.ampm === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerAMPM', opt); reminderService.toggleTimePopover(); }}">${opt}</div>`)}
                <div class="mini-item"></div>
              </div>
              <div class="mini-column">
                <div class="mini-item"></div>
                ${hourOptions.map(opt => jsx`<div class="mini-item ${pickerState.hour === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerHour', opt); reminderService.toggleTimePopover(); }}">${opt}</div>`)}
                <div class="mini-item"></div>
              </div>
              <div class="mini-column">
                <div class="mini-item"></div>
                ${minuteOptions.map(opt => jsx`<div class="mini-item ${pickerState.minute === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerMinute', opt); reminderService.toggleTimePopover(); }}">${opt}</div>`)}
                <div class="mini-item"></div>
              </div>
            </div>
          </div>
        ` : ''}
      </form>
    </div>
  `;
};

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection = (props: ReminderSectionProps) => {
  const { title, category, items, addingSectionId, editingItemId, isEditingTitle, showTimePopover, selectedTime, pickerState } = props;
  const isFixed = category === 'EVERYDAY' || category === 'TODO';
  const isAdding = addingSectionId === category;

  return jsx`
    <section class="section-card">
      ${SectionHeader({ title, category, isEditingTitle, isFixed })}
      
      <div class="items-container">
        ${items.map((item) => ReminderItem({
          sectionId: category,
          item,
          isEditing: editingItemId === item.id,
          showTimePopover,
          selectedTime,
          pickerState,
        }))}
      </div>
      
      ${SectionFooter({ category, isAdding, showTimePopover, selectedTime, pickerState })}
    </section>
  `;
};
