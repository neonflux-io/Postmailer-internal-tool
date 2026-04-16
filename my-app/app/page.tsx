'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { extractFirstEmail } from '@/lib/email-extractor';
import { DirectboxDefault } from 'iconsax-react';

export default function Home() {
  const { data: session } = useSession();
  const [linkedInPost, setLinkedInPost] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumeContext, setResumeContext] = useState('');
  const [extractedEmail, setExtractedEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResume(file);
    setLoading(true);

    try {
      // Send file to server for parsing
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResumeContext(data.text);
      } else {
        alert('Failed to parse resume. Please try a different file.');
      }
    } catch (error) {
      alert('Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractEmail = () => {
    const email = extractFirstEmail(linkedInPost);
    if (email) {
      setExtractedEmail(email);
      setStep(3);
    } else {
      alert('No email found in the LinkedIn post');
    }
  };

  const handleGenerateEmail = async () => {
    if (!resumeContext || !extractedEmail || !linkedInPost) {
      alert('Please complete all previous steps');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContext,
          recipientEmail: extractedEmail,
          linkedInPost,
        }),
      });

      const data = await response.json();
      setEmailSubject(data.subject);
      setEmailBody(data.body);
      setStep(4);
    } catch (error) {
      alert('Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!session) {
      signIn('google');
      return;
    }

    setLoading(true);
    try {
      let resumeBase64;
      if (resume) {
        const arrayBuffer = await resume.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resumeBase64 = btoa(binary);
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: extractedEmail,
          subject: emailSubject,
          body: emailBody,
          resumeAttachment: resume
            ? {
                filename: resume.name,
                content: resumeBase64,
                mimeType: resume.type,
              }
            : undefined,
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
        // Reset only the post and email fields, keep resume
        setLinkedInPost('');
        setExtractedEmail('');
        setEmailSubject('');
        setEmailBody('');
        setStep(2); // Go back to step 2 (LinkedIn post input)
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A2A2A] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#E8E8E8] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight flex items-center gap-3">
              <DirectboxDefault size="48" color="#000000" variant="Bold"/>
              Post-Mailer
            </h1>
            {session ? (
              <button
                onClick={() => signOut()}
                className="px-6 py-3 bg-[#D97777] text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-[#7BA8A3] text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase"
              >
                🔐 Sign In
              </button>
            )}
          </div>

          {/* Step 1: Upload Resume */}
          <div className="mb-8 bg-[#D4C5A9] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4 flex items-center uppercase">
              <span className="bg-black text-[#D4C5A9] border-4 border-black w-12 h-12 flex items-center justify-center mr-4 text-xl rotate-3">
                1
              </span>
              Upload Resume
            </h2>
            {!resume ? (
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleResumeUpload}
                disabled={loading}
                className="block w-full text-sm text-black font-bold file:mr-4 file:py-3 file:px-6 file:border-4 file:border-black file:text-sm file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white file:uppercase file:cursor-pointer disabled:opacity-50"
              />
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-black bg-white border-2 border-black inline-block px-3 py-1 flex-1">
                  ✓ {resume.name} ({resumeContext.length} characters extracted)
                </p>
                <button
                  onClick={() => {
                    setResume(null);
                    setResumeContext('');
                    setLinkedInPost('');
                    setExtractedEmail('');
                    setEmailSubject('');
                    setEmailBody('');
                    setStep(1);
                  }}
                  className="px-4 py-2 bg-[#D97777] text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            {loading && !resume && (
              <p className="mt-3 text-sm font-bold text-black">⏳ Parsing resume...</p>
            )}
          </div>

          {/* Step 2: LinkedIn Post */}
          <div className="mb-8 bg-[#9DB5A5] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4 flex items-center uppercase">
              <span className="bg-black text-[#9DB5A5] border-4 border-black w-12 h-12 flex items-center justify-center mr-4 text-xl -rotate-3">
                2
              </span>
              LinkedIn Post
            </h2>
            <textarea
              value={linkedInPost}
              onChange={(e) => setLinkedInPost(e.target.value)}
              placeholder="Paste the LinkedIn post text here..."
              className="w-full h-32 p-4 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-black"
            />
            <button
              onClick={handleExtractEmail}
              disabled={!linkedInPost || !resume}
              className="mt-4 px-6 py-3 bg-black text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none uppercase"
            >
              Extract Email →
            </button>
            {extractedEmail && (
              <p className="mt-3 text-sm font-bold text-black bg-white border-2 border-black inline-block px-3 py-1">
                ✓ {extractedEmail}
              </p>
            )}
          </div>

          {/* Step 3: Generate Email */}
          {step >= 3 && (
            <div className="mb-8 bg-[#C9A9C0] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4 flex items-center uppercase">
                <span className="bg-black text-[#C9A9C0] border-4 border-black w-12 h-12 flex items-center justify-center mr-4 text-xl rotate-2">
                  3
                </span>
                Generate Email
              </h2>
              <button
                onClick={handleGenerateEmail}
                disabled={loading}
                className="px-6 py-3 bg-black text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-gray-300 disabled:shadow-none uppercase"
              >
                {loading ? '⚡ Generating...' : '🤖 Generate with AI'}
              </button>
            </div>
          )}

          {/* Step 4: Preview & Send */}
          {step >= 4 && emailSubject && (
            <div className="mb-8 bg-[#A8B5C7] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-6 flex items-center uppercase">
                <span className="bg-black text-[#A8B5C7] border-4 border-black w-12 h-12 flex items-center justify-center mr-4 text-xl -rotate-2">
                  4
                </span>
                Preview & Send
              </h2>
              <div className="bg-white border-4 border-black p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-black text-black mb-2 uppercase">
                    To:
                  </label>
                  <input
                    type="text"
                    value={extractedEmail}
                    readOnly
                    className="w-full p-3 border-4 border-black bg-gray-100 font-mono text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-black text-black mb-2 uppercase">
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-black"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-black text-black mb-2 uppercase">
                    Body:
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full h-64 p-4 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-black whitespace-pre-wrap"
                  />
                </div>
                {resume && (
                  <div className="bg-[#D4C5A9] border-2 border-black p-3 inline-block">
                    <p className="text-sm font-bold text-black">
                      📎 {resume.name}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="px-8 py-4 bg-[#D97777] text-black font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-gray-300 disabled:shadow-none text-lg uppercase"
              >
                {loading ? '📤 Sending...' : session ? '🚀 Send Email' : '🔐 Sign In to Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
