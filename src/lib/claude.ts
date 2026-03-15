import Anthropic from "@anthropic-ai/sdk";
import type { Keyword } from "./db/schema";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * 텍스트에서 핵심 키워드를 추출한다.
 * 각 키워드의 원본 텍스트 내 위치(startIndex, endIndex)도 함께 반환.
 */
export async function extractKeywords(text: string): Promise<Keyword[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `다음 텍스트에서 학습에 중요한 핵심 키워드(용어, 개념, 고유명사, 숫자 등)를 추출해줘.

규칙:
1. 단어 단위로 추출 (2글자 이상)
2. 조사, 접속사, 일반적인 동사/형용사는 제외
3. 전문 용어, 고유명사, 핵심 개념어를 우선 선택
4. 키워드는 원본 텍스트에서 정확히 일치하는 문자열이어야 함
5. 최소 5개, 최대 30개 추출
6. 반드시 아래 JSON 형식으로만 응답

텍스트:
"""
${text}
"""

응답 형식 (JSON만, 다른 텍스트 없이):
[{"word": "키워드", "startIndex": 0, "endIndex": 3}]

startIndex와 endIndex는 원본 텍스트에서의 위치(0-based, endIndex는 exclusive).`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("텍스트 응답을 받지 못했습니다.");
  }

  try {
    // JSON 파싱 - 코드블록으로 감싸져 있을 수 있음
    let jsonStr = content.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const keywords: Keyword[] = JSON.parse(jsonStr);

    // 유효성 검증: 원본 텍스트에서 실제로 해당 위치에 해당 단어가 있는지 확인
    return keywords.filter((kw) => {
      const found = text.substring(kw.startIndex, kw.endIndex);
      return found === kw.word;
    });
  } catch {
    // JSON 파싱 실패 시 간단한 폴백: 텍스트에서 직접 매칭
    throw new Error("키워드 추출 결과를 파싱할 수 없습니다.");
  }
}

/**
 * 이미지에서 텍스트를 추출한다.
 */
export async function extractTextFromImage(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "이 이미지에 있는 텍스트를 정확하게 추출해줘. 텍스트만 반환하고, 다른 설명은 하지 마.",
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("텍스트 응답을 받지 못했습니다.");
  }

  return content.text;
}
