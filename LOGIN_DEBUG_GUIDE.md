# Dashboard Login Debugging Guide

## ✅ Quick Fix Applied

I've fixed the dashboard login with these changes:

### 1. **Server-Side Authentication**
- Credentials are now validated on the server
- Cookie is set on the server (more reliable)
- Automatic redirect after successful login

### 2. **Simplified Form Flow**
- Removed complex state management
- Using native HTML form with `action` attribute
- Pre-filled username: `NEWSAPP` for easier testing

### 3. **Better Error Handling**
- Console logging for debugging
- Environment variable validation
- Clear error messages

---

## 🔐 Login Credentials

```
Username: NEWSAPP
Password: Today@news
```

**Note**: These come from your `.env` file:
```
DASHBOARD_USERNAME=NEWSAPP
DASHBOARD_PASSWORD=Today@news
```

---

## 🧪 Testing Steps

### Step 1: Test Authentication Endpoint
1. Open: `https://your-site.com/api/auth-test`
2. Check the JSON response:
   ```json
   {
     "auth_cookie_exists": true,
     "auth_cookie_value": "admin-secret",
     "all_cookies": [...]
   }
   ```
3. After login, this should show `auth_cookie_exists: true`

### Step 2: Clear Browser Data
Before testing, clear cookies/cache:
1. **Chrome**: DevTools → Application → Cookies → Delete all
2. **Firefox**: Settings → Privacy → Clear Recent History
3. **Safari**: Develop → Empty Caches

### Step 3: Test Login
1. Visit: `/dashboard/login`
2. Username: `NEWSAPP`
3. Password: `Today@news`
4. Click: **AUTHORIZE SESSION**
5. Should redirect to `/dashboard`

### Step 4: Verify in Console
1. Open DevTools (F12)
2. Go to Console tab
3. You should see:
   ```
   [LoginPage] Submitting: { username: 'NEWSAPP' }
   [Auth] Login attempt - Username: NEWSAPP
   [Auth] Valid username: NEWSAPP
   [Auth] Cookie set successfully
   ```

---

## 🔍 Troubleshooting

### ❌ Still redirects to login after entering credentials

**Causes & Fixes:**

1. **Environment variables not loaded**
   - Restart dev server: `npm run dev`
   - Check `.env` file exists in root
   - Verify values: `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD`

2. **Browser cookies disabled**
   - Chrome: Settings → Privacy → Allow all cookies
   - Firefox: Preferences → Privacy → Accept cookies
   - Check if cookies are being set: DevTools → Application → Cookies

3. **Wrong credentials**
   - Username must be exactly: `NEWSAPP` (case-sensitive)
   - Password must be exactly: `Today@news`
   - No spaces before/after

4. **Cache issue**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear all browser cache
   - Try incognito/private window

5. **Server logs not showing auth messages**
   - Open terminal where `npm run dev` is running
   - Verify you see `[Auth]` log messages
   - If not, environment variables aren't loaded

### ❌ Getting "Invalid credentials" error

**Check:**
1. Verify `.env` file has exact values:
   ```
   DASHBOARD_USERNAME=NEWSAPP
   DASHBOARD_PASSWORD=Today@news
   ```
2. No extra spaces or quotes
3. Restart dev server after changing `.env`

### ❌ Login button doesn't respond

**Check:**
1. Browser console for JavaScript errors
2. Network tab: Check if POST request is sent
3. Check if form action is being triggered
4. Try incognito/private window

---

## 🛠️ Manual Testing Commands

### Test via API
```bash
# Using curl (command line)
curl http://localhost:3000/api/auth-test

# Should return if logged in:
# {"auth_cookie_exists": true}
```

### Test Dev Server
```bash
# Make sure server is running
npm run dev

# Should see output like:
# > next-news@1.0.0 dev
# > next dev
# ▲ Next.js 16.1.6
# ✓ Ready in 1.23s
```

---

## 📋 Diagnostic Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` has `DASHBOARD_USERNAME=NEWSAPP`
- [ ] `.env` has `DASHBOARD_PASSWORD=Today@news`
- [ ] Dev server restarted after `.env` changes
- [ ] Browser cookies are enabled
- [ ] Entered exact credentials with no spaces
- [ ] Cleared browser cache/cookies
- [ ] No JavaScript errors in console
- [ ] `/api/auth-test` shows auth status
- [ ] Console shows `[Auth]` log messages

---

## 📞 If Still Not Working

1. **Check the logs**:
   - Open terminal running `npm run dev`
   - Look for `[Auth]` messages
   - They should appear when you click login button

2. **Verify credentials**:
   ```bash
   # In your terminal, check .env file:
   cat .env | grep DASHBOARD
   # Should output:
   # DASHBOARD_USERNAME=NEWSAPP
   # DASHBOARD_PASSWORD=Today@news
   ```

3. **Try resetting everything**:
   ```bash
   # Clear node_modules cache
   npm run build
   npm run dev
   ```

4. **Check deployment** (if on Vercel):
   - Go to Vercel Dashboard
   - Environment Variables
   - Verify `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` are set
   - Re-deploy

---

## 🎯 Architecture Overview

```
User enters credentials
        ↓
Form submits to handleSubmit (server action)
        ↓
Server validates against env vars
        ↓
If valid: Set cookie "auth=admin-secret"
        ↓
Redirect to /dashboard (server-side)
        ↓
Dashboard page receives request with cookie
        ↓
Dashboard checks: authCookie.value === "admin-secret"
        ↓
If match: Show dashboard
If no match: Redirect back to login
```

---

**Last Updated**: March 4, 2026  
**Status**: Ready for Testing
