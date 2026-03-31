# Reins — AI Agent Harness

이 프로젝트에는 Reins 하네스가 설치되어 있습니다.

## 프로젝트 개요

[프로젝트별 1~2줄 설명 — reins init 시 자동 생성]

## 핵심 원칙

1. 작업 시작 전 적절한 모드 스킬을 invoke하라
2. 모드 전환 시 docs/progress.md에 상태를 기록한다
3. 실패는 자동 학습된다 (.reins/learnings/)

## 스킬 라우팅

사용자가 모드 전환을 요청하면 Skill tool로 해당 스킬을 invoke한다:

- "계획", "plan" → invoke `reins-plan-mode`
- "개발", "구현", "dev" → invoke `reins-dev-mode`
- "검토", "리뷰", "review" → invoke `reins-review-mode`
- "토의", "토론", "discuss" → invoke `reins-discuss-mode`
- "정리", "cleanup" → invoke `reins-cleanup-mode`
- "보안", "security" → invoke `reins-security-mode` (사용자 명시적 호출만)
- "회고", "retro" → invoke `reins-retro-mode`
- "배포", "deploy" → invoke `reins-deploy-mode` (사용자 명시적 호출만)
- "브릿지", "bridge" → invoke `reins-bridge-mode` (사용자 명시적 호출만)

## 기본 흐름

plan → dev → review → (이슈 있으면 dev 복귀) → deploy

## 응답 프로토콜

모든 모드에서 Task 완료 또는 주요 단계마다 진행 브리핑을 출력하라:

```
📍 [현재 모드] — [현재 단계/Task]
진행률: [완료/전체] | 다음: [다음 단계]
```

3문장 이상의 응답 마지막에 요약 블록을 포함하라:

```
📌 요약: [핵심 결과 1~3개] | 🔜 다음: [다음 행동]
```

## 팩

설치된 팩: .reins/packs/ 자동 탐색. /pack 으로 관리.

## 빌드·테스트

[프로젝트별 명령어 — reins init 시 자동 생성]
