import MyComponent from '../components/MyComponent';

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('root');
  if (root) {
    const myComponent = new MyComponent({ someProp: 'value' });
    myComponent.render();
  }
});
