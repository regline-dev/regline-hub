# regline-hub

> 포트폴리오 포털 — 카드로 작업물을 둘러보는 입구  
> 호스팅: **Vercel** (정적 Vite SPA) · Production: https://regline-hub-three.vercel.app  
> 이 문서는 **현재 상태 스냅샷(README)** 입니다. 날짜별 변경 이력은 [CHANGELOG](https://github.com/regline-dev/CHANGELOG)의 `regline-hub_CHANGELOG.md`에 둡니다.

**README 작성 요령** (CHANGELOG와 다름)

- 새 내용은 **추가**, 기존 내용은 **업데이트**
- 더 이상 쓰지 않는 내용은 ~~취소선~~ 또는 삭제
- 폴더·메뉴·연결 주소가 **한눈에** 들어오게 유지

---

## 1. 전체 폴더 구조

```
regline-hub/
├── public/                 # 정적 자산 (빌드에 그대로 포함)
│   ├── docs/               # PDF (자기소개서·이력서)
│   ├── img/ · chatbot_img/ # 가이드용 이미지
│   ├── chatbot_guide.html
│   └── budget_guide.html
├── src/
│   ├── components/         # UI (ProjectCard, WorksCard, WorksPanel, …)
│   ├── data/               # 카드·링크·CHANGELOG/README Raw 연동
│   ├── App.tsx             # 사이드 네비 + Projects / Works / Links
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.ts
├── Dockerfile · nginx.conf # (레거시) Hetzner 정적 서빙용 — ~~주 배포 경로 아님~~
└── README.md               # 본 문서 (Works → regline-hub → 진행현황에서 표시)
```

**구분 기준**

- `public/` → 방문자에게 그대로 제공되는 파일
- `src/data/` → 메뉴·카드·외부 Raw URL 설정 (코드 한곳에서 관리)
- `src/components/` → 화면 조각

---

## 2. 화면 · 메뉴 (현재)

| 사이드 | 역할 | 주요 데이터 |
|--------|------|-------------|
| **Projects** | 완성·배포된 앱 카드 | `src/data/works.ts` |
| **Works** | 왼쪽 카드 40% + 오른쪽 상세 패널 60% | `src/data/worksProjects.ts` |
| **Links** | 외부 링크·메일·PDF | `src/data/links.ts` |

Projects 섹션 예: FAQ 챗봇 · 챗봇 관리자 · LottoInsight · Docs · Profile  

Works 카드 예:

| 카드 제목 | 진행현황 | 운영로그 |
|-----------|----------|----------|
| 챗봇/RAG 프로젝트 | 해당 README Raw | `chatbot-rag_CHANGELOG.md` |
| **regline-hub** | 이 README | `regline-hub_CHANGELOG.md` |
| 다른 프로젝트 02 | (준비 중) | — |
| 다른 프로젝트 03 | (준비 중) | — |

---

## 3. Works 패널 동작 (확정)

```
왼쪽 ~40%                         오른쪽 ~60%
Works 카드 한 줄 4개               선택한 탭 패널
[챗봇/RAG][regline-hub][…][…]      진행현황 → README
                                   운영로그 → CHANGELOG
```

- 페이지 이동 없음. 카드는 왼쪽 유지, 오른쪽만 갱신
- 카드 제목 = **프로젝트명**

---

## 4. 외부 연결

| 대상 | 주소 / 방식 |
|------|-------------|
| Production | https://regline-hub-three.vercel.app |
| 소스 | https://github.com/regline-dev/regline-hub |
| 운영 이력 | https://github.com/regline-dev/CHANGELOG |
| FAQ 챗봇 UI | Hetzner `:3001` (카드 href) |
| 챗봇 관리자 | Hetzner `:3002` |
| LottoInsight | https://lotto-insight-pied.vercel.app |

시크릿·DB는 이 포털에 두지 않는다.

---

## 5. 로컬 · 배포

```bash
npm install
npm start          # Vite 개발 서버
npm test
npm run build      # dist/ → Vercel Output
```

| 항목 | 값 |
|------|-----|
| Framework | Vite + React + TypeScript |
| 배포 | GitHub `main` push → Vercel 자동 |
| ~~Hetzner `:3003` Docker~~ | 이전 호스팅 — 현재 주 경로 아님 |

---

## 6. 관련 문서 (모노레포 Docs)

로컬 워크스페이스 `Docs/` (이 GitHub 레포에는 없을 수 있음)

- `20260715_포트폴리오_카드포털_계획.md`
- `20260716_Worls_Links_작업계획.md` · `20260716_Works_구조_부록.md`
- `20260717_CHANGELOG_Works연동_계획.md`
- `20260717_Works_스플릿패널_계획.md`
