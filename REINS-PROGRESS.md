# Reins — 진행 상세 과정

> 이 문서는 Reins 하네스의 실제 구현 시 단계별로 따라갈 작업 목록이다.
> 각 Task에는 구체적 행동, 대상 파일, 검증 기준, 의존성, 참조 레퍼런스가 명시되어 있다.

---

## 진행 상태 요약

| Phase | 상태 | 진행률 |
|-------|------|--------|
| Phase 1: 코어 기반 | ⬜ 대기 | 0/11 |
| Phase 2: 확장 모드 | ⬜ 대기 | 0/8 |
| Phase 3: 팩 + 변환 | ⬜ 대기 | 0/6 |
| Phase 4: 병합 + 브릿지 | ⬜ 대기 | 0/5 |
| Phase 5: 업데이트 + 생태계 | ⬜ 대기 | 0/5 |
| Phase 6: 고급 기능 | ⬜ 대기 | 0/7 |

---

## Phase 1: 코어 기반 (예상 2주)

Phase 1 완료 시 Reins의 핵심 루프(계획 → 개발 → 검토)가 작동한다.

---

### Task 1.1: 프로젝트 초기화

```
행동:
  - package.json 생성 (name: reins, type: module)
  - tsconfig.json 생성 (target: ES2022, module: NodeNext, strict: true)
  - 전체 디렉터리 구조 생성 (빈 폴더 + .gitkeep)
  - .gitignore 작성 (node_modules, dist, .reins/learnings/)
  - README.md 초안

대상 파일:
  - package.json
  - tsconfig.json
  - 전체 디렉터리 트리
  - .gitignore
  - README.md

검증 기준:
  - npm install 성공
  - npm run build 성공 (빈 빌드)
  - 디렉터리 구조가 확정 계획서 §18과 일치

의존성: 없음

참조:
  - 레퍼런스: claude-code-harness/package.json (TS 설정 패턴)
  - 마켓 검색: 불필요
```

---

### Task 1.2: bin/reins CLI 래퍼

```
행동:
  - bin/reins 셸 스크립트 작성
  - 서브커맨드 분기: new, list, fork, --safe, --mode, --pack, --version, --help
  - 기본 실행 시 --dangerously-skip-permissions + --enable-auto-mode 자동 적용
  - 세션 이름으로 실행 시 존재 여부 판단 → claude --resume 또는 claude -n
  - help.txt 작성

대상 파일:
  - bin/reins
  - bin/help.txt

검증 기준:
  - chmod +x bin/reins 후 실행 가능
  - reins --version → 버전 출력
  - reins --help → 도움말 출력
  - reins new test-session → claude -n test-session --dangerously-skip-permissions --enable-auto-mode 호출 확인
  - reins test-session → claude --resume test-session ... 호출 확인

의존성: Task 1.1

참조:
  - 레퍼런스: gstack의 bin/ 디렉터리 구조, setup 스크립트
  - 마켓 검색: "CLI wrapper launcher" (참고용)
```

---

### Task 1.3: install.sh 부트스트랩

```
행동:
  - install.sh 작성 (macOS + Linux 지원)
  - Phase 1: Node.js 확인/설치 (brew 또는 nvm)
  - Phase 2: Git, jq 확인/설치
  - Phase 3: Claude Code 설치 (npm install -g)
  - Phase 4: Reins clone + npm install + npm run build
  - Phase 5: bin/reins 심볼릭 링크 + PATH 등록
  - Phase 6: CLAUDE.md 배치 + settings.json 주입 (statusLine + 훅)
  - install.ps1 작성 (Windows PowerShell 기본 지원)

대상 파일:
  - install.sh
  - install.ps1

검증 기준:
  - macOS에서 curl | bash 실행 → reins --version 성공
  - Linux에서 curl | bash 실행 → reins --version 성공
  - 이미 설치된 환경에서 재실행 → "기존 설치 발견, 업데이트 중" 메시지
  - Claude Code 미인증 상태에서도 설치 자체는 완료 (인증은 별도 안내)

의존성: Task 1.2

참조:
  - 레퍼런스: gstack의 setup 스크립트, claude-code-harness의 설치 흐름
  - 마켓 검색: 불필요
```

---

### Task 1.4: CLAUDE.md 오케스트레이터

```
행동:
  - CLAUDE.md 작성 (확정 계획서 §4 포맷 그대로)
  - 100줄 이하, 2,500 토큰 이하
  - 핵심 원칙 3개만
  - 모드 목록 (한 줄)
  - 팩/병합 경로 참조
  - [프로젝트별] 자리표시자 포함

대상 파일:
  - CLAUDE.md

검증 기준:
  - 줄 수: wc -l CLAUDE.md ≤ 100
  - 토큰 카운트 ≤ 2,500 (tiktoken 또는 수동 추정)
  - Claude Code에서 세션 시작 시 CLAUDE.md 로드 확인 (/context로 확인)

의존성: 없음

참조:
  - 레퍼런스: Boris의 ~100줄 CLAUDE.md 패턴
  - 공식: code.claude.com/docs/en/best-practices
  - HumanLayer: "150~200 지시 한계" 참고
```

---

### Task 1.5: reins-plan-mode 스킬

```
행동:
  - skills/reins-plan-mode/SKILL.md 작성
    - 프론트매터: name, description(트리거 중심), mode: true, version
    - 소크라틱 질문 워크플로우
    - Task Breakdown 포맷 + 검증 기준 필수
    - 체크포인트 정의 규칙
    - 진행 브리핑 포맷 (브리핑 섹션)
    - 응답 요약 프로토콜 (요약 섹션)
  - skills/reins-plan-mode/templates/plan-template.md 작성
    - Phase/Task/검증기준/의존성/체크포인트 구조

대상 파일:
  - skills/reins-plan-mode/SKILL.md
  - skills/reins-plan-mode/templates/plan-template.md

검증 기준:
  - 프론트매터 체크리스트 전항목 통과
  - SKILL.md 본문 ≤ 2,000 토큰
  - Claude Code에서 /mode plan 또는 /reins-plan-mode 호출 시 스킬 활성화
  - "프로젝트 계획 세워줘" 자연어로도 자동 트리거
  - 출력에 진행 브리핑 포함
  - 출력에 📌 요약 블록 포함

의존성: Task 1.4

참조:
  - 레퍼런스: superpowers/skills/brainstorming/SKILL.md (소크라틱 패턴)
  - 레퍼런스: gstack/plan-ceo-review/SKILL.md (다각도 리뷰)
  - 마켓 검색: skills.sh "planning brainstorming task-breakdown"
```

---

### Task 1.6: reins-dev-mode 스킬

```
행동:
  - skills/reins-dev-mode/SKILL.md 작성
    - 프론트매터: name, description(트리거), mode: true, version
    - 계획 로드 → Task 순차 실행 흐름
    - 자동 검증 체크리스트 5항목
    - Task 완료마다 진행 브리핑 출력 지시
    - 응답 요약 프로토콜
  - skills/reins-dev-mode/reference/verification-checklist.md
    - 5항목 상세 설명 + 실행 방법

대상 파일:
  - skills/reins-dev-mode/SKILL.md
  - skills/reins-dev-mode/reference/verification-checklist.md

검증 기준:
  - 프론트매터 체크리스트 전항목 통과
  - /mode dev 호출 → docs/plans/PLAN-*.md 로드 시도
  - Task 실행 후 자동 검증 5항목 출력
  - 검증 실패 시 → 검토 모드 전환 제안
  - 진행 브리핑 진행률 바 표시
  - 📌 요약 블록 포함

의존성: Task 1.5

참조:
  - 레퍼런스: superpowers/skills/writing-plans/SKILL.md (서브에이전트 실행)
  - 레퍼런스: claude-code-harness/skills-v3/ (Plan→Work 루프)
  - 마켓 검색: "TDD implementation subagent"
```

---

### Task 1.7: reins-review-mode 스킬

```
행동:
  - skills/reins-review-mode/SKILL.md 작성
    - 프론트매터: name, description(트리거), mode: true, version
    - 7레이어 검증 구조 (Layer 6-7은 조건부)
    - 반복 조건: 이슈 0까지, 최대 5회
    - 반복 회차별 진행 브리핑
    - 응답 요약 프로토콜
  - skills/reins-review-mode/reference/review-layers.md
    - 각 Layer 상세 설명 + 실행 명령어 예시

대상 파일:
  - skills/reins-review-mode/SKILL.md
  - skills/reins-review-mode/reference/review-layers.md

검증 기준:
  - /mode review 호출 → Layer 1부터 순차 실행
  - 이슈 발견 시 수정 → Layer 1 재시작
  - 모든 Layer 통과 시 "✅ 검토 통과" 출력
  - 최대 5회 도달 시 "사용자 개입 필요" 출력
  - Layer 6-7: UI 팩 미설치 시 "팩 미설치, 스킵" 출력

의존성: Task 1.6

참조:
  - 레퍼런스: claude-code-harness/core/src/guardrails/ (규칙 엔진)
  - 레퍼런스: impeccable/.claude/skills/ (디자인 검증 패턴, Layer 7 참고)
  - 레퍼런스: millionco/expect (브라우저 검증, Layer 6 참고)
  - 마켓 검색: "code-review quality-gate linting"
```

---

### Task 1.8: 훅 4개 구현

```
행동:
  - hooks/auto-checkpoint.ts 작성
    - PostToolUse (Write|Edit|MultiEdit) 이벤트
    - 변경 파일 수 체크 → N개 초과 시 커밋 제안 메시지 출력
  - hooks/auto-format.ts 작성
    - PostToolUse (Write|Edit|MultiEdit) 이벤트
    - $CLAUDE_FILE_PATH에 프로젝트 포매터 실행
  - hooks/learning-observer.ts 작성
    - Stop 이벤트
    - 세션 내 실패/수정 패턴을 .reins/learnings/errors.jsonl에 기록
  - hooks/security-guard.ts 작성
    - PreToolUse (Read) 이벤트
    - .env, .pem, .key, .ssh/ 등 패턴 매칭 → 차단 + 경고
  - scripts/build-hooks.sh 작성
    - tsc로 hooks/*.ts → hooks/dist/*.js 빌드
  - settings.json 자동 주입 로직 (install.sh에 통합)

대상 파일:
  - hooks/auto-checkpoint.ts
  - hooks/auto-format.ts
  - hooks/learning-observer.ts
  - hooks/security-guard.ts
  - scripts/build-hooks.sh

검증 기준:
  - npm run build:hooks → hooks/dist/*.js 생성
  - 파일 편집 후 → 포맷 명령 실행 확인
  - .env 파일 Read 시도 → 차단 메시지 출력
  - 세션 종료 후 → .reins/learnings/errors.jsonl에 기록 존재
  - settings.json에 훅 설정 정상 주입

의존성: Task 1.1

참조:
  - 레퍼런스: claude-code-harness/hooks/ (훅 구조)
  - 레퍼런스: ccharness (commit-reminder, audit-read 패턴)
  - 공식: code.claude.com/docs/en/best-practices (훅 가이드)
  - 마켓 검색: "hooks automation format"
```

---

### Task 1.9: statusLine 스크립트

```
행동:
  - core/statusline/reins-status.sh 작성
    - stdin JSON 파싱 (jq)
    - 모드 아이콘 (📋/🔨/🔍/💬/🧹/🔒/📊/🚀/🌐)
    - 진행률 바 (docs/progress.md 읽기)
    - 컨텍스트% (색상 코딩: 초록<50, 노랑<80, 빨강≥80)
    - 세션 비용
    - 경과 시간
    - Git 브랜치
    - 활성 팩 이름
  - settings.json 자동 등록 로직

대상 파일:
  - core/statusline/reins-status.sh

검증 기준:
  - chmod +x 후 독립 실행 가능 (테스트 JSON 입력)
  - Claude Code 세션에서 하단 상태 바에 정보 표시
  - 모드 전환 시 아이콘 자동 변경

의존성: Task 1.1

참조:
  - 레퍼런스: ccstatusline (위젯 구조, 서브에이전트 인식)
  - 레퍼런스: claude-code-usage-bar (사용량 바 패턴)
  - 공식: code.claude.com/docs/en/statusline
  - 마켓 검색: "statusline status-bar context"
```

---

### Task 1.10: reins-mode 유틸리티 스킬

```
행동:
  - skills/reins-mode/SKILL.md 작성
    - /mode <n> → 해당 모드 스킬 활성화
    - /mode status → 현재 모드 + progress.md 요약
    - /mode history → 모드 전환 이력 (.reins/mode-history.jsonl)
  - core/mode-engine/engine.ts 작성
    - 모드 전환 로직 (현재 상태 저장 → 새 모드 로드)
  - core/mode-engine/state.ts 작성
    - docs/progress.md 읽기/쓰기
  - core/mode-engine/transitions.ts 작성
    - 전환 규칙 (dev → review 자동 전환 등)

대상 파일:
  - skills/reins-mode/SKILL.md
  - core/mode-engine/engine.ts
  - core/mode-engine/state.ts
  - core/mode-engine/transitions.ts

검증 기준:
  - /mode plan → /mode dev → /mode review 전환 정상
  - /mode status → 현재 모드 + 진행률 출력
  - /mode history → 전환 이력 표시
  - 모드 전환 시 docs/progress.md에 상태 기록

의존성: Task 1.5, 1.6, 1.7

참조:
  - 레퍼런스: gstack의 역할 전환 패턴
  - 마켓 검색: "mode switching workflow"
```

---

### Task 1.11: Phase 1 통합 테스트

```
행동:
  - 전체 워크플로우 E2E 테스트:
    1. reins new integration-test 실행
    2. /mode plan → 간단한 계획 수립 → 계획서 생성 확인
    3. /mode dev → Task 1개 실행 → 자동 검증 확인
    4. /mode review → Layer 1~5 실행 → 통과 확인
    5. 모드 전환 시 progress.md 갱신 확인
    6. 진행 브리핑 출력 형태 확인
    7. 응답 요약 📌 블록 출력 확인
    8. statusLine 표시 확인
    9. 훅 동작 확인 (파일 편집 → 포맷, 시크릿 → 차단)
  - 발견된 이슈 수정
  - 결과 기록

대상 파일:
  - (기존 파일 수정만, 신규 없음)

검증 기준:
  - 전체 흐름 무중단 완료
  - 모든 출력 포맷이 설계와 일치
  - 훅 4개 모두 정상 작동
  - statusLine 정상 표시

의존성: Task 1.1 ~ 1.10 전부

참조: 불필요 (자체 테스트)
```

---

## Phase 2: 확장 모드 (예상 2주)

CP: Phase 1 통합 테스트 통과 후 진입.

---

### Task 2.1: reins-discuss-mode 스킬 + 에이전트 4개

```
행동:
  - skills/reins-discuss-mode/SKILL.md
    - 동적 에이전트 선택 로직 (주제별 3~4개)
    - 3라운드 토의 구조
    - 합의 도출 포맷
  - skills/reins-discuss-mode/reference/discussion-format.md
  - agents/advocate.md, critic.md, pragmatist.md, innovator.md
    - 각각 프론트매터(name, description 트리거, tools) + 시스템 프롬프트
  - agents/user-advocate.md, domain-expert.md (추가 풀)

검증: /mode discuss → 에이전트 선택 제안 → 3라운드 토의 → 합의 문서 생성
의존성: Task 1.10
참조: gstack의 multi-review 패턴, superpowers의 서브에이전트 패턴
```

---

### Task 2.2: reins-cleanup-mode 스킬

```
행동:
  - skills/reins-cleanup-mode/SKILL.md
    - 엔트로피 7항목 스캔 로직
    - /cleanup scan, fix, fix --dry-run, report, schedule
  - 브리핑·요약 포함

검증: /mode cleanup → 스캔 결과 리포트 → 자동 수정 항목 처리
의존성: Task 1.10
참조: OpenAI 하네스 엔지니어링 가비지 컬렉션 패턴
```

---

### Task 2.3: reins-security-mode 스킬

```
행동:
  - skills/reins-security-mode/SKILL.md
    - disable-model-invocation: true
    - 6레이어 보안 검증 구조
    - /security scan, scan --quick, secrets, deps, threat-model, pentest, report, fix
  - skills/reins-security-mode/reference/cwe-top-25.md
  - skills/reins-security-mode/reference/stride-model.md

검증: /mode security → 6레이어 순차 실행 → 보안 리포트 생성
의존성: Task 1.10
참조: claude-forge/security-pipeline, 마켓 "security-audit CWE SAST"
```

---

### Task 2.4: reins-retro-mode 스킬

```
행동:
  - skills/reins-retro-mode/SKILL.md
    - 5개 카테고리 분석 (생산성, 품질, 효율, 학습, 보안)
    - /retro session, project, weekly, compare
  - skills/reins-retro-mode/templates/retro-template.md

검증: /retro session → 세션 분석 리포트 생성
의존성: Task 1.10
참조: gstack/retro/SKILL.md
```

---

### Task 2.5: reins-deploy-mode 스킬

```
행동:
  - skills/reins-deploy-mode/SKILL.md (disable-model-invocation: true)
    - preview, staging, prod, canary, rollback

검증: /mode deploy → 배포 체크리스트 + 단계별 실행
의존성: Task 1.10
참조: 마켓 "deployment CI-CD release"
```

---

### Task 2.6: reins-bridge-mode 스킬

```
행동:
  - skills/reins-bridge-mode/SKILL.md (disable-model-invocation: true)
    - /bridge gemini review, /bridge gpt opinion, /bridge compare, /bridge handoff
  - core/bridges/adapter.ts, gemini.ts, openai.ts 기본 구조

검증: API 키 설정 → /bridge gemini review → 응답 수신
의존성: Task 1.10
참조: 마켓 "multi-model cross-model"
```

---

### Task 2.7: context-compact 훅

```
행동:
  - hooks/context-compact.ts
    - PostToolUse 이벤트
    - 컨텍스트 사용률 체크 → 60% 초과 시 압축 제안 메시지

검증: 컨텍스트 60% 초과 시 → 알림 출력
의존성: Task 1.8
참조: 공식 statusLine JSON의 used_percentage 필드
```

---

### Task 2.8: Phase 2 통합 테스트

```
행동: 모든 확장 모드 워크플로우 테스트
검증: 9개 모드 전부 정상 작동, 모드 간 전환 정상
의존성: Task 2.1 ~ 2.7
```

---

## Phase 3: 팩 + 계획서 변환 (예상 2주)

CP: Phase 2 통합 테스트 통과 후 진입.

---

### Task 3.1: 팩 엔진

```
행동:
  - core/registry/scanner.ts (packs/ 디렉터리 자동 스캔)
  - core/registry/resolver.ts (팩 스킬/에이전트/커맨드 해석)
  - core/registry/auto-trigger.ts (맥락 기반 팩 스킬 자동 활성화)
  - PACK.yaml 표준 스키마 정의

검증: 팩 설치 → 스킬 자동 등록 → /skill-name 호출 가능
의존성: Task 1.10
참조: superpowers의 스킬 자동 탐지 패턴
```

---

### Task 3.2: reins-pack 유틸리티 스킬

```
행동:
  - skills/reins-pack/SKILL.md
    - /pack list, install, remove, info, update, create, search

검증: /pack install ui-design → 팩 설치 → 관련 스킬 활성화
의존성: Task 3.1
```

---

### Task 3.3 ~ 3.5: 기본 팩 3개

```
Task 3.3: packs/ui-design/
  - PACK.yaml + skills/ + agents/ + anti-patterns.md
  - Impeccable 안티패턴 + 닐슨 휴리스틱 내장
  - Review Layer 6-7 활성화
  참조: impeccable/.claude/skills/, 마켓 "frontend-design UI-audit"

Task 3.4: packs/novel-writing/
  - PACK.yaml + skills/ + agents/ + modes/writing.yaml
  - 집필 모드 (개요→초고→퇴고) 커스텀 모드 포함
  참조: 마켓 "writing creative novel storytelling"

Task 3.5: packs/game-dev/
  - PACK.yaml + skills/ + agents/
  - 레벨 디자인, 밸런싱, 플레이테스트 스킬
  참조: 마켓 "game-dev unity godot balancing"
```

---

### Task 3.6: reins-convert-plan 스킬 + core/plan-converter/

```
행동:
  - skills/reins-convert-plan/SKILL.md
    - /convert-plan, --preview, --interactive
  - skills/reins-convert-plan/templates/reins-plan-format.md
  - core/plan-converter/parser.ts (MD/TXT/DOCX/PDF 파싱)
  - core/plan-converter/analyzer.ts (요구사항, 기술 스택, 마일스톤 추출)
  - core/plan-converter/generator.ts (Reins 계획 포맷 변환)

검증:
  - .md 파일 → /convert-plan test.md → Reins 계획서 생성
  - 생성된 계획서에 Phase/Task/검증기준/의존성/체크포인트 포함
  - "원본 대비 변경점" 섹션 포함
  - --preview → 저장 없이 미리보기만
  - --interactive → 단계별 확인 대화

의존성: Task 1.5 (계획 모드 포맷)
참조: 마켓 "document-converter PRD spec-parser"
```

---

## Phase 4: 병합 + 브릿지 (예상 1~2주)

---

### Task 4.1: merge 시스템

```
행동:
  - core/merge/analyzer.ts (외부 소스 구조 분석)
  - core/merge/adapter.ts (Level 2 래핑 어댑터 생성)
  - core/merge/converter.ts (Level 3 네이티브 변환)
  - skills/reins-merge/SKILL.md
  - .reins/merged/registry.json 스키마

검증: /reins merge --from-github <repo> → 분석 → 병합 레벨 제안
의존성: Task 3.1
참조: 각 레퍼런스 레포의 디렉터리 구조
```

---

### Task 4.2 ~ 4.4: bridges 어댑터 + 연동 테스트

```
Task 4.2: core/bridges/adapter.ts (통합 인터페이스)
Task 4.3: core/bridges/gemini.ts + openai.ts (API 호출 로직)
Task 4.4: bridge 모드 연동 E2E 테스트
```

---

### Task 4.5: Phase 4 통합 테스트

---

## Phase 5: 업데이트 + 생태계 (예상 1~2주)

---

### Task 5.1: updater 시스템

```
행동:
  - core/updater/checker.ts (GitHub releases API 버전 체크)
  - core/updater/installer.ts (백업 → 업데이트 → 훅 재빌드 → statusLine 갱신)
  - core/updater/rollback.ts (직전 백업 복원)
  - bin/reins에 update 서브커맨드 추가
```

---

### Task 5.2: 마켓플레이스 배포 준비

```
행동:
  - .claude-plugin/plugin.json 완성
  - .claude-plugin/marketplace.json 완성
  - README.md 최종 작성
  - CONTRIBUTING.md 작성
```

---

### Task 5.3 ~ 5.4: 나머지 팩 11개

```
Task 5.3: data-science, devops, mobile-app, api-dev, tech-docs (5개)
Task 5.4: marketing, education, legal, research, hardware, audio (6개)
```

---

### Task 5.5: 사용자 문서

```
행동: 전체 사용자 가이드, 팩 개발 가이드, 기여 가이드 작성
```

---

## Phase 6: 고급 기능 (지속)

---

```
Task 6.1: Conductor (멀티 세션 오케스트레이터)
Task 6.2: 알림 연동 (Slack/Discord/Telegram 웹훅)
Task 6.3: 스냅샷/복원 (/snapshot save/restore/compare)
Task 6.4: 성능 프로파일링 (/perf)
Task 6.5: 프로젝트 템플릿 (reins init --template)
Task 6.6: 세션 포크 (reins fork)
Task 6.7: 커스텀 모드 YAML 엔진
```

---

## 네이밍 컨벤션 (전체 적용)

```
스킬:     reins-<기능>            예: reins-plan-mode, reins-convert-plan
팩 스킬:  <팩명>-<기능>            예: ui-design-audit, novel-character-check
에이전트: <역할명>                 예: critic, advocate, pragmatist
훅:       <동작>-<대상>.ts         예: auto-checkpoint.ts, security-guard.ts
모드:     reins-<모드명>-mode      예: reins-plan-mode, reins-dev-mode
```

---

## 개발 시 참조 프로토콜 (매 Task 적용)

```
1. 해당 Task의 최우선 레퍼런스 실제 코드를 fetch/clone으로 직접 확인
2. 스킬 마켓플레이스(skills.sh, SkillHub, SkillsMP)에서 관련 키워드 검색
3. 상위 3개 인기 스킬의 구조 확인 → 효과적 패턴 추출
4. Reins 표준(프론트매터, 네이밍, 토큰 상한)에 맞게 변환
5. .reins/references.md에 참조 이력 기록
```
