import { Store } from '@core/Store';
import { STORAGE_KEYS } from '@src/shared/constants';

interface ThemeState {
  isDarkMode: boolean;
}

class ThemeStore extends Store<ThemeState> {
  constructor() {
    // 초기 테마 설정: 로컬 스토리지에 없으면 시스템 설정 확인
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    super({
      isDarkMode: systemDarkMode,
    }, STORAGE_KEYS.THEME);
    
    this.loadAndHydrate();
  }

  private async loadAndHydrate() {
    if (!this.storageKey || !(window as any).api) return;
    try {
      const savedData = await (window as any).api.invoke('reminder:get-all', this.storageKey);
      if (savedData && typeof savedData.isDarkMode === 'boolean') {
        this.setState({ isDarkMode: savedData.isDarkMode });
      }
    } catch (e) {
      console.error(`[ThemeStore] Load error:`, e);
    }
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.state.isDarkMode });
  }
}

export const themeStore = new ThemeStore();
