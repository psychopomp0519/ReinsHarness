# Reins — AI Agent Harness

> "고삐가 말의 힘을 방향으로 바꾸듯, Reins는 AI 에이전트의 능력을 신뢰할 수 있는 결과물로 바꾼다."

Reins는 Claude Code 위에서 동작하는 **모드 기반 통합 AI 에이전트 하네스**입니다.

## 특징

- **9개 내장 모드**: plan · dev · review · discuss · cleanup · security · retro · deploy · bridge
- **3계층 규칙 체계**: 훅(100% 강제) → 모드 스킬(90%+ 준수) → CLAUDE.md(80% 가이드)
- **17개 도메인 팩**: UI, 소설, 게임, 데이터 과학, AI/ML 등 특화 워크플로우
- **자동 학습**: 실패/수정 패턴을 자동 기록하고 재발 방지
- **계획서 변환**: 외부 PRD/기획서를 Reins 계획 형식으로 자동 변환
- **외부 AI 브릿지**: Gemini, GPT 등 크로스 리뷰/세컨드 오피니언

## 빠른 시작

```bash
# 설치
curl -fsSL https://raw.githubusercontent.com/<owner>/reins/main/install.sh | bash

# 새 세션 시작
reins new my-project

# 모드 전환
/mode plan     # 계획 수립
/mode dev      # 개발
/mode review   # 검토
```

## 모드

| 모드 | 커맨드 | 용도 |
|------|--------|------|
| 📋 계획 | `/mode plan` | 요구사항 → 상세 작업 분해 |
| 🔨 개발 | `/mode dev` | 단계별 구현 + 자동 검증 |
| 🔍 검토 | `/mode review` | 다층 검증, 오류 0까지 반복 |
| 💬 토의 | `/mode discuss` | 멀티 에이전트 토론 |
| 🧹 정리 | `/mode cleanup` | 엔트로피 스캔 + 수정 |
| 🔒 보안 | `/mode security` | 6레이어 보안 검증 |
| 📊 회고 | `/mode retro` | 성과 분석 |
| 🚀 배포 | `/mode deploy` | 릴리스 파이프라인 |
| 🌐 브릿지 | `/mode bridge` | 외부 AI 연계 |

## 팩

도메인 특화 기능을 팩으로 설치:

```bash
reins pack install ui-design
reins pack install novel-writing
```

## 라이선스

MIT
