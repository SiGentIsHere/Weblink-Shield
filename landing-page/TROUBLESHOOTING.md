# Authentication Timeout Troubleshooting Guide

## Issue: Stuck on "Processing..." during Sign Up/Sign In

This guide will help you diagnose and fix authentication timeout issues.

---

## Step 1: Check Your Browser Console

Open your browser's Developer Console (F12) and look for these messages:

### ✅ Good Signs:
- `✅ Supabase connected successfully!`
- `✅ Sign in successful`
- `✅ User profile fetched successfully`

### ❌ Bad Signs and Solutions:

#### Problem: Missing Configuration
```
❌ Supabase configuration is missing!
URL exists: false
Key exists: false
```

**Solution:** Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then **restart your dev server**:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### Problem: Row Level Security (RLS) Blocking Insert
```
❌ Error creating user profile: {...}
💡 Hint: Check if Row Level Security policies allow INSERT on User table
```

**Solution:** Run the SQL in `fix_rls_policies.sql`:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix_rls_policies.sql`
3. Click "Run"

Or manually add this policy:
```sql
CREATE POLICY "Users can insert own profile" ON "User"
    FOR INSERT 
    WITH CHECK (auth.uid()::text = auth_user_id::text);
```

#### Problem: Timeout Error
```
Request timeout - Please check your internet connection
```

**Possible causes:**
1. **Wrong credentials** - Double-check your Supabase URL and anon key
2. **Database not set up** - Make sure you've run the schema SQL in Supabase
3. **RLS policies blocking** - See the RLS solution above
4. **Network/Firewall** - Check if your network blocks Supabase connections

---

## Step 2: Verify Supabase Setup

### Check Your Database Tables

Go to Supabase Dashboard → Table Editor and verify these tables exist:
- `User`
- `Role` (with a "Free" role entry)
- `Plan` (with a "Free" plan entry)
- `Subscription`

### Check Email Confirmation Settings

1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Email Confirmations"
3. **For development:** Turn OFF "Confirm email" to test easier
4. **For production:** Keep it ON for security

### Check Row Level Security

1. Go to Supabase Dashboard → Authentication → Policies
2. Verify the `User` table has these policies:
   - ✅ "Users can view own profile" (SELECT)
   - ✅ "Users can update own profile" (UPDATE)
   - ✅ **"Users can insert own profile" (INSERT)** ← This is critical!

If missing, run `fix_rls_policies.sql`.

---

## Step 3: Test Connection

### Test 1: Basic Connection
Open your browser console when the app loads. You should see:
```
🔍 Checking Supabase configuration...
URL exists: true
URL value: https://abcdefghijklmnopqrst...
Key exists: true
Key value: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
✅ Supabase connected successfully!
```

### Test 2: Sign Up Flow
Try signing up and watch the console:
```
📝 Starting sign up for: user@example.com
⏳ Waiting for signup response...
✅ Auth signup successful
📧 Email confirmation required: false
🔨 Creating user profile in database...
✅ User profile created successfully
```

If it stops at any step, the console will show the error.

---

## Step 4: Common Issues & Solutions

### Issue: "Invalid API key"
- Your `VITE_SUPABASE_ANON_KEY` is wrong
- Get the correct one from Supabase Dashboard → Settings → API

### Issue: "Table 'User' does not exist"
- Run `supabase_schema_and_data.sql` in Supabase SQL Editor

### Issue: "new row violates row-level security policy"
- Run `fix_rls_policies.sql` to add missing INSERT policy

### Issue: Email already exists but can't sign in
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user
3. Check if email is confirmed
4. Try resetting the password

---

## Step 5: Emergency Reset

If nothing works, reset everything:

### Reset Database:
```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS "User" CASCADE;
-- Then run your full schema SQL again
```

### Reset Auth:
1. Go to Supabase Dashboard → Authentication → Users
2. Delete test users
3. Try signing up again

### Reset Local App:
```bash
# Clear all local storage
# In browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Getting More Help

If you're still stuck, share these details:

1. **Console logs** from your browser (F12)
2. **Network tab** - Check for failed requests (red ones)
3. **Supabase URL format** - Should be `https://xxx.supabase.co`
4. **Which step fails** - Sign up, sign in, or profile creation?

---

## Quick Checklist

Before asking for help, verify:

- [ ] `.env` file exists with correct values
- [ ] Dev server restarted after creating/editing `.env`
- [ ] Database tables exist (User, Role, Plan, Subscription)
- [ ] "Free" role and "Free" plan entries exist in database
- [ ] RLS INSERT policy added for User table
- [ ] Browser console shows detailed error messages
- [ ] Network isn't blocking Supabase (try different network)

