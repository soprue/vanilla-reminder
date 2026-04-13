import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import minusSquareIcon from '@assets/icons/minusSquare.svg';
import clockIcon from '@assets/icons/clock.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  addingSectionId: string | null;
  editingItemId: number | null;
  isEditingTitle: boolean; // 제목 수정 여부 추가
  showTimePopover: boolean;
  selectedTime: string;
  pickerState: { ampm: string; hour: string; minute: string };
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onUpdateItem: (id: number, text: string) => void;
  onSetAddingSection: (id: string | null) => void;
  onSetEditingItem: (id: number | null) => void;
  onUpdateSectionTitle: (title: string) => void; // 제목 업데이트 핸들러
  onSetEditingSection: (id: string | null) => void; // 제목 수정 시작 핸들러
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
  addingSectionId,
  editingItemId,
  isEditingTitle,
  showTimePopover,
  selectedTime,
  pickerState,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onSetAddingSection,
  onSetEditingItem,
  onUpdateSectionTitle,
  onSetEditingSection,
  onToggleTimePopover,
  onUpdatePicker,
  onSetAllDay,
  onAddItem,
  onDeleteSection,
}: ReminderSectionProps) => {
  const isFixed = category === 'EVERYDAY' || category === 'TODO';
  const isAdding = addingSectionId === category;

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
        ${
          isEditingTitle && !isFixed
            ? jsx`
              <input 
                type="text" 
                class="section-title-input" 
                value="${title}"
                onkeydown="${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') onUpdateSectionTitle((e.target as HTMLInputElement).value);
                  else if (e.key === 'Escape') onSetEditingSection(null);
                }}"
                onblur="${(e: FocusEvent) => onUpdateSectionTitle((e.target as HTMLInputElement).value)}"
              />
            `
            : jsx`
              <h2 
                class="section-title ${!isFixed ? 'editable' : ''}" 
                onclick="${() => !isFixed && onSetEditingSection(category)}"
                title="${!isFixed ? '클릭하여 이름 수정' : ''}"
              >
                ${title}
              </h2>
            `
        }
        ${
          !isFixed
            ? jsx`
          <button class="section-delete-btn" onclick="${onDeleteSection}" title="섹션 삭제">
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
            isEditing: editingItemId === item.id,
            showTimePopover,
            selectedTime,
            pickerState,
            onToggle: onToggleItem,
            onDelete: onDeleteItem,
            onUpdate: onUpdateItem,
            onStartEdit: onSetEditingItem,
            onToggleTimePopover,
            onUpdatePicker,
            onSetAllDay,
          })
        )}
      </div>
      
      <div class="section-footer">
        ${
          isAdding
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
                      const container = (e.target as HTMLElement).closest(
                        '.input-area-wrapper'
                      );
                      if (container && container.contains(e.relatedTarget as Node)) return;
                      setTimeout(() => onSetAddingSection(null), 150);
                    }}"
                  />
                  <button
                    type="button"
                    class="time-badge ${selectedTime !== 'All Day' ? 'active' : ''}"
                    onclick="${onToggleTimePopover}"
                  >
                    <img src="${clockIcon}" alt="time" class="time-icon" />
                    <span class="time-text">${selectedTime === 'All Day' ? '' : selectedTime}</span>
                  </button>
                </div>

                ${
                  showTimePopover
                    ? jsx`
                  <div class="time-popover-box">
                    <div class="popover-all-day" onclick="${(e: Event) => {
                      e.stopPropagation();
                      onSetAllDay();
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
                        <div class="mini-item)</div>
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
                onSetAddingSection(category)}" style="cursor: pointer;">
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
