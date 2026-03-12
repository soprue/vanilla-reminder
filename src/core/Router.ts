import { Component, ComponentProps } from './Component';

export class Router {
  private static instance: Router;
  private routes: Record<string, new (props: any) => Component<any, any>> = {};
  private currentPage: Component<any, any> | null = null;

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
      // 1. 기존 페이지 언마운트 (생명주기 관리)
      if (this.currentPage) {
        this.currentPage.componentWillUnmount();
      }

      // 2. 새 페이지 생성 및 마운트
      this.currentPage = new route({});
      this.currentPage.render();
    }
  }

  navigate(path: string) {
    window.history.pushState({}, path, window.location.origin + path);
    this.resolve();
  }
}
