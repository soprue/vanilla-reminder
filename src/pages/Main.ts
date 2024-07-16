import { Router } from '@src/Router';
import { Component, ComponentProps } from '../Component';

export default class MainPage extends Component {
  constructor(props: ComponentProps) {
    super(props);
  }

  render() {
    const element = document.getElementById('root');
    if (element) {
      element.innerHTML = `
        <div>
          <button id="go-to-login">Go to Login</button>
        </div>
      `;
      document.getElementById('go-to-login')?.addEventListener('click', () => {
        console.log(1);
        const router = Router.getInstance(); // 전역 Router 인스턴스 사용
        router.navigate('/login');
        console.log(2);
      });
    }
  }
}
