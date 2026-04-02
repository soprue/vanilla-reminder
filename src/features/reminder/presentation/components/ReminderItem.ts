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
}

/**
 * 개별 리마인더 항목을 렌더링하는 컴포넌트
 */
export const ReminderItem = ({ item, onToggle }: ReminderItemProps) => {
  return jsx`
    <div class="reminder-row">
      <div 
        class="checkbox-rect ${item.done ? 'done' : ''}" 
        onclick="${() => onToggle(item.id)}"
        style="display: flex; justify-content: center; align-items: center;"
      >
        ${item.done ? jsx`<img src="${cancelIcon}" alt="check" style="width: 7px; height: 7px;" />` : ''}
      </div>
      <div class="item-content" onclick="${() => onToggle(item.id)}" style="cursor: pointer;">
        <p class="text-main ${item.done ? 'text-done' : ''}">${item.text}</p>
        ${item.time ? jsx`<span class="text-time ${item.done ? 'text-done' : ''}">${item.time}</span>` : ''}
      </div>
    </div>
  `;
};
