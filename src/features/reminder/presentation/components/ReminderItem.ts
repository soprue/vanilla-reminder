import jsx from '@core/JSX';
import cancelIcon from '@assets/icons/cancel.svg';

interface ReminderItemProps {
  item: {
    id: number;
    text: string;
    time?: string;
    done: boolean;
  };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void; // 삭제 핸들러 추가
}

/**
 * 개별 리마인더 항목을 렌더링하는 컴포넌트
 */
export const ReminderItem = ({ item, onToggle, onDelete }: ReminderItemProps) => {
  return jsx`
    <div class="reminder-row" style="position: relative; group">
      <div 
        class="checkbox-rect ${item.done ? 'done' : ''}" 
        onclick="${(e: MouseEvent) => {
          e.stopPropagation();
          onToggle(item.id);
        }}"
        style="display: flex; justify-content: center; align-items: center;"
      >
        ${item.done ? jsx`<img src="${cancelIcon}" alt="check" style="width: 7px; height: 7px;" />` : ''}
      </div>
      
      <div class="item-content" onclick="${() => onToggle(item.id)}" style="cursor: pointer; flex: 1;">
        <p class="text-main ${item.done ? 'text-done' : ''}">${item.text}</p>
        ${item.time ? jsx`<span class="text-time ${item.done ? 'text-done' : ''}">${item.time}</span>` : ''}
      </div>

      <!-- 삭제 버튼: 호버 시에만 나타나도록 CSS 클래스 적용 -->
      <button 
        class="delete-item-btn"
        onclick="${(e: MouseEvent) => {
          e.stopPropagation();
          if(confirm('이 항목을 삭제하시겠습니까?')) onDelete(item.id);
        }}"
        title="삭제"
      >
        ×
      </button>
    </div>
  `;
};
