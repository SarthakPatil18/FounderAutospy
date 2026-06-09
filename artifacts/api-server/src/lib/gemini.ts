import { logger } from "./logger";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AutopsyResult {
  rootCause: string;
  factors: string[];
  tags: string[];
  verdict: string;
}

const VALID_TAGS = [
  "PMF mismatch",
  "Cash flow",
  "Team conflict",
  "Market timing",
  "Competition",
  "Tech debt",
  "Regulatory",
  "Execution",
  "Customer acquisition",
  "Pivot failure",
];

export async function runAutopsy(
  name: string,
  story: string,
  whatFailed: string,
  lessonsLearned: string,
): Promise<AutopsyResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY not set — skipping autopsy");
    return null;
  }

  const prompt = `You are an expert startup analyst performing a clinical autopsy on a failed startup.

Startup: ${name}

Story:
${story}

What failed:
${whatFailed}

Lessons learned:
${lessonsLearned}

Analyze this postmortem and respond with a JSON object (no markdown, raw JSON only) with exactly these fields:
{
  "primary_cause": "<one sentence — the single root cause of failure>",
  "contributing_factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "tags": ["<tag>"],
  "verdict": "<2-3 sentence clinical summary of what happened and why it was inevitable>"
}

The tags field MUST only contain values from this list: ${VALID_TAGS.join(", ")}
Choose 1-3 tags that best match.
contributing_factors must have 3-5 items.
Be precise, clinical, and direct. No hedging.`;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      logger.error({ status: res.status }, "Gemini API error");
      return null;
    }

    const data = await res.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const validTags = (parsed.tags ?? []).filter((t: string) =>
      VALID_TAGS.includes(t),
    );

    return {
      rootCause: parsed.primary_cause ?? "",
      factors: Array.isArray(parsed.contributing_factors)
        ? parsed.contributing_factors
        : [],
      tags: validTags,
      verdict: parsed.verdict ?? "",
    };
  } catch (err) {
    logger.error({ err }, "Failed to parse Gemini autopsy response");
    return null;
  }
}
