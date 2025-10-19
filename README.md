# Titcha - AI-Powered Education Platform

> Titcha is a comprehensive educational platform featuring role-based portals for Students, Parents, and Teachers. The platform leverages AI to provide personalized learning experiences with real-time insights and collaboration tools.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit **http://localhost:3000**

## ✨ Features

### Marketing Site
- ✅ **Landing Page** - Hero section with animated blobs, features, testimonials, CTA
- ✅ **Features Page** - 12 detailed feature cards with icons and benefits
- ✅ **Pricing Page** - 3-tier pricing with FAQ section
- ✅ **About Page** - Mission, vision, values, team profiles, and stats
- ✅ **Contact Page** - Contact form with validation and info cards

### Authentication
- ✅ **Login Page** - Email/password with social auth options (Google, GitHub)
- ✅ **Register Page** - Multi-step registration with role selection
- ✅ **NextAuth Integration** - JWT-based authentication with role-based redirects

### User Portals
- ✅ **Student Portal** - Dashboard, homework tracking, subjects, collaborative study rooms
- ✅ **Parent Portal** - Child management, performance tracking, homework monitoring
- ✅ **Teacher Portal** - Class management, resource uploads, learner tracking, grading
- 🚧 **Admin Portal** - (Coming soon)

### Design & UX
- ✅ **Responsive Navigation** - Mobile hamburger menu with smooth animations
- ✅ **Active Link Highlighting** - Visual indicator for current page
- ✅ **Scroll Effects** - Navbar shadow on scroll, fade-in animations
- ✅ **Role-Based Theming** - 4 distinct color schemes
- ✅ **Accessibility** - Semantic HTML, keyboard navigation, ARIA labels

## 📦 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Animation** | Framer Motion |
| **Authentication** | NextAuth.js |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Fonts** | Inter, Poppins |

## 📂 Project Structure

```
src/
├── app/
│   ├── (public)/          # Marketing pages
│   │   ├── page.tsx       # Landing page
│   │   ├── features/      # Features page
│   │   ├── pricing/       # Pricing page
│   │   ├── about/         # About page
│   │   ├── contact/       # Contact page
│   │   └── layout.tsx     # Public layout with navbar
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (portal)/          # Protected user dashboards
│   │   └── student/       # Student portal
│   ├── api/
│   │   ├── auth/          # NextAuth endpoints
│   │   └── contact/       # Contact form API
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── marketing/         # Marketing components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── PricingCards.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── ui/                # Reusable UI components
│   │   ├── ButtonGradient.tsx
│   │   └── SectionTitle.tsx
│   └── ...                # Feature components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── api.ts             # API client setup
│   ├── store.ts           # Zustand store
│   ├── theme.ts           # Role-based themes
│   └── utils.ts           # Utility functions
└── ...
```

## 🎨 Theme System

The platform uses a custom role-based theming system defined in `lib/theme.ts`:

| Role | Primary Color | Secondary Color | Use Case |
|------|---------------|-----------------|----------|
| **Student** | Purple `#9333EA` | Pink `#EC4899` | Student portal |
| **Parent** | Teal `#14B8A6` | Amber `#F59E0B` | Parent dashboard |
| **School** | Emerald `#10B981` | Gold `#FACC15` | School admin |
| **Admin** | Dark `#111827` | Orange `#F59E0B` | Platform admin |

## 🔗 API Endpoints

### Public Endpoints
- `GET /` - Landing page
- `GET /features` - Features page
- `GET /pricing` - Pricing page
- `GET /about` - About page
- `GET /contact` - Contact page
- `POST /api/contact` - Contact form submission

### Authentication Endpoints
- `GET /login` - Login page
- `GET /register` - Registration page
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Protected Endpoints
- `GET /portal/student/dashboard` - Student dashboard
- (More to be added for other roles)

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5100

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🌐 Backend Services

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 3000 | http://localhost:3000 | Next.js web app |
| **App-Logic** | 5100 | http://localhost:5100 | NestJS business logic |
| **AI Gateway** | 5001 | http://localhost:5001 | Express proxy with retry |
| **AI Core** | 8000 | http://localhost:8000 | FastAPI AI services |

## 📱 Pages Overview

### Public Pages
- **`/`** - Landing page with hero, features, testimonials
- **`/features`** - Detailed 12-feature showcase
- **`/pricing`** - 3-tier pricing with FAQ
- **`/about`** - Company story, mission, values, team
- **`/contact`** - Contact form with office info

### Auth Pages
- **`/login`** - Email/password + social auth
- **`/register`** - Multi-step role-based registration

### Protected Pages
- **`/portal/student/dashboard`** - Student learning dashboard

## 🎯 Key Features Explained

### Navigation System
- **Desktop**: Horizontal nav with active link indicator
- **Mobile**: Hamburger menu with slide-down animation
- **Scroll Effect**: Shadow appears when scrolling down
- **Active Links**: Underline animation on current page

### Animation System
- **Hero**: Animated gradient blobs in background
- **Features**: Staggered fade-in on scroll
- **Pricing**: Scale effect on popular plan
- **Forms**: Input focus animations

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Touch-optimized buttons and inputs
- Optimized images and fonts

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [NextAuth.js](https://next-auth.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🔄 Recent Updates (Phase 4 Complete)

✅ Enhanced Tailwind config with custom fonts and animations
✅ Created reusable UI components (ButtonGradient, SectionTitle)
✅ Built complete marketing pages (About, Contact, Features)
✅ Implemented authentication pages with NextAuth
✅ Added mobile-responsive navigation with hamburger menu
✅ Implemented scroll-based navbar shadow effect
✅ Created contact form API endpoint
✅ Updated pricing page with FAQ section

## 🎓 Learning Resources

For a complete implementation guide with code examples, see:
- [PHASE4_IMPLEMENTATION.md](./PHASE4_IMPLEMENTATION.md)

---

**Built with ❤️ for modern education | Titcha Platform**
