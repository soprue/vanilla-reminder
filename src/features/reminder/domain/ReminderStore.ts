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
    const initialSections: ReminderSectionData[] = [
      { id: CATEGORIES.EVERYDAY, title: 'Everyday', isFixed: true, items: [
        { id: 1, text: '약 먹기', time: '2:00 PM', done: true },
        { id: 2, text: '알고리즘 문제 풀기', time: '4:00 PM', done: false },
        { id: 3, text: '산책하기', time: '11:00 PM', done: true },
      ]},
      { id: CATEGORIES.TODO, title: 'To Do', isFixed: true, items: [
        { id: 4, text: '책 반납하기', time: 'All Day', done: false },
        { id: 5, text: '편의점 택배 보내고 오기', time: '4:00 PM', done: false },
      ]},
      { id: CATEGORIES.WORK, title: 'Work', isFixed: false, items: [] },
    ];

    super({ sections: initialSections }, STORAGE_KEYS.REMINDER);
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

  addReminder(sectionId: string, text: string, time?: string) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: [...s.items, { id: Date.now(), text, time, done: false }]
    }));
  }

  toggleReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, done: !item.done } : item)
    }));
  }

  updateReminder(sectionId: string, reminderId: number, text: string, time?: string) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, text, time } : item)
    }));
  }

  deleteReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.filter(item => item.id !== reminderId)
    }));
  }
}

export const reminderStore = new ReminderStore();
