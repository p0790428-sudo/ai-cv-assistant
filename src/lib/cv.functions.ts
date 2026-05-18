import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const AnalysisSchema = z.object({
  candidateName: z.string().nullable(),
  summary: z.string(),
  score: z.number().min(0).max(100),
  scoreReasoning: z.string(),
  technicalSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string().nullable(),
      duration: z.string().nullable(),
      highlights: z.array(z.string()),
    }),
  ),
  educationLevel: z.string(),
  education: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
  atsKeywords: z.array(z.string()),
});

export type CVAnalysis = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert technical recruiter and CV analyst. Analyze the given CV text and return a JSON object describing the candidate. Score the candidate from 0 to 100 for a general tech / data / engineering role, weighing experience depth, skill breadth, education, clarity, and impact metrics. Be honest and specific. Always respond with a single valid JSON object matching the requested schema. No prose, no markdown, no code fences.`;

const JSON_SCHEMA_HINT = `Return JSON with exactly these keys:
{
  "candidateName": string | null,
  "summary": string (2-3 sentences),
  "score": integer 0-100,
  "scoreReasoning": string (2-4 sentences),
  "technicalSkills": string[],
  "softSkills": string[],
  "experience": [{ "role": string, "company": string|null, "duration": string|null, "highlights": string[] }],
  "educationLevel": string (e.g. "Bachelor's", "Master's", "PhD", "Self-taught"),
  "education": string[],
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "recommendations": string[] (specific actionable CV improvement tips, including ATS keyword and formatting suggestions),
  "atsKeywords": string[] (keywords to add for ATS optimization)
}`;

export const analyzeCV = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => {
    if (!data?.text || typeof data.text !== "string") {
      throw new Error("CV text is required");
    }
    const text = data.text.slice(0, 24000);
    if (text.trim().length < 50) {
      throw new Error("CV text is too short to analyze");
    }
    return { text };
  })
  .handler(async ({ data }): Promise<CVAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${JSON_SCHEMA_HINT}\n\nCV TEXT:\n"""\n${data.text}\n"""`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // try to extract JSON block
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }

    return AnalysisSchema.parse(parsed);
  });
