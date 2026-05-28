import { callAnthropic } from '../api';

const DOMAIN_LIST = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

export async function toArchiveRecord(
  kidName: string,
  text: string,
): Promise<{ body: string; domains: string[] }> {
  const prompt = `아래 유아 기록을 관찰 기록문 형식으로 변환하고, 누리과정 영역을 판별해주세요.

[유아명]: ${kidName}
[원본 내용]
${text}

[변환 규칙]
- "${kidName}이(가) ~하였다", "${kidName}은(는) ~하는 모습을 보였다" 형태의 3인칭 서술
- 모든 문장은 반드시 "~다"로 끝낼 것
- 학부모 인사말, 격려 문구, 교사 감상 등 주관적 표현은 모두 제거
- 아이의 구체적 행동, 발화, 상호작용, 놀이 과정만 남길 것
- 3~4문장

[누리과정 영역 판별]
기록 내용에서 가장 핵심적인 영역 딱 1개만 선택:
${DOMAIN_LIST.join(', ')}

[출력 형식 - JSON만 출력, 다른 설명 없이]
{"body":"변환된 관찰 기록문","domains":["핵심 영역 1개"]}`;

  const raw = await callAnthropic([{ role: 'user', content: prompt }], { maxTokens: 600 });
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

  const body = typeof parsed.body === 'string' ? parsed.body.trim() : text;
  const domains = Array.isArray(parsed.domains)
    ? parsed.domains.filter((d: unknown) => DOMAIN_LIST.includes(d as string))
    : [];

  return { body, domains };
}
