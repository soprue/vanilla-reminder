import { Store } from '@src/core/Store';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string } | null;
  isDarkMode: boolean;
}

class AuthStore extends Store<AuthState> {
  constructor() {
    super({ 
      isLoggedIn: false, 
      user: null,
      isDarkMode: false // 초기 테마 상태
    });
  }

  login(name: string) {
    this.setState({
      isLoggedIn: true,
      user: { name },
    });
  }

  logout() {
    this.setState({ isLoggedIn: false, user: null });
  }

  toggleDarkMode() {
    this.setState({ isDarkMode: !this.getState().isDarkMode });
  }
}

export const authStore = new AuthStore();
