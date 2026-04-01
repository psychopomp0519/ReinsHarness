# Reins — 전체 기능 상세 문서

이 문서는 Reins 하네스의 모든 기능을 상세히 설명합니다.
빠른 시작은 [README.md](../README.md)를 참고하세요.

---

## 목차

1. [모드 상세](#1-모드-상세)
2. [훅 상세](#2-훅-상세)
3. [가드레일 규칙](#3-가드레일-규칙)
4. [도메인 팩 상세](#4-도메인-팩-상세)
5. [학습 시스템](#5-학습-시스템)
6. [계획서 변환](#6-계획서-변환)
7. [외부 AI 브릿지](#7-외부-ai-브릿지)
8. [외부 소스 병합](#8-외부-소스-병합)
9. [StatusLine](#9-statusline)
10. [CLI 전체 명령어](#10-cli-전체-명령어)
11. [세션 내 전체 명령어](#11-세션-내-전체-명령어)
12. [커스텀 모드](#12-커스텀-모드)
13. [팩 개발 가이드](#13-팩-개발-가이드)
14. [설정](#14-설정)
15. [디렉터리 구조](#15-디렉터리-구조)
16. [규칙 3계층 구조](#16-규칙-3계층-구조)
17. [프론트매터 표준](#17-프론트매터-표준)
18. [업데이트 시스템](#18-업데이트-시스템)

---

## 1. 모드 상세

### 📋 Plan (계획) — `/plan`

요구사항을 검증 가능한 구현 계획으로 변환합니다.

**워크플로우:**

```
Step 1: 소크라틱 질문 (3~7개) — 목표, 대상, 제약, 성공 기준
Step 2: 코드베이스 조사 — 기존 구조 파악, 재사용 가능 컴포넌트
Step 3: 아키텍처 설계 — 2~3개 접근법 비교, 트레이드오프 분석
Step 4: Task 분해 — Phase/Task 구조, 5~15분 단위
Step 5: 리스크 분석 — 기술/범위/의존성 리스크 3~5개
Step 5.5: 자체 검토 — 플레이스홀더/모순/모호함 점검
Step 6: 사용자 승인 → docs/plans/PLAN-<n>.md 저장
```

**규칙:**
- 모든 Task에 검증 기준(Acceptance Criteria) 필수
- "TBD", "TODO", "나중에 구현" 같은 플레이스홀더 사용 금지
- Phase 경계에 체크포인트 → 자동 검토 모드 전환 제안
- 최대 5 Phase, Phase당 최대 8 Task
- 설계 승인 전 코드 작성 금지 (HARD-GATE)

**산출물:** `docs/plans/PLAN-<n>.md`, `docs/progress.md`

**완료 후:** `/dev` 제안

---

### 🔨 Dev (개발) — `/dev`

계획에 따라 Task를 순차적으로 실행합니다.

**워크플로우:**

```
Step 1: 계획 로드 — docs/plans/PLAN-*.md + docs/progress.md
Step 2: 다음 미완료 Task 선택 → 사용자에게 제시
Step 3: Task 구현
Step 4: 자동 검증 (5항목)
Step 5: progress.md 업데이트
Step 6: 다음 Task 또는 Phase 완료
```

**자동 검증 5항목:**

| # | 항목 | 확인 내용 |
|---|------|----------|
| 1 | Lint | 프로젝트 린터 실행, 새 경고 없음 |
| 2 | Types | 타입 체커 실행, 새 에러 없음 |
| 3 | Tests | 관련 테스트 실행, 전부 통과 |
| 4 | Acceptance Criteria | Task에 명시된 검증 기준 충족 |
| 5 | Architecture | 모듈 경계, 네이밍 컨벤션 준수 |

**규칙:**
- 검증 실패 시 자동 수정 최대 2회 (HARD-GATE)
- 2회 실패 후에도 미해결 → `/review` 제안
- Phase 완료 시 git commit + tag (`checkpoint-phase-N`)

**완료 후:** `/review` 제안

---

### 🔍 Review (검토) — `/review`

7개 레이어로 코드 품질을 검증하고, 이슈가 0이 될 때까지 반복합니다.

**레이어:**

| Layer | 이름 | 내용 | 조건 |
|-------|------|------|------|
| 1 | 정적 분석 | 린터, 타입체커, 미사용 코드 | 항상 |
| 2 | 테스트 | 유닛, 통합 테스트 실행 | 항상 |
| 3 | 계획 대비 | 각 Task의 검증 기준 충족 여부 | 항상 |
| 4 | AI 코드 리뷰 | 서브에이전트가 로직 에러, 엣지케이스, 성능 분석 | 항상 |
| 5 | 아키텍처 | 순환 의존성, 레이어 위반, 네이밍, 파일 구조 | 항상 |
| 6 | 브라우저 | diff 기반 테스트 플랜 생성 → Playwright 실행 | ui-design 팩 활성 시 |
| 7 | 디자인 | 닐슨 휴리스틱 /40 + 기술 감사 /20, 안티패턴 검출 | ui-design 팩 활성 시 |

**반복 프로토콜:**
- 이슈 발견 → 수정 → Layer 1부터 재검증
- 최대 5회 반복
- 5회 후에도 이슈 → "사용자 개입 필요" 보고

**출력 형식:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Review] Iteration N/5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Layer | 상태 | 이슈 | CRITICAL | HIGH |
|-------|------|------|----------|------|
| 1 Static | PASS | 0 | 0 | 0 |
| 2 Tests | PASS | 0 | 0 | 0 |
| ...   | ...  | ... | ...      | ...  |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**완료 후:** 전부 통과 → `/deploy` 제안, 이슈 → `/dev` 제안

---

### 💬 Discuss (토의) — `/discuss`

여러 AI 에이전트가 토론하여 다각도 분석을 수행합니다.

**에이전트 풀 (6개):**

| 에이전트 | 역할 |
|---------|------|
| advocate | 제안의 강점을 찾고 옹호 |
| critic | 약점, 리스크, 엣지케이스 분석 |
| pragmatist | 구현 가능성과 비용 평가 |
| innovator | 대안적 접근법 제시 |
| user-advocate | 최종 사용자 관점에서 평가 |
| domain-expert | 활성 팩에 따라 전문 지식 제공 |

**동적 선택 (주제별 3~4개):**

| 주제 | 선택 에이전트 |
|------|-------------|
| 기술 설계 | critic, pragmatist, innovator |
| 사용자 경험 | user-advocate, critic, innovator |
| 비즈니스 결정 | advocate, critic, pragmatist |
| 도메인 특화 | domain-expert, critic, pragmatist |
| 복합 주제 | advocate, critic, pragmatist, innovator |

**3라운드:**
1. **개별 분석** — 각 에이전트가 독립적으로 분석
2. **교차 반론** — 다른 에이전트의 분석에 반론
3. **합의 도출** — 합의점, 미해결 쟁점, 최종 권고

**완료 후:** `/plan` (계획 수정) 또는 `/dev` (구현) 제안

---

### 🧹 Cleanup (정리) — `/cleanup`

코드베이스의 엔트로피를 스캔하고 수정합니다.

**7개 카테고리:**

| # | 카테고리 | 탐지 내용 |
|---|---------|----------|
| 1 | 코드 중복 | 10줄 이상, 80% 이상 유사한 코드 블록 |
| 2 | 죽은 코드 | 미사용 함수, 변수, import, 5줄 이상 주석 코드 |
| 3 | 문서 불일치 | README와 실제 동작 차이, 삭제된 코드 참조 주석 |
| 4 | 네이밍 위반 | camelCase/snake_case 혼용, 목적과 안 맞는 이름 |
| 5 | 테스트 커버리지 | 테스트 없는 모듈, assert 없는 테스트 |
| 6 | 의존성 낡음 | 오래된 패키지, 미사용 의존성, 중복 버전 |
| 7 | 스타일 드리프트 | 포맷팅 불일치, import 정렬 위반 |

**명령어:**
- `/cleanup scan` — 전체 스캔 (리포트만)
- `/cleanup scan --quick` — 중복, 죽은 코드, 네이밍만 (빠름)
- `/cleanup fix` — 스캔 + 안전한 항목 자동 수정
- `/cleanup fix --dry-run` — 수정 미리보기

**완료 후:** `/review` 제안

---

### 🔒 Security (보안) — `/security`

> 수동 호출만 가능 (`/security` 직접 입력 필요)

6개 레이어로 보안 감사를 수행합니다.

**레이어:**

| Layer | 이름 | 내용 |
|-------|------|------|
| 1 | 시크릿 탐지 | API 키, 토큰, 비밀번호, .env 커밋 여부 |
| 2 | 의존성 CVE | npm audit, pip-audit, cargo audit 등 |
| 3 | SAST | CWE Top 25 — SQL 인젝션, XSS, 커맨드 인젝션, 경로 탐색 |
| 4 | STRIDE | 스푸핑, 변조, 부인, 정보 유출, DoS, 권한 상승 |
| 5 | DAST | 브라우저 보안 테스트 (가능한 경우) |
| 6 | 인프라 | Docker, K8s, CORS, CSP, TLS |

**Pre-commit 게이트:**
- 커밋 전 자동으로 Layer 1(시크릿) + Layer 3(SAST) 실행
- Critical 발견 → 커밋 차단
- High 발견 → 경고 후 사용자 확인

**CWE 그렙 패턴 (자동 적용):**
- SQL 인젝션: `SELECT.*\+`, 템플릿 리터럴 in 쿼리
- XSS: `innerHTML`, `document.write`, `dangerouslySetInnerHTML`
- 커맨드 인젝션: `exec()` + 사용자 입력
- 경로 탐색: `req.params` in `fs.readFile`

**심각도:**

| 등급 | 의미 | 행동 |
|------|------|------|
| Critical | 즉시 악용 가능 | 커밋 차단, 즉시 수정 |
| High | 노력하면 악용 가능 | 경고, 24시간 내 수정 |
| Medium | 잠재적 취약점 | 정보 제공, 1주 내 수정 |
| Low | 모범 사례 위반 | 편할 때 수정 |

**완료 후:** `/dev` (취약점 수정) 제안

---

### 📊 Retro (회고) — `/retro`

세션이나 프로젝트의 성과를 5개 카테고리로 분석합니다.

**5개 분석 카테고리:**
1. **생산성** — Task 완료율, LOC, 커밋 수
2. **품질** — 검토 반복 횟수, 발견 이슈, 자동 수정률
3. **효율** — 컨텍스트 사용량, 토큰 비용, 모드 전환 횟수
4. **학습** — 에러 패턴, 반복 실수, 승격된 규칙
5. **보안** — 발견 취약점, 해결률

**명령어:**
- `/retro session` — 현재 세션 분석
- `/retro 7d` — 최근 7일 분석
- `/retro 30d` — 최근 30일 분석
- `/retro compare <a> <b>` — 두 기간 비교

**시간 기반 분석:**
- git 로그에서 커밋 타임스탬프 추출
- 작업 세션 자동 감지 (45분 이상 간격 = 새 세션)
- 세션 유형 분류: 딥(50분+), 미디엄(20~50분), 마이크로(<20분)
- 집중 점수: 가장 많이 변경된 디렉토리의 커밋 비율

**트렌드 추적:**
- 이전 회고 스냅샷과 비교 (↑↓→ 화살표)
- `.reins/retros/retro-<날짜>.json`에 저장

**완료 후:** `/plan` (다음 반복) 제안

---

### 🚀 Deploy (배포) — `/deploy`

> 수동 호출만 가능

**파이프라인:**

```
Preview → Staging → Production → Canary → Full Rollout
```

| 단계 | 내용 | 승인 필요 |
|------|------|----------|
| Preview | 빌드 + 전체 테스트 + 아티팩트 생성 | 아니오 |
| Staging | 스테이징 배포 + 스모크 테스트 | 사용자 확인 |
| Production | 프로덕션 배포 + 헬스체크 | **필수** (HARD-GATE) |
| Canary | 5% → 25% → 50% → 100% 점진 배포 | 선택 |
| Rollback | 이전 태그로 롤백 | 자동 (에러율 초과 시) |

**규칙 (HARD-GATE):**
- 프로덕션 배포 시 반드시 사용자 명시적 승인 필요
- 배포 전 반드시 git tag 생성

**완료 후:** `/retro` 제안, 롤백 시 `/dev` 제안

---

### 🌐 Bridge (브릿지) — `/bridge`

> 수동 호출만 가능

외부 AI 모델과 연동하여 크로스 리뷰, 세컨드 오피니언, 태스크 위임을 수행합니다.

**사전 설정:** `.reins/bridges.json`

```json
{
  "gemini": { "api_key": "YOUR_KEY", "model": "gemini-2.0-flash" },
  "openai": { "api_key": "YOUR_KEY", "model": "gpt-4o" },
  "codex": { "transport": "direct" }
}
```

**사용 방법:**
```
/bridge gemini review <파일>     Gemini에 코드 리뷰 요청
/bridge gpt opinion <주제>       GPT에 의견 요청
/bridge codex review <파일>      Codex에 코드 리뷰 요청
/bridge codex rescue <작업>      Codex에 작업 위임
/bridge codex adversarial <파일> Codex가 코드를 깨뜨리려 시도
/bridge compare <프롬프트>       여러 AI에 같은 질문 → 결과 비교
/bridge status                   설정된 브릿지 목록
```

**각 AI의 강점:**
- **Gemini** — 멀티모달, 큰 컨텍스트
- **GPT** — 창의적 생성, 특정 도메인 지식
- **Codex** — 자율 코딩, 태스크 위임, 적대적 테스팅
- **Claude** — 코드 분석, 구조화된 추론

**규칙 (HARD-GATE):**
- `.env`, API 키, 비밀번호 등 민감 정보를 외부 AI에 전송 금지
- 외부 전송 전 반드시 사용자에게 알림

---

### 🐛 Debug (디버깅) — `/debug`

체계적 디버깅 워크플로우. 추측 수정을 금지하고 근본 원인을 먼저 찾습니다.

**규칙 (HARD-GATE):** 근본 원인 조사 없이 수정 금지

**4단계:**

| Phase | 이름 | 활동 |
|-------|------|------|
| 1 | 조사 | 에러 메시지 읽기, 재현, 최근 변경 확인, 증거 수집 |
| 2 | 패턴 분석 | 동작하는 유사 코드 찾기 → 차이점 목록화 |
| 3 | 가설 + 검증 | 가설 수립 → 최소 변경으로 검증 → 맞으면 Phase 4 |
| 4 | 구현 | 실패 테스트 작성 → 수정 → 테스트 통과 확인 |

**에스컬레이션:**
- 3회 이상 수정 시도 실패 → 아키텍처 문제로 간주
- 아키텍처 문제 → `/discuss` 제안

**멀티 컴포넌트 진단:**
- 여러 컴포넌트가 있는 시스템 (API → 서비스 → DB)
- 수정 전에 각 컴포넌트 경계에 진단 로그 추가
- 한 번 실행해서 어디서 끊기는지 확인

**완료 후:** `/review` 제안, 아키텍처 이슈 시 `/discuss` 제안

---

### 🤖 Subagent Dev (서브에이전트 개발) — `/subagent-dev`

각 Task를 독립 에이전트에게 위임하여 구현합니다.

**워크플로우:**
1. Task 스펙 준비 (파일 경로, 요구사항, 컨텍스트)
2. Agent tool로 구현 에이전트 스폰 (Task당 1개, fresh context)
3. 구현 에이전트가 코드 작성 + 자체 검토
4. **1차 리뷰:** 스펙 준수 검증 (요구사항 충족?)
5. **2차 리뷰:** 코드 품질 검증 (로직, 성능, 보안)
6. 이슈 → 같은 에이전트가 수정 → 재리뷰 (반복)
7. 전체 Task 완료 후 → 최종 통합 리뷰

**구현 에이전트 상태:**

| 상태 | 의미 | 대응 |
|------|------|------|
| DONE | 완전 완료 | 리뷰 진행 |
| DONE_WITH_CONCERNS | 완료했지만 우려 있음 | 우려 사항 먼저 확인 |
| NEEDS_CONTEXT | 추가 정보 필요 | 정보 제공 후 재실행 |
| BLOCKED | 진행 불가 | 더 큰 모델로 재시도 또는 Task 분할 |

**모델 선택:**
- 1~2 파일, 명확한 스펙 → sonnet (빠르고 저렴)
- 여러 파일, 통합 필요 → opus (정확도 우선)

**규칙 (HARD-GATE):**
- 리뷰 절대 건너뛰지 않음
- 병렬 구현 에이전트 금지 (충돌 방지)
- 스펙 준수 리뷰 통과 전 코드 품질 리뷰 시작 금지

---

### 📦 Session Wrap (세션 마무리) — `/session-wrap`

세션 종료 전 정리 작업을 수행합니다.

**5단계:**
1. **컨텍스트 수집** — `git diff --stat`으로 변경 사항 파악
2. **액션 아이템 생성** — 문서 업데이트, 학습 기록, 후속 작업
3. **카테고리별 제시** — `[docs]`, `[learning]`, `[followup]` 태그
4. **사용자 선택** — 번호 선택, all, none
5. **실행 + 저장** — `.reins/session-followups.md`에 다음 작업 기록

---

## 2. 훅 상세

### auto-checkpoint

| 항목 | 값 |
|------|---|
| 이벤트 | PostToolUse (Write, Edit, MultiEdit) |
| 동작 | 변경 파일 수가 임계값 초과 시 커밋 제안 |
| 설정 | `REINS_CHECKPOINT_THRESHOLD` 환경변수 (기본 5) |
| 쿨다운 | 5분 (같은 제안 반복 방지) |

### auto-format

| 항목 | 값 |
|------|---|
| 이벤트 | PostToolUse (Write, Edit, MultiEdit) |
| 동작 | 편집된 파일에 프로젝트 포매터 실행 |
| 지원 | Prettier (JS/TS/CSS/MD), Black (Python), gofmt, rustfmt |
| 실패 시 | 워크플로우 차단 안 함 (무시) |

### security-guard

| 항목 | 값 |
|------|---|
| 이벤트 | PreToolUse (Read) |
| 동작 | 민감 파일 읽기 차단 |
| 차단 패턴 | `.env`, `.pem`, `.key`, `.p12`, `.ssh/`, `credentials.json`, `secrets.json` |
| 허용 | `.env.example`, `.env.template`, `.env.sample` |

### learning-observer

| 항목 | 값 |
|------|---|
| 이벤트 | Stop |
| 동작 | 세션 내 실패/수정 패턴을 JSONL로 기록 |
| 저장 위치 | `.reins/learnings/errors.jsonl`, `patterns.jsonl` |

### context-compact

| 항목 | 값 |
|------|---|
| 이벤트 | PostToolUse |
| 동작 | 컨텍스트 사용률 체크, 임계값 초과 시 알림 |
| 임계값 | 60% (환경변수로 변경 가능) |
| 쿨다운 | 10분 |

### security-auto-trigger

| 항목 | 값 |
|------|---|
| 이벤트 | PostToolUse (Edit, Write) |
| 동작 | 보안 민감 파일 수정 시 `/security` 실행 제안 |
| 감지 패턴 | `auth/*`, `payment/*`, `api/*`, `.env*`, `crypto*`, `session*`, `token*` |
| 제한 | 파일당 세션당 1회만 (중복 방지) |

### output-secret-filter

| 항목 | 값 |
|------|---|
| 이벤트 | PostToolUse |
| 동작 | 도구 출력에 시크릿이 포함되었는지 스캔 → 경고 |
| 감지 | AWS 키 (AKIA...), Bearer 토큰, password=, api_key=, PEM 블록 |
| 참고 | 차단하지 않고 경고만 함 |

### db-guard

| 항목 | 값 |
|------|---|
| 이벤트 | PreToolUse (Bash) |
| 동작 | 위험한 SQL 명령 차단 |
| 차단 | DROP TABLE/DATABASE/SCHEMA, TRUNCATE, ALTER TABLE DROP, DELETE without WHERE |

### remote-command-guard

| 항목 | 값 |
|------|---|
| 이벤트 | PreToolUse (Bash) |
| 동작 | 위험한 시스템 명령 차단 |
| 차단 | `env`, `printenv`, `echo $SECRET`, `chmod 777`, `chown`, `kill -9`, `shutdown` |

---

## 3. 가드레일 규칙

TypeScript로 구현된 선언적 규칙 12개. `core/guardrails/rules.ts`에 정의.

| ID | 이름 | 대상 도구 | 결정 | 설명 |
|----|------|----------|------|------|
| R01 | No Sudo | Bash | deny | sudo, su 명령 차단 |
| R02 | No Force Push | Bash | deny | git push --force 차단 |
| R03 | No Reset Hard | Bash | ask | git reset --hard 확인 요청 |
| R04 | Secret File Read | Read | deny | .env, .pem 등 읽기 차단 |
| R05 | Confirm rm -rf | Bash | ask | rm -rf 확인 요청 |
| R06 | No Skip Hooks | Bash | deny | --no-verify 차단 |
| R07 | No Secrets in Code | Write/Edit | ask | 코드에 시크릿 하드코딩 감지 |
| R08 | No Out-of-Project Write | Write/Edit | ask | 프로젝트 외부 파일 쓰기 확인 |
| R09 | No Redirect Protected | Bash | deny | > .env, tee .git/ 등 리디렉트 차단 |
| R10 | Infra File Warning | Write/Edit | ask | package.json, Dockerfile 등 수정 확인 |
| R11 | No Direct Push Protected | Bash | ask | main/master 직접 push 확인 |
| R12 | No Write Sensitive | Write/Edit | deny | .env, .git/, .ssh/ 직접 쓰기 차단 |

**결정 유형:**
- `approve` — 허용
- `deny` — 차단 (진행 불가)
- `ask` — 사용자 확인 요청

**평가 방식:** 순차 평가, 첫 번째 매칭 규칙의 결정을 따름 (first-match-wins)

---

## 4. 도메인 팩 상세

### ui-design (10개 스킬)

**감사 스킬:**
- `ui-design-audit` — 닐슨 휴리스틱 /40 + 기술 감사 /20 = 합산 /60, P0~P3 우선순위
- `ui-accessibility-check` — WCAG 2.1 AA 준수 검사 (인지/조작/이해/견고)
- `ui-context-gather` — 브랜드, 대상, 디자인 의도 수집 → `.reins/ui-context.md`

**수정 스킬 (6개):**
- `ui-polish` — 최종 품질 패스 (간격, 정렬, 그림자, 인터랙티브 상태)
- `ui-colorize` — 색상 시스템 정제 (팔레트, 대비, AI slop 패턴 감지)
- `ui-typeset` — 타이포그래피 (스케일, line-height, 폰트 선택)
- `ui-animate` — 모션 디자인 (의도적 애니메이션, reduced-motion 지원)
- `ui-adapt` — 반응형 디자인 (브레이크포인트, 유동 레이아웃, 터치 타겟)
- `ui-harden` — 프로덕션 강화 (에러/빈/로딩 상태, 엣지케이스)

**에이전트:** `ui-critic` — 토의 모드에서 UI/UX 관점 제공

**참조 파일 (5개):**
- `reference/heuristics-scoring.md` — 닐슨 10개 항목 0~4점 채점 루브릭
- `reference/cognitive-load.md` — 인지 부하 3유형 + 8개 위반 패턴
- `reference/personas.md` — 5개 테스트 페르소나 (파워유저~모바일유저)
- `reference/typography.md` — 타입 스케일, 유동 타입, 폰트 로딩, OpenType
- `reference/color.md` — OKLCH, 틴티드 뉴트럴, 다크모드, 토큰 계층

**안티패턴 목록 (10개 카테고리, 65+ 항목):**
AI Slop, 레이아웃, 타이포그래피, 색상, 인터랙션, 성능, 접근성, UX 라이팅, 점진적 공개, 모달

### novel-writing (2개 스킬 + 2개 에이전트)

- `novel-character-check` — 캐릭터 일관성 (목소리, 동기, 성장 아크)
- `novel-plot-structure` — 플롯 구조 분석 (3막, 영웅 여정)
- 에이전트: `story-critic` (서사 품질), `editor` (문장 수준 편집)

### game-dev (2개 스킬 + 2개 에이전트)

- `game-balance-check` — 게임 밸런스 (경제, 난이도 곡선, 보상 비율)
- `game-loop-review` — 게임 루프 (입력, 업데이트, 렌더링)
- 에이전트: `game-designer` (메커니즘 평가), `playtester` (플레이어 관점)

### codex (3개 스킬 + 1개 에이전트)

- `codex-review` — Codex CLI로 독립 코드 리뷰
- `codex-rescue` — Codex에 Task 위임 (백그라운드 작업)
- `codex-adversarial` — Codex가 코드를 깨뜨리려 시도 (적대적 리뷰)
- 에이전트: `codex-delegate` — 태스크 전달 중개

### 기타 팩 (각 1개 스킬)

| 팩 | 스킬 | 용도 |
|----|------|------|
| data-science | data-eda-check | EDA 검토 |
| devops | devops-pipeline-review | CI/CD 파이프라인 분석 |
| mobile-app | mobile-perf-check | 모바일 성능 분석 |
| api-dev | api-design-review | API 설계 품질 |
| tech-docs | docs-quality-check | 문서 품질 검토 |
| marketing | marketing-copy-review | 카피 + SEO 검토 |
| education | edu-curriculum-check | 커리큘럼 구조 검토 |
| legal | legal-contract-review | 계약서 조항 분석 |
| research | research-paper-structure | 논문 구조 검토 |
| hardware | hardware-firmware-review | 펌웨어 코드 검토 |
| audio | audio-mix-review | 믹스 품질 분석 |
| embedded-ai | ai-rag-review | RAG 파이프라인 검토 |
| i18n-l10n | i18n-coverage-check | 다국어 커버리지 분석 |
| video-production | video-metadata-review | 영상 메타데이터/SEO 검토 |

---

## 5. 학습 시스템

### 학습 엔트리 스키마

```json
{
  "skill": "dev-mode",
  "type": "pattern | pitfall | preference | architecture | tool",
  "key": "short-identifier",
  "insight": "무엇을 배웠는가",
  "confidence": 7,
  "source": "observed | user-stated | inferred",
  "files": ["src/foo.ts"],
  "timestamp": "2026-03-31T12:00:00Z"
}
```

### 타입

| 타입 | 의미 |
|------|------|
| pattern | 잘 작동하는 코드/워크플로우 패턴 |
| pitfall | 에러나 시간 낭비를 일으킨 함정 |
| preference | 사용자의 스타일이나 도구 선호 |
| architecture | 구조적 결정이나 제약 |
| tool | 도구 사용 팁, 플래그, 우회법 |

### 명령어

| 명령어 | 동작 |
|--------|------|
| `/learn show` | 최근 학습 내역 표시 |
| `/learn search <키워드>` | 키워드로 학습 검색 (key, insight, files 매칭) |
| `/learn add` | 수동으로 학습 추가 (type, key, insight, confidence 입력) |
| `/learn prune` | 참조 파일이 삭제된 오래된 학습 정리 |
| `/learn stats` | 총 개수, 타입별/소스별 분포, 평균 신뢰도 |
| `/learn errors` | 에러 패턴만 표시 |
| `/learn promote <id>` | 학습을 규칙으로 승격 |
| `/learn reset` | 전체 학습 초기화 (확인 필요) |

### 자동 동작

- **세션 종료 시** — learning-observer 훅이 실패/수정 패턴 자동 기록
- **3회 반복 패턴** — 규칙 승격 제안 (rule-promoter)
- **파일 참조** — 학습에 관련 파일 경로 저장, prune 시 존재 확인

---

## 6. 계획서 변환

외부에서 작성된 계획서(PRD, 기획서, 스펙)를 Reins 계획 형식으로 변환합니다.

**지원 형식:** `.md`, `.txt`, `.docx` (pandoc 필요), `.pdf` (pdftotext 필요)

**명령어:**
```
/convert-plan <파일경로>           변환 실행
/convert-plan --preview <파일>     미리보기 (저장 안 함)
/convert-plan --interactive        단계별 확인하며 변환
```

**변환 과정:**

```
원본 파일 파싱 → 요소 추출 (요구사항, 기술스택, 마일스톤, 제약)
    → Phase/Task 구조로 변환 (검증 기준 자동 생성, 의존성 추론)
    → 사용자 검토 → docs/plans/PLAN-<n>.md 저장
```

**산출물에 포함되는 특수 섹션:**

```markdown
## Original vs. Converted
| 변경 | 이유 |
|------|------|
| 검증 기준 추가 | 원본에 없었음 — 자동 생성 |
| "Backend" Phase를 3개로 분할 | 원본 Phase가 8개 Task 초과 |
```

---

## 7. 외부 AI 브릿지

### 지원 모델

| 브릿지 | API 키 필요 | 연결 방식 |
|--------|-----------|----------|
| Gemini | 필요 | HTTPS API |
| OpenAI (GPT) | 필요 | HTTPS API |
| Codex | 불필요 | 로컬 JSON-RPC (app-server) |

### Codex 연결 상세

Codex는 OpenAI의 로컬 코딩 CLI입니다. API 키 없이 로컬에서 실행됩니다.

**설치:** `npm install -g @openai/codex`

**연결 방식:**
- Direct: `codex app-server`를 자식 프로세스로 생성, stdin/stdout JSON-RPC
- Broker: 공유 Unix 소켓으로 연결 (여러 세션이 하나의 Codex 인스턴스 공유)

**Codex 팩 스킬:**
- `/codex review` — 코드 리뷰 위임
- `/codex rescue` — 태스크 위임 (백그라운드, 작업 추적)
- `/codex adversarial` — 적대적 코드 분석 (깨뜨리기 시도)
- `/codex status` — 실행 중인 작업 상태 확인
- `/codex cancel` — 실행 중인 작업 취소

---

## 8. 외부 소스 병합

다른 Claude Code 플러그인이나 하네스를 Reins에 통합합니다.

**3단계 병합:**

| 레벨 | 이름 | 설명 | 노력 |
|------|------|------|------|
| 1 | 공존 (coexist) | 그대로 설치, Reins가 인식하여 호출 | 낮음 |
| 2 | 래핑 (wrap) | Reins 팩으로 래핑, 통합 명령 체계 | 중간 |
| 3 | 변환 (convert) | 네이티브 Reins 스킬로 재작성 | 높음 |

**명령어:**
```bash
reins merge <소스경로>            분석 + 병합
reins merge --from-github <URL>   GitHub에서 직접
reins merge --level wrap          래핑 레벨 지정
reins merge list                  병합된 소스 목록
reins merge remove <소스>         병합 해제
```

---

## 9. StatusLine

Claude Code 세션 하단에 실시간 상태를 표시합니다.

**표시 정보:**
```
📋 Plan | ████████░░ 75% (9/12) | 🟢 32% ctx | 💰 $0.45 | ⏱ 23m | 🔀 feature/auth | 📦 ui-design
```

| 요소 | 의미 |
|------|------|
| 모드 아이콘 | 현재 활성 모드 (📋🔨🔍💬🧹🔒📊🚀🌐) |
| 진행률 바 | docs/progress.md 기준 Task 완료율 |
| ctx % | 컨텍스트 윈도우 사용률 (🟢<50, 🟡<80, 🔴≥80) |
| 💰 | 세션 누적 비용 (USD) |
| ⏱ | 세션 경과 시간 |
| 🔀 | 현재 git 브랜치 |
| 📦 | 활성 팩 이름 |
| ⚠️ rate | Rate limit 70% 초과 시 경고 |

---

## 10. CLI 전체 명령어

```bash
# 세션 관리
reins                             새 세션 (auto-mode + bypass-permissions)
reins new <이름>                  이름 지정 새 세션
reins <이름>                      기존 세션 이어하기
reins list                        세션 목록
reins fork <이름>                 세션 분기 (git 브랜치 생성)
reins --safe [이름]               안전 모드 (자동 권한 없이)
reins --mode <모드> [이름]        특정 모드로 시작
reins --pack <팩> new <이름>      팩 설치 후 세션 시작

# 설정
reins setup                       스킬/에이전트/훅 등록
reins config set <키> <값>        설정 변경
reins config get <키>             설정 조회
reins doctor                      환경 진단
reins --version                   버전 출력
reins --help                      도움말

# 업데이트
reins update                      전체 업데이트
reins update --check              업데이트 확인만
reins update --rollback           이전 버전 복원

# 팩
reins pack list                   팩 목록 (설치 상태 표시)
reins pack install <이름>         팩 설치
reins pack install --all          전부 설치
reins pack remove <이름>          팩 제거
reins pack create <이름>          새 팩 템플릿

# 병합
reins merge <소스>                외부 소스 분석 + 병합
reins merge list                  병합 목록
```

---

## 11. 세션 내 전체 명령어

```
# 모드
/plan, /dev, /review, /discuss, /cleanup, /retro     자동 호출 모드
/security, /deploy, /bridge                          수동 호출 모드
/debug                                                디버깅
/subagent-dev                                         서브에이전트 개발
/mode status                                          현재 상태
/mode history                                         전환 이력

# 계획서
/convert-plan <파일>                                  외부 계획서 변환
/convert-plan --preview <파일>                        미리보기

# 스냅샷
/snapshot save [이름]                                  저장
/snapshot restore <이름>                               복원
/snapshot list                                         목록
/snapshot compare <a> <b>                              비교

# 학습
/learn show | search | add | prune | stats | errors | promote | reset

# 성능
/perf profile | benchmark | report

# 설정
/briefing on | off | format <compact|full>

# 세션 마무리
/session-wrap
```

---

## 12. 커스텀 모드

`.reins/modes/<이름>.yaml` 파일로 사용자 정의 모드를 만들 수 있습니다.

```yaml
name: my-mode
description: "내 프로젝트 전용 워크플로우"
workflow:
  - step: "요구사항 분석"
    action: "Read and summarize the task"
  - step: "구현"
    action: "Write code following project conventions"
  - step: "검증"
    action: "Run tests and check types"
agents: [critic, pragmatist]
triggers: ["my mode", "내 모드"]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
```

---

## 13. 팩 개발 가이드

### 팩 구조

```
packs/<이름>/
├── PACK.yaml           팩 메타데이터
├── skills/             스킬 파일들 (.md)
├── agents/             에이전트 파일들 (.md)
└── (optional)
    ├── reference/      참조 문서
    ├── modes/          커스텀 모드 정의
    └── anti-patterns.md 안티패턴 목록
```

### PACK.yaml

```yaml
name: my-pack
version: "1.0.0"
description: "팩 설명"
author: "작성자"
keywords: [관련, 키워드]
dependencies: []
skills:
  - skill-name-1
  - skill-name-2
agents:
  - agent-name-1
```

### 스킬 작성 규칙

```yaml
---
name: pack-name-skill-name          # 소문자 + 하이픈
description: >                       # "Use when..."으로 시작, 250자 이내
  Use when the user says "trigger phrase".
allowed-tools: "Read, Grep, Glob"    # 최소 권한
---
```

- `version` 필드 사용 금지 (Claude Code 미인식)
- description에 기능 요약 넣지 않기 (트리거 조건만)
- 본문에 당연한 내용 넣지 않기 (Claude가 이미 아는 것)

---

## 14. 설정

### Reins 설정

```bash
reins config set <키> <값>
reins config get <키>
```

저장 위치: `~/.reins-config/config.json`

### Claude Code 설정

`reins setup` 실행 시 `~/.claude/settings.json`에 자동 주입:
- 훅 (PostToolUse, PreToolUse, Stop)
- 환경변수 (REINS_HOME)

---

## 15. 디렉터리 구조

```
reins/
├── bin/reins                              CLI 래퍼 (bash)
├── install.sh / install.ps1               설치 스크립트
├── .claude-plugin/                        마켓플레이스 메타데이터
│   ├── plugin.json
│   └── marketplace.json
├── core/                                  TypeScript 코어 (32 모듈)
│   ├── mode-engine/                       모드 전환, 상태, 전환 규칙, 커스텀 로더
│   ├── registry/                          팩 스캔, 리소스 해석, 자동 트리거
│   ├── guardrails/                        가드레일 규칙 엔진 (12 규칙)
│   ├── learning/                          학습 감시, 기록, 규칙 승격
│   ├── merge/                             외부 소스 분석, 래핑, 변환
│   ├── updater/                           버전 체크, 업데이트, 롤백
│   ├── plan-converter/                    계획서 파싱, 분석, 생성
│   ├── bridges/                           Gemini, OpenAI, Codex 어댑터
│   ├── statusline/                        StatusLine 스크립트
│   ├── conductor/                         멀티 세션 오케스트레이터
│   ├── notifications/                     웹훅 알림 (Slack/Discord/Telegram)
│   ├── profiler/                          성능 프로파일러
│   ├── snapshot/                          스냅샷 관리
│   ├── session/                           세션 포크
│   └── templates/                         프로젝트 템플릿 초기화
├── skills/                                내장 스킬 (20개)
│   ├── reins-*-mode/                      모드 스킬 (9개)
│   ├── reins-debug/                       디버깅
│   ├── reins-subagent-dev/                서브에이전트 개발
│   ├── reins-session-wrap/                세션 마무리
│   └── reins-{mode,pack,merge,...}/       유틸리티 스킬 (8개)
├── agents/                                토의 모드 에이전트 (6개)
├── hooks/                                 자동화 훅 (9개, TS → JS)
├── packs/                                 도메인 팩 (18개)
├── templates/outputs/                     산출물 템플릿 (5개)
├── scripts/                               유틸리티 스크립트
│   ├── build-hooks.sh                     훅 빌드
│   ├── register-skills.sh                 스킬 등록
│   ├── skill-preamble.sh                  런타임 상태 수집
│   ├── setup.sh / doctor.sh
│   └── codex/                             Codex 연동 스크립트
├── CLAUDE.md                              오케스트레이터 (93줄)
├── AGENTS.md                              에이전트 목차
├── CONTRIBUTING.md                        기여 가이드
└── package.json / tsconfig.json
```

---

## 16. 규칙 3계층 구조

```
계층 1: 훅 — 100% 강제 실행 (결정론적)
  9개 TypeScript 훅이 도구 사용 전후에 자동 실행
  예: .env 파일 읽기 차단, DROP TABLE 차단

계층 2: 모드 스킬 — 90%+ 준수
  SKILL.md 안의 지시사항을 Claude가 따름
  HARD-GATE 태그로 절대 규칙 강제
  예: "코드 작성 전 설계 승인 필수"

계층 3: CLAUDE.md — 80% 가이드
  프로젝트 수준 가이드라인 (93줄)
  반합리화 테이블, 라우팅 규칙, 출력 포맷
```

---

## 17. 프론트매터 표준

### 인식되는 필드

| 필드 | 설명 | 필수 |
|------|------|------|
| `name` | 소문자 + 하이픈 | 필수 |
| `description` | "Use when..."으로 시작, 250자 이내 | 필수 |
| `allowed-tools` | 사용 가능한 도구 목록 | 권장 |
| `disable-model-invocation` | true면 사용자 명시적 호출만 | 선택 |
| `user-invocable` | false면 사용자가 직접 호출 불가 | 선택 |

### 사용하면 안 되는 필드

- `version` — Claude Code가 인식하지 않음 (무시됨)
- `mode` — Claude Code가 인식하지 않음 (무시됨)

---

## 18. 업데이트 시스템

```bash
reins update              # git pull → npm install → build → 스킬 재등록
reins update --check      # 업데이트 확인만 (GitHub releases API)
reins update --rollback   # 이전 버전으로 복원
```

**업데이트 과정:**
1. 백업 생성 (`.reins/backups/backup-<버전>-<타임스탬프>`)
2. `git pull origin main`
3. `npm install`
4. `npm run build:all` (코어 + 훅)
5. `reins setup` (스킬/에이전트 재등록)
6. 버전 확인

**롤백:**
- 직전 백업에서 package.json, CLAUDE.md, hooks/dist 복원
- 실패한 업데이트에서 복구 가능
