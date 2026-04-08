import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import minusSquareIcon from '@assets/icons/minusSquare.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  isEditing: boolean;
  onToggleItem: (id: number) => void;
  onSetEditing: (id: string | null) => void;
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
  onToggleItem,
  onSetEditing,
  onAddItem,
  onDeleteSection
}: ReminderSectionProps) => {
  // 'EVERYDAY'와 'TODO'는 고정 섹션으로 판단
  const isFixed = category === 'EVERYDAY' || category === 'TODO';

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
      
      <!-- 리스트 항목들만 담는 컨테이너 -->
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
                    onkeydown="${(e: KeyboardEvent) => onAddItem(e, category)}"
                    onblur="${() => onSetEditing(null)}"
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
