import { ResumeData } from '@/types';

export async function parseResume(file: File): Promise<ResumeData> {
  const text = await extractTextFromFile(file);
  
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    summary: extractSummary(text),
    rawText: text,
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType === 'text/plain') {
    return await file.text();
  }
  
  if (fileType === 'application/pdf') {
    // For PDF parsing, we'll handle this on the server side
    return await file.text();
  }
  
  // For DOCX, we'll also handle server-side
  return await file.text();
}

function extractName(text: string): string {
  const lines = text.split('\n');
  return lines[0]?.trim() || 'Unknown';
}

function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

function extractPhone(text: string): string | undefined {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : undefined;
}

function extractSkills(text: string): string[] {
  const skillsSection = text.match(/skills?:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  if (!skillsSection) return [];
  
  const skills = skillsSection[1]
    .split(/[,\n•·-]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50);
  
  return skills.slice(0, 10);
}

function extractExperience(text: string): string[] {
  const expSection = text.match(/experience:?\s*([\s\S]*?)(?=\neducation|$)/i);
  if (!expSection) return [];
  
  const experiences = expSection[1]
    .split(/\n(?=[A-Z])/)
    .map(e => e.trim())
    .filter(e => e.length > 10);
  
  return experiences.slice(0, 5);
}

function extractEducation(text: string): string[] {
  const eduSection = text.match(/education:?\s*([\s\S]*?)(?=\n\n[A-Z]|$)/i);
  if (!eduSection) return [];
  
  const education = eduSection[1]
    .split(/\n/)
    .map(e => e.trim())
    .filter(e => e.length > 5);
  
  return education.slice(0, 3);
}

function extractSummary(text: string): string {
  const summarySection = text.match(/(?:summary|profile|about):?\s*([\s\S]*?)(?=\n\n[A-Z]|experience|$)/i);
  if (summarySection) {
    return summarySection[1].trim().slice(0, 500);
  }
  
  // Fallback: use first few lines
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return lines.slice(1, 4).join(' ').slice(0, 500);
}
