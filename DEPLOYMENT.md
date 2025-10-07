# Deployment Guide for Invoice Processing ROI Calculator

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend on Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**: `https://github.com/vlyd04/Invoicing-ROI`
4. **Configure the service**:
   - **Name**: `invoicing-roi-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://lydiajoice04:lydiajoice04@cluster0.gd6fg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   FRONTEND_URL=https://invoicing-roi.netlify.app
   ```

6. **Deploy** - Click "Create Web Service"

**Expected Backend URL**: `https://invoicing-roi-backend.onrender.com`

### Step 2: Deploy Frontend on Netlify

1. **Go to [Netlify.com](https://netlify.com)** and sign up/login
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to Git** → Choose GitHub → Select `vlyd04/Invoicing-ROI`
4. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

5. **Add Environment Variables** (Site settings → Environment variables):
   ```
   REACT_APP_API_URL=https://invoicing-roi-backend.onrender.com/api
   ```

6. **Deploy** - Click "Deploy site"

**Expected Frontend URL**: `https://invoicing-roi.netlify.app` (or your custom domain)

## 🔗 Live URLs

Once deployed, your application will be available at:

- **Frontend (Netlify)**: https://invoicing-roi.netlify.app
- **Backend API (Render)**: https://invoicing-roi-backend.onrender.com/api
- **Health Check**: https://invoicing-roi-backend.onrender.com/api/health

## 🧪 Testing the Deployment

1. **Frontend Test**: Visit the Netlify URL and verify the calculator loads
2. **Backend Test**: Visit `/api/health` endpoint
3. **Integration Test**: Try saving a scenario and generating a PDF report
4. **Cross-Origin Test**: Ensure frontend can communicate with backend

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Ensure `FRONTEND_URL` environment variable is set correctly on Render
   - Check that Netlify URL matches the CORS configuration

2. **MongoDB Connection**:
   - Verify `MONGO_URI` is set correctly in Render environment variables
   - Check MongoDB Atlas IP whitelist (should allow all IPs: 0.0.0.0/0)

3. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

4. **PDF Generation Issues**:
   - Puppeteer may need additional configuration on Render
   - Consider using a different PDF generation service for production

## 📦 Alternative Deployment Options

### Vercel (Alternative to Render)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend && vercel --prod
```

### Railway (Alternative to Render)
1. Connect GitHub repo to Railway
2. Set environment variables
3. Deploy with automatic builds

## 🔐 Security Notes

- MongoDB credentials are exposed for demo purposes
- In production, use secure environment variable management
- Implement rate limiting and input validation
- Use HTTPS for all communications

## 📊 Expected Performance

- **Backend**: ~1-2 second response times on free tier
- **Frontend**: Static hosting with CDN distribution
- **Database**: MongoDB Atlas M0 (free tier)
- **PDF Generation**: 3-5 seconds per report

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Real-time calculations work
- [ ] Scenario saving/loading functions
- [ ] PDF report generation works
- [ ] Email capture saves to database
- [ ] Mobile responsiveness verified
- [ ] API endpoints respond correctly