# Daily Grind 🔥

A personal daily fitness & faith checklist PWA.

## Features
- Daily checklist (prayer, workouts, Bible reading)
- Monthly items (weigh-in on the 1st)
- Streak tracking
- Calendar history view
- Add/edit/remove items
- Bible verse on completion
- Works offline as a PWA
- Data persists in localStorage

## Deploy to Cloudflare Pages

### Option A: Connect GitHub repo (recommended)
1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
3. Click **Create a project** → **Connect to Git**
4. Select your repo
5. Set build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click **Save and Deploy**

### Option B: Direct upload
1. Run `npm install && npm run build` locally
2. Go to Cloudflare Pages → **Create a project** → **Direct Upload**
3. Upload the `dist` folder

### Add to your phone
Once deployed, visit the URL on your phone → tap **Share** → **Add to Home Screen**.

## Local development
```bash
npm install
npm run dev
```
