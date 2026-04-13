export type Listener = () => void;

/**
 * 전역 상태 관리를 위한 Store 클래스
 * localStorage를 통한 데이터 영속성(Persistence)을 지원합니다.
 */
export class Store<T extends object> {
  protected state: T;
  private storageKey: string | null;
  private listeners: Set<Listener> = new Set();

  constructor(initialState: T, storageKey: string | null = null) {
    this.storageKey = storageKey;
    
    // 1. 로컬 저장소에서 데이터 복구 시도
    const savedRaw = this.storageKey ? localStorage.getItem(this.storageKey) : null;
    
    try {
      const savedState = savedRaw ? JSON.parse(savedRaw) : null;
      
      if (savedState) {
        // 로컬 스토리지 데이터가 있으면 우선적으로 사용 (병합하지 않고 덮어쓰기)
        // 단, 객체 형태일 때만 전개 연산자로 안전하게 복사
        this.state = typeof savedState === 'object' ? { ...savedState } : savedState;
      } else {
        this.state = initialState;
      }
    } catch (e) {
      console.error(`[Store] Failed to parse saved state for key "${this.storageKey}":`, e);
      this.state = initialState;
    }
  }

  /**
   * 현재 상태를 반환합니다.
   */
  getState(): T {
    return this.state;
  }

  /**
   * 상태를 업데이트하고 모든 구독자에게 알림을 보냅니다.
   * storageKey가 설정되어 있다면 localStorage에 자동으로 저장합니다.
   */
  setState(newState: Partial<T>) {
    const nextState = { ...this.state, ...newState };
    
    // 이전 상태와 다음 상태의 JSON 문자열 비교를 통해 실제 변경 여부 확인
    const prevStateJson = JSON.stringify(this.state);
    const nextStateJson = JSON.stringify(nextState);

    if (prevStateJson === nextStateJson) return;

    this.state = nextState;
    
    if (this.storageKey) {
      try {
        localStorage.setItem(this.storageKey, nextStateJson);
      } catch (e) {
        console.error(`[Store] Failed to save state for key "${this.storageKey}":`, e);
      }
    }

    this.notify();
  }

  /**
   * 상태 변경을 구독합니다.
   */
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 등록된 모든 리스너를 실행합니다.
   */
  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
