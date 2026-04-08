## 프로젝트 소개

> Vanilla JavaScript, TypeScript, Electron 기반의 데스크탑 애플리케이션입니다.

저는 정해진 루틴대로 생활하고 있으며, 약도 제시간에 챙겨 먹어야 합니다. 하지만 핸드폰을 자주 보지 않아 시간을 놓치는 경우가 많았습니다.  
이러한 문제를 해결하기 위해 이 애플리케이션을 만들었습니다.  
이 애플리케이션은 데스크탑 환경에서 알림을 통해 중요한 일정을 놓치지 않도록 도와줍니다.

<br />

## 프로젝트 목표

1. **JavaScript 기본기 강화**: React와 같은 프레임워크 없이 순수 JavaScript로 애플리케이션을 구현하여 JavaScript의 기본기를 다집니다.
2. **TypeScript 이해**: TypeScript를 사용하여 코드의 안정성과 가독성을 높이는 방법을 익힙니다.
3. **Electron 학습**: Electron을 사용하여 웹 애플리케이션을 데스크탑 애플리케이션으로 변환하는 방법을 학습합니다.
4. **React 심화 이해**: 바닐라 JavaScript와 비교를 통해 React의 장점과 효율성을 심도 있게 이해합니다.

<br />

## 시작 가이드

#### 요구사항

#### Installation

```
// 아직 제작 중입니다......
```

<br />

## 주요 구현 기능

- [x] 컴포넌트 구현: 클래스 컴포넌트와 생명주기 메서드를 사용하여 애플리케이션의 UI 구성 요소를 구현합니다. 이를 통해 React의 생명주기 관리와 상태 관리에 대한 깊은 이해를 목표로 합니다.
- [x] 라우팅 구현: 클래스를 활용하여 페이지 간의 이동을 처리하는 라우팅 기능을 구현합니다. 이를 통해 SPA (Single Page Application) 라우팅의 기본 원리를 학습합니다.
- [x] JSX 구현: JSX와 유사한 구문을 직접 구현하여 React의 컴포넌트 렌더링 방식과 유사한 방식으로 UI를 구성합니다.
- [x] 전역 상태 관리 구현: Observable 패턴 기반의 `Store` 클래스와 컴포넌트 구독(Subscribe) 시스템을 직접 구현하여, 전역 상태 변화에 따른 자동 리렌더링 기능을 지원합니다.
- [x] 가상 돔 구현: 가상 돔을 사용하여 효율적인 DOM 조작을 구현합니다. 이를 통해 실제 DOM 조작의 비용을 최소화하고 성능을 향상시키는 방법을 학습합니다.

<br />

## 기술 스택

[![stackticon](https://firebasestorage.googleapis.com/v0/b/stackticon-81399.appspot.com/o/images%2F1718175676976?alt=media&token=ad75a0ff-7d96-4a64-8e86-58a008493a95)](https://github.com/msdio/stackticon)

<br />

## 🚀 향후 개발 로드맵 (Roadmap)

본 프로젝트는 Nest.js 백엔드 통합 전까지 데스크톱 앱으로서의 완성도를 높이는 데 집중합니다.

### **1단계: 다크모드 스타일링 완성 (UI/UX)**
- [x] `style.css` 내 다크모드(`dark-mode`) 전용 색상 변수 정의
- [x] 시스템 테마 감지 (`matchMedia`) 및 자동 적용 기능

### **2단계: 데이터 영속성 확보 (Persistence)**
- [ ] `localStorage` 또는 `electron-store`를 활용한 상태 자동 저장
- [ ] 앱 재시작 시 리마인더 목록 및 사용자 설정(테마 등) 복구

### **3단계: 검색 및 필터링 기능 (Features)**
- [ ] 상단 검색바 UI 추가 및 실시간 리스트 필터링 구현
- [ ] 카테고리별/상태별 필터링 기능 고도화

### **4단계: 커스텀 타이틀바 및 프레임리스 윈도우 (Desktop Experience)**
- [ ] Electron 기본 타이틀바 제거 (`frame: false`)
- [ ] HTML/CSS/IPC를 활용한 직접 디자인한 창 제어 버튼(닫기/최소화/최대화) 구현

### **5단계: 네이티브 시스템 알림 (Advanced)**
- [ ] 리마인더별 시간 설정 UI 추가
- [ ] 지정된 시간에 Electron 네이티브 알림(Notification API) 전송 로직 구현
