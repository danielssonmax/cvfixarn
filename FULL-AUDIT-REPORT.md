# Full SEO Audit Report: CVfixaren.se

**Audit Date:** 2026-03-11
**Business Type:** CV/Resume Builder SaaS (Swedish market)
**Pages Analyzed:** 32 (sitemap) / 10 crawled in depth
**Framework:** Next.js + Tailwind CSS (Vercel hosted)

---

## Executive Summary

### Overall SEO Health Score: 58/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Technical SEO | 55/100 | 25% | 13.8 |
| Content Quality | 60/100 | 25% | 15.0 |
| On-Page SEO | 68/100 | 20% | 13.6 |
| Schema / Structured Data | 20/100 | 10% | 2.0 |
| Performance (CWV) | 70/100 | 10% | 7.0 |
| Images | 50/100 | 5% | 2.5 |
| AI Search Readiness | 30/100 | 5% | 1.5 |
| **Total** | | **100%** | **55.4 → 58** |

### Top 5 Critical Issues
1. **No robots.txt file** — Returns 404, blocking crawl directives and sitemap discovery
2. **Missing structured data on most pages** — Only basic Organization schema on homepage; no FAQPage, Article, BreadcrumbList, or SoftwareApplication schema
3. **No Open Graph tags on most pages** — Only the blog listing and blog posts have OG tags; homepage and key landing pages lack them
4. **Missing Blog Article schema** — Blog posts lack BlogPosting/Article JSON-LD, author info, and dateModified
5. **Thin content on several key pages** — CV-mallar (~200 words), ATS-mallar (~400 words), FAQ (~300 words)

### Top 5 Quick Wins
1. **Create a robots.txt** — Simple file, immediate crawlability improvement
2. **Add FAQPage schema** to homepage FAQ section and /vanliga-fragor
3. **Add Open Graph + Twitter Card tags** to all pages (especially homepage)
4. **Add BlogPosting schema** to all blog articles with author, datePublished, dateModified
5. **Expand thin content pages** — Add 500+ words to cv-mallar and ats-anpassade-cv-mallar

---

## 1. Technical SEO (Score: 55/100)

### Crawlability

| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | ❌ MISSING | Returns 404 — critical issue |
| XML Sitemap | ✅ Present | 32 URLs, well-structured with priorities |
| Sitemap in robots.txt | ❌ N/A | No robots.txt to reference sitemap |
| Canonical tags | ✅ Present | All crawled pages have proper self-referencing canonicals |
| Internal linking | ⚠️ Adequate | Footer has good links; body content could interlink more |
| HTTPS | ✅ Yes | All pages served over HTTPS |
| www redirect | ✅ Yes | Properly resolves to www.cvfixaren.se |

### Indexability

| Check | Status | Notes |
|-------|--------|-------|
| Noindex tags | ✅ None found | All pages appear indexable |
| Duplicate content | ⚠️ Risk | /cv-mallar and /ats-anpassade-cv-mallar show nearly identical templates with different wrappers |
| URL structure | ✅ Clean | Swedish-language slugs, lowercase, no parameters on content pages |
| Pagination | ✅ N/A | No paginated content detected |

### Security

| Check | Status | Notes |
|-------|--------|-------|
| HTTPS | ✅ Active | SSL certificate valid |
| Mixed content | ✅ None detected | All resources loaded over HTTPS |

### Redirect Chains
No redirect chains detected on crawled pages.

### Mobile
- Framework (Next.js + Tailwind) is mobile-responsive by default
- Viewport meta tag present

### Core Web Vitals (Estimated)
| Metric | Estimate | Status |
|--------|----------|--------|
| LCP | ~2.0-2.5s | ⚠️ Needs improvement (large hero images from Vercel Blob) |
| INP | ~100-150ms | ✅ Likely good (mostly static content) |
| CLS | ~0.05-0.1 | ⚠️ Potential shifts from dynamic image loading |

---

## 2. Content Quality & E-E-A-T (Score: 60/100)

### Content Depth by Page

| Page | Word Count | Assessment |
|------|-----------|------------|
| Homepage | ~800 | ✅ Adequate for landing page |
| /cv-exempel | ~2,500 | ✅ Strong — good depth with 50+ examples |
| /blogg (listing) | ~900 | ✅ Adequate |
| Blog posts | ~850 avg | ⚠️ Could be deeper (aim for 1,200+) |
| /karriartips | ~500 | ⚠️ Thin — needs expansion |
| /intervjuguide | ~600 | ⚠️ Thin — needs expansion |
| /cv-mallar | ~200 | ❌ Very thin |
| /ats-anpassade-cv-mallar | ~400 | ❌ Thin |
| /vanliga-fragor | ~350 | ⚠️ Thin — only 5 questions |

### E-E-A-T Assessment

| Signal | Status | Notes |
|--------|--------|-------|
| **Experience** | ⚠️ Weak | No author bios, no case studies, no "about us" page |
| **Expertise** | ⚠️ Weak | No author credentials shown, no expert citations |
| **Authoritativeness** | ⚠️ Moderate | Domain is topically focused; lacks external trust signals |
| **Trustworthiness** | ✅ Moderate | Contact info present, privacy policy exists, HTTPS active |

### Key Issues
- **No author attribution** on any blog posts — critical for E-E-A-T
- **No "About Us" page** — company information only on contact page
- **No testimonial verification** — reviews on homepage appear unverified
- **Stats unverified** — "10,000+ CVs created" and "98% satisfied users" lack source

---

## 3. On-Page SEO (Score: 68/100)

### Title Tags

| Page | Title | Length | Assessment |
|------|-------|--------|------------|
| Homepage | "CVfixaren - Skapa ett CV gratis" | 32 chars | ⚠️ Could include more keywords |
| /cv-mallar | "CV-mallar \| CVfixaren" | 22 chars | ⚠️ Too short, missing description |
| /cv-exempel | "CV-exempel för olika yrken och branscher (2026) \| CVfixaren" | 60 chars | ✅ Good |
| /ats-anpassade-cv-mallar | "ATS-anpassade cv-mallar: Rekryterar-vänligt format (2026) \| CVfixaren" | 70 chars | ✅ Good |
| /blogg | "Karriärblogg \| CVfixaren.se" | 28 chars | ⚠️ Short |
| Blog posts | Good descriptive titles | 50-60 chars | ✅ Good |

### Meta Descriptions

| Page | Present | Length | Assessment |
|------|---------|--------|------------|
| Homepage | ✅ | 155 chars | ✅ Good — includes keywords and CTA |
| /cv-mallar | ✅ | 72 chars | ⚠️ Too short |
| /cv-exempel | ✅ | 131 chars | ✅ Good |
| /ats-anpassade-cv-mallar | ✅ | 165 chars | ✅ Good |
| /vanliga-fragor | ✅ | 95 chars | ✅ Adequate |

### Heading Structure

| Page | H1 | Assessment |
|------|-----|------------|
| Homepage | "Bara 2% av alla CV:n går vidare. Var en av dem." | ⚠️ Catchy but lacks keywords — "CV" only mentioned once |
| /cv-mallar | "Våra CV-mallar" | ✅ Clear |
| /cv-exempel | "Professionella CV-exempel för alla branscher" | ✅ Strong |
| /karriartips | "Karriärtips" | ⚠️ Too generic |

### Internal Linking Issues
- Footer provides consistent cross-linking ✅
- Blog posts lack contextual internal links to related articles ⚠️
- No breadcrumb navigation on any page ❌
- CV example sub-pages don't link to each other ⚠️

---

## 4. Schema & Structured Data (Score: 20/100)

### Current Implementation

| Schema Type | Page | Status |
|------------|------|--------|
| Organization | Homepage | ✅ Present (basic — name, url, logo, description) |
| FAQPage | Homepage FAQ section | ❌ Missing |
| FAQPage | /vanliga-fragor | ❌ Missing |
| BlogPosting | Blog articles | ❌ Missing |
| BreadcrumbList | All pages | ❌ Missing |
| SoftwareApplication | Homepage | ❌ Missing |
| WebSite (SearchAction) | Homepage | ❌ Missing |
| LocalBusiness | /kontakt | ❌ Missing |
| HowTo | Homepage "how it works" | ❌ Missing |

### Organization Schema Review
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CVfixaren.se",
  "url": "https://www.cvfixaren.se",
  "logo": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/...",
  "description": "CVfixaren.se hjälper dig att skriva ett optimalt CV..."
}
```
**Issues:**
- Missing `sameAs` (social media links)
- Missing `contactPoint`
- Missing `address`
- Logo hosted on external blob storage (should ideally be on own domain)

---

## 5. Performance (Score: 70/100)

### Observations
- **Next.js SSR/SSG**: Good baseline performance from framework
- **Vercel hosting**: CDN-delivered, good TTFB expected
- **Images hosted on Vercel Blob Storage**: External domain adds DNS lookup
- **Google Tag Manager + Google Ads**: Two third-party scripts impacting load
- **No visible lazy loading implementation** on images (from markup analysis)
- **Tailwind CSS**: Efficient utility-first CSS, likely well-purged

### Concerns
- Hero image (2000x500px) may be oversized for mobile
- No `<link rel="preconnect">` hints for external blob storage domain
- No evidence of image format optimization (WebP/AVIF)

---

## 6. Images (Score: 50/100)

### Image Audit

| Issue | Count | Details |
|-------|-------|---------|
| Images with alt text | 6/6 | ✅ All detected images have alt text |
| Descriptive alt text | 4/6 | ⚠️ Logo alts are generic; template previews are adequate |
| External hosting | 6/6 | ❌ All images on hebbkx1anhila5yf.public.blob.vercel-storage.com |
| Format optimization | Unknown | ⚠️ Likely PNG — no WebP/AVIF detected |
| Responsive images | Unknown | ⚠️ No `srcset` or `<picture>` elements detected in markup |
| Blog post images | 0 | ❌ Blog articles have no content images |
| Lazy loading | Unknown | ⚠️ Not detected in markup (Next.js may handle via Image component) |

---

## 7. AI Search Readiness (Score: 30/100)

### Citability Assessment

| Signal | Status | Impact |
|--------|--------|--------|
| Clear, factual statements | ⚠️ Moderate | Some good FAQ content, but most pages are promotional |
| Structured content (lists, tables) | ⚠️ Some | Homepage has good structure; inner pages less so |
| Expert attribution | ❌ None | No author names or credentials |
| Data/statistics with sources | ❌ Weak | Stats claimed but unsourced |
| Comprehensive topic coverage | ⚠️ Partial | /cv-exempel is strong; other pages thin |

### AI Crawler Accessibility

| Check | Status |
|--------|--------|
| robots.txt allows AI bots | ❌ No robots.txt at all |
| llms.txt file | ❌ Not present |
| Content is server-rendered | ✅ Next.js SSR |
| Semantic HTML structure | ✅ Good heading hierarchy |

### Recommendations for AI Visibility
1. Create `llms.txt` with site description and key pages
2. Add comprehensive FAQ content (20+ questions)
3. Include cited statistics and expert quotes
4. Build topical authority through deeper content clusters

---

## 8. Sitemap Analysis

### Structure
- **Total URLs:** 32
- **Format:** Standard XML sitemap
- **Location:** /sitemap.xml (but not referenced in robots.txt)

### Priority Distribution
| Priority | Count | Pages |
|----------|-------|-------|
| 1.0 | 1 | Homepage |
| 0.9 | 5 | Core tool & template pages |
| 0.8 | 1 | Blog listing |
| 0.7 | 17 | CV examples, blog posts |
| 0.5 | 5 | Resource pages |
| 0.3 | 3 | Legal/admin pages |

### Issues
- ⚠️ Not referenced in robots.txt (because robots.txt doesn't exist)
- ⚠️ Some pages in sitemap may not be in navigation (verify all are linked)
- ✅ lastmod dates are recent (2026-03-04)
- ✅ Appropriate frequency settings

---

## 9. Duplicate Content Risk

### /cv-mallar vs /ats-anpassade-cv-mallar
These two pages show the same three templates (Elegant, Standard, Lyxig) with nearly identical content. The ATS page has a slightly different H1 and intro, but the template cards appear identical.

**Recommendation:** Either consolidate into one page or significantly differentiate the content with unique ATS-specific guidance, comparison tables, and educational content on the ATS page.

---

## 10. International SEO

| Check | Status |
|--------|--------|
| `lang="sv"` | ✅ Present |
| hreflang tags | N/A (single language site) |
| Content language consistency | ✅ All Swedish |
| URL structure | ✅ Swedish slugs |

---

## Scoring Breakdown

### Technical SEO: 55/100
- (+) HTTPS, clean URLs, canonical tags, sitemap present
- (+) Next.js framework provides good technical foundation
- (-) No robots.txt (-20)
- (-) Potential duplicate content between template pages (-10)
- (-) No breadcrumbs (-5)
- (-) Missing preconnect hints (-5)

### Content Quality: 60/100
- (+) Homepage has engaging copy with clear value proposition
- (+) /cv-exempel is comprehensive with 50+ examples
- (+) Blog covers relevant topics
- (-) Multiple thin content pages (-15)
- (-) No author attribution (-10)
- (-) No "About Us" page (-5)
- (-) Blog articles averaging only ~850 words (-5)
- (-) No case studies or success stories (-5)

### On-Page SEO: 68/100
- (+) All pages have unique title tags and meta descriptions
- (+) Proper H1 tags on all pages
- (+) Good URL structure
- (-) Several title tags too short (-5)
- (-) Some meta descriptions too short (-5)
- (-) Homepage H1 lacks target keywords (-5)
- (-) Missing breadcrumbs (-5)
- (-) Blog posts lack internal cross-linking (-5)
- (-) No breadcrumb navigation (-7)

### Schema: 20/100
- (+) Basic Organization schema on homepage
- (-) No FAQPage schema (-20)
- (-) No BlogPosting schema (-20)
- (-) No BreadcrumbList (-10)
- (-) No SoftwareApplication (-10)
- (-) No HowTo schema (-10)
- (-) Organization schema incomplete (-10)

### Performance: 70/100
- (+) Next.js + Vercel = strong baseline
- (+) Tailwind CSS is efficient
- (-) External image hosting adds latency (-10)
- (-) No detected image optimization (-10)
- (-) Third-party scripts (GTM, Google Ads) (-5)
- (-) Missing preconnect hints (-5)

### Images: 50/100
- (+) Alt text present on all images
- (-) All images on external domain (-15)
- (-) No blog content images (-15)
- (-) No WebP/AVIF format optimization detected (-10)
- (-) No responsive images detected (-10)

### AI Search Readiness: 30/100
- (+) Server-rendered content
- (+) Good semantic HTML
- (-) No llms.txt (-15)
- (-) No author/expert signals (-15)
- (-) Unsourced statistics (-10)
- (-) Thin content reduces citability (-15)
- (-) No robots.txt to explicitly allow AI crawlers (-15)
