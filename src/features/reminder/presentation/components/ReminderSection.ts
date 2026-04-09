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
  onDeleteSection,
}: ReminderSectionProps) => {
  const isFixed = category === 'EVERYDAY' || category === 'TODO';

  // 시간 옵션 생성
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, '0')
  );

  return jsx`
    <section class="section-card">
      <div class="section-header">
        <h2 class="section-title">${title}</h2>
        ${
          !isFixed
            ? jsx`
          <button class="section-delete-btn" onclick="${onDeleteSection}">
            <img src="${minusSquareIcon}" alt="delete" />
          </button>
        `
            : ''
        }
      </div>
      
      <div class="items-container">
        ${items.map((item) =>
          ReminderItem({
            item,
            onToggle: onToggleItem,
            onDelete: onDeleteItem,
          })
        )}
      </div>
      
      <div class="section-footer">
        ${
          isEditing
            ? jsx`
              <form class="input-area-wrapper" onsubmit="${(e: Event) =>
                e.preventDefault()}">
                <div class="input-container">
                  <div class="checkbox-rect"></div>
                  <input 
                    type="text" 
                    class="reminder-inline-input" 
                    placeholder="할 일을 입력하세요..."
                    onkeydown="${(e: KeyboardEvent) => {
                      if (e.key === 'Enter') onAddItem(e, category);
                    }}"
                    onblur="${(e: FocusEvent) => {
                      // 시간 피커를 누를 때는 닫히지 않게 방어
                      const container = (e.target as HTMLElement).closest(
                        '.input-area-wrapper'
                      );
                      if (
                        container &&
                        container.contains(e.relatedTarget as Node)
                      )
                        return;

                      // 미세한 지연을 주어 클릭 이벤트가 씹히지 않게 함
                      setTimeout(() => onSetEditing(null), 150);
                    }}"
                  />
                  <button
                    type="button"
                    class="time-badge ${selectedTime !== 'All Day' ? 'active' : ''}"
                    onclick="${onToggleTimePopover}"
                  >
                    <img src="${clockIcon}" alt="time" class="time-icon" />
                    <span class="time-text">
                      ${selectedTime === 'All Day' ? '' : selectedTime}
                    </span>
                  </button>                </div>

                ${
                  showTimePopover
                    ? jsx`
                  <div class="time-popover-box">
                    <div class="popover-all-day" onclick="${() => {
                      onSetAllDay();
                      onToggleTimePopover();
                    }}">☀️ All Day 로 설정</div>
                    <div class="mini-picker-columns">
                      <div class="mini-column">
                        <div class="mini-item"></div>
                        ${ampmOptions.map(
                          (opt) => jsx`
                          <div class="mini-item ${
                            pickerState.ampm === opt ? 'selected' : ''
                          }" 
                               onclick="${() => {
                                 onUpdatePicker('pickerAMPM', opt);
                                 onToggleTimePopover();
                               }}">${opt}</div>
                        `
                        )}
                        <div class="mini-item"></div>
                      </div>
                      <div class="mini-column">
                        <div class="mini-item"></div>
                        ${hourOptions.map(
                          (opt) => jsx`
                          <div class="mini-item ${
                            pickerState.hour === opt ? 'selected' : ''
                          }" 
                               onclick="${() => {
                                 onUpdatePicker('pickerHour', opt);
                                 onToggleTimePopover();
                               }}">${opt}</div>
                        `
                        )}
                        <div class="mini-item"></div>
                      </div>
                      <div class="mini-column">
                        <div class="mini-item"></div>
                        ${minuteOptions.map(
                          (opt) => jsx`
                          <div class="mini-item ${
                            pickerState.minute === opt ? 'selected' : ''
                          }" 
                               onclick="${() => {
                                 onUpdatePicker('pickerMinute', opt);
                                 onToggleTimePopover();
                               }}">${opt}</div>
                        `
                        )}
                        <div class="mini-item"></div>
                      </div>
                    </div>
                  </div>
                `
                    : ''
                }
              </form>
            `
            : jsx`
              <div class="reminder-row" onclick="${() =>
                onSetEditing(category)}" style="cursor: pointer;">
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
