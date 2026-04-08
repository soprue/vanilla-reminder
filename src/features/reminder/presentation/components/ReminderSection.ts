import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import minusSquareIcon from '@assets/icons/minusSquare.svg';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  isEditing: boolean;
  onToggleItem: (id: number) => void;
  onDeleteItem: (id: number) => void; // 신규 추가
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
  onDeleteItem, // 추가
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
        ${items.map(item => ReminderItem({ 
          item, 
          onToggle: onToggleItem,
          onDelete: onDeleteItem // 전달
        }))}
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
                    onkeydown="${(e: KeyboardEvent) => {
                      // Enter 입력 시 blur 이벤트보다 먼저 처리를 완료할 수 있게 함
                      if (e.key === 'Enter') {
                        onAddItem(e, category);
                      }
                    }}"
                    onblur="${(e: FocusEvent) => {
                      // Enter를 쳤을 때 발생할 수 있는 레이스 컨디션 방지를 위해 약간의 지연을 주거나
                      // 단순히 부모의 상태를 null로 돌림
                      setTimeout(() => onSetEditing(null), 100);
                    }}"
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
