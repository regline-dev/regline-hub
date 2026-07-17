# regline-hub

포트폴리오 포털 — 카드로 작업물을 둘러보는 입구입니다.

- Production: https://regline-hub-three.vercel.app
- 로컬: `npm install` → `npm start` (Vite)

## 메뉴

| 사이드 | 역할 |
|--------|------|
| Projects | 완성·배포된 앱 카드 |
| Works | 진행 중 / 기록용 카드 |
| Links | 외부 링크·연락 |

## Works 운영로그

**Works → 챗봇/RAG 프로젝트 → 운영로그** 목록은 코드에 고정하지 않고  
[regline-dev/CHANGELOG](https://github.com/regline-dev/CHANGELOG)의 `regline-hub_CHANGELOG.md`를 읽습니다.

CHANGELOG 레포에 push하면 이 hub를 재배포하지 않아도 운영로그가 갱신됩니다.

## 개발

```bash
npm test
npm run build
```
