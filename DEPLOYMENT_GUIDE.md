# Deployment Guide - Bus Management System

## समस्या का समाधान

आपकी समस्या थी कि **deployment पर location tracking काम नहीं कर रहा था** क्योंकि frontend में hardcoded `localhost:5001` URLs थे।

## किए गए Changes

### 1. Frontend Changes
- `StudentLocationMap.jsx` - Socket.io और API calls में environment variable का उपयोग
- `SimpleDriverMap.jsx` - Location update और end trip APIs में environment variable का उपयोग

### 2. Backend Changes
- `.env` file में `CLIENT_URL` को ठीक किया

## Deployment Steps

### Backend Deployment (Render/Railway/Heroku)

1. **Environment Variables सेट करें:**
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES=7d
   CLIENT_URL=https://your-frontend-url.vercel.app
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Important:** `CLIENT_URL` में अपना deployed frontend URL डालें

3. **Deploy करें:**
   - Render: Connect GitHub repo → Deploy
   - Railway: Connect GitHub repo → Deploy
   - Heroku: `git push heroku main`

4. **Deployed Backend URL नोट करें** (जैसे: `https://your-backend.onrender.com`)

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables सेट करें:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Important Points:**
   - `VITE_API_URL` में अपना deployed backend URL डालें
   - URL के अंत में `/` नहीं होना चाहिए
   - Example: `https://college-bus-management-system-4mf2.onrender.com`

3. **Deploy करें:**
   - Vercel: `vercel --prod`
   - Netlify: Connect GitHub repo → Deploy

### Local Development के लिए

1. **Backend `.env`:**
   ```
   CLIENT_URL=http://localhost:5173
   ```

2. **Frontend `.env`:**
   ```
   VITE_API_URL=http://localhost:5001
   ```

3. **दोनों servers चलाएं:**
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (नई terminal में)
   cd Frontend
   npm run dev
   ```

## Troubleshooting

### Error: ERR_CONNECTION_REFUSED

**कारण:** Backend server नहीं चल रहा या गलत URL

**समाधान:**
1. Check करें कि backend deployed और running है
2. Frontend `.env` में सही backend URL है
3. Backend logs check करें

### Error: CORS Error

**कारण:** Backend में frontend URL allow नहीं है

**समाधान:**
1. Backend `.env` में `CLIENT_URL` update करें
2. Frontend का exact URL use करें (trailing slash के बिना)

### Location Tracking काम नहीं कर रहा

**कारण:** Environment variables सही से set नहीं हैं

**समाधान:**
1. Frontend rebuild करें environment variables के साथ
2. Browser cache clear करें
3. Hard refresh करें (Ctrl+Shift+R)

## Verification Checklist

- [ ] Backend deployed और running है
- [ ] Frontend deployed और running है
- [ ] Backend `.env` में सही `CLIENT_URL` है
- [ ] Frontend `.env` में सही `VITE_API_URL` है
- [ ] CORS errors नहीं आ रहे
- [ ] Socket.io connection successful है
- [ ] Location tracking काम कर रहा है

## Important URLs

### Current Setup
- **Backend:** `https://college-bus-management-system-4mf2.onrender.com`
- **Frontend:** Update करें अपने Vercel URL से

### Update करने के लिए:

1. **Backend `.env`:**
   ```
   CLIENT_URL=https://your-actual-frontend-url.vercel.app
   ```

2. **Frontend `.env`:**
   ```
   VITE_API_URL=https://college-bus-management-system-4mf2.onrender.com
   ```

3. **Redeploy करें दोनों applications**

## Testing

1. **Backend Health Check:**
   ```
   https://your-backend-url.onrender.com/api/health
   ```

2. **Frontend Check:**
   - Login करें
   - Student panel खोलें
   - Location tracking tab पर जाएं
   - Console में errors check करें

## Support

अगर अभी भी समस्या है तो:
1. Browser console में errors check करें
2. Backend logs check करें
3. Network tab में API calls check करें
