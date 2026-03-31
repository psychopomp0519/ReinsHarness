# Reins — AI Agent Harness

이 프로젝트에는 Reins 하네스가 설치되어 있습니다.

## 프로젝트 개요

[프로젝트별 1~2줄 설명 — reins init 시 자동 생성]

## 핵심 원칙

1. 작업 시작 전 적절한 모드 스킬을 invoke하라
2. 모드 전환 시 docs/progress.md에 상태를 기록한다
3. 실패는 자동 학습된다 (.reins/learnings/)

## 스킬 사용 규칙

<HARD-GATE>
스킬이 적용될 가능성이 1%라도 있으면 반드시 invoke하라. 다음 생각이 들면 STOP하고 스킬을 확인하라:

| 이 생각이 들면 | 실제 해야 할 일 |
|--------------|---------------|
| "이건 간단한 질문이라 스킬이 필요 없어" | 질문도 작업이다. 스킬을 확인하라. |
| "먼저 코드베이스를 탐색해야 해" | 스킬이 탐색 방법을 알려준다. 먼저 확인하라. |
| "추가 맥락이 필요해" | 스킬 확인이 맥락 수집보다 우선이다. |
| "이미 어떻게 할지 알고 있어" | 스킬이 놓친 단계를 잡아준다. 확인하라. |
| "스킬을 쓰면 오히려 느려져" | 스킬을 건너뛰면 나중에 더 느려진다. |
</HARD-GATE>

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

### 라우팅 우선순위

충돌 시: 프로세스 스킬 > 구현 스킬 > 검증 스킬

### 제외 규칙

- 사용자가 "그냥 해줘", "스킬 없이"라고 하면 스킬을 invoke하지 않는다
- 1~2문장 간단한 질문에는 스킬을 invoke하지 않는다
- 이미 해당 스킬이 활성 상태이면 다시 invoke하지 않는다

## 기본 흐름

plan → dev → review → (이슈 있으면 dev 복귀) → deploy

## 완료 상태 프로토콜

모든 스킬/작업 완료 시 다음 상태 중 하나를 보고하라:

| 상태 | 의미 | 다음 행동 |
|------|------|----------|
| DONE | 완전히 완료 | 다음 단계 진행 |
| DONE_WITH_CONCERNS | 완료했지만 우려 있음 | 우려 사항 제시 후 진행 |
| NEEDS_CONTEXT | 추가 정보 필요 | 필요한 정보 명시 |
| BLOCKED | 진행 불가 | 차단 사유 + 제안 |

3회 이상 시도 실패 시 → BLOCKED 보고. "이건 너무 어렵습니다" 보고는 항상 허용.

## 지시 우선순위

1. 사용자 명시적 지시 (CLAUDE.md, 직접 요청) — 최우선
2. Reins 스킬 지시 — 기본 행동 재정의
3. 기본 시스템 동작 — 최하위

사용자 지시와 스킬이 충돌하면 사용자 지시를 따른다.

## 출력 포맷 규칙

- `━━━` 구분선 + `[Phase N]` 헤더로 단계 구분
- 멀티스텝: `[1/N]` 번호 카운터 + `[카테고리]` 태그
- 검증/감사: 심각도 테이블 (PASS/FAIL/SKIP, CRITICAL/HIGH/MEDIUM 열)
- 수정 후: Before/After 비교 테이블
- 사용자 선택: 번호 목록 + `번호, all, none` 입력 안내
- 응답 끝: `요약: [결과] | 다음: [행동]`

## 팩

설치된 팩: .reins/packs/ 자동 탐색. /pack 으로 관리.

## 빌드·테스트

[프로젝트별 명령어 — reins init 시 자동 생성]
