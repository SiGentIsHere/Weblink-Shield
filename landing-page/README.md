# WebLink Shield - Security Analysis Platform

A responsive landing page for WebLink Shield, a mobile application for scanning web links. Built with Vite + React + TypeScript + TailwindCSS.

## Features

- **Responsive Design**: Mobile-first approach with clean, modern UI
- **Product Introduction**: Hero section showcasing the mobile app
- **App Showcase**: Features and milestones of the WebLink Shield mobile app
- **User Testimonials**: Reviews and ratings from satisfied users
- **Pricing Plans**: Free, Pro, and Enterprise tiers with clear feature comparison
- **Modern UI**: Clean design with rounded corners, soft shadows, and focus rings

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library with TypeScript
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **TypeScript** - Type-safe JavaScript

## Supabase Setup

1. Install the SDK:
```bash
npm i @supabase/supabase-js
```

2. Create `.env` at the project root and paste your keys:
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Client is initialized in `src/lib/supabase.ts`. Auth form calls:
- Sign Up: `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, username }}})`
- Sign In: `supabase.auth.signInWithPassword({ email, password })`

Restart dev server after changing env files.

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── HeroScanner.tsx         # Hero section with app introduction
│   ├── AppShowcase.tsx         # App features and milestones
│   ├── Testimonials.tsx        # User reviews and ratings
│   ├── Pricing.tsx             # Pricing plans and features
│   └── Footer.tsx              # Footer component
├── pages/
│   ├── HomePage.tsx            # Landing page sections
│   └── AuthPage.tsx            # Sign in / Sign up page (Supabase wired)
├── lib/
│   └── supabase.ts             # Supabase client
├── App.tsx                     # App with simple page switching
├── main.tsx                    # App entry point
└── index.css                   # Global styles
```

## Design System

### Colors
- **Primary Accent**: #3B82F6 (blue)
- **Success**: Green variants for safe/low risk
- **Warning**: Yellow variants for medium risk
- **Danger**: Red variants for high risk

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary and secondary variants with focus states
- **Input Fields**: Clean design with focus rings
- **Icons**: Lucide React icons throughout

## Features Overview

### Header
- Sticky navigation with logo and menu items
- Mobile-responsive hamburger menu
- Sign In/Sign Up button

### Hero Section
- Product introduction with compelling headline
- Mobile app mockup preview
- Key features overview
- Download and Learn More buttons

### App Showcase
- Comprehensive feature grid (6 key features)
- Milestone statistics (downloads, accuracy, etc.)
- App store download badges
- Mobile-first design showcase

### Testimonials
- User reviews with ratings and avatars
- Statistics section (app rating, satisfaction, threats blocked)
- Call-to-action for new users
- Social proof elements

### Pricing
- Three-tier pricing structure (Free, Pro, Enterprise)
- Feature comparison with checkmarks
- Popular plan highlighting
- FAQ section
- Clear value proposition

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
