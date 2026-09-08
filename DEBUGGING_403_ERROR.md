# Debugging 403 Forbidden Error on Render

## Quick Diagnostics

### Step 1: Test the Health Check Endpoint (CRITICAL)
Before testing the register endpoint, test if the API is even running:

```
GET https://vertex-thdg.onrender.com/api/v1/health
```

**Expected Response (if working):**
```json
{
  "status": "UP",
  "message": "Vertex API is running",
  "activeProfile": "prod",
  "frontendUrl": "your-frontend-url-here",
  "timestamp": 1694184523000
}
```

**If you get 404 or timeout:**
- Your application is NOT running or responding
- Check Render logs immediately (see Step 2)

---

## Step 2: Check Render Logs

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **vertex-api** service
3. Click **Logs** tab
4. Look for:
   - `Starting VertexApiApplication` (should say "Vertex API is running")
   - `APPLICATION STARTUP DEBUG INFO` section
   - Any errors related to database, JWT, or environment variables

---

## Step 3: Verify All Required Environment Variables are Set

In Render Dashboard → **vertex-api** → **Environment**, ensure these are set:

| Variable | Required | Notes |
|----------|----------|-------|
| `SPRING_PROFILES_ACTIVE` | ✅ YES | Must be `prod` |
| `SPRING_DATASOURCE_URL` | ✅ YES | PostgreSQL connection URL from Aiven |
| `SPRING_DATASOURCE_USERNAME` | ✅ YES | Database username |
| `SPRING_DATASOURCE_PASSWORD` | ✅ YES | Database password |
| `JWT_SECRET` | ✅ YES | Strong random string (min 32 chars) |
| `FRONTEND_URL` | ✅ YES | Your frontend URL (e.g., `https://vertex-web-xxx.onrender.com`) |
| `JWT_EXPIRATION` | ❌ NO | Defaults to 86400000 (24 hours) |
| `PORT` | ❌ NO | Render assigns this automatically |

**IMPORTANT:** After setting/updating variables, click **Save** - Render will auto-redeploy.

---

## Step 4: Verify Frontend URL Format

The `FRONTEND_URL` should be:
- ✅ **Correct:** `https://vertex-web-xxx.onrender.com`
- ❌ **Wrong:** `https://vertex-web-xxx.onrender.com/` (with trailing slash)
- ❌ **Wrong:** `https://vertex-web-xxx.onrender.com/api/v1` (should not include paths)

---

## Step 5: Test Register Endpoint

After health check passes, test registration:

```bash
curl -X POST https://vertex-thdg.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

---

## Common Issues & Solutions

### Issue: 403 Forbidden with no logs
**Cause:** Request not reaching the app (CORS or network issue)

**Solutions:**
1. Test `/api/v1/health` endpoint first
2. Check if `SPRING_PROFILES_ACTIVE=prod` is set
3. Verify `FRONTEND_URL` is set and correct
4. Check if frontend URL matches your actual frontend domain

### Issue: 404 on `/api/v1/health`
**Cause:** Application not running or wrong URL

**Solutions:**
1. Check Render logs for startup errors
2. Verify all required environment variables are set
3. Check database connection (PostgreSQL must be accessible)
4. Check JWT_SECRET is set and not empty

### Issue: Application crashes on startup
**Cause:** Missing required environment variables

**Solutions:**
1. Set all environment variables from Step 3
2. Check Render logs for the exact error
3. Ensure JWT_SECRET is at least 32 characters
4. Verify database credentials are correct

### Issue: CORS error in browser console
**Cause:** Frontend URL not in CORS whitelist

**Solutions:**
1. Verify `FRONTEND_URL` is set correctly
2. Frontend URL should match the origin exactly
3. Render will auto-redeploy after environment changes

---

## Manual Redeploy (if needed)

1. Go to Render Dashboard → **vertex-api**
2. Click **Manual Deploy**
3. Wait for deployment to complete
4. Check logs to see if application starts correctly

---

## Debug Logs to Look For

**Success indicators in Render logs:**
```
APPLICATION STARTUP DEBUG INFO
Active Profiles: [prod]
CORS Frontend URL: https://vertex-web-xxx.onrender.com
JWT Secret configured: true
Database URL configured: true
```

**Error indicators:**
```
Could not resolve placeholder 'jwt.secret' / 'spring.datasource.url'
Connection refused / Database connection failed
CORS allowed origin patterns for auth requests: [...]
```

---

## Next Steps

1. **First:** Test health endpoint → `/api/v1/health`
2. **Check:** All environment variables in Render dashboard
3. **Verify:** Active profile is `prod` in startup logs
4. **Test:** Register endpoint
5. **If still 403:** Check frontend URL in CORS whitelist

If health endpoint works but auth endpoints still give 403, the issue is CORS configuration, not authentication.

