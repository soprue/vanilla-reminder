import MainPage from '../pages/Main';

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('root');
  if (root) {
    const mainPage = new MainPage({ someProp: 'value' });
    mainPage.render();
  }
});
