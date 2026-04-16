export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
  rawText: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  resumeAttachment?: {
    filename: string;
    content: string;
    mimeType: string;
  };
}

export interface LinkedInPost {
  text: string;
  extractedEmail?: string;
}
