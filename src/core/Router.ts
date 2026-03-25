import { Component, ComponentProps } from './Component';

export class Router {
  private static instance: Router;
  private routes: Record<
    string,
    new (target: HTMLElement, props: any) => Component<any, any>
  > = {};
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

  add(path: string, page: new (target: HTMLElement, props: any) => Component<any, any>) {
    this.routes[path] = page as any;
  }

  resolve() {
    let { pathname } = window.location;
    // Electron 파일 모드일 경우 /index.html 등이 포함될 수 있으므로 정규화
    if (pathname.endsWith('index.html')) pathname = '/';
    
    console.log('[Router] Current Path:', pathname);
    const route = this.routes[pathname] || this.routes['/'];
    
    if (route) {
      const target = document.getElementById('root');
      if (target) {
        console.log('[Router] Found route for:', pathname);
        // 1. 기존 페이지 언마운트
        if (this.currentPage) {
          this.currentPage.componentWillUnmount();
        }

        // 2. 새 페이지 생성 및 마운트
        this.currentPage = new route(target, {});
        this.currentPage.render();
      }
    } else {
      console.error('[Router] Route not found for:', pathname);
    }
  }

  navigate(path: string) {
    window.history.pushState({}, path, window.location.origin + path);
    this.resolve();
  }
}
