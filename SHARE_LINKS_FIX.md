# Share Links Fix - Using Environment Variable

## ✅ Issue Fixed

Updated the share links in article pages to use the `NEXT_PUBLIC_SITE_URL` environment variable instead of hardcoded URLs.

## 🔧 Changes Made

### 1. Created Site URL Utility (`src/lib/utils/site-url.ts`)

**New utility functions:**
```typescript
// Get the base site URL from environment variable or fallback
export function getSiteUrl(): string

// Get the full URL for a given path  
export function getFullUrl(path: string): string

// Get the full URL for an article by slug
export function getArticleUrl(slug: string): string
```

**Smart fallback logic:**
1. **Primary**: Uses `NEXT_PUBLIC_SITE_URL` environment variable
2. **Browser fallback**: Uses `window.location.origin` in client-side
3. **Server fallback**: Uses `https://cesafisports.com` for SSR

### 2. Updated Article Slug Page (`src/app/(public)/news/[slug]/page.tsx`)

**Before (Hardcoded):**
```tsx
<ShareButtons
  title={displayArticle.title}
  url={`https://cesafisports.com/news/${displayArticle.slug}`}
  variant="compact"
/>
```

**After (Environment Variable):**
```tsx
<ShareButtons
  title={displayArticle.title}
  url={getArticleUrl(displayArticle.slug)}
  variant="compact"
/>
```

**Updated locations:**
- ✅ Top share buttons (compact variant)
- ✅ Bottom share buttons (expanded variant)

### 3. Updated Preview Article Page (`src/app/(protected)/preview/articles/[id]/page.tsx`)

**Updated locations:**
- ✅ Top share buttons (compact variant, disabled)
- ✅ Bottom share buttons (full variant, disabled)

## 🎯 Benefits

### Environment-Based Configuration
- ✅ **Development**: Can use `http://localhost:3000`
- ✅ **Staging**: Can use staging URL
- ✅ **Production**: Uses production URL from environment
- ✅ **Flexible**: Easy to change without code modifications

### Smart Fallbacks
- ✅ **Server-Side Rendering**: Works during build time
- ✅ **Client-Side**: Uses current origin if env var missing
- ✅ **Default**: Falls back to production URL

### Maintainability
- ✅ **Single Source of Truth**: All URLs come from one place
- ✅ **Easy Updates**: Change environment variable, not code
- ✅ **Consistent**: Same URL logic across all share buttons

## 🔧 Environment Variable

**Required in `.env.local`:**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Examples:**
```bash
# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Staging  
NEXT_PUBLIC_SITE_URL=https://staging.cesafisports.com

# Production
NEXT_PUBLIC_SITE_URL=https://cesafisports.com
```

## 📱 Share Button Behavior

### Social Media Sharing
- **Twitter**: `https://twitter.com/intent/tweet?text=Article+Title&url=https://your-domain.com/news/article-slug`
- **Facebook**: `https://www.facebook.com/sharer/sharer.php?u=https://your-domain.com/news/article-slug`

### Copy Link
- **Clipboard**: `https://your-domain.com/news/article-slug`

## ✅ Testing

### Verify the Fix
1. **Set environment variable** in `.env.local`
2. **Visit article page**: `/news/[slug]`
3. **Click share buttons** to verify correct URLs
4. **Check copied links** use the environment URL

### Different Environments
```bash
# Test with different URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
NEXT_PUBLIC_SITE_URL=https://staging.com    # Staging
NEXT_PUBLIC_SITE_URL=https://production.com # Production
```

## 🚀 Result

Share links now dynamically use the correct domain based on the environment configuration, making the application more flexible and maintainable across different deployment environments! 🎉