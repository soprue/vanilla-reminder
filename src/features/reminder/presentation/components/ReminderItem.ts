import jsx from '@core/JSX';
import clockIcon from '@assets/icons/clock.svg';
import { reminderService } from '../ReminderService';

interface ReminderItemProps {
  sectionId: string; // 섹션 ID 추가
  item: {
    id: number;
    text: string;
    time?: string;
    done: boolean;
  };
  isEditing: boolean;
  showTimePopover: boolean;
  selectedTime: string;
  pickerState: { ampm: string; hour: string; minute: string };
}

/**
 * 수정 모드 UI 렌더링
 */
const EditMode = (props: ReminderItemProps) => {
  const { sectionId, item, selectedTime, pickerState, showTimePopover } = props;
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  return jsx`
    <form class="input-area-wrapper" onsubmit="${(e: Event) => e.preventDefault()}" style="margin-bottom: 8px;">
      <div class="input-container">
        <div class="checkbox-rect ${item.done ? 'done' : ''}">
          ${item.done ? jsx`<div class="icon-cancel-mask" style="pointer-events: none;"></div>` : ''}
        </div>
        <input 
          type="text" 
          class="reminder-inline-input" 
          value="${item.text}"
          onkeydown="${(e: KeyboardEvent) => {
            if (e.key === 'Enter') reminderService.handleUpdateReminder(sectionId, item.id, (e.target as HTMLInputElement).value);
            else if (e.key === 'Escape') reminderService.setEditingItemId(null);
          }}"
          onblur="${(e: FocusEvent) => {
            const container = (e.target as HTMLElement).closest('.input-area-wrapper');
            if (container && container.contains(e.relatedTarget as Node)) return;
            setTimeout(() => reminderService.handleUpdateReminder(sectionId, item.id, (e.target as HTMLInputElement).value), 150);
          }}"
        />
        <button type="button" class="time-badge ${selectedTime !== 'All Day' ? 'active' : ''}" onclick="${() => reminderService.toggleTimePopover()}">
          <img src="${clockIcon}" alt="time" class="time-icon" />
          <span class="time-text">${selectedTime === 'All Day' ? '' : selectedTime}</span>
        </button>
      </div>

      ${showTimePopover ? jsx`
        <div class="time-popover-box" style="top: 36px;">
          <div class="popover-all-day" onclick="${(e: Event) => { e.stopPropagation(); reminderService.setAllDay(); }}">☀️ All Day 로 설정</div>
          <div class="mini-picker-columns">
            <div class="mini-column">
              <div class="mini-item"></div>
              ${ampmOptions.map(opt => jsx`
                <div class="mini-item ${pickerState.ampm === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerAMPM', opt); reminderService.toggleTimePopover(); }}">${opt}</div>
              `)}
              <div class="mini-item"></div>
            </div>
            <div class="mini-column">
              <div class="mini-item"></div>
              ${hourOptions.map(opt => jsx`
                <div class="mini-item ${pickerState.hour === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerHour', opt); reminderService.toggleTimePopover(); }}">${opt}</div>
              `)}
              <div class="mini-item"></div>
            </div>
            <div class="mini-column">
              <div class="mini-item"></div>
              ${minuteOptions.map(opt => jsx`
                <div class="mini-item ${pickerState.minute === opt ? 'selected' : ''}" onclick="${() => { reminderService.updatePickerTime('pickerMinute', opt); reminderService.toggleTimePopover(); }}">${opt}</div>
              `)}
              <div class="mini-item"></div>
            </div>
          </div>
        </div>
      ` : ''}
    </form>
  `;
};

/**
 * 일반 모드 UI 렌더링
 */
const ViewMode = (props: ReminderItemProps) => {
  const { sectionId, item } = props;
  return jsx`
    <div class="reminder-row" ondblclick="${() => reminderService.setEditingItemId(item.id)}">
      <div class="checkbox-rect ${item.done ? 'done' : ''}" onclick="${(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); reminderService.handleToggleReminder(sectionId, item.id); }}">
        ${item.done ? jsx`<div class="icon-cancel-mask" style="pointer-events: none;"></div>` : ''}
      </div>
      
      <div class="item-content" onclick="${(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); reminderService.handleToggleReminder(sectionId, item.id); }}" style="cursor: pointer; flex: 1;">
        <p class="text-main ${item.done ? 'text-done' : ''}">${item.text}</p>
        ${item.time ? jsx`<span class="text-time ${item.done ? 'text-done' : ''}">${item.time}</span>` : ''}
      </div>

      <div class="item-actions">
        <button class="edit-item-btn" onclick="${(e: MouseEvent) => { e.stopPropagation(); reminderService.setEditingItemId(item.id); }}" title="수정">✎</button>
        <button class="delete-item-btn" onclick="${(e: MouseEvent) => { e.stopPropagation(); reminderService.handleDeleteReminder(sectionId, item.id); }}" title="삭제">×</button>
      </div>
    </div>
  `;
};

/**
 * 개별 리마인더 항목을 렌더링하는 컴포넌트
 */
export const ReminderItem = (props: ReminderItemProps) => {
  return props.isEditing ? EditMode(props) : ViewMode(props);
};
