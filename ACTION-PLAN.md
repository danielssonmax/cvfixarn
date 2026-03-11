# SEO Action Plan: CVfixaren.se

**Generated:** 2026-03-11
**Current Score:** 58/100
**Target Score:** 80+/100

---

## 🔴 Critical (Fix Immediately)

### 1. Create robots.txt
**Impact:** Crawlability + Sitemap discovery
**Effort:** 5 minutes

```txt
User-agent: *
Allow: /

Sitemap: https://www.cvfixaren.se/sitemap.xml
```

Add as `public/robots.txt` in your Next.js project, or configure via `next.config.js`.

---

### 2. Add FAQPage Schema to Homepage & /vanliga-fragor
**Impact:** Rich results in Google (FAQ dropdowns)
**Effort:** 30 minutes

Add JSON-LD to the homepage FAQ section and the dedicated FAQ page:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Hur långt bör mitt CV vara?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

---

### 3. Add BlogPosting Schema to All Blog Articles
**Impact:** Rich results (article snippets, author info)
**Effort:** 1 hour (template-level change)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article title",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2026-02-10",
  "dateModified": "2026-02-10",
  "publisher": {
    "@type": "Organization",
    "name": "CVfixaren.se",
    "logo": { "@type": "ImageObject", "url": "..." }
  },
  "image": "...",
  "description": "..."
}
```

---

### 4. Add Open Graph & Twitter Card Tags to All Pages
**Impact:** Social sharing appearance, link previews
**Effort:** 1 hour (template-level change)

Currently only blog pages have OG tags. Add to all pages:

```html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://www.cvfixaren.se/og-image.png" />
<meta property="og:url" content="https://www.cvfixaren.se/page-url" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

---

### 5. Resolve Duplicate Content: /cv-mallar vs /ats-anpassade-cv-mallar
**Impact:** Avoid keyword cannibalization
**Effort:** 2-3 hours

**Options:**
- **Option A:** Merge into single page with ATS section
- **Option B:** Significantly expand /ats-anpassade-cv-mallar with unique ATS education content (what ATS is, how it works, tips for passing ATS, comparison table)

---

## 🟠 High Priority (Fix Within 1 Week)

### 6. Add Author Attribution to Blog Posts
**Impact:** E-E-A-T signals
**Effort:** 2 hours

- Add author name, photo, and brief bio to each blog post
- Include author in BlogPosting schema
- Create an author/team page

### 7. Create an "About Us" / "Om oss" Page
**Impact:** E-E-A-T, trust signals
**Effort:** 2-3 hours

Include:
- Company story and mission
- Team members with credentials
- Number of users/CVs created (with context)
- Any press mentions or partnerships

### 8. Expand Thin Content Pages
**Impact:** Rankings for target keywords
**Effort:** 4-6 hours

| Page | Current | Target | What to Add |
|------|---------|--------|-------------|
| /cv-mallar | ~200 words | 800+ | Template comparisons, use cases, selection guide |
| /ats-anpassade-cv-mallar | ~400 words | 1,200+ | ATS explanation, tips, success rates |
| /karriartips | ~500 words | 1,500+ | Expand each section, add practical examples |
| /intervjuguide | ~600 words | 1,500+ | More questions, STAR method examples |
| /vanliga-fragor | ~350 words (5 Qs) | 1,500+ (15-20 Qs) | Add pricing, template, technical, and career Qs |

### 9. Add BreadcrumbList Schema
**Impact:** Enhanced SERP appearance
**Effort:** 1 hour (template-level)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Hem", "item": "https://www.cvfixaren.se" },
    { "@type": "ListItem", "position": 2, "name": "CV-mallar", "item": "https://www.cvfixaren.se/cv-mallar" }
  ]
}
```

### 10. Implement Visible Breadcrumb Navigation
**Impact:** UX + internal linking + schema eligibility
**Effort:** 2 hours

Add breadcrumb UI component across all pages (especially blog posts and CV examples).

---

## 🟡 Medium Priority (Fix Within 1 Month)

### 11. Optimize Homepage H1 for Keywords
**Impact:** Primary keyword targeting
**Effort:** 15 minutes

Current: "Bara 2% av alla CV:n går vidare. Var en av dem."
Suggested: "Skapa ett professionellt CV gratis — var en av de 2% som går vidare"

This keeps the marketing hook while including "skapa CV gratis" and "professionellt CV."

### 12. Improve Title Tags
**Impact:** CTR from search results
**Effort:** 30 minutes

| Page | Current | Suggested |
|------|---------|-----------|
| Homepage | "CVfixaren - Skapa ett CV gratis" | "Skapa CV gratis online — Professionella mallar \| CVfixaren" |
| /cv-mallar | "CV-mallar \| CVfixaren" | "Professionella CV-mallar — Välj din design \| CVfixaren" |
| /blogg | "Karriärblogg \| CVfixaren.se" | "CV-tips & karriärråd — Blogg \| CVfixaren" |
| /karriartips | "Karriärtips \| CVfixaren.se" | "Karriärtips för jobbsökande — Guide 2026 \| CVfixaren" |

### 13. Expand Blog Content
**Impact:** Organic traffic, topical authority
**Effort:** Ongoing

- Increase average article length to 1,200-1,500 words
- Add images/illustrations to blog posts
- Add internal links between related articles
- Publish 2-4 new articles per month targeting:
  - "CV tips 2026"
  - "bästa CV-mallar"
  - "hur skriver man ett CV"
  - "personligt brev mall"
  - "arbetsintervju tips"

### 14. Enhance Organization Schema
**Impact:** Knowledge panel, brand SERP
**Effort:** 30 minutes

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CVfixaren.se",
  "url": "https://www.cvfixaren.se",
  "logo": "https://www.cvfixaren.se/logo.png",
  "description": "...",
  "sameAs": ["https://facebook.com/...", "https://instagram.com/..."],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+46-8-123-45-67",
    "contactType": "customer service",
    "availableLanguage": "Swedish"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Storgatan 1",
    "addressLocality": "Stockholm",
    "postalCode": "123 45",
    "addressCountry": "SE"
  }
}
```

### 15. Move Images to Own Domain
**Impact:** Performance, SEO signals
**Effort:** 2-3 hours

Currently all images are on `hebbkx1anhila5yf.public.blob.vercel-storage.com`. Move to:
- `www.cvfixaren.se/images/` or
- `images.cvfixaren.se` (with proper CNAME)

Benefits: Faster DNS, brand consistency, better image SEO signals.

### 16. Add `<link rel="preconnect">` Hints
**Impact:** Performance (LCP improvement)
**Effort:** 10 minutes

```html
<link rel="preconnect" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />
<link rel="preconnect" href="https://www.googletagmanager.com" />
```

### 17. Optimize Images for WebP/AVIF
**Impact:** Page load speed, CWV
**Effort:** 1-2 hours

Use Next.js `<Image>` component with automatic format negotiation, or manually convert and serve WebP with PNG fallback.

---

## 🟢 Low Priority (Backlog)

### 18. Create llms.txt File
**Impact:** AI search visibility
**Effort:** 30 minutes

```
# CVfixaren.se
> CVfixaren.se is a free Swedish CV builder that helps job seekers create professional, ATS-optimized resumes.

## Key Pages
- [Homepage](https://www.cvfixaren.se): Create your CV
- [CV Templates](https://www.cvfixaren.se/cv-mallar): Browse templates
- [CV Examples](https://www.cvfixaren.se/cv-exempel): 50+ profession-specific examples
- [Blog](https://www.cvfixaren.se/blogg): Career tips and CV advice
- [FAQ](https://www.cvfixaren.se/vanliga-fragor): Common questions
```

### 19. Add SoftwareApplication Schema
**Impact:** Potential rich results for software
**Effort:** 20 minutes

### 20. Add HowTo Schema to "Så här fungerar det" Section
**Impact:** Potential rich results
**Effort:** 20 minutes

### 21. Implement Blog Post Cross-Linking
**Impact:** Internal link equity, lower bounce rate
**Effort:** 1-2 hours

Add "Related articles" section to each blog post.

### 22. Add Testimonial/Review Schema
**Impact:** Star ratings in SERPs
**Effort:** 30 minutes

### 23. Create a Comprehensive "Hur skriver man ett CV" Pillar Page
**Impact:** Major keyword, topical authority hub
**Effort:** 4-6 hours

Target the high-volume keyword "hur skriver man ett CV" with a 3,000+ word guide linking to all CV examples, templates, and tips.

### 24. Add Structured Data Testing to CI/CD
**Impact:** Prevent schema regressions
**Effort:** 1-2 hours

---

## Implementation Timeline

| Week | Tasks | Expected Score Impact |
|------|-------|----------------------|
| Week 1 | #1 robots.txt, #2 FAQ schema, #3 Blog schema, #4 OG tags | +10 points |
| Week 2 | #6 Author attribution, #7 About page, #9-10 Breadcrumbs | +5 points |
| Week 3 | #5 Duplicate content, #8 Expand thin pages | +5 points |
| Week 4 | #11-14 On-page optimizations, schema enhancements | +5 points |
| Month 2 | #13 Blog expansion, #15-17 Image/performance | +5 points |
| Month 3 | #18-24 Advanced optimizations | +3 points |

**Projected score after full implementation: 85-90/100**

---

*Report generated by Claude Code SEO Audit*
