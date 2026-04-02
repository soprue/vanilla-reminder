import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import minusSquareIcon from '@assets/icons/minusSquare.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  isEditing: boolean;
  onToggleItem: (id: number) => void;
  onSetEditing: (category: string | null) => void;
  onAddItem: (e: KeyboardEvent, category: string) => void;
}

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection = ({
  title,
  category,
  items,
  isEditing,
  onToggleItem,
  onSetEditing,
  onAddItem
}: ReminderSectionProps) => {
  const isFixed = category === 'Everyday' || category === 'To Do';

  return jsx`
    <section class="section-card">
      <div class="section-header">
        <h2 class="section-title">${title}</h2>
        ${!isFixed ? jsx`
          <button class="section-delete-btn" onclick="${() => console.log('Delete Section')}">
            <img src="${minusSquareIcon}" alt="delete" />
          </button>
        ` : ''}
      </div>
      
      <!-- 리스트 항목들만 담는 컨테이너 (렌더링 안정성 확보) -->
      <div class="items-container">
        ${items.map(item => ReminderItem({ item, onToggle: onToggleItem }))}
      </div>
      
      <!-- 추가 버튼 영역 -->
      <div class="section-footer" style="margin-top: 12px;">
        ${isEditing 
          ? jsx`
              <div class="reminder-row">
                <div class="checkbox-rect"></div>
                <div class="item-content">
                  <input 
                    type="text" 
                    class="reminder-inline-input" 
                    placeholder="할 일을 입력하세요..."
                    onkeydown="${onAddItem ? (e: KeyboardEvent) => onAddItem(e, category) : null}"
                    onblur="${() => onSetEditing(null)}"
                    autofocus
                  />
                </div>
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
