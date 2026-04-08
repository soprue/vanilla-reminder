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
  onDelete: (id: number) => void;
}

/**
 * 개별 리마인더 항목을 렌더링하는 컴포넌트
 */
export const ReminderItem = ({ item, onToggle, onDelete }: ReminderItemProps) => {
  return jsx`
    <div class="reminder-row">
      <div 
        class="checkbox-rect ${item.done ? 'done' : ''}" 
        onclick="${(e: MouseEvent) => {
          e.stopPropagation();
          onToggle(item.id);
        }}"
      >
        <!-- img 대신 div + mask-image 방식 사용 -->
        ${item.done ? jsx`<div class="icon-cancel-mask"></div>` : ''}
      </div>
      
      <div class="item-content" onclick="${() => onToggle(item.id)}" style="cursor: pointer; flex: 1;">
        <p class="text-main ${item.done ? 'text-done' : ''}">${item.text}</p>
        ${item.time ? jsx`<span class="text-time ${item.done ? 'text-done' : ''}">${item.time}</span>` : ''}
      </div>

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
