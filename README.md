# Reins — AI Agent Harness

> "고삐가 말의 힘을 방향으로 바꾸듯, Reins는 AI 에이전트의 능력을 신뢰할 수 있는 결과물로 바꾼다."

Reins는 Claude Code 위에서 동작하는 하네스입니다.
계획 → 개발 → 검토 → 배포까지 전체 개발 흐름을 **모드**로 관리하고,
훅과 가드레일로 AI가 실수하지 않도록 자동으로 제어합니다.

---

## 1분 안에 시작하기

```bash
# 1. 설치
git clone https://github.com/psychopomp0519/ReinsHarness.git ~/.reins
cd ~/.reins && npm install && npm run build:all
npm install -g @anthropic-ai/claude-code

# 2. PATH 등록 + 스킬 등록
ln -sf ~/.reins/bin/reins ~/.local/bin/reins
export PATH="$HOME/.local/bin:$PATH"
reins setup

# 3. 설치 확인
reins doctor

# 4. 세션 시작!
reins new my-project
```

세션이 열리면 바로 사용:
```
/plan          → 계획 수립 (요구사항을 Task로 분해)
/dev           → 개발 (Task 순차 실행 + 자동 검증)
/review        → 검토 (7레이어 검증, 이슈 0까지 반복)
```

---

## Reins가 하는 일

### 모드로 작업을 구조화

모드를 전환하면 Claude가 해당 모드의 워크플로우를 자동으로 따릅니다.
직접 `/plan`, `/dev`, `/review` 등을 입력하거나, "계획 세워줘", "개발 시작" 같은 자연어로도 전환됩니다.

| 모드 | 명령어 | 하는 일 |
|------|--------|---------|
| 📋 계획 | `/plan` | 소크라틱 질문 → 2~3개 접근법 비교 → Task 분해 (5~15분 단위) → 검증 기준 |
| 🔨 개발 | `/dev` | 계획 로드 → Task 순차 실행 → 자동 검증 5항목 → 실패 시 2회 재시도 후 검토 모드 |
| 🔍 검토 | `/review` | 7레이어 검증 (린트→테스트→계획대비→AI리뷰→아키텍처→브라우저→디자인) |
| 💬 토의 | `/discuss` | 3~4개 AI 에이전트가 3라운드 토론 → 합의 도출 |
| 🧹 정리 | `/cleanup` | 코드 중복, 죽은 코드, 문서 불일치 등 7항목 자동 스캔 + 수정 |
| 🔒 보안 | `/security` | 시크릿 탐지 → CVE → SAST(CWE Top 25) → STRIDE → DAST → 인프라 (수동 호출만) |
| 📊 회고 | `/retro` | 생산성·품질·효율·학습·보안 5개 카테고리 분석 |
| 🚀 배포 | `/deploy` | preview → staging → production → canary/rollback (수동 호출만) |
| 🌐 브릿지 | `/bridge` | Gemini, GPT, Codex CLI 등 외부 AI와 크로스 리뷰/태스크 위임 (수동 호출만) |
| 🐛 디버깅 | `/debug` | 근본 원인 먼저 찾기 → 4단계 체계적 디버깅 (추측 수정 금지) |
| 🤖 서브에이전트 | `/subagent-dev` | Task별 독립 에이전트 생성 → 2단계 리뷰 → 병합 |
| 📦 세션 마무리 | `/session-wrap` | 세션 종료 전 문서 업데이트, 학습 기록, 다음 작업 정리 |

### 기본 흐름

```
/plan → /dev → /review → (이슈 있으면 /dev 복귀) → /deploy
```

각 모드는 완료 시 다음 모드를 자동으로 제안합니다.

---

## 훅 — AI 행동을 자동으로 제어

설치하면 자동으로 작동합니다. 별도 설정 불필요.

| 훅 | 언제 작동 | 하는 일 |
|----|----------|---------|
| security-guard | 파일 읽기 전 | `.env`, `.pem`, SSH 키 등 민감 파일 읽기 차단 |
| auto-format | 파일 수정 후 | 편집한 파일에 포매터 자동 실행 |
| auto-checkpoint | 파일 수정 후 | 변경 파일이 많으면 커밋 제안 |
| context-compact | 도구 사용 후 | 컨텍스트 60% 초과 시 압축 알림 |
| learning-observer | 세션 종료 시 | 실패/수정 패턴을 자동 기록 |
| security-auto-trigger | 파일 수정 후 | 인증/결제 관련 파일 수정 시 보안 검토 제안 |
| output-secret-filter | 도구 사용 후 | 출력에 API 키/비밀번호가 노출되면 경고 |
| db-guard | 명령 실행 전 | DROP TABLE, TRUNCATE 등 위험한 SQL 차단 |
| remote-command-guard | 명령 실행 전 | `printenv`, `chmod 777`, `kill -9` 등 차단 |

---

## 도메인 팩 — 필요한 것만 설치

팩을 설치하면 해당 분야에 특화된 스킬과 에이전트가 추가됩니다.

```bash
reins pack list                # 사용 가능한 18개 팩 목록
reins pack install ui-design   # 설치
reins pack install --all       # 전부 설치
reins pack remove ui-design    # 제거
```

| 팩 | 용도 |
|----|------|
| **ui-design** | 닐슨 휴리스틱 채점(/40), 접근성(WCAG), AI slop 안티패턴, 6개 수정 스킬 |
| **novel-writing** | 캐릭터 일관성, 플롯 구조(3막/영웅여정), 집필/퇴고 |
| **game-dev** | 게임 루프 리뷰, 밸런싱 분석, 플레이테스트 |
| **data-science** | EDA, 피처 엔지니어링, 모델링, 실험 관리 |
| **devops** | CI/CD 파이프라인, IaC, 모니터링, 장애 대응 |
| **mobile-app** | 모바일 성능 분석, 스토어 심사 체크 |
| **api-dev** | REST/GraphQL 설계 품질, 인증, DB 설계 |
| **tech-docs** | API 문서, 튜토리얼, 변경로그 |
| **marketing** | 카피라이팅, SEO, A/B 테스트 |
| **education** | 커리큘럼, 퀴즈, 인터랙티브 교재 |
| **legal** | 계약서 분석, 이용약관, 컴플라이언스 |
| **research** | 논문 구조, 문헌 리뷰, 통계 분석 |
| **hardware** | 펌웨어 리뷰, 프로토콜 분석 |
| **audio** | 오디오 처리, 믹싱/마스터링 분석 |
| **embedded-ai** | RAG 파이프라인, 프롬프트 엔지니어링, 에이전트 설계 |
| **i18n-l10n** | 다국어 커버리지, 번역 품질, RTL |
| **video-production** | 영상 편집 스크립트, 자막, 스토리보드 |
| **codex** | OpenAI Codex CLI 연동 — 크로스 리뷰, 태스크 위임, 적대적 리뷰 |

---

## 세션 안에서 쓸 수 있는 추가 명령어

```
/convert-plan <파일>          외부 계획서(PRD 등)를 Reins 형식으로 변환
/snapshot save <이름>         현재 상태 스냅샷 저장
/snapshot restore <이름>      스냅샷 복원
/learn show                   AI가 학습한 내역 조회
/learn search <키워드>        학습 내역 검색
/learn prune                  더 이상 유효하지 않은 학습 정리
/perf profile                 성능 프로파일링
/retro 7d                     최근 7일 회고 분석
/briefing on|off              진행 브리핑 켜기/끄기
/session-wrap                 세션 마무리 (문서 업데이트 + 다음 작업 정리)
```

---

## CLI 명령어 모음

```bash
# 세션
reins new <이름>              새 세션 시작
reins <이름>                  기존 세션 이어하기
reins list                    세션 목록
reins fork <이름>             세션 분기 (A/B 비교)
reins --safe <이름>           안전 모드 (자동 권한 승인 없이)

# 업데이트
reins update                  최신 버전으로 업데이트
reins update --check          업데이트 있는지 확인만
reins update --rollback       이전 버전으로 되돌리기

# 팩
reins pack list               팩 목록 (설치 상태 표시)
reins pack install <이름>     팩 설치
reins pack install --all      전부 설치
reins pack remove <이름>      팩 제거
reins pack create <이름>      새 팩 템플릿 생성

# 설정
reins config set <키> <값>    설정 변경
reins config get <키>         설정 조회
reins setup                   스킬/에이전트/훅 재등록
reins doctor                  환경 진단
```

---

## 외부 AI 연결

`.reins/bridges.json` 파일을 만들면 외부 AI와 연동할 수 있습니다:

```json
{
  "gemini": { "api_key": "YOUR_KEY", "model": "gemini-2.0-flash" },
  "openai": { "api_key": "YOUR_KEY", "model": "gpt-4o" },
  "codex": { "transport": "direct" }
}
```

Codex는 로컬에서 실행되므로 API 키가 필요 없습니다. `npm install -g @openai/codex`로 설치하세요.

세션에서 사용:
```
/bridge gemini review <파일>    Gemini에 코드 리뷰 요청
/bridge codex rescue <작업>     Codex에 작업 위임
/bridge compare <질문>          여러 AI 결과 비교
```

---

## 자동 학습 시스템

Reins는 세션 중 발생한 실패, 수정, 패턴을 자동으로 기록합니다.

- **같은 실수 반복 시** → 이전 해결책을 자동으로 시도
- **3회 이상 반복되는 패턴** → 규칙으로 승격 제안
- **다음 세션 시작 시** → 관련 학습 데이터 자동 로드

```bash
/learn show           # 학습 내역 확인
/learn search <키워드> # 특정 패턴 검색
/learn stats          # 학습 통계 (타입별, 신뢰도별)
/learn prune          # 오래된 학습 정리
```

---

## 커스텀 모드 만들기

`.reins/modes/<이름>.yaml` 파일로 나만의 모드를 만들 수 있습니다:

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
```

---

## 개발 / 기여

```bash
npm run build          # TypeScript 코어 빌드
npm run build:hooks    # 훅 빌드 (TS → JS)
npm run build:all      # 전체 빌드
reins doctor           # 환경 진단
```

자세한 기여 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 상세 문서

- [전체 기능 상세](docs/FEATURES.md) — 모든 모드, 훅, 가드레일, 팩의 상세 설명
- [상세 명세서](docs/SPECIFICATION.md) — 아키텍처, 프로토콜, 스키마, 레퍼런스

## 라이선스

MIT
