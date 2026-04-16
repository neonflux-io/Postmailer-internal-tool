import { NextRequest, NextResponse } from 'next/server';
import { generateEmail } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { resumeContext, recipientEmail, linkedInPost } = await request.json();

    if (!resumeContext || !recipientEmail || !linkedInPost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailContent = await generateEmail(
      resumeContext,
      recipientEmail,
      linkedInPost
    );

    return NextResponse.json(emailContent);
  } catch (error: any) {
    console.error('Generate email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
