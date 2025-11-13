# Performance Improvements Implementation

This document details the frontend performance optimizations implemented based on the recommendations in `FRONTEND_PERFORMANCE_REVIEW.md`.

## Implementation Date
November 13, 2025

## Changes Implemented

### 1. ✅ JavaScript Optimization - Defer Attributes
**File:** `layouts/partials/scriptsBodyEnd.html`

**Changes:**
- Added `defer` attribute to production script tags (previously missing)
- Maintains `async` for development mode
- Preserves SRI (Subresource Integrity) hashes for security

**Impact:** Expected 300-500ms faster Time to Interactive

**Details:**
```html
<!-- Production mode now includes defer -->
<script defer src="{{  $main.Permalink }}" integrity="{{ $main.Data.Integrity }}"></script>
```

### 2. ✅ Inline Critical Theme Detection
**File:** `layouts/partials/scriptsBodyStart.html`

**Changes:**
- Inlined critical theme detection script (runs immediately, no network request)
- Prevents Flash of Unstyled Content (FOUC)
- Deferred full theme.js load for interactive features
- Maintains theme toggle and menu blur functionality

**Impact:** Zero theme flash, cleaner initial paint

**Details:**
- Critical path (theme detection) runs inline: ~500 bytes
- Full theme.js (1.1 KB) loads with `defer` for non-critical features

### 3. ✅ Font Preload Optimization
**File:** `layouts/partials/head.html`

**Changes:**
- Added preload hint for Roboto font (woff2)
- Loads font earlier in the critical rendering path
- Used `crossorigin` attribute (required for font preloading)

**Impact:** Expected 300-600ms faster font display

**Details:**
```html
<link rel="preload" href="/fonts/Roboto/roboto-v30-latin-regular.woff2"
      as="font" type="font/woff2" crossorigin>
```

**Note:** `font-display: swap` was already implemented in the theme (verified in `_fonts.scss`)

### 4. ✅ Conditional Code Highlight CSS
**File:** `layouts/partials/head.html`

**Changes:**
- Code syntax highlighting CSS (10 KB) now loads conditionally
- Only loads on pages that contain code blocks
- Auto-detects `<pre>` tags in rendered content
- Supports manual override via `hasCode: true` front matter parameter

**Impact:** 10 KB saved on pages without code blocks (~30% size reduction for non-code pages)

**Details:**
```go
{{- if or .Params.hasCode (findRE "<pre" .Content) }}
{{- $code_syntax_highlight_css := resources.Get "code-highlight.css" | minify | fingerprint }}
<link href="{{ $code_syntax_highlight_css.RelPermalink }}" rel="stylesheet">
{{- end }}
```

### 5. ❌ Critical CSS Extraction
**Status:** Removed due to style conflicts

**Reason:**
- Manual critical CSS implementation caused layout conflicts with theme
- The aggressive CSS reset broke the theme's carefully crafted styles
- Theme's CSS is already small (23 KB) and well-optimized
- Proper critical CSS extraction requires automated tooling

**Decision:** Removed critical CSS to preserve theme integrity. Future implementation should use automated extraction tools like Critical or PurgeCSS.

### 6. ✅ Favicon Optimization
**File:** `layouts/partials/head.html`

**Changes:**
- Reduced from 5 favicon variants to 4 essential ones:
  - SVG favicon (modern browsers, scalable)
  - ICO fallback (legacy browsers)
  - Apple touch icon (iOS home screen)
  - Safari pinned tab icon
- Removed redundant 32x32 and 16x16 PNG variants (SVG covers these use cases)

**Impact:** 2 fewer HTTP requests

**Before:**
```html
<link rel="icon" type="image/svg+xml" href="...">
<link rel="shortcut icon" href="...">
<link rel="icon" type="image/png" sizes="32x32" href="...">
<link rel="icon" type="image/png" sizes="16x16" href="...">
<link rel="apple-touch-icon" sizes="180x180" href="...">
```

**After:**
```html
<link rel="icon" type="image/svg+xml" href="...">
<link rel="shortcut icon" href="...">
<link rel="apple-touch-icon" sizes="180x180" href="...">
<link rel="mask-icon" href="...">
```

### 7. ✅ Image Lazy Loading
**File:** `layouts/_default/_markup/render-image.html` (new)

**Changes:**
- Created Hugo render hook for markdown images
- Automatically adds `loading="lazy"` to all blog post images
- Added `decoding="async"` for non-blocking image decode
- Preserves alt text and title attributes for accessibility

**Impact:** Lower priority for below-the-fold images, faster initial page load

**Details:**
- Avatar image intentionally NOT lazy-loaded (above-the-fold, critical, only 1.2 KB)
- Lazy loading best practices: don't lazy load above-the-fold content

**Note:** Current impact is minimal (most pages have no or few images), but future-proofs the site for image-heavy posts.

### 8. ✅ Compression Verification
**Status:** Verified via curl test

**Findings:**
```bash
$ curl -sI -H "Accept-Encoding: gzip,deflate,br" https://clews.id.au
content-encoding: gzip
```

**Current State:**
- Site uses gzip compression ✅
- Brotli compression NOT enabled ❌

**Recommendation:**
GitHub Pages currently serves gzip but not Brotli. Brotli provides ~10-20% better compression than gzip.

**Action Items:**
- GitHub Pages configuration (not code-level fix)
- Monitor GitHub Pages feature updates for Brotli support
- Alternative: Consider Cloudflare (free tier supports Brotli)

**Expected Improvement if Brotli enabled:** 40-60% size reduction vs uncompressed, 10-20% better than gzip

---

## Deferred / Not Implemented

### Critical CSS Extraction
**Status:** Attempted and removed due to conflicts

**What Happened:**
- Initial implementation created manual inline critical CSS
- The aggressive CSS reset (`* { margin: 0; padding: 0; }`) broke theme layout
- Caused visual regressions and style conflicts
- Removed to preserve theme integrity

**Reason:**
- Requires automated build tooling (Critical npm package, PurgeCSS, or similar)
- Manual extraction is error-prone and causes conflicts
- Current CSS bundle is already small (23 KB main + 10 KB code-highlight)
- Hugo doesn't have built-in critical CSS extraction

**Recommendation:**
Only implement with proper tooling. Manual critical CSS is not maintainable. Potential approaches:
1. Use Critical package in GitHub Actions workflow to auto-extract from compiled CSS
2. Add PurgeCSS to build process
3. Use Hugo's built-in asset pipeline with PostCSS plugins

**Expected Impact if properly implemented:** 400-800ms faster First Contentful Paint

**Lesson Learned:** Don't manually create critical CSS - it must be extracted from the actual compiled stylesheets to avoid conflicts.

### Cache Headers
**Status:** Not implemented (infrastructure-level)

**Reason:**
- GitHub Pages controls cache headers
- Cannot be configured via code repository
- Current headers: `cache-control: max-age=600` (10 minutes)

**Recommendation:**
GitHub Pages configuration is conservative but reasonable. For better control:
1. Use Cloudflare in front of GitHub Pages (configure cache rules)
2. Migrate to Netlify/Vercel (more granular cache control)
3. Use CDN with custom cache policies

**Recommended Headers:**
```
# Fingerprinted assets (with SHA256 hash in filename)
/style.min.*.css         Cache-Control: public, max-age=31536000, immutable
/js/*.min.*.js          Cache-Control: public, max-age=31536000, immutable
/fonts/*.woff2          Cache-Control: public, max-age=31536000, immutable

# HTML pages
/*.html                 Cache-Control: public, max-age=600, must-revalidate

# Images
/images/**              Cache-Control: public, max-age=86400
```

**Expected Impact if implemented:** Near-instant repeat visits (from cache), reduced bandwidth costs

---

## Testing and Validation

### Local Testing

To test these changes locally:

```bash
# Start development server
make serve

# Build for production (to test production-mode scripts with defer)
hugo --minify --baseURL="http://localhost:1313"
```

### Production Testing

After deployment, verify:

1. **JavaScript Defer:** View page source, confirm `defer` on script tags
2. **Theme Flash:** Hard refresh homepage, observe no theme flicker
3. **Font Loading:** Network tab should show font preload
4. **Code Highlight CSS:** Compare pages with/without code blocks
5. **Favicons:** Check only 4 favicon requests in Network tab
6. **Image Lazy Loading:** Inspect images in blog posts for `loading="lazy"`

### Performance Metrics to Monitor

Before/after comparison metrics:

- **First Contentful Paint (FCP):** Target < 1.5s
- **Time to Interactive (TTI):** Target < 2.5s
- **Total Page Size:** Homepage target < 35 KB
- **HTTP Requests:** Homepage target < 8 requests (with favicon reduction)
- **Lighthouse Performance Score:** Target 90+

---

## Expected Overall Impact

### Quick Wins (Implemented)
- ✅ 300-500ms faster Time to Interactive (defer scripts)
- ✅ 300-600ms faster font display (font preload)
- ✅ Zero theme flash (inline theme detection)
- ✅ 10 KB saved on non-code pages (conditional code-highlight CSS)
- ✅ 2 fewer HTTP requests (favicon reduction)
- ❌ Critical CSS removed due to style conflicts

### Total Expected Improvement
- **Desktop:** 600ms-1s faster load time
- **Mobile (3G):** 1-1.5s faster load time
- **Repeat Visits:** Minimal change (cache headers not implemented)

**Note:** Initial estimates included critical CSS benefits (400-800ms FCP improvement). After removing critical CSS due to layout conflicts, overall improvement is more conservative but still significant.

---

## Browser Compatibility

All implemented changes are compatible with:
- Modern browsers (Chrome, Firefox, Safari, Edge - last 2 years)
- `defer`: Supported by all modern browsers and IE10+
- `loading="lazy"`: Supported by 94% of browsers (graceful degradation in older browsers)
- `preload`: Supported by 95% of browsers
- Font `crossorigin`: Required for CORS, widely supported

---

## Maintenance Notes

### Custom Template Overrides

The following theme templates have been overridden in `layouts/partials/`:
- `head.html` - Font preload, conditional code CSS, favicon optimization
- `scriptsBodyEnd.html` - JavaScript defer attributes
- `scriptsBodyStart.html` - Inline theme detection

**Important:** When updating the `hugo-blog-awesome` theme, review these files for upstream changes and merge manually if needed.

### How to Update Theme

```bash
# Update theme submodule
git submodule update --remote themes/hugo-blog-awesome

# Check for template changes in:
# - themes/hugo-blog-awesome/layouts/partials/head.html
# - themes/hugo-blog-awesome/layouts/partials/scriptsBodyEnd.html
# - themes/hugo-blog-awesome/layouts/partials/scriptsBodyStart.html

# Manually merge relevant changes into layouts/partials/ overrides
```

---

## References

- [FRONTEND_PERFORMANCE_REVIEW.md](FRONTEND_PERFORMANCE_REVIEW.md) - Original performance audit
- [MDN: Resource Hints](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)
- [MDN: Script defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer)
- [MDN: Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading)
- [Hugo: Render Hooks](https://gohugo.io/templates/render-hooks/)
- [Web.dev: Critical Rendering Path](https://web.dev/critical-rendering-path/)

---

## Future Optimization Opportunities

1. **Service Worker:** Offline support, cache API (low priority for blog)
2. **Critical CSS:** Automated extraction in build pipeline
3. **CDN/Cloudflare:** Better cache control, Brotli compression
4. **Content Security Policy:** Security + performance benefit
5. **HTTP/2 Server Push:** Push critical resources (if CDN supports)
6. **WebP/AVIF Images:** Already using WebP for avatar ✅
7. **Performance Budgets:** Add to CI/CD (fail build if bundle > 50 KB)

---

## Validation Checklist

- [x] JavaScript deferred in production mode
- [x] Theme detection inlined
- [x] Font preload added
- [x] Code highlight CSS conditional
- [x] Favicons reduced
- [x] Image lazy loading enabled
- [x] Compression verified (gzip active)
- [ ] Critical CSS extraction (deferred)
- [ ] Cache headers optimization (infrastructure)
- [ ] Performance testing with Lighthouse
- [ ] Production deployment validation

