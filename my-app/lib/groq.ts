import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateEmail(
  resumeContext: string,
  recipientEmail: string,
  linkedInPost: string
): Promise<{ subject: string; body: string }> {
  const prompt = `You are a professional email writer. Based on the following resume and LinkedIn post, generate a professional email offering services/resume for opportunities.

Resume Context:
${resumeContext}

LinkedIn Post:
${linkedInPost}

Recipient Email: ${recipientEmail}

Generate:
1. A professional subject line (max 60 characters)
2. A professional email body that:
   - Starts with a proper greeting (Dear Hiring Team, or Hello,)
   - Has proper paragraph breaks (use \\n\\n between paragraphs)
   - References the LinkedIn post context in the first paragraph
   - Highlights 2-3 relevant skills from the resume in the second paragraph
   - Mentions the attached resume in the third paragraph
   - Ends with a professional closing (Best regards, or Sincerely,)
   - Includes the sender's name from the resume
   - Is concise (3-4 short paragraphs maximum)

Format your response as JSON:
{
  "subject": "your subject line",
  "body": "your email body with \\n\\n for paragraph breaks"
}

IMPORTANT: Return ONLY the JSON object, no other text. Use \\n\\n to separate paragraphs in the body.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const response = completion.choices[0]?.message?.content || '';
  
  try {
    // Remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanedResponse);
    return {
      subject: parsed.subject,
      body: parsed.body,
    };
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Response was:', response);
    // Fallback if JSON parsing fails
    return {
      subject: 'Professional Opportunity - Resume Submission',
      body: response,
    };
  }
}
