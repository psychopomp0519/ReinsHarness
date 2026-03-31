# Reins — 최종 확정 계획서

> "고삐가 말의 힘을 방향으로 바꾸듯, Reins는 AI 에이전트의 능력을 신뢰할 수 있는 결과물로 바꾼다."

---

## 1. 프로젝트 정의

| 항목 | 내용 |
|------|------|
| 이름 | **Reins** |
| 정체성 | 모드 기반 통합 AI 에이전트 하네스 |
| 주 언어 | TypeScript 코어 + Markdown 스킬 (하이브리드) |
| 대상 플랫폼 | Claude Code (1차), Codex/OpenCode (2차) |
| 배포 방식 | Claude Code 플러그인 마켓플레이스 + Git clone 수동 설치 |
| 라이선스 | MIT |

---

## 2. 레퍼런스 우선순위

기능이 겹칠 때 에이전트가 가장 정확히 따를 수 있는 쪽을 우선한다.

| 기능 영역 | 최우선 레퍼런스 | 이유 |
|-----------|---------------|------|
| 워크플로우 강제 | **Superpowers** | Markdown 스킬 단위 프로세스 정의가 가장 경량이고 준수율 높음 |
| 역할 기반 제약 | **gstack** | 역할별 SKILL.md 분리로 토큰 효율 높고 실전 검증됨 |
| 가드레일 엔진 | **claude-code-harness** | TypeScript 13개 선언적 규칙 + 훅 기반 런타임 강제 |
| 디자인 품질 | **Impeccable** | 안티패턴 목록 + 닐슨 휴리스틱 스코어링이 가장 구체적 |
| 브라우저 검증 | **Expect (millionco)** | diff 기반 테스트 플랜 자동 생성 + Playwright |
| 시스템 프롬프트 이해 | **system_prompts_leaks** | Claude Code 내부 도구/안전 정책 역공학 참조 |

레이어 적용 순서: Markdown 프로세스(Superpowers) → TypeScript 런타임 강제(훅) → 역할 격리(gstack)

---

## 3. 규칙 3계층 구조

공식 가이드라인 분석 결과 확정된 구조.

```
계층 1: 훅 — 100% 강제, 결정론적
  ├── auto-checkpoint.ts       파일 N개 변경 → 자동 커밋 제안
  ├── auto-format.ts           파일 편집 후 → 포매터 실행
  ├── learning-observer.ts     세션 종료 시 → 실패/수정 패턴 기록
  ├── security-guard.ts        민감 파일 접근 → 차단
  └── context-compact.ts       컨텍스트 60% 초과 → 압축 알림

계층 2: 모드 스킬 — 90%+ 준수
  ├── 진행 브리핑 포맷         각 모드 SKILL.md 내에 포함
  ├── 응답 요약 프로토콜       각 모드 SKILL.md 내에 포함
  └── 검증 체크리스트         dev/review 모드 SKILL.md에 포함

계층 3: CLAUDE.md — 80% 가이드
  ├── 프로젝트 개요
  ├── 모드 목록
  ├── 핵심 원칙 3개
  └── 팩/병합 소스 경로
```

---

## 4. CLAUDE.md 확정 사양

100줄 이하, 2,500 토큰 이하. 강제 규칙은 훅과 모드 스킬에 위임.

```markdown
# Reins — AI Agent Harness

이 프로젝트에는 Reins 하네스가 설치되어 있습니다.

## 프로젝트 개요
[프로젝트별 1~2줄 — reins init 시 자동 생성]

## 핵심 원칙
1. 모든 작업은 모드 안에서 수행한다
2. 모드 전환 시 docs/progress.md에 상태를 기록한다
3. 실패는 자동 학습된다 (.reins/learnings/)

## 모드 (→ /mode <n>)
plan · dev · review · discuss · cleanup · security · retro · deploy · bridge
커스텀 모드: .reins/modes/*.yaml

## 팩
설치된 팩: .reins/packs/ 자동 탐색. /pack 으로 관리.

## 병합된 외부 소스
.reins/merged/registry.json 참조.

## 빌드·테스트
[프로젝트별 — reins init 시 자동 생성]
```

---

## 5. 프론트매터 표준

### 5.1 모드 스킬

```yaml
---
name: reins-<mode>-mode              # 소문자+하이픈, reins- 접두사
description: >                       # 3인칭, what + when 트리거
  Does X. Use when the user says "A", "B", or invokes /mode <mode>.
mode: true                           # Mode Commands 섹션에 표시
version: "0.1.0"
disable-model-invocation: false      # 위험 모드(security/deploy/bridge)만 true
allowed-tools: "Read, Grep, Bash"    # 선택
---
```

### 5.2 유틸리티 스킬

```yaml
---
name: reins-<기능>
description: >
  Manages X. Use when the user says "A" or needs to B.
version: "0.1.0"
---
```

### 5.3 에이전트

```yaml
---
name: <역할명>
description: >
  Use this agent when [트리거 조건].
  Trigger when [구체적 상황].
tools: Read, Grep, Glob              # 최소 권한 원칙
model: sonnet                        # 선택
---
```

### 5.4 프론트매터 체크리스트 (작성 시 필수 확인)

```
[ ] name: 소문자 + 하이픈만 사용
[ ] description: 3인칭 작성
[ ] description: what + when 모두 포함
[ ] description: 트리거 문구 포함 ("Use when...", "Trigger when...")
[ ] mode: true → 모드 스킬에 적용
[ ] disable-model-invocation: true → 위험 모드에 적용
[ ] 토큰 상한 미초과
[ ] Claude가 이미 아는 당연한 내용 미포함
```

---

## 6. CLI 래퍼: `reins`

### 6.1 전체 명령어

```bash
# ── 세션 ──
reins                             새 세션 (auto-mode + bypass-permissions)
reins new <n>                  이름 지정 새 세션
reins <n>                      기존 세션 이어서 진행
reins list                        세션 목록
reins fork <n>                 세션 분기
reins --safe [name]               안전 모드 (auto-mode만)
reins --mode <mode> [name]        특정 모드로 시작
reins --pack <pack> new <n>    팩과 함께 시작

# ── 업데이트 ──
reins update                      전체 업데이트 (코어 + 팩)
reins update --core               코어만
reins update --packs              팩만
reins update --check              확인만
reins update --rollback           롤백

# ── 팩 ──
reins pack list                   설치 가능 팩 목록
reins pack install <n>         설치
reins pack remove <n>          제거
reins pack create <n>          새 팩 템플릿

# ── 병합 ──
reins merge <source>              외부 소스 병합
reins merge list                  병합 목록
reins merge update                병합 소스 업데이트
reins merge remove <source>       병합 해제

# ── 설정·진단 ──
reins config set <key> <value>    설정 변경
reins config get <key>            설정 조회
reins doctor                      환경 진단
reins --version                   버전
reins --help                      도움말
```

### 6.2 내부 동작

```
reins <session-name>
    ↓
1. 자동 업데이트 체크 (설정 시)
2. 세션 존재 여부 확인
   ├─ 존재 → claude --resume <name> --dangerously-skip-permissions --enable-auto-mode
   └─ 없음 → claude -n <name> --dangerously-skip-permissions --enable-auto-mode
3. Reins 초기화 주입
   ├─ CLAUDE.md 오케스트레이터 로드
   ├─ 현재 모드 상태 복원
   ├─ 학습 데이터 로드
   └─ statusLine 활성화
```

---

## 7. 원클릭 부트스트랩

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/reins/main/install.sh | bash
```

설치 흐름:
```
Phase 1: 의존성 → Node.js, Git, jq 확인/설치
Phase 2: Claude Code → npm install -g @anthropic-ai/claude-code
Phase 3: Reins → git clone + npm install + npm run build
Phase 4: CLI → bin/reins 심볼릭 링크 + PATH 등록
Phase 5: 설정 → CLAUDE.md 배치, settings.json에 statusLine + 훅 주입
```

---

## 8. 모드 엔진

### 8.1 내장 모드 9개

| 모드 | 커맨드 | 용도 | 자동 호출 | 수동 전용 |
|------|--------|------|----------|----------|
| 📋 계획 | /mode plan | 요구사항 → 상세 작업 분해 | ✅ | |
| 🔨 개발 | /mode dev | 단계별 구현 + 자동 검증 | ✅ | |
| 🔍 검토 | /mode review | 다층 검증, 오류 0까지 반복 | ✅ | |
| 💬 토의 | /mode discuss | 멀티 에이전트 토론 | ✅ | |
| 🧹 정리 | /mode cleanup | 엔트로피 스캔 + 수정 | ✅ | |
| 🔒 보안 | /mode security | 6레이어 보안 검증 | | ✅ |
| 📊 회고 | /mode retro | 성과 분석 | ✅ | |
| 🚀 배포 | /mode deploy | 릴리스 파이프라인 | | ✅ |
| 🌐 브릿지 | /mode bridge | 외부 AI 연계 | | ✅ |

### 8.2 📋 계획 모드

```
요구사항 수집 → 소크라틱 질문 → 조사 → 아키텍처 설계
    → 작업 분해 → 의존성 그래프 → 체크포인트 → 승인
```

산출물: `docs/plans/PLAN-<n>.md`
- 각 Task는 5~15분 크기로 분해
- 모든 Task에 검증 기준 필수
- Phase 경계에 체크포인트 → 자동 검토 모드 전환

### 8.3 🔨 개발 모드

```
계획 로드 → Task 선택 → 구현 → 자동 검증 → 결과 기록 → 다음 Task
                                    ↓ (실패)
                              검토 모드 자동 전환
```

자동 검증 5항목: 린트, 타입, 테스트, 검증 기준, 아키텍처 제약
자동 체크포인트: N개 Task 완료마다 git commit + tag

### 8.4 🔍 검토 모드

```
Layer 1: 정적 분석 (린터, 타입체커)
Layer 2: 테스트 실행 (유닛, 통합)
Layer 3: 계획 대비 검증 (검증 기준 충족?)
Layer 4: AI 코드 리뷰 (서브에이전트 스폰)
Layer 5: 아키텍처 적합성 (의존성, 모듈 경계)
Layer 6: 브라우저 검증 (UI 팩 활성 시, Expect 연동)
Layer 7: 디자인 검증 (UI 팩 활성 시, Impeccable 연동)
```

반복: 이슈 발견 → 수정 → Layer 1부터 재검증, 이슈 0 → 통과, 최대 5회

### 8.5 💬 토의 모드

역할 풀 6개 정의, 주제별 3~4개 동적 선택:
- 기술 설계 → critic, pragmatist, innovator
- 사용자 경험 → user-advocate, critic, innovator
- 비즈니스 → advocate, critic, pragmatist
- 복합 → advocate, critic, pragmatist, innovator

3라운드: 개별 분석 → 교차 반론 → 합의 도출

### 8.6 🧹 정리 모드

탐지: 코드 중복, 죽은 코드, 문서 불일치, 네이밍 위반, 테스트 커버리지, 의존성 낡음, 스타일 드리프트

### 8.7 🔒 보안 모드 (수동 전용)

```
Layer 1: 시크릿 탐지
Layer 2: 의존성 CVE (npm/pip/cargo audit)
Layer 3: SAST (CWE Top 25)
Layer 4: STRIDE 위협 모델링
Layer 5: DAST (Expect 연동, 브라우저 보안 테스트)
Layer 6: 인프라 보안 (Docker, K8s, CORS, CSP)
```

### 8.8 📊 회고 모드

분석: 생산성(LOC, 커밋, Task), 품질(검토 반복, 이슈), 효율(모드별 시간, 토큰, 비용), 학습(오류 패턴), 보안(취약점)

### 8.9 🚀 배포 모드 (수동 전용)

preview → staging → prod(승인 필요) → canary, rollback 지원

### 8.10 🌐 브릿지 모드 (수동 전용)

크로스 리뷰, 세컨드 오피니언, 강점 활용, 레이트 리밋 우회, 비교 생성.
`.reins/bridges.json`에 API 키 설정.

### 8.11 커스텀 모드

`.reins/modes/<name>.yaml`로 사용자 정의. workflow, agents, triggers 포함.

---

## 9. 백그라운드 자동 학습

별도 모드가 아닌, 모든 모드에서 상시 작동하는 레이어.

```
이벤트 감지 (실패, 사용자 수정, 같은 이슈 재발, 선호 패턴)
    ↓
자동 기록 → .reins/learnings/ (errors.jsonl, patterns.jsonl, preferences.jsonl)
    ↓
자동 적용
├── 동일 실패 → 이전 해결책 자동 시도
├── 누적 3회 → 규칙으로 승격 제안
└── 세션 시작 시 → 관련 학습 컨텍스트 주입
```

---

## 10. 실시간 진행 브리핑

모든 모드에서 Task 완료마다 진행률 바 + 상태 출력.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 진행 브리핑 — Task 3/8: API 엔드포인트 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████░░░░░░░░] 37.5% (3/8 Tasks)

✅ 완료: 1. 프로젝트 초기화  2. DB 스키마  3. API 엔드포인트
🔄 다음: Task 4 — 인증 미들웨어
⏱ 경과: 15분 | 예상 잔여: ~40분
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

빈도: Task 완료(필수), Phase 전환, 오류 발생(즉시), 장시간 Task(5분마다)

---

## 11. 응답 요약 프로토콜

모든 답변 마지막에 필수 포함 (단순 1~2문장 응답 제외).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [핵심 결과 1]
• [핵심 결과 2]
• [핵심 결과 3]

🔜 다음 단계: [다음에 할 일]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 12. 계획서 변환 기능 (Plan Converter)

외부 계획서(PRD, 기획서, 스펙)를 Reins 계획 형식으로 자동 변환.

지원 형식: .md, .txt, .docx, .pdf, 노션/Google Docs 내보내기

```
/convert-plan <파일경로>              변환 실행
/convert-plan --preview <파일경로>    미리보기만
/convert-plan --interactive           대화형 변환
```

변환 흐름:
```
원본 파싱 → 요소 추출 (요구사항, 기술 스택, 마일스톤, 제약)
    → Reins 포맷 변환 (Phase/Task, 검증 기준, 의존성, 체크포인트)
    → 사용자 검토 → docs/plans/PLAN-<n>.md 저장
    → 개발 모드에서 즉시 사용 가능
```

산출물에 "원본 대비 변경점" 섹션 포함: 추가된 항목, 구체화된 항목, 구조 변경 이유.

---

## 13. 외부 소스 병합 시스템

```
Level 1 공존:  외부 플러그인 그대로 설치, Reins가 인식하여 모드에서 호출
Level 2 래핑:  외부 스킬을 Reins 팩으로 래핑, 커맨드 체계에 통합
Level 3 변환:  핵심 로직을 Reins 네이티브 스킬로 재작성
```

```
/reins merge <source>                  분석 + 병합
/reins merge --from-plugin <name>      설치된 플러그인에서
/reins merge --from-github <url>       GitHub에서 직접
/reins merge --level coexist|wrap|convert
/reins merge list|update|remove
```

---

## 14. 업데이트 시스템

```
reins update           → 버전 확인 → diff 표시 → 백업 → 코어·팩 업데이트 → 훅 재빌드 → statusLine 갱신
reins update --rollback → 직전 백업으로 복원
```

---

## 15. 도메인 팩 14개

| 팩 | 핵심 기능 |
|----|----------|
| ui-design | 컴포넌트 설계, 접근성, 디자인 시스템, Impeccable 병합 |
| novel-writing | 세계관, 캐릭터, 플롯, 문체, 집필/퇴고 모드 |
| game-dev | 게임 루프, 밸런싱, 레벨 디자인, QA |
| data-science | EDA, 피처 엔지니어링, 모델링, 실험 관리 |
| devops | CI/CD, IaC, 모니터링, 장애 대응 |
| mobile-app | 네이티브/크로스플랫폼, 성능, 스토어 심사 |
| api-dev | REST/GraphQL, 인증, DB, 성능 |
| tech-docs | API 문서, 튜토리얼, 변경로그, 다이어그램 |
| marketing | 카피라이팅, SEO, A/B 테스트, 콘텐츠 전략 |
| education | 커리큘럼, 퀴즈, 인터랙티브 교재 |
| legal | 계약서 분석, 이용약관, 컴플라이언스, 개인정보 |
| research | 논문 구조화, 문헌 리뷰, 통계 분석, 인용 관리 |
| hardware | 회로 설계, 펌웨어, 프로토콜, 센서 통합 |
| audio | 오디오 처리, 사운드 디자인, 믹싱/마스터링 |

---

## 16. 상태 표시 (StatusLine)

```
📋 Plan | ████████░░ 75% (9/12) | 🧠 32% ctx | 💰 $0.45 | ⏱ 23m | 🔀 feature/auth | 📦 ui-design
```

모드별 자동 변환:
```
🔨 Dev     | ████░░ 67% | ✅ 8 ❌ 0 | 🧠 45%
🔍 Review  | Layer 3/5 | Issues: 2 | Loop 2/5
💬 Discuss  | Round 2/3 | Agents: 4 | 🧠 60%
🔒 Security | Layer 4/6 | Critical: 0 | High: 2
```

---

## 17. 추가 기능

| 기능 | 설명 |
|------|------|
| 세션 포크 | `reins fork <name>` A/B 비교 구현 |
| 컨텍스트 자동 압축 | 모드 전환 시 핵심만 추출, 불필요 이력 압축 |
| Conductor | 여러 reins 세션 병렬 관리 |
| 알림 연동 | Slack/Discord/Telegram 웹훅 |
| 프로젝트 템플릿 | `reins init --template nextjs` |
| 스냅샷/복원 | `/snapshot save/restore/compare` |
| 성능 프로파일링 | `/perf profile/benchmark/report` |

---

## 18. 확정 디렉터리 구조

```
reins/
├── bin/reins                        CLI 래퍼
├── install.sh                       원클릭 설치
├── install.ps1                      Windows 설치
├── .claude-plugin/
│   ├── plugin.json                  플러그인 메타
│   └── marketplace.json             마켓플레이스
├── core/                            TypeScript 코어
│   ├── mode-engine/                 모드 전환·상태
│   ├── registry/                    리소스 탐색·해석·자동 활성화
│   ├── guardrails/                  가드레일 규칙 엔진
│   ├── learning/                    자동 학습 (감시·기록·승격)
│   ├── merge/                       외부 소스 병합
│   ├── updater/                     업데이트·롤백
│   ├── plan-converter/              계획서 변환 (파싱·분석·생성)
│   ├── statusline/reins-status.sh   상태 바
│   └── bridges/                     외부 AI 어댑터
├── skills/                          모든 스킬 (commands/ 통합)
│   ├── reins-plan-mode/             모드 스킬 9개
│   ├── reins-dev-mode/
│   ├── reins-review-mode/
│   ├── reins-discuss-mode/
│   ├── reins-cleanup-mode/
│   ├── reins-security-mode/
│   ├── reins-retro-mode/
│   ├── reins-deploy-mode/
│   ├── reins-bridge-mode/
│   ├── reins-mode/                  유틸리티 스킬
│   ├── reins-pack/
│   ├── reins-merge/
│   ├── reins-snapshot/
│   ├── reins-perf/
│   ├── reins-briefing/
│   ├── reins-learn/
│   └── reins-convert-plan/          계획서 변환 스킬
├── agents/                          토의 모드 역할 풀 6개
├── hooks/                           자동화 훅 (TS → JS)
├── packs/                           도메인 팩 14개
├── templates/                       산출물 + 프로젝트 템플릿
├── scripts/                         setup, doctor, build-hooks
├── CLAUDE.md                        오케스트레이터 (100줄 이하)
├── AGENTS.md                        에이전트 목차
├── package.json
├── tsconfig.json
└── README.md
```

---

## 19. 토큰 효율 기준

| 항목 | 상한 |
|------|------|
| CLAUDE.md | 2,500 토큰 (100줄) 이하 |
| 모드 SKILL.md 프론트매터 | 200 토큰 이하 |
| 모드 SKILL.md 본문 | 2,000 토큰 이하 |
| 에이전트 정의 | 500 토큰 이하 |
| 유틸리티 스킬 | 1,000 토큰 이하 |

---

## 20. 개발 시 참조 프로토콜

각 기능 구현 직전:

```
1. 최우선 레퍼런스 실제 코드를 git clone 또는 fetch로 직접 확인
2. 스킬 마켓플레이스(skills.sh, SkillHub, SkillsMP 등)에서 유사 인기 스킬 검색
3. 추출 패턴을 Reins 표준(프론트매터, 네이밍, 토큰 상한)에 맞게 변환
4. 참조 이력을 .reins/references.md에 기록
```

---

## 21. 개발 로드맵

| Phase | 범위 | 기간 |
|-------|------|------|
| **1 코어** | CLI + install.sh + plan/dev/review 모드 + 훅 4개 + statusLine + 브리핑/요약 | 2주 |
| **2 확장 모드** | discuss + cleanup + security + retro + deploy + bridge + context-compact 훅 | 2주 |
| **3 팩+변환** | 팩 엔진 + 3개 기본 팩 + convert-plan + PACK.yaml 표준 | 2주 |
| **4 병합+브릿지** | merge 시스템 + bridges 어댑터 + bridge 모드 연동 | 1~2주 |
| **5 업데이트+생태계** | updater + 마켓플레이스 배포 + 나머지 11개 팩 + 문서 | 1~2주 |
| **6 고급** | Conductor + 알림 + 스냅샷 + 프로파일링 + 템플릿 + 포크 | 지속 |
