# Vanilla Reminder Project Guidelines

이 프로젝트는 **Electron**과 **Vanilla TypeScript** 기반의 커스텀 프레임워크를 사용합니다. 
AI는 작업을 시작하기 전, 아래 규칙 중 현재 작업 범위에 해당하는 상세 지침을 먼저 읽고 준수해야 합니다.

## 📌 규칙 인덱스 (Rule Index)
- **프레임워크 코어 (.gemini/rules/framework.md)**: `Component`, `JSX`, `Router` 활용 및 생명주기 규칙.
- **Electron 아키텍처 (.gemini/rules/electron.md)**: 메인/렌더러 프로세스 분리 및 IPC 통신 규칙.
- **스타일 및 UI (.gemini/rules/style.md)**: CSS 네이밍 및 컴포넌트 스타일링 규칙.
- **Git 워크플로우 (.gemini/rules/git.md)**: 논리적 단위 커밋 및 메시지 컨벤션 규칙.

---

## 🛠 기본 원칙 (Core Principles)
1. **모듈성**: 모든 UI는 `Component`를 상속받은 독립적인 클래스로 구성합니다.
2. **보안**: 렌더러 프로세스에서 Node.js API를 직접 호출하지 않습니다 (`preload.cjs` 활용).
3. **단방향 흐름**: 가능한 `state` 변경을 통해 UI를 갱신하며, 직접적인 DOM 조작은 최소화합니다.
