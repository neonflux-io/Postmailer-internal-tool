# LinkedIn Email Automation

Automate professional email outreach from LinkedIn posts using AI and Gmail API.

## Features

- 📧 Extract email addresses from LinkedIn posts
- 🤖 AI-powered email generation using Groq (free tier)
- 📎 Automatic resume attachment
- ✉️ Send emails directly via Gmail API
- 🎨 Clean, step-by-step UI

## Setup Instructions

### 1. Install Dependencies

```bash
cd my-app
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and add:

```env
# Google OAuth (already configured)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Get your free Groq API key from https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

### 4. Get Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up for a free account
3. Create an API key
4. Copy it to `.env.local` as `GROQ_API_KEY`

Free tier includes: 14,400 requests/day!

### 5. Configure Google OAuth Redirect URI

In your Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Click on your OAuth 2.0 Client ID
3. Add this to "Authorized redirect URIs":
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Save

### 6. Enable Gmail API

1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Library"
3. Search for "Gmail API"
4. Click "Enable"

### 7. Run the Application

```bash
npm run dev
```

Open http://localhost:3000

## How to Use

1. **Upload Resume**: Upload your resume (PDF, TXT, or DOCX)
2. **Paste LinkedIn Post**: Copy and paste the LinkedIn post containing an email
3. **Extract Email**: Click to extract the email address
4. **Generate Email**: AI generates a professional email based on your resume
5. **Preview & Edit**: Review and edit the generated email
6. **Send**: Sign in with Google and send the email with your resume attached

## Tech Stack

- Next.js 15
- NextAuth.js (Google OAuth)
- Gmail API
- Groq AI (Llama 3.3 70B)
- TypeScript
- Tailwind CSS

## Deployment

When deploying to production (e.g., Vercel):

1. Add production environment variables
2. Update Google OAuth redirect URI:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
3. Update `NEXTAUTH_URL` to your production URL

## Troubleshooting

### "Not authenticated" error
- Make sure you've signed in with Google
- Check that Gmail API is enabled in Google Cloud Console

### "Failed to generate email"
- Verify your Groq API key is correct
- Check you haven't exceeded the free tier limit

### Email not sending
- Ensure Gmail API scope is correct in the OAuth consent screen
- Try signing out and signing in again

## License

MIT
