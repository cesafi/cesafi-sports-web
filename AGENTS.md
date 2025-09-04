# CESAFI Sports Website - Developer Handover Document

## 📋 Project Overview

The **CESAFI Sports Website** is the official digital platform for the Cebu Schools Athletic Foundation, Inc. (CESAFI), designed to be the central hub for collegiate sports in Cebu, Philippines. This is a modern, full-stack web application built with Next.js 15, providing real-time sports updates, news, and comprehensive sports management functionality.

### 🎯 Project Goals
- **Real-time Sports Coverage**: Live game updates, scores, and match results
- **Content Management**: Articles, news, and social media integration
- **Sports Administration**: Team management, scheduling, and league operations
- **User Experience**: Fast, responsive, and accessible sports platform
- **Community Engagement**: Fan interaction and sports community building

---

## 🏗️ Technical Architecture

### Technology Stack
- **Framework**: Next.js 15.4.2 (React 19.1.0)
- **Language**: TypeScript 5+ (Strict mode enabled)
- **Backend**: Supabase (PostgreSQL + Real-time features)
- **Styling**: Tailwind CSS 4.0 + Shadcn/UI components
- **State Management**: TanStack React Query v5
- **Validation**: Zod v4 schemas
- **Image Management**: Cloudinary + next-cloudinary
- **Testing**: Jest + React Testing Library
- **Development**: Turbopack (dev mode)

### Project Structure
```
cesafi-sports-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/         # Route groups
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── metadata.ts        # SEO metadata
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/UI base components
│   │   └── contexts/         # React Context providers
│   ├── lib/                   # Utility libraries
│   │   ├── types/            # TypeScript type definitions
│   │   ├── supabase/         # Database client configuration
│   │   ├── validations/      # Zod validation schemas
│   │   └── utils.ts          # Helper utilities
│   ├── services/             # Data access layer
│   ├── actions/              # Next.js Server Actions
│   ├── hooks/                # Custom React hooks
│   └── middleware.ts         # Next.js middleware
├── database.types.ts         # Auto-generated Supabase types
├── package.json             # Dependencies and scripts
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── jest.config.ts          # Testing configuration
└── eslint.config.mjs       # ESLint configuration
```

---

## 🗄️ Data Layer Architecture

### Database Design (Supabase)
The application uses Supabase PostgreSQL with the following key entities:

**Core Entities:**
- `schools` - Educational institutions participating in CESAFI
- `sports` - Different sports categories (Basketball, Volleyball, etc.)
- `seasons` - Academic/competition years
- `matches` - Individual game events
- `games` - Specific game instances within matches
- `articles` - News articles and content
- `volunteers` - Staff and volunteer management

**Relationships:**
- Schools → Teams → Matches → Games → Scores
- Sports → Seasons → Matches
- Articles → Authors (volunteers)

### Service Layer Pattern
```typescript
// Base service class providing common functionality
export abstract class BaseService {
  protected static async getClient() // Universal client (server/browser)
  protected static formatError<T>() // Standardized error handling
  protected static async getPaginatedData<T>() // Generic pagination
}

// Entity-specific services extend BaseService
export class SchoolService extends BaseService {
  static async getPaginated() // Get schools with filters
  static async getById() // Single school retrieval
  static async insert() // Create new school
  static async updateById() // Update existing school
  static async deleteById() // Remove school
}
```

### Data Flow Architecture
1. **Client Components** → Custom Hooks (React Query)
2. **Hooks** → Server Actions (Next.js)
3. **Server Actions** → Service Layer
4. **Services** → Supabase Database
5. **Validation** → Zod schemas at action level
6. **Caching** → React Query with smart invalidation

### Authentication & Authorization
- **Supabase Auth**: Built-in authentication system
- **Role-Based Access**: `admin`, `league_operator`, `volunteer`
- **Row-Level Security**: Database-level permission enforcement
- **Middleware**: Currently disabled (noted in code for future implementation)

---

## 🔧 Development Environment Setup

### Prerequisites
- Node.js 18+ (recommended: latest LTS)
- npm or yarn package manager
- Git version control

### Environment Variables Required
Create `.env.local` with the following variables:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration (for image management)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/cesafi/cesafi-sports-web.git
cd cesafi-sports-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with actual credentials

# Start development server
npm run dev
```

### Development Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint code checking
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## 🧪 Testing Strategy

### Current Testing Setup
- **Framework**: Jest with jsdom environment
- **React Testing**: React Testing Library
- **Configuration**: Next.js optimized Jest setup
- **Location**: Tests should be created alongside source files

### Testing Philosophy
- **Unit Tests**: Individual functions, utilities, and components
- **Integration Tests**: Component + hook interactions
- **Focus Areas**: Services, validation schemas, custom hooks

### Testing Commands
```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage reports
```

### Notes
- **Test Files**: Currently no test files exist (setup ready)
- **Jest Setup**: Configured but no `jest.setup.ts` file present
- **Future Work**: Implement comprehensive test suite

---

## 🚀 Deployment & Infrastructure

### Current Deployment Strategy
- **Platform**: Vercel (mentioned in README)
- **Branch Strategy**:
  - `main` branch → Production deployment
  - No CI/CD workflows detected in `.github/workflows/`
- **Build Process**: Standard Next.js build (`npm run build`)

### Domain & Hosting
- **Hosting**: Vercel platform
- **Database**: Supabase hosted PostgreSQL
- **Images**: Cloudinary CDN
- **SSL**: Automatic via Vercel

### Deployment Process
1. Push to `main` branch
2. Vercel automatic deployment
3. Build validation via Next.js
4. Production release

### Performance Optimizations
- **Next.js 15**: Latest features and optimizations
- **Turbopack**: Fast development builds
- **Image Optimization**: Next.js + Cloudinary integration
- **Code Splitting**: Automatic via Next.js App Router

---

## 📦 Key Dependencies

### Production Dependencies
```json
{
  "next": "15.4.2",                    // React framework
  "@supabase/supabase-js": "^2.52.0", // Database client
  "@tanstack/react-query": "^5.83.0", // State management
  "@radix-ui/*": "latest",             // UI primitives
  "zod": "^4.0.5",                     // Schema validation
  "framer-motion": "^12.23.6",         // Animations
  "next-cloudinary": "^6.16.0",        // Image management
  "tailwindcss": "^4",                 // Styling
  "lucide-react": "^0.525.0"           // Icons
}
```

### Development Dependencies
```json
{
  "@testing-library/react": "^16.3.0", // Testing utilities
  "jest": "^30.0.5",                   // Test framework
  "eslint": "^9",                      // Code linting
  "prettier": "^3.6.2",               // Code formatting
  "typescript": "^5"                   // Type safety
}
```

---

## 🔒 Security Considerations

### Current Security Features
- **Environment Variables**: Sensitive data in `.env.local`
- **Supabase RLS**: Row-level security policies
- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Zod schemas for all user inputs

### Security Notes
- **Middleware**: Security headers disabled (see `src/middleware.ts`)
- **CORS**: Handled by Supabase configuration
- **Authentication**: Supabase Auth with role-based access

### Recommended Security Improvements
1. Re-enable security headers in middleware
2. Implement rate limiting
3. Add input sanitization
4. Set up security monitoring

---

## 🚧 Known Issues & Technical Debt

### Current Issues
1. **Middleware Disabled**: Security middleware commented out in `src/middleware.ts`
   ```typescript
   // FIX: dunno what happens here but i cant access any page with this
   ```

2. **Missing Tests**: No test files implemented despite Jest setup

3. **Development State**: Landing page shows minimal content (`<>test</>`)

4. **Environment Setup**: Manual credential request required from project lead

### Technical Debt Areas
1. **Error Handling**: Some services use generic error catching
2. **Type Safety**: Some `any` types used in base service
3. **Documentation**: Limited inline code documentation
4. **Testing**: Comprehensive test suite needed

---

## 👥 Team & Collaboration

### Current Team Structure
- **Project Lead**: Porter, Nicolo Ryne (@nicoryne)
- **Contact**: porternicolo@gmail.com
- **Repository**: Private, authorized volunteers only

### Development Workflow
1. **Branch Strategy**: Feature branches from `main`
2. **Pull Requests**: Required for all changes
3. **Code Review**: Team member approval required
4. **Merge**: Direct to `main` → Vercel deployment

### Branch Naming Convention
- `feat/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation
- `refactor/<description>` - Code improvements
- `chore/<description>` - Maintenance tasks

---

## 📚 Key APIs & Integrations

### Supabase Integration
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Built-in auth system
- **Storage**: File uploads and management
- **API**: Auto-generated REST and GraphQL APIs

### Cloudinary Integration
- **Image Upload**: Direct browser uploads
- **Transformations**: Dynamic image processing
- **CDN**: Global content delivery
- **Upload Preset**: `cesafi-uploads` for unsigned uploads

### Facebook Integration
- **Social Media Embed**: React Social Media Embed library
- **Content Sync**: Manual integration with CESAFI Facebook page

---

## 🔧 Common Development Tasks

### Adding New Entity
1. **Database**: Add table to Supabase
2. **Types**: Regenerate `database.types.ts`
3. **Validation**: Create Zod schema in `lib/validations/`
4. **Service**: Implement service class extending `BaseService`
5. **Actions**: Create server actions in `actions/`
6. **Hooks**: Implement React Query hooks in `hooks/`
7. **Components**: Build UI components as needed

### Database Schema Updates
1. Make changes in Supabase dashboard
2. Regenerate types: `supabase gen types typescript --project-id YOUR_PROJECT_ID > database.types.ts`
3. Update related validation schemas
4. Test affected services and components

### Environment Variable Changes
1. Update `.env.local` locally
2. Update Vercel environment variables
3. Update documentation
4. Notify team members

---

## 📋 Maintenance Checklist

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Monitor Supabase usage and limits
- [ ] Review and optimize Cloudinary usage
- [ ] Check for security updates
- [ ] Update Vercel deployment settings

### Performance Monitoring
- [ ] Next.js build performance
- [ ] Supabase query performance
- [ ] Cloudinary image optimization
- [ ] React Query cache efficiency

### Code Quality
- [ ] ESLint rule compliance
- [ ] TypeScript strict mode compliance
- [ ] Zod schema validation coverage
- [ ] Test coverage improvement

---

## 🆘 Troubleshooting Guide

### Common Issues

**Build Failures:**
- Check TypeScript errors: `npm run build`
- Verify environment variables
- Update dependencies if needed

**Database Connection Issues:**
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Validate RLS policies

**Image Upload Problems:**
- Confirm Cloudinary cloud name
- Check upload preset configuration
- Verify network connectivity

**Development Server Issues:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check port availability (default: 3000)

### Debug Commands
```bash
# Check build output
npm run build

# Lint check
npm run lint

# Type checking
npx tsc --noEmit

# Clear all caches
rm -rf .next node_modules package-lock.json && npm install
```

---

## 📞 Contact & Support

### Primary Contact
- **Name**: Porter, Nicolo Ryne
- **Email**: porternicolo@gmail.com
- **GitHub**: @nicoryne
- **Role**: Project Lead

### Repository Access
- **URL**: https://github.com/cesafi/cesafi-sports-web
- **Access**: Authorized CESAFI volunteers only
- **Permissions**: Contact project lead for access

### External Resources
- **CESAFI Official**: [Facebook Page](https://www.facebook.com/thecesafi/)
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest

---

## 📈 Future Roadmap

### Immediate Priorities
1. **Fix middleware security issues**
2. **Implement comprehensive testing**
3. **Complete landing page development**
4. **Set up proper CI/CD pipeline**

### Feature Development
1. **Live Score Updates**: Real-time game scoring
2. **User Authentication**: Fan and admin portals
3. **Mobile App**: React Native or PWA
4. **Advanced Analytics**: Sports statistics and insights

### Technical Improvements
1. **Performance Optimization**: Bundle size and load times
2. **Accessibility**: WCAG compliance
3. **SEO Enhancement**: Better search visibility
4. **Monitoring**: Error tracking and performance monitoring

---

*This document should be updated regularly as the project evolves. Last updated: December 2024*

---

## 🔄 Document Maintenance

**Update Frequency**: Monthly or after major changes
**Maintainer**: Current project lead
**Review Process**: Team review for accuracy
**Version Control**: Track changes in git history

