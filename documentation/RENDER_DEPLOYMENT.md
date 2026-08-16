# Render Deployment Guide

This guide explains how to deploy the Vertex application (frontend + backend) on Render.com.

## Overview

The Vertex application consists of:
- **Backend**: Spring Boot REST API (vertex-api)
- **Frontend**: Next.js web application (vertex-web)
- **Database**: PostgreSQL (via Aiven or similar)

Both need to be configured with the correct environment variables to communicate properly.

## Prerequisites

1. Render.com account
2. GitHub repository with the Vertex project
3. PostgreSQL database (Aiven or another provider)

## Backend Deployment (vertex-api)

### Step 1: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the service details:
   - **Name**: `vertex-api` (or your preferred name)
   - **Environment**: `Docker`
   - **Build Command**: (leave default, it will auto-detect the Dockerfile)
   - **Start Command**: (leave default)

### Step 2: Configure Environment Variables

In the Render dashboard, go to the **Environment** tab and add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://[host]:[port]/[db_name]` | PostgreSQL connection URL from Aiven |
| `SPRING_DATASOURCE_USERNAME` | `[username]` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | `[password]` | PostgreSQL password |
| `JWT_SECRET` | `your_super_secret_key_here` | Generate a strong random key for JWT signing |
| `JWT_EXPIRATION` | `86400000` | JWT token expiration in milliseconds (24 hours) |
| `FRONTEND_URL` | `https://vertex-web-xxx.onrender.com` | Your frontend URL on Render (see step 4) |

### Step 3: Deploy Backend

1. Click **Create Web Service**
2. Render will build and deploy the backend
3. Once deployed, note the backend URL (e.g., `https://vertex-api-xxx.onrender.com`)

### Step 4: Get Backend Public URL

After deployment completes, your backend will be accessible at:
```
https://vertex-api-[unique-id].onrender.com
```

This URL will be used when deploying the frontend.

---

## Frontend Deployment (vertex-web)

### Step 1: Create a Web Service for Frontend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository (same repo)
4. Fill in the service details:
   - **Name**: `vertex-web`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### Step 2: Configure Environment Variables

Add these variables in the **Environment** tab:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://vertex-api-xxx.onrender.com/api/v1` | Backend API URL (use the URL from backend deployment) |

### Step 3: Deploy Frontend

1. Click **Create Web Service**
2. Render will build and deploy the frontend
3. Once deployed, you'll get a frontend URL (e.g., `https://vertex-web-xxx.onrender.com`)

---

## Updating Backend CORS After Frontend Deployment

Once your frontend is deployed, you must update the backend's `FRONTEND_URL` environment variable:

1. Go to Render Dashboard → **vertex-api** service
2. Click on **Environment**
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   https://vertex-web-xxx.onrender.com
   ```
4. Click **Save** - the service will redeploy automatically

### Supporting Multiple Frontend Instances

If you have multiple frontend instances (e.g., staging, production), you can specify multiple URLs:

```
FRONTEND_URL=https://vertex-web-prod.onrender.com,https://vertex-web-staging.onrender.com
```

---

## Testing the Deployment

### 1. Check Backend Health

Open your browser and navigate to:
```
https://vertex-api-xxx.onrender.com/api/v1/auth/login
```

You should see a 405 Method Not Allowed error (since POST is required), which confirms the backend is running.

### 2. Test Login from Frontend

1. Navigate to your frontend URL: `https://vertex-web-xxx.onrender.com`
2. Try to register a new account
3. Try to login

If you see a 403 Forbidden error, check:
- Backend logs in Render dashboard
- `FRONTEND_URL` is correctly set in backend environment
- `NEXT_PUBLIC_API_URL` is correctly set in frontend environment

### 3. Check Logs

To view service logs:
1. Go to Render Dashboard → Service
2. Click on **Logs** tab
3. Look for any errors related to CORS or authentication

---

## Common Issues and Solutions

### Issue: 403 Forbidden on Login

**Cause**: CORS configuration mismatch

**Solution**:
1. Verify `FRONTEND_URL` is set to your actual frontend domain
2. Verify `NEXT_PUBLIC_API_URL` is set to your backend domain
3. Make sure `FRONTEND_URL` doesn't include `/api/v1` (it should be just the domain)
4. Restart both services after updating environment variables

### Issue: JWT Token Errors

**Cause**: JWT secret not set or configuration issue

**Solution**:
1. Ensure `JWT_SECRET` is set as an environment variable
2. Make sure it's at least 32 characters long
3. Use a strong random value (not easily guessable)

### Issue: Database Connection Fails

**Cause**: Invalid database credentials

**Solution**:
1. Verify `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`
2. Test connection from your local machine first
3. Ensure PostgreSQL allows connections from Render's IP ranges

### Issue: Build Fails

**Cause**: Missing dependencies or build errors

**Solution**:
1. Check Render logs for the specific error
2. Ensure all dependencies are listed in `pom.xml` (backend) or `package.json` (frontend)
3. Rebuild locally to verify the build works

---

## Environment Variable Reference

### Backend (vertex-api)

```bash
# Profile
SPRING_PROFILES_ACTIVE=prod

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRATION=86400000

# CORS - Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Port (Render assigns this automatically)
PORT=10000
```

### Frontend (vertex-web)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com/api/v1
```

---

## Deploying Updates

### Backend Updates

1. Push changes to your GitHub repository
2. Render automatically redeploys if auto-deploy is enabled
3. Or manually click **Manual Deploy** on the Render dashboard

### Frontend Updates

Same process as backend - push to GitHub and Render handles the redeploy.

---

## Monitoring and Debugging

### View Logs

In Render dashboard, click **Logs** to see:
- Build logs (during deployment)
- Runtime logs (application output)

### Common Log Entries to Look For

**Successful startup**:
```
2026-08-16T12:18:37.158+05:30  INFO 1 --- [vertex-api] [main] c.v.vertex_api.VertexApiApplication : Starting VertexApiApplication
```

**CORS Error** (frontend trying to access backend):
```
Cross-Origin Request Blocked
```

**JWT Error**:
```
Could not resolve placeholder 'jwt.secret'
```

---

## Security Best Practices

1. **JWT Secret**: Use a strong, random value (minimum 32 characters)
2. **Database Password**: Use a strong password
3. **FRONTEND_URL**: Only allow your actual frontend domain, not wildcards
4. **Rotate Secrets**: Periodically update JWT_SECRET in non-production environments
5. **Use HTTPS**: Render provides free HTTPS certificates

---

## Next Steps

- Monitor your application for errors in the first 24 hours
- Set up email notifications for deployment failures
- Configure custom domain (optional)
- Set up monitoring/alerting tools

For more help, visit [Render Documentation](https://render.com/docs)

