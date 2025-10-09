# 🔍 Debug Request Timeout Issue

## Quick Access: Diagnostic Page

I've created a diagnostic page to help you isolate the timeout issue.

### Access it:
1. Open your browser
2. Go to: **`http://localhost:5173/#diagnostic`**
3. Run the tests and share the results

---

## What to Check Right Now

### 1. Open Browser Console (F12)

When you load your app, you should see these messages immediately:

```
🔍 Checking Supabase configuration...
URL exists: true
URL full value: https://your-project-id.supabase.co
Key exists: true
Key length: 218
Key starts with: eyJhbGciOiJIUzI1NiIs...
🧪 Testing Supabase connection...
```

### 2. What Should Happen

**✅ If everything is working:**
```
✅ Supabase connected successfully!
Session exists: false
```

**❌ If there's a problem:**
```
❌ Supabase connection error: Connection test timeout after 5 seconds
This usually means:
  1. Wrong Supabase URL or API key
  2. Network/Firewall blocking connection
  3. CORS issues
  4. Supabase project is paused/deleted
```

---

## Common Timeout Causes

### Problem 1: .env File Not Loaded
**Symptoms:**
- Console shows `URL exists: false`
- Console shows `MISSING` for values

**Solution:**
1. Verify `.env` file exists in project root (same folder as `package.json`)
2. Check the contents:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **IMPORTANT:** Restart your dev server (Ctrl+C, then `npm run dev`)
4. Refresh your browser

### Problem 2: Wrong Credentials
**Symptoms:**
- Console shows `Request timeout after 10 seconds`
- Network tab shows failed requests to Supabase

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** (should look like `https://abcdefg.supabase.co`)
5. Copy **anon/public key** (long string starting with `eyJ`)
6. Update your `.env` file
7. Restart dev server

### Problem 3: Supabase Project Paused
**Symptoms:**
- Connection test times out
- All requests to Supabase fail

**Solution:**
1. Check [Supabase Dashboard](https://app.supabase.com)
2. Look for "Project Paused" banner
3. Click "Resume Project" if paused
4. Free tier projects pause after inactivity

### Problem 4: Network/Firewall Blocking
**Symptoms:**
- Works on different network
- Other Supabase projects timeout too

**Solution:**
1. Try different network (mobile hotspot, different WiFi)
2. Check firewall settings
3. Try disabling VPN
4. Check antivirus/security software

---

## Step-by-Step Debugging

### Step 1: Check .env Loading

**Run this in browser console:**
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Expected:** Should show your actual values (not `undefined`)

### Step 2: Test Connection

1. Go to `http://localhost:5173/#diagnostic`
2. Click **"Run Full Diagnostics"**
3. Watch the results:
   - ✅ Environment Check should pass
   - ✅ Network Test should pass
   - ✅ Database Test should pass

### Step 3: Test Authentication

1. On diagnostic page, enter the email/password you created manually in Supabase
2. Click **"Test Authentication"**
3. Watch what happens:

**If it times out:**
- The problem is with Supabase connection (credentials, network, or project status)

**If it succeeds:**
- The problem was with profile creation (RLS policies)
- You should see: `✅ Sign in successful in XXms`

### Step 4: Check Sign In Flow

Try signing in with your manually created account:

1. Go to Auth page
2. Enter credentials
3. Watch console for these messages:

```
🔐 Starting sign in...
📧 Email: your@email.com
🔑 Password length: 8
🌐 Testing network connectivity to Supabase...
⏳ Waiting for auth response from Supabase...
```

**It should complete in under 2 seconds.** If it takes longer, there's a network issue.

---

## Quick Checklist

Before asking for more help, verify:

- [ ] `.env` file exists with correct values
- [ ] Dev server restarted after editing `.env`
- [ ] Console shows Supabase URL and key on page load
- [ ] Diagnostic page connection test passes
- [ ] Supabase project is active (not paused)
- [ ] User exists in Supabase Auth dashboard
- [ ] User profile exists in database `User` table
- [ ] Tried different network (rule out firewall)

---

## Share These Details

If still stuck, share:

1. **Console output** when app loads (the 🔍 messages)
2. **Diagnostic page results** (screenshot or text)
3. **Network tab** - Any failed requests? What status codes?
4. **Supabase project status** - Active? Paused? Region?
5. **What happens** - Does it timeout on sign in, sign up, or both?

---

## Test Commands

### Check if .env is loaded:
```bash
# Stop server
# Print .env contents
cat .env
# Start server
npm run dev
```

### Verify Supabase is reachable:
```bash
# From command line
curl https://YOUR-PROJECT-ID.supabase.co
```

Should return HTML, not timeout.

---

## Next Steps

1. **First:** Go to `http://localhost:5173/#diagnostic` and run all tests
2. **Second:** Check browser console for the detailed logs
3. **Third:** Share the console output and diagnostic results

The diagnostic page will tell us exactly where it's failing! 🎯

