import { Router } from '@core/Router';
import MainPage from '@pages/Main';
import LoginPage from '@pages/Login';

document.addEventListener('DOMContentLoaded', function () {
  const router = Router.getInstance();
  router.add('/', MainPage);
  router.add('/login', LoginPage);

  router.resolve();
});
