# Setup Checklist

Follow these steps to get your LinkedIn Email Automation app running:

## ✅ Completed
- [x] Google OAuth credentials configured
- [x] Project structure created
- [x] Dependencies listed in package.json

## 🔧 To Do

### 1. Install Dependencies
```bash
cd my-app
npm install
```

### 2. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Copy the output and paste it in `.env.local` as `NEXTAUTH_SECRET`

### 3. Get Groq API Key (FREE - 5 minutes)
1. Visit: https://console.groq.com
2. Sign up (free account)
3. Go to API Keys section
4. Create new API key
5. Copy it to `.env.local` as `GROQ_API_KEY`

### 4. Enable Gmail API in Google Cloud
1. Go to: https://console.cloud.google.com
2. Select project: "lively-encoder-493309-a8"
3. Navigate to: APIs & Services > Library
4. Search: "Gmail API"
5. Click "Enable"

### 5. Add OAuth Redirect URI
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Click "Save"

### 6. Run the App
```bash
npm run dev
```

### 7. Test It Out
1. Open: http://localhost:3000
2. Upload a resume
3. Paste a LinkedIn post with an email
4. Generate and send!

## 🎯 Quick Test

Use this sample LinkedIn post to test:
```
We're hiring! Looking for talented developers to join our team.
Interested? Send your resume to hiring@example.com
```

## 📝 Notes

- Groq free tier: 14,400 requests/day (very generous!)
- Gmail API: No cost for personal use
- All data stays on your machine/account
- Resume is attached automatically to emails

## 🚀 Ready to Deploy?

When deploying to Vercel:
1. Add environment variables in Vercel dashboard
2. Add production redirect URI in Google Console:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
