# Reins — AI Agent Harness

이 프로젝트에는 Reins 하네스가 설치되어 있습니다.

## 프로젝트 개요

[프로젝트별 1~2줄 설명 — reins init 시 자동 생성]

## 핵심 원칙

1. 모든 작업은 모드 안에서 수행한다
2. 모드 전환 시 docs/progress.md에 상태를 기록한다
3. 실패는 자동 학습된다 (.reins/learnings/)

## 모드 (→ /mode \<name\>)

plan · dev · review · discuss · cleanup · security · retro · deploy · bridge

커스텀 모드: .reins/modes/*.yaml

## 팩

설치된 팩: .reins/packs/ 자동 탐색. /pack 으로 관리.

## 병합된 외부 소스

.reins/merged/registry.json 참조.

## 빌드·테스트

[프로젝트별 명령어 — reins init 시 자동 생성]
