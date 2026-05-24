# 유아기록 Pro — 진행 현황 및 상세 문서

## 파일 구조

```
src/
  types.ts          타입 정의 (Page, Week, AppRecord)
  constants.ts      ACTIVITY_CATEGORIES, DOMAINS 상수
  api.ts            OpenAI 호출 함수 (callAnthropic)
  store.tsx         전역 상태 Context (kids, weeks, records 등)
  App.tsx           레이아웃 + 페이지 라우팅
  components/
    Sidebar.tsx     좌측 네비게이션
    ClassModal.tsx  반 이름 설정 모달
  pages/
    WeeksPage.tsx   주간활동 관리
    NotifyPage.tsx  알림장 AI 작성
    ObservePage.tsx 관찰기록 AI 작성
    ArchivePage.tsx 기록함 + 누적 평가
    StatsPage.tsx   누적 현황 + 도넛 차트
    KidsPage.tsx    유아 관리
api/
  anthropic.ts      Vercel 서버리스 함수 (OpenAI 프록시)
```

---

## 페이지별 기능

| 페이지 | 기능 |
|--------|------|
| 주간활동 | 주차 생성, 대·소주제 입력, 카테고리별 활동 등록, 이번 주 설정 |
| 알림장 | 유아 선택 → 기분/식사/활동 입력 → GPT-4o 스트리밍 생성 |
| 관찰기록 | 유아 선택 → 누리과정 영역 선택 → 메모 입력 → GPT-4o 생성 |
| 기록함 | 저장된 기록 필터링, AI 평가 추가, 누적 평가 자동 생성 |
| 누적현황 | 월별 영역별 관찰 횟수 바차트 + 도넛 차트 |
| 유아관리 | 유아 이름 등록/삭제 |

## 활동 카테고리 (주간활동)
`쌓기` `역할` `언어` `수/과학(조작)` `미술` `음률` `대/소집단` `실내/외놀이`

## 누리과정 영역
`신체운동·건강` `의사소통` `사회관계` `예술경험` `자연탐구`

---

## 데이터 구조

```typescript
// localStorage 키: v4_class, v4_kids, v4_weeks, v4_records

interface Week {
  name: string;
  mainTheme: string;
  subTheme: string;
  activities: Record<string, string[]>; // 카테고리 → 활동 목록
}

interface AppRecord {
  type: 'notify' | 'observe';
  kidName: string;
  date: string;        // YYYY-MM-DD
  theme: string;
  body: string;        // AI 생성 본문
  domains: string[];   // 누리과정 영역
  eval: string;        // 평가 내용
  ts: number;          // timestamp
}
```

---

## 환경변수

`.env.local`:
```
VITE_OPENAI_API_KEY=sk-...   # 로컬 개발용 (프론트에서 직접 호출)
OPENAI_API_KEY=sk-...        # Vercel 서버리스 함수용
```

로컬에서는 `VITE_OPENAI_API_KEY`가 있으면 OpenAI 직접 호출,
배포 환경에서는 `/api/anthropic` 서버리스 프록시를 통해 호출.

---

## 작업 현황

### 완료
- React 19 + TypeScript + Vite 프로젝트 초기화
- 유아 관리, 주간활동, 알림장, 관찰기록, 기록함, 누적현황 페이지 구현
- OpenAI GPT-4o 스트리밍 연동
- Vercel 서버리스 프록시(`/api/anthropic`) 구현
- 주간활동 카테고리별 활동 입력 구조로 변경
- 로컬 개발 시 `VITE_OPENAI_API_KEY` 직접 호출 분기 추가
- 반 설정 모달 취소 버튼 가로 정렬 수정 (`white-space: nowrap`)
- 사이드바 반 이름 이모지 자동 매핑 (동물 40여 종 포함)
- 알림장: 아이 이름 성 제거(이름만 사용), 받침 유무에 따라 '이름이/이름 학부모님' 구분
- 알림장: 월요일 주 시작 / 금요일 주 마무리 멘트 반영, 화·수·목 관련 멘트 차단

### 미완료 / 다음 작업
- (여기에 추가)
