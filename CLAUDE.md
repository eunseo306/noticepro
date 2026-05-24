# 유아기록 Pro — 프로젝트 문서

유치원 교사용 웹앱. 유아 놀이기록 작성, AI 알림장·관찰기록 생성, 누리과정 평가 관리 도구.

> 파일 구조, 데이터 구조, 작업 현황 등 세부 내용은 [progress.md](progress.md) 참고.

## 기술 스택
- **Frontend**: React 19 + TypeScript + Vite
- **AI**: OpenAI GPT-4o (스트리밍)
- **상태관리**: React Context + localStorage
- **배포**: GitHub(`eunseo306/noticepro`) → Vercel 자동 배포

---

## 로컬 개발

```bash
npm run dev       # 개발 서버 (포트 5173)
npm run build     # 프로덕션 빌드
```

환경변수는 `.env.local`에 설정. 자세한 내용은 [progress.md](progress.md) 참고.

## 배포

`main` 브랜치에 push하면 Vercel이 자동 빌드·배포.
Vercel 환경변수에 `OPENAI_API_KEY` 설정 필요.
