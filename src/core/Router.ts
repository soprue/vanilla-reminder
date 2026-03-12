import { Component, ComponentProps } from './Component';

export class Router {
  private static instance: Router;
  private routes: Record<string, new (props: any) => Component<any, any>> = {};

  private constructor() {
    window.addEventListener('popstate', this.resolve.bind(this));
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  add(path: string, page: new (props: any) => Component<any, any>) {
    this.routes[path] = page;
  }

  resolve() {
    const { pathname } = window.location;
    const route = this.routes[pathname] || this.routes['404'];
    if (route) {
      const page = new route({});
      page.render();
    }
  }

  navigate(path: string) {
    window.history.pushState({}, path, window.location.origin + path);
    this.resolve();
  }
}
