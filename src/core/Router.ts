export class Router {
  private static instance: Router;
  routes: any = {};

  constructor() {
    window.addEventListener('popstate', this.resolve.bind(this));
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  add(path: string, page: any) {
    this.routes[path] = page;
  }

  resolve() {
    const { pathname } = window.location;
    const route = this.routes[pathname] || this.routes[404];
    if (route) {
      const page = new route();
      page.render();
    }
  }

  navigate(path: string) {
    console.log(path);
    window.history.pushState({}, path, window.location.origin + path);
    this.resolve();
  }
}
