# Reins — AI Agent Harness

> "고삐가 말의 힘을 방향으로 바꾸듯, Reins는 AI 에이전트의 능력을 신뢰할 수 있는 결과물로 바꾼다."

Reins는 Claude Code 위에서 동작하는 **모드 기반 통합 AI 에이전트 하네스**입니다. 계획부터 개발, 검토, 배포까지 전체 소프트웨어 개발 라이프사이클을 구조화된 모드로 관리하며, 3계층 규칙 체계로 AI 에이전트의 행동을 제어합니다.

## 주요 특징

- **9개 내장 모드** — plan · dev · review · discuss · cleanup · security · retro · deploy · bridge
- **3계층 규칙 체계** — 훅(100% 강제) → 모드 스킬(90%+ 준수) → CLAUDE.md(80% 가이드)
- **17개 도메인 팩** — UI 디자인, 소설 집필, 게임 개발, 데이터 과학, AI/ML 등
- **자동 학습** — 실패/수정 패턴을 자동 기록하고, 3회 반복 시 규칙으로 승격 제안
- **계획서 변환** — 외부 PRD/기획서를 Reins 계획 형식으로 자동 변환
- **외부 AI 브릿지** — Gemini, GPT, Codex CLI와 크로스 리뷰/세컨드 오피니언/태스크 위임
- **실시간 StatusLine** — 모드, 진행률, 컨텍스트 사용량, 비용, 시간을 한눈에 표시

---

## 설치

### 원클릭 설치 (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/reins/main/install.sh | bash
```

설치 스크립트가 자동으로 처리하는 항목:
1. Node.js, Git, jq 의존성 확인 및 설치
2. Claude Code 설치 (`npm install -g @anthropic-ai/claude-code`)
3. Reins 클론 + 빌드 (`npm install && npm run build:all`)
4. CLI 심볼릭 링크 + PATH 등록
5. settings.json에 StatusLine + 훅 설정 주입

### Windows

```powershell
.\install.ps1
```

### 수동 설치

```bash
git clone https://github.com/<owner>/reins.git ~/.reins
cd ~/.reins
npm install
npm run build:all
ln -sf ~/.reins/bin/reins ~/.local/bin/reins
```

### 설치 확인

```bash
reins doctor
```

출력 예시:
```
Reins Environment Diagnostics
────────────────────────────────
  Node.js:     v24.11.1
  Git:         2.52.0
  jq:          jq-1.7
  Claude Code: installed
  Reins:       v0.1.0
  Hooks:       5 built
────────────────────────────────
```

---

## 빠른 시작

```bash
# 새 세션 시작
reins new my-project

# 안전 모드 (자동 권한 승인 없이)
reins --safe my-project

# 특정 모드로 시작
reins --mode plan my-project

# 기존 세션 이어서 진행
reins my-project

# 세션 목록
reins list
```

세션 내에서 모드 전환:
```
/mode plan      → 계획 수립
/mode dev       → 개발
/mode review    → 검토
/mode status    → 현재 상태 확인
```

---

## 모드

### 📋 Plan (계획)

요구사항을 상세 작업으로 분해합니다.

```
요구사항 수집 → 소크라틱 질문 → 조사 → 아키텍처 설계
    → 작업 분해 → 의존성 그래프 → 체크포인트 → 승인
```

- 각 Task는 5~15분 크기로 분해
- 모든 Task에 검증 기준(Acceptance Criteria) 필수
- Phase 경계에 체크포인트 배치 → 자동 검토 모드 전환
- 산출물: `docs/plans/PLAN-<n>.md`

### 🔨 Dev (개발)

계획에 따라 Task를 순차 실행하고 자동 검증합니다.

```
계획 로드 → Task 선택 → 구현 → 자동 검증 → 결과 기록 → 다음 Task
```

자동 검증 5항목:
1. 린트 (linter)
2. 타입 체크 (type checker)
3. 테스트 (test suite)
4. 검증 기준 충족 여부
5. 아키텍처 제약 준수

### 🔍 Review (검토)

7레이어 다층 검증을 이슈 0이 될 때까지 반복합니다 (최대 5회).

| Layer | 검증 항목 | 조건 |
|-------|----------|------|
| 1 | 정적 분석 | 항상 |
| 2 | 테스트 실행 | 항상 |
| 3 | 계획 대비 검증 | 항상 |
| 4 | AI 코드 리뷰 | 항상 |
| 5 | 아키텍처 적합성 | 항상 |
| 6 | 브라우저 검증 | ui-design 팩 활성 시 |
| 7 | 디자인 검증 | ui-design 팩 활성 시 |

### 💬 Discuss (토의)

멀티 에이전트 토론으로 다각도 분석을 수행합니다.

역할 풀 6개에서 주제별 3~4개를 동적 선택:

| 주제 | 선택 에이전트 |
|------|-------------|
| 기술 설계 | critic, pragmatist, innovator |
| 사용자 경험 | user-advocate, critic, innovator |
| 비즈니스 결정 | advocate, critic, pragmatist |
| 도메인 특화 (팩 활성) | domain-expert, critic, pragmatist |
| 복합 주제 | advocate, critic, pragmatist, innovator |

3라운드: 개별 분석 → 교차 반론 → 합의 도출

### 🧹 Cleanup (정리)

코드 엔트로피 7항목을 스캔하고 수정합니다:
코드 중복, 죽은 코드, 문서 불일치, 네이밍 위반, 테스트 커버리지 갭, 의존성 낡음, 스타일 드리프트

### 🔒 Security (보안) — 수동 전용

6레이어 보안 감사를 수행합니다:
1. 시크릿 탐지
2. 의존성 CVE (npm/pip/cargo audit)
3. SAST (CWE Top 25)
4. STRIDE 위협 모델링
5. DAST (브라우저 보안 테스트)
6. 인프라 보안 (Docker, K8s, CORS, CSP)

### 📊 Retro (회고)

5개 카테고리 성과 분석: 생산성, 품질, 효율, 학습, 보안

### 🚀 Deploy (배포) — 수동 전용

배포 파이프라인: preview → staging → production → canary, rollback 지원

### 🌐 Bridge (브릿지) — 수동 전용

외부 AI 모델과 연계: Gemini, GPT, Codex CLI

```bash
/bridge gemini review <file>        # Gemini 코드 리뷰
/bridge gpt opinion <topic>         # GPT 의견
/bridge codex review <file>         # Codex 코드 리뷰
/bridge codex rescue <task>         # Codex에 태스크 위임
/bridge codex adversarial <file>    # 적대적 리뷰
/bridge compare <prompt>            # 멀티 AI 비교
```

---

## 도메인 팩

팩을 설치하면 해당 도메인에 특화된 스킬, 에이전트, 검증 레이어가 추가됩니다.

```bash
reins pack list                     # 설치 가능 팩 목록
reins pack install <name>           # 설치
reins pack remove <name>            # 제거
reins pack create <name>            # 새 팩 템플릿 생성
```

### 사용 가능한 팩 (18개)

| 팩 | 핵심 기능 |
|----|----------|
| **ui-design** | 닐슨 휴리스틱, 접근성(WCAG), 안티패턴, 디자인 시스템 |
| **novel-writing** | 세계관, 캐릭터 일관성, 플롯 구조, 집필/퇴고 모드 |
| **game-dev** | 게임 루프, 밸런싱, 레벨 디자인, 플레이테스트 |
| **data-science** | EDA, 피처 엔지니어링, 모델링, 실험 관리 |
| **devops** | CI/CD, IaC, 모니터링, 장애 대응 |
| **mobile-app** | 네이티브/크로스플랫폼, 성능, 스토어 심사 |
| **api-dev** | REST/GraphQL, 인증, DB 설계, 성능 |
| **tech-docs** | API 문서, 튜토리얼, 변경로그, 다이어그램 |
| **marketing** | 카피라이팅, SEO, A/B 테스트, 콘텐츠 전략 |
| **education** | 커리큘럼, 퀴즈, 인터랙티브 교재 |
| **legal** | 계약서 분석, 이용약관, 컴플라이언스 |
| **research** | 논문 구조화, 문헌 리뷰, 통계 분석, 인용 관리 |
| **hardware** | 회로 설계, 펌웨어, 프로토콜, 센서 통합 |
| **audio** | 오디오 처리, 사운드 디자인, 믹싱/마스터링 |
| **embedded-ai** | RAG 파이프라인, 프롬프트 엔지니어링, 에이전트 아키텍처 |
| **i18n-l10n** | 다국어 번역 품질, 문자열 추출, RTL, 날짜/통화 포맷 |
| **video-production** | 영상 편집 스크립트, 자막 생성, 스토리보드 |
| **codex** | Codex CLI 연동, 크로스 리뷰, 태스크 위임, 적대적 리뷰 |

---

## CLI 전체 명령어

### 세션

```bash
reins                             # 새 세션 (auto-mode + bypass-permissions)
reins new <name>                  # 이름 지정 새 세션
reins <name>                      # 기존 세션 이어서 진행
reins list                        # 세션 목록
reins fork <name>                 # 세션 분기 (A/B 비교)
reins --safe [name]               # 안전 모드 (auto-mode만, bypass 없음)
reins --mode <mode> [name]        # 특정 모드로 시작
reins --pack <pack> new <name>    # 팩과 함께 시작
```

### 업데이트

```bash
reins update                      # 전체 업데이트 (코어 + 팩)
reins update --core               # 코어만 업데이트
reins update --packs              # 팩만 업데이트
reins update --check              # 업데이트 확인만
reins update --rollback           # 직전 버전으로 롤백
```

### 팩 관리

```bash
reins pack list                   # 설치 가능 팩 목록
reins pack install <name>         # 팩 설치
reins pack remove <name>          # 팩 제거
reins pack create <name>          # 새 팩 템플릿 생성
```

### 외부 소스 병합

```bash
reins merge <source>              # 외부 소스 분석 + 병합
reins merge --from-github <url>   # GitHub에서 직접 병합
reins merge --level coexist       # 공존 (그대로 설치)
reins merge --level wrap          # 래핑 (Reins 팩으로 변환)
reins merge --level convert       # 변환 (네이티브 스킬로 재작성)
reins merge list                  # 병합된 소스 목록
reins merge update                # 병합 소스 업데이트
reins merge remove <source>       # 병합 해제
```

### 설정 및 진단

```bash
reins config set <key> <value>    # 설정 변경
reins config get <key>            # 설정 조회
reins doctor                      # 환경 진단
reins --version                   # 버전 출력
reins --help                      # 도움말
```

---

## 세션 내 스킬 명령어

모드 전환 외에도 세션 안에서 사용할 수 있는 유틸리티 스킬:

```
/mode <name>                      모드 전환
/mode status                      현재 모드 + 진행 상태
/mode history                     모드 전환 이력

/convert-plan <filepath>          외부 계획서 → Reins 형식 변환
/convert-plan --preview <file>    미리보기만 (저장 안 함)
/convert-plan --interactive       대화형 변환

/snapshot save [name]             스냅샷 저장
/snapshot restore <name>          스냅샷 복원
/snapshot compare <a> <b>         스냅샷 비교

/perf profile                     성능 프로파일링
/perf benchmark                   벤치마크 실행
/perf report                      성능 리포트

/learn show                       학습 내역 조회
/learn errors                     에러 패턴 조회
/learn promote <id>               학습 → 규칙 승격

/briefing on|off                  진행 브리핑 켜기/끄기
/briefing format compact|full     브리핑 포맷 설정
```

---

## 3계층 규칙 체계

### 계층 1: 훅 (100% 강제)

TypeScript 훅으로 결정론적 강제 실행:

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| auto-checkpoint | PostToolUse (Write/Edit) | N개 파일 변경 시 커밋 제안 |
| auto-format | PostToolUse (Write/Edit) | 편집 파일에 포매터 실행 |
| security-guard | PreToolUse (Read) | .env, .pem 등 민감 파일 접근 차단 |
| learning-observer | Stop | 세션 종료 시 실패/수정 패턴 기록 |
| context-compact | PostToolUse | 컨텍스트 60% 초과 시 압축 알림 |

### 계층 2: 모드 스킬 (90%+ 준수)

각 모드의 SKILL.md에 포함된 지시사항:
- 진행 브리핑 포맷 (Task 완료마다 진행률 바 출력)
- 응답 요약 프로토콜 (매 응답 끝에 요약 블록)
- 검증 체크리스트 (dev/review 모드)

### 계층 3: CLAUDE.md (80% 가이드)

프로젝트 수준 가이드라인 (100줄, 2,500 토큰 이하):
- 핵심 원칙 3개
- 모드 목록
- 팩/병합 참조 경로

---

## 자동 학습

모든 모드에서 백그라운드로 작동하는 학습 시스템:

```
이벤트 감지 (실패, 사용자 수정, 이슈 재발, 선호 패턴)
    ↓
자동 기록 → .reins/learnings/ (errors.jsonl, patterns.jsonl, preferences.jsonl)
    ↓
자동 적용
├── 동일 실패 → 이전 해결책 자동 시도
├── 누적 3회 → 규칙으로 승격 제안
└── 세션 시작 시 → 관련 학습 컨텍스트 주입
```

---

## StatusLine

세션 하단에 실시간 상태 표시:

```
📋 Plan | ████████░░ 75% (9/12) | 🟢 32% ctx | 💰 $0.45 | ⏱ 23m | 🔀 feature/auth | 📦 ui-design
```

모드별 자동 변환:
```
🔨 Dev      | ████░░ 67% | ✅ 8 ❌ 0 | 🟡 45% ctx
🔍 Review   | Layer 3/5 | Issues: 2 | Loop 2/5
💬 Discuss   | Round 2/3 | Agents: 4 | 🟡 60% ctx
🔒 Security  | Layer 4/6 | Critical: 0 | High: 2
```

Rate limit 70% 초과 시 경고 표시.

---

## 외부 AI 연결 (브릿지)

`.reins/bridges.json`에 API 키를 설정하면 외부 AI 모델과 연동:

```json
{
  "gemini": { "api_key": "YOUR_KEY", "model": "gemini-2.0-flash" },
  "openai": { "api_key": "YOUR_KEY", "model": "gpt-4o" },
  "codex": { "transport": "direct" }
}
```

Codex는 로컬 CLI 실행이므로 API 키 불필요 — `npm install -g @openai/codex`로 설치 후 바로 사용.

---

## 커스텀 모드

`.reins/modes/<name>.yaml`로 사용자 정의 모드를 생성할 수 있습니다:

```yaml
name: my-custom-mode
description: "Custom workflow for my project"
workflow:
  - step: "Analyze requirements"
    action: "Read and summarize the task"
  - step: "Implement"
    action: "Write code following project conventions"
  - step: "Verify"
    action: "Run tests and check types"
agents: [critic, pragmatist]
triggers: ["custom", "my workflow"]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
```

---

## 디렉터리 구조

```
reins/
├── bin/reins                           CLI 래퍼
├── install.sh / install.ps1            원클릭 설치
├── .claude-plugin/                     마켓플레이스 메타데이터
├── core/                               TypeScript 코어
│   ├── mode-engine/                    모드 전환 · 상태 관리
│   ├── registry/                       리소스 탐색 · 해석 · 자동 활성화
│   ├── guardrails/                     가드레일 규칙 엔진
│   ├── learning/                       자동 학습 (감시 · 기록 · 승격)
│   ├── merge/                          외부 소스 병합
│   ├── updater/                        업데이트 · 롤백
│   ├── plan-converter/                 계획서 변환
│   ├── bridges/                        외부 AI 어댑터 (Gemini/GPT/Codex)
│   ├── statusline/                     상태 바 스크립트
│   ├── conductor/                      멀티 세션 오케스트레이터
│   ├── notifications/                  웹훅 알림 (Slack/Discord/Telegram)
│   ├── profiler/                       성능 프로파일러
│   ├── snapshot/                       스냅샷 관리
│   ├── session/                        세션 포크
│   └── templates/                      프로젝트 템플릿 초기화
├── skills/                             내장 스킬 (17개)
│   ├── reins-{plan,dev,review,...}-mode/   모드 스킬 (9개)
│   └── reins-{mode,pack,merge,...}/        유틸리티 스킬 (8개)
├── agents/                             토의 모드 역할 풀 (6개)
├── hooks/                              자동화 훅 (5개, TS → JS)
├── packs/                              도메인 팩 (18개)
├── templates/outputs/                  산출물 템플릿
├── scripts/                            setup, doctor, build-hooks, codex
├── CLAUDE.md                           오케스트레이터 (31줄)
├── AGENTS.md                           에이전트 목차
└── package.json / tsconfig.json
```

---

## 개발 / 기여

```bash
# 빌드
npm run build              # TypeScript 코어 빌드
npm run build:hooks        # 훅 빌드 (TS → JS)
npm run build:all          # 전체 빌드

# 환경 진단
bin/reins doctor
```

팩 개발, 기여 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

---

## 라이선스

MIT
