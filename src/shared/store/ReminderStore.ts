import { Store } from '@core/Store';
import { ReminderSectionData } from '../types/reminder';

interface ReminderState {
  sections: ReminderSectionData[];
}

class ReminderStore extends Store<ReminderState> {
  constructor() {
    super({
      sections: [
        {
          id: 'EVERYDAY',
          title: 'Everyday',
          isFixed: true,
          items: [
            { id: 1, text: '약 먹기', time: '2:00 PM', done: true },
            { id: 2, text: '알고리즘 문제 풀기', time: '4:00 PM', done: false },
            { id: 3, text: '산책하기', time: '6:00 PM', done: false },
          ],
        },
        {
          id: 'TODO',
          title: 'To Do',
          isFixed: true,
          items: [
            { id: 4, text: '책 반납하기', time: 'All Day', done: false },
            { id: 5, text: '편의점 택배 보내고 오기', time: '4:00 PM', done: false },
          ],
        },
        {
          id: 'WORK',
          title: 'Work',
          isFixed: false,
          items: [],
        },
      ],
    }, 'vanilla_reminder_data'); // 로컬 저장소 키
  }

  /**
   * 새로운 섹션을 추가합니다.
   */
  addSection(title: string) {
    const newSection: ReminderSectionData = {
      id: `SECTION_${Date.now()}`,
      title,
      isFixed: false,
      items: [],
    };
    this.setState({ sections: [...this.state.sections, newSection] });
  }

  /**
   * 특정 항목을 삭제합니다.
   */
  deleteReminder(sectionId: string, reminderId: number) {
    const nextSections = this.state.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.filter((item) => item.id !== reminderId),
      };
    });
    this.setState({ sections: nextSections });
  }

  /**
   * 특정 항목의 완료 상태를 토글합니다.
   */
  toggleReminder(sectionId: string, reminderId: number) {
    const nextSections = this.state.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === reminderId ? { ...item, done: !item.done } : item
        ),
      };
    });
    this.setState({ sections: nextSections });
  }

  /**
   * 섹션에 새로운 항목을 추가합니다.
   */
  addReminder(sectionId: string, text: string, time?: string) {
    const nextSections = this.state.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: [
          ...section.items,
          { id: Date.now(), text, time, done: false },
        ],
      };
    });
    this.setState({ sections: nextSections });
  }

  /**
   * 특정 항목의 내용을 업데이트합니다.
   */
  updateReminder(sectionId: string, reminderId: number, text: string, time?: string) {
    const nextSections = this.state.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === reminderId ? { ...item, text, time } : item
        ),
      };
    });
    this.setState({ sections: nextSections });
  }

  /**
   * 섹션 자체를 삭제합니다. (isFixed가 아닐 때만)
   */
  deleteSection(sectionId: string) {
    const nextSections = this.state.sections.filter(
      (s) => s.isFixed || s.id !== sectionId
    );
    this.setState({ sections: nextSections });
  }
}

export const reminderStore = new ReminderStore();
