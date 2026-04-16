import { Store } from '@core/Store';
import { ReminderSectionData } from './reminder';
import { STORAGE_KEYS, CATEGORIES } from '@src/shared/constants';

interface ReminderState {
  sections: ReminderSectionData[];
}

/**
 * 리마인더 데이터를 관리하는 스토어 클래스
 */
class ReminderStore extends Store<ReminderState> {
  constructor() {
    // 오늘 날짜 기준 예시 시간 생성
    const today = new Date();
    
    const initialSections: ReminderSectionData[] = [
      { id: CATEGORIES.EVERYDAY, title: 'Everyday', isFixed: true, items: [
        { id: 1, text: '약 먹기', time: new Date(new Date(today).setHours(14, 0, 0, 0)), isAllDay: false, notified: true, done: true },
        { id: 2, text: '알고리즘 문제 풀기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
        { id: 3, text: '산책하기', time: new Date(new Date(today).setHours(23, 0, 0, 0)), isAllDay: false, notified: false, done: true },
      ]},
      { id: CATEGORIES.TODO, title: 'To Do', isFixed: true, items: [
        { id: 4, text: '책 반납하기', isAllDay: true, notified: false, done: false },
        { id: 5, text: '편의점 택배 보내고 오기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
      ]},
      { id: CATEGORIES.WORK, title: 'Work', isFixed: false, items: [] },
    ];

    super({ sections: initialSections }, STORAGE_KEYS.REMINDER);
    this.loadAndHydrate();
  }

  /* -------------------------------------------------------------------------- */
  /* Helper Methods (Encapsulation)                                             */
  /* -------------------------------------------------------------------------- */

  private updateSection(sectionId: string, updater: (section: ReminderSectionData) => ReminderSectionData) {
    this.setState({
      sections: this.state.sections.map(s => s.id === sectionId ? updater(s) : s)
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Public Actions                                                             */
  /* -------------------------------------------------------------------------- */

  private async loadAndHydrate() {
    if (!this.storageKey || !(window as any).api) return;
    try {
      const savedData = await (window as any).api.invoke('reminder:get-all', this.storageKey);
      if (savedData && savedData.sections) {
        // 날짜 객체 복원 (Hydration) 및 유효성 검사
        const hydratedSections = savedData.sections.map((section: any) => ({
          ...section,
          items: section.items.map((item: any) => {
            let hydratedTime: Date | undefined = undefined;
            
            if (item.time) {
              const date = new Date(item.time);
              if (!isNaN(date.getTime())) {
                hydratedTime = date;
              }
            }

            return {
              ...item,
              time: hydratedTime,
              isAllDay: item.isAllDay ?? (item.time === 'All Day'),
              notified: item.notified ?? false,
              done: item.done ?? false
            };
          })
        }));
        this.setState({ sections: hydratedSections });
      } else {
        // 저장된 데이터가 없으면 초기 데이터를 강제로 저장 (하드디스크에 쓰기)
        console.log("[ReminderStore] Storage is empty. Persisting initial state...");
        this.forceSave();
      }
    } catch (e) {
      console.error(`[ReminderStore] Load error:`, e);
    }
  }

  addSection(title: string) {
    const newSection: ReminderSectionData = {
      id: `SECTION_${Date.now()}`,
      title,
      isFixed: false,
      items: [],
    };
    this.setState({ sections: [...this.state.sections, newSection] });
  }

  updateSectionTitle(sectionId: string, title: string) {
    this.updateSection(sectionId, s => ({ ...s, title }));
  }

  deleteSection(sectionId: string) {
    this.setState({
      sections: this.state.sections.filter(s => s.isFixed || s.id !== sectionId)
    });
  }

  addReminder(sectionId: string, text: string, time?: Date, isAllDay: boolean = false) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: [...s.items, { id: Date.now(), text, time, isAllDay, notified: false, done: false }]
    }));
  }

  toggleReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, done: !item.done } : item)
    }));
  }

  updateReminder(sectionId: string, reminderId: number, text: string, time?: Date, isAllDay: boolean = false) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, text, time, isAllDay, notified: false } : item)
    }));
  }

  deleteReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.filter(item => item.id !== reminderId)
    }));
  }

  /**
   * 알림을 보낸 후 상태를 업데이트하는 메서드
   */
  markAsNotified(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, notified: true } : item)
    }));
  }
}

export const reminderStore = new ReminderStore();
