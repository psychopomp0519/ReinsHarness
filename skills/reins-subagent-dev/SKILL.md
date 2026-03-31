---
name: reins-subagent-dev
description: >
  Use when implementing tasks that benefit from fresh-context agents,
  when the user says "서브에이전트로 개발", "subagent development",
  or when dev mode encounters complex tasks requiring isolated execution.
allowed-tools: "Read, Grep, Glob, Bash, Write, Edit"
---

# Subagent-Driven Development

서브에이전트 기반 개발 패턴. 각 태스크를 독립된 에이전트에게 위임하여 신선한 컨텍스트에서 실행한다.

## 핵심 원칙

1. **Fresh Agent per Task** — 각 구현 태스크마다 새로운 Agent를 spawn한다. 컨텍스트 오염을 방지한다.
2. **Two-Stage Review** — 모든 결과물은 스펙 준수 검증 → 코드 품질 검증 2단계를 거친다.
3. **Clear Status Protocol** — 각 에이전트는 반드시 4가지 상태 중 하나로 완료를 보고한다.

## 에이전트 상태 프로토콜

| 상태 | 의미 | 다음 행동 |
|------|------|----------|
| `DONE` | 태스크 완전 완료 | 리뷰 단계로 진행 |
| `DONE_WITH_CONCERNS` | 완료했지만 우려 사항 있음 | 우려 사항 검토 후 판단 |
| `NEEDS_CONTEXT` | 추가 정보 필요 | 요청된 컨텍스트 제공 후 재실행 |
| `BLOCKED` | 진행 불가 | 상위 에이전트가 블로커 해결 |

## 모델 선택 가이드

- **복잡한 태스크** (아키텍처 변경, 다중 파일 리팩토링, 새 시스템 설계) → `opus` 모델
- **단순한 태스크** (단일 함수 구현, 테스트 작성, 포맷 변경) → `sonnet` 모델
- 판단 기준: 파일 3개 이상 수정 또는 설계 판단 필요 → opus

## 워크플로우

### 1단계: 태스크 분해

계획 모드에서 받은 태스크 목록을 검토하고, 각 태스크의 복잡도와 의존성을 파악한다.

```
태스크 분석:
- 독립 실행 가능한가?
- 다른 태스크의 결과에 의존하는가?
- 예상 복잡도는? (모델 선택에 사용)
```

### 2단계: 에이전트 Spawn

각 태스크에 대해 Agent tool을 호출한다. 프롬프트에 반드시 포함할 것:

```
Agent tool 호출 패턴:

prompt: |
  ## 태스크
  [구체적인 태스크 설명]

  ## 컨텍스트
  - 프로젝트 루트: [path]
  - 관련 파일: [file list]
  - 의존성: [dependency info]

  ## 완료 조건
  [스펙에서 추출한 구체적 조건]

  ## 보고 형식
  작업 완료 시 반드시 다음 형식으로 보고하라:
  STATUS: [DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED]
  SUMMARY: [1-2문장 요약]
  FILES_CHANGED: [변경된 파일 목록]
  CONCERNS: [있을 경우만]
```

### 3단계: Two-Stage Review

**Stage 1 — 스펙 준수 검증:**
- 완료 조건 체크리스트 대조
- 누락된 요구사항 확인
- 엣지 케이스 처리 여부

**Stage 2 — 코드 품질 검증:**
- 기존 코드 스타일과의 일관성
- 에러 핸들링 적절성
- 테스트 커버리지
- 불필요한 변경 없는지 확인

### 4단계: 통합

모든 서브에이전트 결과를 통합하고 전체 시스템 수준에서 검증한다.

## 의존성 있는 태스크 처리

태스크 간 의존성이 있는 경우:

1. 의존성 그래프를 작성한다
2. 독립 태스크를 먼저 실행한다
3. 선행 태스크 완료 후 그 결과를 후속 태스크의 컨텍스트로 전달한다
4. 순환 의존성이 발견되면 태스크를 재분해한다

## 실패 처리

- `NEEDS_CONTEXT` → 요청된 정보를 수집하여 동일 태스크를 새 에이전트로 재실행
- `BLOCKED` → 블로커 원인 분석 후, 필요시 태스크 재분해 또는 사용자에게 에스컬레이션
- 동일 태스크 3회 실패 → 태스크 자체의 정의가 잘못되었을 가능성. 계획 재검토 필요.

## 진행률 보고

각 에이전트 완료 시마다 브리핑:

```
📍 [subagent-dev] — Task [N/Total]
상태: [STATUS] | 모델: [opus/sonnet]
변경: [files] | 다음: [next task or review]
```
