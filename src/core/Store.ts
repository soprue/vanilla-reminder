export type Listener = () => void;

/**
 * 전역 상태 관리를 위한 Store 클래스
 * Electron IPC를 통한 파일 기반 영속성 및 디바운싱 저장을 지원합니다.
 */
export class Store<T extends object> {
  protected state: T;
  private storageKey: string | null;
  private listeners: Set<Listener> = new Set();
  
  // 저장 상태 추적
  private _isSaving = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(initialState: T, storageKey: string | null = null) {
    this.storageKey = storageKey;
    this.state = initialState;
    this.loadInitialState();
  }

  /**
   * 저장 중인지 여부를 반환합니다.
   */
  get isSaving() {
    return this._isSaving;
  }

  private async loadInitialState() {
    if (!this.storageKey || typeof window === 'undefined' || !(window as any).api) return;
    try {
      const savedData = await (window as any).api.invoke('reminder:get-all', this.storageKey);
      if (savedData) {
        this.state = { ...this.state, ...savedData };
        this.notify();
      }
    } catch (e) {
      console.error(`[Store] Load error:`, e);
    }
  }

  getState(): T {
    return this.state;
  }

  /**
   * 상태를 업데이트하고 디바운싱된 저장을 수행합니다.
   */
  setState(newState: Partial<T>) {
    const nextState = { ...this.state, ...newState };
    if (JSON.stringify(this.state) === JSON.stringify(nextState)) return;

    this.state = nextState;
    this.notify(); // UI는 즉시 업데이트 (낙관적 업데이트)

    // 디바운싱 저장 (0.3초)
    if (this.storageKey) {
      this.debounceSave();
    }
  }

  private debounceSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    
    this._isSaving = true;
    this.notify(); // 저장 중 상태 알림

    this.saveTimeout = setTimeout(async () => {
      if (!this.storageKey || !(window as any).api) return;
      
      try {
        await (window as any).api.invoke('reminder:save', {
          key: this.storageKey,
          data: this.state
        });
      } catch (err) {
        console.error('[Store] Save failed:', err);
      } finally {
        this._isSaving = false;
        this.notify(); // 저장 완료 알림
      }
    }, 300);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
