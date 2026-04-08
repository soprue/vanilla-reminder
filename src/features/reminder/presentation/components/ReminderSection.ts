import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import minusSquareIcon from '@assets/icons/minusSquare.svg';
import clockIcon from '@assets/icons/clock.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  isEditing: boolean;
  showTimePopover: boolean;
  selectedTime: string;
  pickerState: { ampm: string; hour: string; minute: string };
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onSetEditing: (id: string | null) => void;
  onToggleTimePopover: () => void;
  onUpdatePicker: (key: string, val: string) => void;
  onSetAllDay: () => void;
  onAddItem: (e: KeyboardEvent, id: string) => void;
  onDeleteSection: () => void;
}

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection = ({
  title,
  category,
  items,
  isEditing,
  showTimePopover,
  selectedTime,
  pickerState,
  onToggleItem,
  onDeleteItem,
  onSetEditing,
  onToggleTimePopover,
  onUpdatePicker,
  onSetAllDay,
  onAddItem,
  onDeleteSection
}: ReminderSectionProps) => {
  const isFixed = category === 'EVERYDAY' || category === 'TODO';

  // 컬럼 데이터 생성
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  return jsx`
    <section class="section-card">
      <div class="section-header">
        <h2 class="section-title">${title}</h2>
        ${!isFixed ? jsx`
          <button class="section-delete-btn" onclick="${onDeleteSection}">
            <img src="${minusSquareIcon}" alt="delete" />
          </button>
        ` : ''}
      </div>
      
      <div class="items-container">
        ${items.map(item => ReminderItem({ 
          item, 
          onToggle: onToggleItem,
          onDelete: onDeleteItem 
        }))}
      </div>
      
      <div class="section-footer">
        ${isEditing 
          ? jsx`
              <div class="input-area-wrapper">
                <div class="input-container">
                  <div class="checkbox-rect"></div>
                  <input 
                    type="text" 
                    class="reminder-inline-input" 
                    placeholder="할 일을 입력하세요..."
                    onkeydown="${(e: KeyboardEvent) => {
                      if (e.key === 'Enter') onAddItem(e, category);
                    }}"
                  />
                  <button class="time-popover-btn" onclick="${onToggleTimePopover}" title="시간 설정">
                    <span style="font-size: 11px; color: var(--color-primary); margin-right: 4px; font-weight: 700;">
                      ${selectedTime === 'All Day' ? '' : selectedTime}
                    </span>
                    <img src="${clockIcon}" alt="time" />
                  </button>
                </div>

                <!-- 작고 예쁜 미니 팝오버 -->
                ${showTimePopover ? jsx`
                  <div class="time-popover-box">
                    <div class="popover-all-day" onclick="${onSetAllDay}">☀️ All Day 로 설정</div>
                    <div class="mini-picker-columns">
                      <!-- AM/PM -->
                      <div class="mini-column">
                        <div class="mini-item"></div> <!-- Spacer -->
                        ${ampmOptions.map(opt => jsx`
                          <div class="mini-item ${pickerState.ampm === opt ? 'selected' : ''}" 
                               onclick="${() => onUpdatePicker('pickerAMPM', opt)}">${opt}</div>
                        `)}
                        <div class="mini-item"></div> <!-- Spacer -->
                      </div>
                      <!-- HOURS -->
                      <div class="mini-column">
                        <div class="mini-item"></div> <!-- Spacer -->
                        ${hourOptions.map(opt => jsx`
                          <div class="mini-item ${pickerState.hour === opt ? 'selected' : ''}" 
                               onclick="${() => onUpdatePicker('pickerHour', opt)}">${opt}</div>
                        `)}
                        <div class="mini-item"></div> <!-- Spacer -->
                      </div>
                      <!-- MINUTES -->
                      <div class="mini-column">
                        <div class="mini-item"></div> <!-- Spacer -->
                        ${minuteOptions.map(opt => jsx`
                          <div class="mini-item ${pickerState.minute === opt ? 'selected' : ''}" 
                               onclick="${() => onUpdatePicker('pickerMinute', opt)}">${opt}</div>
                        `)}
                        <div class="mini-item"></div> <!-- Spacer -->
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>
            `
          : jsx`
              <div class="reminder-row" onclick="${() => onSetEditing(category)}" style="cursor: pointer;">
                <div class="checkbox-rect done" style="border-style: dashed;"></div>
                <div class="item-content">
                  <p class="text-main text-done">눌러서 추가하기</p>
                </div>
              </div>
            `
        }
      </div>
    </section>
  `;
};
