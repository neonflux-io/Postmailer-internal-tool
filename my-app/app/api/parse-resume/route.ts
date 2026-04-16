import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileType = file.type;
    let text = '';

    if (fileType === 'application/pdf') {
      // Parse PDF
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      text = data.text;
    } else if (fileType === 'text/plain') {
      // Plain text
      text = await file.text();
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      // For DOCX, we'll need mammoth
      const mammoth = require('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Parse resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
