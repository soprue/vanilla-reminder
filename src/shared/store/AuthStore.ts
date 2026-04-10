import { Store } from '@src/core/Store';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string } | null;
}

class AuthStore extends Store<AuthState> {
  constructor() {
    super({ 
      isLoggedIn: false, 
      user: null
    }, 'vanilla_reminder_auth'); // 저장 키 추가
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
}

export const authStore = new AuthStore();
