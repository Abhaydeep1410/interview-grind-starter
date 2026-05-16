// ── Gemini validation service ─────────────────────────────────────────────

export async function validateWithGemini(task, category, userAnswer, apiKey) {
  const prompt = `You are a strict but fair technical interviewer validating a student's answer for an interview prep task.

TASK: ${task}
CATEGORY: ${category}

STUDENT'S ANSWER:
${userAnswer}

Evaluate if the student has demonstrated sufficient understanding of this topic. 
- For LC problems: they should explain the approach, time/space complexity, and key insight
- For System Design: they should cover key components, trade-offs, and design decisions  
- For Spring/Pattern: they should explain the concept clearly with a real example
- For Behavioral: they should have a clear STAR story with specific details

Respond in this exact JSON format (no markdown, no backticks):
{"approved": true/false, "feedback": "brief feedback in 1-2 sentences", "score": 1-10}

Be strict - a vague or incomplete answer should NOT be approved. Minimum score to approve is 6.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    return JSON.parse(text.trim());
  } catch {
    return { approved: false, feedback: 'Could not parse response. Try again.', score: 0 };
  }
}
