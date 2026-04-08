import { Store } from '@src/core/Store';

interface ThemeState {
  isDarkMode: boolean;
}

class ThemeStore extends Store<ThemeState> {
  constructor() {
    // 1. 시스템 테마 설정을 초기값으로 사용
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    super({ 
      isDarkMode: systemDark 
    });

    // 2. 시스템 테마 변경 실시간 감지 리스너 등록
    this.initSystemThemeListener();
  }

  private initSystemThemeListener() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 시스템 테마가 바뀌면 자동으로 스토어 상태 업데이트
    darkModeMediaQuery.addEventListener('change', (e) => {
      this.setState({ isDarkMode: e.matches });
    });
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.getState().isDarkMode });
  }

  get isDarkMode() {
    return this.getState().isDarkMode;
  }
}

export const themeStore = new ThemeStore();
