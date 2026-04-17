# Tickit (틱잇)

> 체크하고, 관리하는 티켓처럼. Vanilla JavaScript, TypeScript, Electron 기반의 데스크탑 리마인더 애플리케이션입니다.

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
- Node.js (v18 이상 권장)
- npm 또는 yarn

#### Installation

```bash
npm install
npm run build
npm start
```

<br />

## 주요 구현 기능

- [x] **커스텀 프레임워크**: 클래스 컴포넌트와 생명주기 메서드(`init`, `render`, `componentDidUpdate`)를 직접 구현.
- [x] **라우팅 시스템**: Hash 기반의 SPA 라우터 구현.
- [x] **JSX 파서**: `jsx` 태그 템플릿 리터럴을 통한 선언적 UI 구조 지원.
- [x] **전역 상태 관리**: Observable 패턴 기반의 `Store` 시스템으로 상태 변경 시 자동 리렌더링.
- [x] **데이터 영속성**: Electron IPC를 통한 로컬 파일 시스템 저장 및 복구.
- [x] **시스템 알림**: 지정된 시간에 맞춰 데스크탑 네이티브 알림 발송.

<br />

## 기술 스택

- **Frontend**: Vanilla TypeScript, CSS Modules
- **Desktop**: Electron
- **Build**: Webpack, TypeScript Compiler

<br />

## 🚀 향후 개발 로드맵 (Roadmap)

### **1단계: React 마이그레이션 (Planned)**
- [ ] 현재의 커스텀 프레임워크를 React로 전환
- [ ] `Store.ts`를 `Zustand` 또는 `Context API`로 교체
- [ ] `Component.ts` 기반 설계를 함수형 컴포넌트와 Hooks로 전환

### **2단계: 기능 고도화**
- [ ] 리마인더 반복 설정 (매일, 매주 등)
- [ ] 카테고리별 컬러 커스터마이징
