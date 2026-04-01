# Reins — 상세 명세서

> 버전: 0.1.0 | 최종 수정: 2026-04-01

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 이름 | Reins |
| 정체성 | 모드 기반 통합 AI 에이전트 하네스 |
| 대상 플랫폼 | Claude Code (1차), Codex CLI (2차, 브릿지) |
| 주 언어 | TypeScript 코어 + Markdown 스킬 (하이브리드) |
| 라이선스 | MIT |
| 저장소 | https://github.com/psychopomp0519/ReinsHarness |

### 핵심 아이디어

Claude Code가 기본적으로 제공하는 자유로운 에이전트 동작에 **구조**와 **안전장치**를 추가합니다.
"계획 → 개발 → 검토 → 배포"라는 소프트웨어 개발 라이프사이클을 모드로 분리하고,
각 모드에서 Claude가 따라야 할 워크플로우를 스킬 파일로 정의합니다.

### 설계 원칙

1. **모든 작업은 모드 안에서** — 구조 없는 자유 실행을 지양
2. **3계층 규칙** — 훅(100%) → 스킬(90%) → CLAUDE.md(80%)로 준수율 차등 관리
3. **자체 완결** — 설치 후 외부 네트워크 없이 모든 핵심 기능 동작
4. **확장 가능** — 도메인 팩으로 특화 기능 추가, 커스텀 모드 YAML로 사용자 정의

---

## 2. 아키텍처

### 2.1 전체 구조

```
┌─────────────────────────────────────────────┐
│                 사용자                        │
│            reins CLI (bash)                  │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│              Claude Code                     │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐    │
│  │ CLAUDE.md│ │ Skills/  │ │  Agents/  │    │
│  │(라우터)  │ │(20개)    │ │ (6+5개)   │    │
│  └─────────┘ └──────────┘ └───────────┘    │
│  ┌──────────────────────────────────────┐   │
│  │         Hooks (9개, TS→JS)           │   │
│  │  PreToolUse | PostToolUse | Stop     │   │
│  └──────────────────────────────────────┘   │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│           TypeScript 코어 (32 모듈)          │
│  mode-engine │ registry │ guardrails        │
│  learning    │ merge    │ updater           │
│  bridges     │ conductor│ profiler          │
│  plan-converter │ snapshot │ notifications  │
└─────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│           도메인 팩 (18개)                    │
│  ui-design(10) │ novel-writing(2) │ ...     │
│  각 팩: PACK.yaml + skills/ + agents/       │
└─────────────────────────────────────────────┘
```

### 2.2 규칙 3계층

| 계층 | 이름 | 준수율 | 구현 방식 | 예시 |
|------|------|--------|----------|------|
| 1 | 훅 | 100% | TypeScript → JS, settings.json에 주입 | .env 읽기 차단, DROP TABLE 차단 |
| 2 | 모드 스킬 | 90%+ | SKILL.md 내 지시, HARD-GATE 태그 | "설계 승인 전 코드 금지" |
| 3 | CLAUDE.md | 80% | 프로젝트 수준 가이드 | 반합리화 테이블, 라우팅 규칙 |

### 2.3 스킬 로드 흐름

```
사용자 입력: "/plan" 또는 "계획 세워줘"
    ↓
Claude Code가 description 매칭 → Skill tool 호출
    ↓
~/.claude/skills/plan/SKILL.md 로드 (심볼릭 링크 → reins-plan-mode)
    ↓
프론트매터 파싱 (name, description, allowed-tools)
    ↓
SKILL.md 본문이 Claude의 지시사항으로 로드
    ↓
Claude가 워크플로우를 따라 작업 수행
    ↓
완료 시 Handoff 섹션에 따라 다음 모드 제안
```

---

## 3. 모드 명세

### 3.1 모드 목록

| # | 모드 | 스킬명 | 별칭 | 자동호출 | 수동전용 |
|---|------|--------|------|---------|---------|
| 1 | 계획 | reins-plan-mode | /plan | ✅ | |
| 2 | 개발 | reins-dev-mode | /dev | ✅ | |
| 3 | 검토 | reins-review-mode | /review | ✅ | |
| 4 | 토의 | reins-discuss-mode | /discuss | ✅ | |
| 5 | 정리 | reins-cleanup-mode | /cleanup | ✅ | |
| 6 | 보안 | reins-security-mode | /security | | ✅ |
| 7 | 회고 | reins-retro-mode | /retro | ✅ | |
| 8 | 배포 | reins-deploy-mode | /deploy | | ✅ |
| 9 | 브릿지 | reins-bridge-mode | /bridge | | ✅ |

### 3.2 추가 스킬

| # | 스킬 | 별칭 | 용도 |
|---|------|------|------|
| 10 | reins-debug | /debug | 체계적 디버깅 |
| 11 | reins-subagent-dev | /subagent-dev | 서브에이전트 주도 개발 |
| 12 | reins-session-wrap | /session-wrap | 세션 마무리 |
| 13 | reins-mode | /mode | 모드 전환 라우터 |
| 14 | reins-pack | /pack | 팩 관리 |
| 15 | reins-merge | /merge | 외부 소스 병합 |
| 16 | reins-convert-plan | /convert-plan | 계획서 변환 |
| 17 | reins-snapshot | /snapshot | 스냅샷 관리 |
| 18 | reins-perf | /perf | 성능 프로파일링 |
| 19 | reins-briefing | /briefing | 브리핑 설정 |
| 20 | reins-learn | /learn | 학습 관리 |

### 3.3 모드 전환 흐름

```
plan ──→ dev ──→ review ──→ deploy ──→ retro
  ↑        ↓        ↓                    │
  │      discuss   dev (이슈 수정)        │
  └───────────────────────────────────────┘
```

**자연 전환 (자동 제안):**
- plan 승인 → dev
- dev Phase 완료 → review
- review 전체 통과 → deploy 또는 dev (다음 Phase)
- review 이슈 발견 → dev
- deploy 완료 → retro
- retro 완료 → plan (다음 반복)

---

## 4. 훅 명세

### 4.1 훅 목록 (9개)

| # | 파일 | 이벤트 | 대상 | 동작 |
|---|------|--------|------|------|
| 1 | auto-checkpoint.ts | PostToolUse | Write/Edit/MultiEdit | 변경 파일 N개 초과 시 커밋 제안 |
| 2 | auto-format.ts | PostToolUse | Write/Edit/MultiEdit | 편집 파일에 포매터 실행 |
| 3 | security-guard.ts | PreToolUse | Read | 민감 파일 읽기 차단 |
| 4 | learning-observer.ts | Stop | (전체) | 세션 종료 시 학습 기록 |
| 5 | context-compact.ts | PostToolUse | (전체) | 컨텍스트 60%+ 시 압축 알림 |
| 6 | security-auto-trigger.ts | PostToolUse | Edit/Write | 보안 민감 파일 수정 시 경고 |
| 7 | output-secret-filter.ts | PostToolUse | (전체) | 출력에 시크릿 노출 시 경고 |
| 8 | db-guard.ts | PreToolUse | Bash | DROP/TRUNCATE 등 차단 |
| 9 | remote-command-guard.ts | PreToolUse | Bash | printenv/chmod 777/kill -9 차단 |

### 4.2 settings.json 주입 형식

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit|MultiEdit", "hooks": [
        { "type": "command", "command": "node $REINS_HOME/hooks/dist/auto-format.js" },
        { "type": "command", "command": "node $REINS_HOME/hooks/dist/auto-checkpoint.js" }
      ]},
      { "matcher": "", "hooks": [
        { "type": "command", "command": "node $REINS_HOME/hooks/dist/context-compact.js" }
      ]}
    ],
    "PreToolUse": [
      { "matcher": "Read", "hooks": [
        { "type": "command", "command": "node $REINS_HOME/hooks/dist/security-guard.js" }
      ]}
    ],
    "Stop": [
      { "matcher": "", "hooks": [
        { "type": "command", "command": "node $REINS_HOME/hooks/dist/learning-observer.js" }
      ]}
    ]
  }
}
```

---

## 5. 가드레일 명세

### 5.1 규칙 목록 (12개)

| ID | 이름 | 대상 도구 | 결정 | 설명 |
|----|------|----------|------|------|
| R01 | No Sudo | Bash | deny | sudo/su 차단 |
| R02 | No Force Push | Bash | deny | git push --force 차단 |
| R03 | No Reset Hard | Bash | ask | git reset --hard 확인 |
| R04 | Secret File Read | Read | deny | .env/.pem/.key 읽기 차단 |
| R05 | Confirm rm -rf | Bash | ask | rm -rf 확인 |
| R06 | No Skip Hooks | Bash | deny | --no-verify 차단 |
| R07 | No Secrets in Code | Write/Edit | ask | 하드코딩 시크릿 감지 |
| R08 | No Out-of-Project Write | Write/Edit | ask | 프로젝트 외부 쓰기 확인 |
| R09 | No Redirect Protected | Bash | deny | > .env, tee .git/ 차단 |
| R10 | Infra File Warning | Write/Edit | ask | package.json, Dockerfile 수정 확인 |
| R11 | No Direct Push Protected | Bash | ask | main/master 직접 push 확인 |
| R12 | No Write Sensitive | Write/Edit | deny | .env/.git/.ssh 직접 쓰기 차단 |

### 5.2 결정 유형

- **approve** — 허용 (기본값, 규칙 미매칭 시)
- **deny** — 차단 (진행 불가)
- **ask** — 사용자 확인 요청

### 5.3 평가 방식

순차 평가, 첫 번째 매칭 규칙의 결정을 따름 (first-match-wins).

---

## 6. 팩 명세

### 6.1 팩 구조

```
packs/<이름>/
├── PACK.yaml           메타데이터 (이름, 설명, 스킬 목록, 에이전트 목록)
├── skills/             스킬 파일 (.md)
│   └── reference/      참조 문서 (채점 루브릭, 안티패턴 등)
├── agents/             에이전트 파일 (.md)
├── anti-patterns.md    안티패턴 목록 (선택)
└── modes/              커스텀 모드 정의 (선택)
```

### 6.2 팩 목록 (18개)

| # | 팩 | 스킬 수 | 에이전트 수 | 참조 파일 |
|---|-----|---------|-----------|----------|
| 1 | ui-design | 10 | 1 | 5 (heuristics, cognitive-load, personas, typography, color) |
| 2 | novel-writing | 2 | 2 | 0 |
| 3 | game-dev | 2 | 2 | 0 |
| 4 | codex | 3 | 1 | 0 |
| 5 | data-science | 1 | 0 | 0 |
| 6 | devops | 1 | 0 | 0 |
| 7 | mobile-app | 1 | 0 | 0 |
| 8 | api-dev | 1 | 0 | 0 |
| 9 | tech-docs | 1 | 0 | 0 |
| 10 | marketing | 1 | 0 | 0 |
| 11 | education | 1 | 0 | 0 |
| 12 | legal | 1 | 0 | 0 |
| 13 | research | 1 | 0 | 0 |
| 14 | hardware | 1 | 0 | 0 |
| 15 | audio | 1 | 0 | 0 |
| 16 | embedded-ai | 1 | 0 | 0 |
| 17 | i18n-l10n | 1 | 0 | 0 |
| 18 | video-production | 1 | 0 | 0 |

### 6.3 PACK.yaml 스키마

```yaml
name: string              # 소문자+하이픈
version: string            # 시맨틱 버저닝 (팩 자체의 버전, 프론트매터와 별개)
description: string        # 팩 설명
author: string             # 작성자
keywords: string[]         # 검색 키워드
dependencies: string[]     # 의존 팩 (현재 미구현)
skills: string[]           # 포함 스킬 이름 목록
agents: string[]           # 포함 에이전트 이름 목록
review_layers:             # 검토 모드 확장 레이어 (선택)
  - layer: number
    name: string
    description: string
```

---

## 7. 에이전트 명세

### 7.1 코어 에이전트 (6개)

| 이름 | 역할 | 사용 모드 | 모델 |
|------|------|----------|------|
| advocate | 제안 옹호 | discuss | sonnet |
| critic | 약점/리스크 분석 | discuss, review | sonnet |
| pragmatist | 구현 가능성 평가 | discuss | sonnet |
| innovator | 대안 접근법 제시 | discuss | sonnet |
| user-advocate | 최종 사용자 관점 | discuss | sonnet |
| domain-expert | 도메인 전문 지식 (활성 팩에 따라 변형) | discuss | sonnet |

### 7.2 팩 에이전트 (5개)

| 이름 | 팩 | 역할 |
|------|-----|------|
| ui-critic | ui-design | UI/UX 관점 비평 |
| story-critic | novel-writing | 서사 품질 평가 |
| editor | novel-writing | 문장 수준 편집 |
| game-designer | game-dev | 게임 메커니즘 평가 |
| playtester | game-dev | 플레이어 관점 테스트 |

### 7.3 에이전트 프론트매터

```yaml
---
name: string                # 에이전트 식별자
description: >              # "Use this agent when..." 형식
  Use this agent when [트리거 조건].
tools: string               # 최소 권한 (Read, Grep, Glob 등)
model: string               # sonnet (기본), opus (복잡한 분석)
---
```

---

## 8. TypeScript 코어 명세

### 8.1 모듈 목록 (32개)

| 디렉토리 | 모듈 | 역할 |
|---------|------|------|
| mode-engine/ | engine.ts | 모드 전환 로직 |
| | state.ts | 상태 관리 (.reins/state.json) |
| | transitions.ts | 자연 전환 규칙 |
| | custom-loader.ts | .reins/modes/*.yaml 커스텀 모드 로드 |
| registry/ | scanner.ts | 팩/스킬 디렉토리 스캔 |
| | resolver.ts | 스킬/에이전트 이름 → 파일 경로 해석 |
| | auto-trigger.ts | 사용자 입력 → 스킬 매칭 |
| guardrails/ | rules.ts | 12개 선언적 규칙 정의 |
| | validator.ts | 규칙 평가 + 리포트 생성 |
| learning/ | observer.ts | 학습 이벤트 감시 + 기록 |
| | recorder.ts | 에러/패턴/선호 기록 함수 |
| | rule-promoter.ts | 3회+ 반복 패턴 → 규칙 승격 |
| merge/ | analyzer.ts | 외부 소스 구조 분석 |
| | adapter.ts | Level 2 래핑 (팩으로 변환) |
| | converter.ts | Level 3 변환 (네이티브 스킬) |
| updater/ | checker.ts | GitHub releases API 버전 확인 |
| | installer.ts | git pull → npm install → build |
| | rollback.ts | 백업에서 복원 |
| plan-converter/ | parser.ts | .md/.txt/.docx/.pdf 파싱 |
| | analyzer.ts | 요구사항/기술스택/마일스톤 추출 |
| | generator.ts | Reins 계획 포맷으로 변환 |
| bridges/ | adapter.ts | 브릿지 공통 인터페이스 |
| | factory.ts | 브릿지 인스턴스 생성 |
| | gemini.ts | Gemini API 어댑터 |
| | openai.ts | OpenAI API 어댑터 |
| | codex.ts | Codex JSON-RPC 어댑터 |
| conductor/ | orchestrator.ts | 멀티 세션 관리 |
| notifications/ | webhook.ts | Slack/Discord/Telegram 웹훅 |
| profiler/ | profiler.ts | 성능 메트릭 수집/리포트 |
| snapshot/ | manager.ts | git tag 기반 스냅샷 |
| session/ | forker.ts | 세션 포크 (git branch) |
| templates/ | initializer.ts | 프로젝트 템플릿 초기화 |

### 8.2 빌드

```bash
npm run build          # tsc → dist/
npm run build:hooks    # hooks/*.ts → hooks/dist/*.js
npm run build:all      # 위 두 개 순차 실행
```

- Target: ES2022
- Module: NodeNext
- Strict: true

---

## 9. CLI 명세

### 9.1 CLI 실행 파일

`bin/reins` (bash 스크립트, ~400줄)

### 9.2 심볼릭 링크 해석

```bash
REINS_SELF="${BASH_SOURCE[0]}"
while [[ -L "$REINS_SELF" ]]; do
  REINS_LINK_DIR="$(cd "$(dirname "$REINS_SELF")" && pwd)"
  REINS_SELF="$(readlink "$REINS_SELF")"
  [[ "$REINS_SELF" != /* ]] && REINS_SELF="$REINS_LINK_DIR/$REINS_SELF"
done
REINS_HOME="$(cd "$(dirname "$REINS_SELF")/.." && pwd)"
```

### 9.3 전체 명령어

| 명령어 | 동작 |
|--------|------|
| `reins` | 새 세션 (bypass-permissions + auto-mode) |
| `reins new <이름>` | 이름 지정 새 세션 |
| `reins <이름>` | 기존 세션 이어하기 |
| `reins list` | 세션 목록 |
| `reins fork <이름>` | git branch 생성 + 새 세션 |
| `reins --safe [이름]` | auto-mode만 (bypass 없음) |
| `reins --mode <모드> [이름]` | 특정 모드로 시작 |
| `reins --pack <팩> new <이름>` | 팩 설치 후 시작 |
| `reins setup` | 스킬/에이전트/훅 등록 |
| `reins update` | 전체 업데이트 |
| `reins update --check` | 업데이트 확인만 |
| `reins update --rollback` | 이전 버전 복원 |
| `reins pack list` | 팩 목록 (설치 상태 표시) |
| `reins pack install <이름>` | 팩 설치 |
| `reins pack install --all` | 전체 팩 설치 |
| `reins pack remove <이름>` | 팩 제거 |
| `reins pack create <이름>` | 새 팩 템플릿 |
| `reins merge <소스>` | 외부 소스 분석 + 병합 |
| `reins merge list` | 병합 소스 목록 |
| `reins config set <키> <값>` | 설정 변경 |
| `reins config get <키>` | 설정 조회 |
| `reins doctor` | 환경 진단 |
| `reins --version` | 버전 출력 |
| `reins --help` | 도움말 |

### 9.4 reins setup 동작

1. `~/.claude/skills/`에 내장 스킬 20개 심볼릭 링크 생성
2. 짧은 별칭 20개 생성 (plan→reins-plan-mode 등)
3. 모든 팩의 스킬/에이전트 심볼릭 링크 생성
4. `~/.claude/agents/`에 에이전트 심볼릭 링크 생성
5. `~/.claude/settings.json`에 훅 설정 주입

---

## 10. 프론트매터 명세

### 10.1 Claude Code 인식 필드

| 필드 | 타입 | 용도 | 필수 |
|------|------|------|------|
| name | string | 스킬 식별자 (소문자+하이픈) | 필수 |
| description | string | 트리거 조건 ("Use when..."), 250자 이내 | 필수 |
| allowed-tools | string | 사용 가능 도구 목록 | 권장 |
| disable-model-invocation | boolean | true면 사용자 명시적 호출만 | 선택 |
| user-invocable | boolean | false면 사용자 직접 호출 불가 | 선택 |

### 10.2 사용 금지 필드

| 필드 | 이유 |
|------|------|
| version | Claude Code가 인식하지 않음 (무시됨) |
| mode | Claude Code가 인식하지 않음 (무시됨) |

### 10.3 description 작성 규칙

- 반드시 "Use when..."으로 시작
- 기능 요약 포함 금지 (트리거 조건만)
- 250자 이내 (Claude Code가 초과분 절삭)
- 한국어 + 영어 트리거 포함 권장

---

## 11. CLAUDE.md 명세

### 11.1 목적

프로젝트에 설치된 Reins 하네스의 최상위 가이드라인.
Claude Code가 세션 시작 시 자동으로 로드.

### 11.2 제약

- 100줄 이하 (현재 93줄)
- 2,500 토큰 이하

### 11.3 구성

| 섹션 | 내용 |
|------|------|
| 핵심 원칙 | 3개 (스킬 invoke, progress.md 기록, 자동 학습) |
| 스킬 사용 규칙 | HARD-GATE 반합리화 테이블 (5행) |
| 스킬 라우팅 | 9개 모드 → 스킬명 매핑 |
| 라우팅 우선순위 | 프로세스 > 구현 > 검증 |
| 제외 규칙 | "스킬 없이", 간단한 질문, 이미 활성 |
| 완료 상태 프로토콜 | DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED |
| 지시 우선순위 | 사용자 > Reins 스킬 > 시스템 기본 |
| 출력 포맷 | 구분선, 번호 카운터, 심각도 테이블, Before/After, 선택 프롬프트 |

---

## 12. 학습 시스템 명세

### 12.1 저장 위치

`.reins/learnings/` 하위 JSONL 파일:
- `errors.jsonl` — 에러 + 수정 패턴
- `patterns.jsonl` — 워크플로우 패턴
- `preferences.jsonl` — 사용자 선호

### 12.2 엔트리 스키마

```json
{
  "skill": "string",
  "type": "pattern | pitfall | preference | architecture | tool",
  "key": "string",
  "insight": "string",
  "confidence": 1-10,
  "source": "observed | user-stated | inferred",
  "files": ["string"],
  "timestamp": "ISO8601"
}
```

### 12.3 자동 동작

- 세션 종료 → learning-observer 훅이 패턴 추출/기록
- 3회+ 반복 → rule-promoter가 규칙 승격 제안
- 스킬 완료 시 → 비자명 발견 사항 /learn add 권장

---

## 13. StatusLine 명세

### 13.1 입력

Claude Code가 stdin으로 전달하는 JSON:

```json
{
  "session_id": "string",
  "model": "string" | { "id": "string", "display_name": "string" },
  "context_window": {
    "used_percentage": number,
    "context_window_size": number
  },
  "cost": {
    "total_cost_usd": number,
    "total_duration_ms": number
  },
  "rate_limits": {
    "five_hour": { "used_percentage": number }
  }
}
```

### 13.2 출력

```
📋 Plan | ████████░░ 75% (9/12) | 🟢 32% ctx | 💰 $0.45 | ⏱ 23m | 🔀 feature/auth | 📦 ui-design
```

### 13.3 컨텍스트 색상

| 사용률 | 아이콘 |
|--------|--------|
| < 50% | 🟢 |
| 50~79% | 🟡 |
| ≥ 80% | 🔴 |

Rate limit 70% 초과 시 `⚠️ rate N%` 추가 표시.

---

## 14. 외부 브릿지 명세

### 14.1 설정 파일

`.reins/bridges.json`:

```json
{
  "gemini": { "api_key": "string", "model": "string", "base_url": "string (optional)" },
  "openai": { "api_key": "string", "model": "string", "base_url": "string (optional)" },
  "codex":  { "transport": "direct | broker", "socket_path": "string (broker only)" }
}
```

### 14.2 Codex 연결

- **Direct**: `codex app-server`를 자식 프로세스로 생성, stdin/stdout JSON-RPC
- **Broker**: 공유 Unix 소켓으로 연결 (여러 세션이 하나의 Codex 공유)

### 14.3 JSON-RPC 프로토콜

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "create_turn",
  "params": { "prompt": "string" }
}
```

---

## 15. 파일 구조

```
reins/
├── bin/reins                              CLI (bash, ~400줄)
├── install.sh                             macOS/Linux 설치
├── install.ps1                            Windows 설치
├── package.json                           npm 메타 (name: reins, v0.1.0)
├── tsconfig.json                          TS 설정 (ES2022, NodeNext, strict)
├── .gitignore                             node_modules, dist, .reins/learnings
├── CLAUDE.md                              오케스트레이터 (93줄)
├── AGENTS.md                              에이전트 목차
├── README.md                              사용자 가이드 (245줄)
├── CONTRIBUTING.md                        기여 가이드 (90줄)
├── .claude-plugin/
│   ├── plugin.json                        플러그인 메타
│   └── marketplace.json                   마켓플레이스 등록
├── core/                                  TypeScript 코어 (32 모듈)
├── skills/                                내장 스킬 (20개 디렉토리)
├── agents/                                코어 에이전트 (6개 .md)
├── hooks/                                 훅 소스 (9개 .ts) + dist/ (빌드 결과)
├── packs/                                 도메인 팩 (18개 디렉토리)
├── templates/outputs/                     산출물 템플릿 (5개 .md)
├── scripts/
│   ├── build-hooks.sh                     훅 TS→JS 빌드
│   ├── register-skills.sh                 스킬 등록 (레거시, setup으로 대체)
│   ├── skill-preamble.sh                  런타임 상태 수집
│   ├── setup.sh                           프로젝트 초기화
│   ├── doctor.sh                          환경 진단
│   └── codex/                             Codex 연동
│       ├── codex-companion.mjs            명령 디스패처
│       └── lib/
│           ├── app-server.mjs             JSON-RPC 클라이언트
│           └── job-control.mjs            백그라운드 작업 관리
└── docs/
    ├── FEATURES.md                        전체 기능 상세
    └── SPECIFICATION.md                   이 문서
```

---

## 16. 레퍼런스

이 프로젝트는 다음 프로젝트들의 패턴을 참고하여 설계되었습니다:

| 레퍼런스 | 채택 패턴 |
|---------|----------|
| [obra/superpowers](https://github.com/obra/superpowers) | description 규율, HARD-GATE, 반합리화 테이블, 스킬 체이닝, 서브에이전트 패턴 |
| [garrytan/gstack](https://github.com/garrytan/gstack) | allowed-tools, 라우팅 우선순위, 학습 시스템, 회고 시간 창 분석 |
| [Chachamaru127/claude-code-harness](https://github.com/Chachamaru127/claude-code-harness) | 선언적 가드레일 규칙, 훅 설정 형식, first-match-wins 평가 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 닐슨 채점, AI slop 안티패턴, 인지 부하/페르소나 참조, UI 수정 스킬 |
| [millionco/expect](https://github.com/millionco/expect) | diff 기반 브라우저 테스트 플랜 생성, Playwright 연동 |
| [sangrokjung/claude-forge](https://github.com/sangrokjung/claude-forge) | 보안 파이프라인, 출력 시크릿 필터, DB 가드, UI 출력 포맷 |
| [sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline) | StatusLine JSON 스키마, rate limit 표시 |
| [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) | JSON-RPC app-server 프로토콜, 작업 추적 |
