# regline-hub CHANGELOG

포트폴리오 포털(`regline-hub`) 계획·구조·배포 변경 이력.
파일에 버전을 표기하지 않고 이 문서에 누적한다.

---

## 2026-07-23 (v5)

**변경 파일**: src/data/works.ts, src/components/ProjectCard.test.tsx, src/App.test.tsx

**변경 내용**: Projects → LangGraph-Agentic RAG 카드를 어드민 PDF 생성 화면으로 연결

- href: `http://167.233.211.67:3002/pdf/generate` · CTA `OPEN APP` (기존 Works CHANGELOG 내부 이동 해제)

---

## 2026-07-22 (v4)

**변경 파일**: src/components/ProjectCard.tsx, src/styles.css, src/data/works.ts, src/components/ProjectCard.test.tsx

**변경 내용**: Projects → LangGraph-Agentic RAG 카드에 PDF 모드 사용법·검색 예시를 보여 줌

- 파란 `Chat with us` 타이틀 유지, **PDF** 배지 깜빡임
- 본문 텍스트: ① 상단 헤더에서 PDF 선택 → ② LLM판단·라우터·Agent, 이솝·ARKK 2개 벡터DB, 예) 질문·전체 목록 검색
- 카드 요약: `Agent가 질문을 판단해 이솝·ARKK 벡터DB중 컬렉션으로 연결`

---

## 2026-07-22 (v3)

**변경 파일**: src/data/works.ts, src/components/ProjectCard.test.tsx

**변경 내용**: Projects → LangGraph-Agentic RAG 카드를 다른 Live 카드와 같은 일반 배경으로 표시

- Hetzner 배포 반영 — `disabled`(회색) 해제, 배지 `Live`

---

## 2026-07-22 (v2)

**변경 파일**: Docs/20260722_regline-hub_방문카운터JSON_계획.md, api/visit.js, src/components/VisitStatsBadge.tsx, src/data/visitCounter.ts, src/App.tsx, src/styles.css, README.md

**변경 내용**: Phase 2 — Projects 첫 화면 우측 상단에 Visitors/Views 대략 합계 표시

- 외부 DB 없이 `visits-data` 브랜치 `visits.json` + `/api/visit`로 누적 (main 재배포와 분리)
- 세션당 visitors 1회·접속마다 views — 숫자는 대략, “누군가 왔는지”용
- Vercel에 `VISIT_GITHUB_TOKEN` 설정 필요 (미설정 시 배지 숨김)

---

## 2026-07-22 (v1)

**변경 파일**: Docs/20260722_regline-hub_VercelAnalytics_계획.md, src/App.tsx, src/App.test.tsx, package.json, README.md

**변경 내용**: Phase 1 — 허브 Production에 Vercel Web Analytics로 방문자·페이지뷰 집계

- `@vercel/analytics` + `<Analytics />`로 사이트 접속이 대시보드에 쌓이게 함
- 내 IP 제외·자체 DB는 비범위 — Vercel 프로젝트 Analytics 탭에서 확인
- 운영: 대시보드에서 Web Analytics Enable 후 main 배포 반영 필요

---

## 2026-07-17 (v5)

**변경 파일**: src/data/fetchRawText.ts, src/data/fetchRawText.test.ts

**변경 내용**: Works README·CHANGELOG 조회가 GitHub Raw CDN 캐시를 쓰지 않게 수정

- `fetchRawText`에 `cache: 'no-store'` 적용 — 프로젝트 push 후에도 Works 탭이 예전 CHANGELOG를 보여주던 현상 완화
- LangGraph-Agentic-backend 등 외부 레포 push만으로 CHANGELOG.md 탭이 최신 내용을 읽도록 함 (regline-hub 재배포 필요)

---

## 2026-07-17 (v4)

**변경 파일**: src/components/ChangelogSectionView.tsx, src/styles.css

**변경 내용**: 운영로그(Works) 렌더링을 카드형 → 타임라인형으로 변경

- 세로선+dot 타임라인 레이아웃, 날짜/버전 폰트 굵기 분리(날짜 500, 버전 400 muted)
- 변경 파일 목록은 `<details>` 접기 처리(최신 항목만 기본 펼침), 모노스페이스 pill로 표시
- 변경 내용 요약은 항상 노출, 데이터 파싱 로직(`parseChangelog.ts`)은 변경 없음

---

## 2026-07-17 (v3)

**변경 파일**: Docs/20260717_Works_스플릿패널_계획.md, src/App.tsx, src/data/worksProjects.ts, README.md

**변경 내용**: Works를 왼쪽 카드·오른쪽 패널(50:50)로 바꾸고, 진행현황=README·운영로그=CHANGELOG로 연결

- 카드 제목: **regline-hub** (프로젝트명). CHANGELOG는 운영로그에 표시되는 내용
- Works 카드 4개 구성: 챗봇/RAG 프로젝트, regline-hub, 다른 프로젝트 02, 다른 프로젝트 03
- 진행현황/운영로그 클릭 시 페이지 이동 없이 오른쪽에만 표시
- README를 샘플 양식(폴더 트리·표·현재 스냅샷, CHANGELOG와 역할 분리)으로 재작성 — Works 진행현황에 표시

---

## 2026-07-17 (v2)

**변경 파일**: Docs/20260717_CHANGELOG_Works연동_계획.md, CHANGELOG/README.md, src/data/parseChangelog.ts, src/components/WorksDetail.tsx

**변경 내용**: Works 운영로그 화면에 GitHub CHANGELOG 본문(날짜·변경 파일·불릿)을 그대로 표시

- Works → **CHANGELOG** 카드(구 다른 프로젝트 01) → `regline-hub_CHANGELOG.md`
- Works → **챗봇/RAG** → 운영로그 → `chatbot-rag_CHANGELOG.md`
- 한 줄 요약 목록이 아니라 CHANGELOG 섹션 형식 그대로 표시

---
## 2026-07-17 (v1)

**변경 파일**: Docs/20260716_regline-hub_Vercel배포_계획.md, .cursor/rules/changelog.mdc

**변경 내용**: 호스팅을 Hetzner `:3003` → Vercel(옵션 A 단독 레포)로 확정

- Production URL `regline-hub-three.vercel.app` 유지
- CHANGELOG 규칙 도입 (구조/사양 변경만 기록)

---

## 2026-07-16 (v1)

**변경 파일**: Docs/20260716_Worls_Links_작업계획.md, Docs/20260716_Works_구조_부록.md, src/App.tsx

**변경 내용**: Works/Links 메뉴 분리, Profile 이력서 카드 추가

- Projects(완성) / Works(진행) / Links(외부) 분리
- 이유: 포털 골격 MVP

---

## 2026-07-15 (v1)

**변경 파일**: Docs/20260715_포트폴리오_카드포털_계획.md

**변경 내용**: regline-hub 카드 포털 MVP 착수

- 카드 클릭 → 기존 서비스 이동, 데이터는 `works.ts` 한곳
