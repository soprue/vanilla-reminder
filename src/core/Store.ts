export type Listener = () => void;

/**
 * 전역 상태 관리를 위한 Store 클래스
 */
export class Store<T extends object> {
  private state: T;
  protected listeners: Set<Listener> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  /**
   * 현재 상태 반환
   */
  getState(): T {
    return this.state;
  }

  /**
   * 상태를 업데이트하고 모든 구독자에게 알림
   */
  setState(newState: Partial<T>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * 상태 변경을 구독
   */
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 등록된 모든 리스너 실행
   */
  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
