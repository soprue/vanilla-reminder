import MainPage from '@pages/Main';

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('root');
  if (root) {
    const mainPage = new MainPage({});
    mainPage.render();
  }
});
