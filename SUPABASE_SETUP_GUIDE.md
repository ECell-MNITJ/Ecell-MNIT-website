# Supabase Setup Guide for E-Cell MNIT Website

## 🚀 Quick Start

Follow these steps to set up your Supabase backend:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose an organization
4. Enter project details:
   - **Name**: E-Cell MNIT Website
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait ~2 minutes for setup

### 2. Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Find these values under "Project API keys":
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### 3. Configure Environment Variables

1. In your project root (`d:\E-cell\Website`), create a file named `.env.local`
2. Copy the content from `.env.local.example` and replace with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project. supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Save the file

### 4. Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `lib/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" button
6. You should see "Success. No rows returned"

This creates:
- ✅ `team_members` table
- ✅ `events` table  
- ✅ Row Level Security (RLS) policies
- ✅ Storage buckets for images
- ✅ Sample data (optional)

### 5. Create Your Admin Account

**Option A: Via Supabase Dashboard** (Recommended for production)
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Choose "Create new user"
4. Enter:
   - **Email**: your-admin-email@example.com
   - **Password**: Strong password (save it!)
   - **Auto Confirm User**: Enable this checkbox
5. Click "Create user"

**Option B: Via Signup Page** (Easier for development)
1. Run `npm run dev`
2. Visit `http://localhost:3000/admin/signup`
3. Fill in the signup form
4. You're automatically logged in!

### 6. Start Development Server

```bash
npm run dev
```

Visit:
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/admin/login

## 📋 Admin Panel Features

### Dashboard (`/admin/dashboard`)
- View stats (team members, events, upcoming events)
- Quick action links

### Team Management (`/admin/team`)
- ➕ Add new team members
- ✏️ Edit existing members
- 🗑️ Delete members
- 📸 Upload profile images
- 🔗 Add social media links (LinkedIn, Twitter)
- 📊 Reorder team members

### Events Management (`/admin/events`)
- ➕ Create new events
- ✏️ Edit event details
- 🗑️ Delete events
- 📸 Upload event images
- 🏷️ Categorize events
- ⭐ Feature important events
- 📅 Mark as upcoming/past
- 🔗 Add registration links

## 🔧 Troubleshooting

### "Failed to fetch" errors
- ✅ Check `.env.local` file exists and has correct values
- ✅ Restart dev server after adding environment variables
- ✅ Verify Supabase project URL is correct

### "Row Level Security" errors
- ✅ Make sure you ran the `schema.sql` file completely
- ✅ Check that RLS policies were created in Supabase Dashboard
- ✅ Verify you're logged in when trying admin operations

### Images not uploading
- ✅ Check storage buckets exist: `team-images` and `event-images`
- ✅ Verify buckets are set to "Public"
- ✅ Check storage policies allow authenticated users to upload

### Login not working
- ✅ Verify admin user was created properly
- ✅ Check email confirmation (if required)
- ✅ Try password reset if needed

## 🌐 Frontend Integration

The public pages automatically fetch data from Supabase:

**About Page** (`/about`)
- Displays team members from database
- Shows profile images from Supabase storage
- Includes social media links

**Events Page** (`/events`)
- Lists upcoming and past events
- Shows event images
- Displays registration links for upcoming events
- Automatic categorization

### Email Verification Fails on Mobile (Cross-Device Issue)
If a user signs up on their laptop but clicks the verification link on their mobile phone, the verification might fail silently or throw a "missing code verifier" error. This is because the default Supabase email template uses the PKCE flow which requires the original browser.
**To fix this permanent cross-device issue:**
1. Go to your **Supabase Dashboard** -> **Authentication** -> **Email Templates**
2. In the **Confirm signup** template, replace `<a href="{{ .ConfirmationURL }}">Confirm your email</a>` with this EXACT code:
```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/esummit/login">Confirm your email</a>
```
3. Do the same thing for the **Magic Link** template, but change `type=signup` to `type=magiclink`.
4. Do the same thing for the **Reset Password** template, but change `type=signup` to `type=recovery` and change the `next` URL to point to the new password page:
```html
<!-- For E-Cell Users: -->
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset your password</a>

<!-- OR For E-Summit Users (Choose one based on where the user usually resets): -->
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/esummit/reset-password">Reset your password</a>
```
This forces the email strictly through your server-side `token_hash` Route Handler, completely bypassing the cross-device cookie restrictions!

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong passwords** for admin accounts
3. **Enable email confirmation** in production (Supabase Auth settings)
4. **Consider restricting signup** after creating admin accounts
5. **Review RLS policies** before going to production

## 📚 Next Steps

1. **Add real team members** via admin panel
2. **Create your events** with dates and details
3. **Upload quality images** for events and team
4. **Test everything** works correctly
5. **Deploy to production** (Vercel, Netlify, etc.)

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Check browser console** for error messages
- **Check Supabase logs** in Dashboard → Logs

---

**You're all set! 🎉** Start adding content through the admin panel at `/admin`.
