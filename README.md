# Eddie Yang · Portfolio

Live at **[edyang1.github.io/portfolio](https://edyang1.github.io/portfolio/)**. Hand-written HTML, CSS and JavaScript with no frameworks and no build step. GitHub Pages serves `main` as-is.

## Structure

```
index.html                 Home
projects/ skills/ writing/ Each has a hub page (projects.html, …) plus one page per article
404.html                   Custom not-found page (see the note below)
css/main.css               The whole design system: tokens, components, pages, motion
js/site.js                 Every page: theme toggle, nav, mobile menu, footer, reveals, filters, easter egg
js/home.js                 Home only: typing headline, hero tilt, stat counters
js/article.js              Articles only: table of contents, reading progress, image lightbox
js/analytics.js            Google Analytics; the measurement ID lives here and nowhere else
images/                    WebP at 800px and 1600px wide; icons.svg is the icon sprite; og/ holds link-preview cards
extras/                    Résumé, manuscript PDF, and template.html for new articles
```

## Editing

- **Colors and fonts** are CSS custom properties at the top of `css/main.css`. Dark ("dusk") and light ("dawn") themes each get a block.
- **Footer, mobile menu and social links** live in `js/site.js` (`SOCIAL`, `PAGES`), so they are edited in one place.
- **New article:** copy `extras/template.html`. The comment at its top walks through the steps.
- **404 page:** it uses `<base href="/portfolio/">` so its links work from any missing URL. If the site moves to a custom domain, change that one line.

## Preview locally

```bash
python -m http.server 8420
```

Then open <http://localhost:8420>. Analytics is skipped on localhost.

## Easter eggs

Click the rotating word in the hero. Or try the Konami code, or just type "banana".

---

**Copyright © 2024–2026 Eddie Yang**

All works and writings showcased in this portfolio are my original creations. While many remain unpublished, they are protected under U.S. copyright law from the moment of creation. Unauthorized use, reproduction, or distribution of these materials without proper credit constitutes plagiarism and copyright infringement. Proof of authorship and ownership can be provided upon request. Thank you for respecting intellectual property rights. Happy reading!
