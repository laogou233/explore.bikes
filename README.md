# Brand website MVP

An independent lifestyle and clothing brand shaped by Freedom / Explore / Everyday / Culture.

Independent spirit. Everyday exploration. Go your own way. Made for ordinary days, unexpected places, and wherever you decide to go next.

The brand philosophy remains: 自由自在，向喜欢的方向出发。Keep the language brief, concrete, and editorial, with room for travel, everyday culture, and personal curiosity. Past influences belong to the brand's story without defining its audience or its future.

This static site presents DROP 001 / COASTAL: Coastal Tee, Coastal Hoodie, and Freedom Jersey. Open `index.html` to browse the drop. Each piece has its own detail page with a full view, a cropped close-up, visible garment features, and size preferences. Freedom Jersey and all existing artwork remain available as design previews.

The brand identity is separate from the current product-preview status. Selections are saved in the visitor's browser using `localStorage`; they can be reviewed and copied, but are not sent or paid for.

Product images in `assets/` are generated design previews based on the brand graphics. Prices, inventory, final sizing, garment specifications, and a real order destination are not yet configured.

The home-page coastal video and poster are adapted from [Mixkit's palm-lined beach aerial](https://mixkit.co/free-stock-video/aerial-shot-of-a-beach-next-to-a-forest-of-44365/) under the [Mixkit Stock Video Free License](https://mixkit.co/license/modal/videoFree/). The short, muted loop pauses when it leaves the viewport; reduced-motion and data-saving visitors see the poster instead.

The homepage and Story page use `campaign.css`: a white, image-led layout with a full-width coastal film, a three-piece collection, and long-form brand sections. Scroll reveals respect reduced-motion preferences and all content remains available without JavaScript.

`assets/coastal-path-editorial.webp` is generated editorial imagery, not documentation of a brand trip or a product shoot. It was created with the built-in image generation tool and optimized to WebP. The full prompt is recorded in `assets/coastal-path-prompt.txt`.

The generated tee styling image (`assets/coastal-tee-campaign.webp`) follows the existing tee graphic and remains a design preview. Journal imagery (`assets/journal-music.webp` and `assets/journal-objects.webp`) illustrates upcoming topics. These images are not records of published stories or confirmed product samples. Their prompts are in `assets/generated-prompts.md`.

The public sitemap is `sitemap.xml`; `site-map.html` is the navigable map for visitors. Update canonical URLs and the sitemap if the site moves from its GitHub Pages address to a custom domain.

The main navigation connects Shop (`index.html#collection`), Journal, Story, Archive, and My Picks (`picks.html`). Site map lives in the footer. No contact information is displayed until a real contact is provided.

`story.html` describes the brand's outlook; `journal.html` holds three explicitly unpublished editorial previews; `archive.html` preserves existing graphics connected to bicycle culture. These pages share `style.css` and use the scoped `editorial.css` for their layouts. Both public sitemaps exclude the private browser selection and the error page (`picks.html`, `order.html`, `404.html`); those pages retain `noindex`.


## MVP handoff

The active display name is a **temporary Explore placeholder**, not a final naming decision. Edit `brand.json`, then run `node scripts/sync-brand.cjs`. This synchronizes marked static HTML fields and generates `brand.js` for the copied My Picks summary. Run `node scripts/sync-brand.cjs --check` to detect drift. See `BRAND_REPLACEMENT_MAP.md` for artwork, URLs, and remaining naming decisions.

`picks.html` is a browser-only personal list. `order.html` redirects to it, preserving old bookmarks. The existing `explore-bike-order-draft-v1` storage key and internal `order-*` / `data-cart-*` hooks remain for compatibility; do not rename the storage key without a migration. Quantities are limited to 1–99 for each product/size. Nothing is submitted, reserved, or paid for.

The website stays buildless. Deploy the static site files with `assets/`, `brand.js`, `script.js`, `shop.js`, `style.css`, `editorial.css`, and `campaign.css`. `brand.json` and its synchronization tool are only needed when changing the display name. Original PNG artwork is retained; pages serve optimized WebP previews. The favicon reuses the existing orange brand mark.

## Local QA

From the repository folder, `python3 qa/serve.py` starts a static preview at `http://127.0.0.1:8766/` and simulates the project's nested 404 handling. This server is for development only; the website has no backend. `Ctrl+C` stops it.

With Node, Playwright, and Chrome available, run:

```sh
QA_URL=http://127.0.0.1:8766/ node qa/verify.cjs
QA_URL=http://127.0.0.1:8766/ node qa/edge-cases.cjs
QA_URL=http://127.0.0.1:8766/ node qa/campaign.cjs
node scripts/sync-brand.cjs --check
```

The browser tests use an isolated profile with synthetic picks. They do not edit a visitor's existing saved data. Results and screenshots are in `qa/evidence/`; the handoff is `MVP_QA_REPORT.md`. `qa/` and the documentation need not be included in a production deployment.
