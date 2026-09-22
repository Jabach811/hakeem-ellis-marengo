# Hakeem, Ellis & Marengo Website Redesign Specification

Date: September 21, 2026  
Status: Awaiting written-spec approval  
Project type: New static-site implementation based on the current public website

## 1. Objective

Create a complete, maintainable replacement for the current Hakeem, Ellis & Marengo website. The replacement must preserve the firm's useful public content and familiar routes while presenting the firm as an established Stockton institution rather than a generic law-office template.

The site's primary job is to help a prospective client quickly understand:

1. What the firm handles.
2. Why the firm is credible.
3. Which attorney or practice area may fit the matter.
4. How to call, email, or visit the office.

The finished site must work cleanly on phones, avoid fake or unverified contact mechanisms, and remain portable to ordinary static hosting.

## 2. Audience and Positioning

### Primary audiences

- Central Valley business owners and companies needing ongoing corporate or transactional counsel.
- Individuals or organizations involved in civil disputes or litigation.
- Property owners, developers, and businesses dealing with real-estate matters.
- Licensed professionals facing investigations or discipline.
- Individuals and families needing criminal defense, family law, estate planning, probate, or restraining-order representation.

### Positioning

The firm is an established, local, full-service practice with the personal attention of a small firm and experience commonly associated with larger firms.

The visual and written voice will be:

- Established, not old-fashioned.
- Confident, not aggressive for its own sake.
- Local, not folksy.
- Direct, not promotional.
- Reassuring without making outcome guarantees.

## 3. Approved Creative Direction

### Direction name

**Established Stockton Institution**

### Signature idea

The memorable visual moment is a composed opening built around genuine firm or Stockton imagery and the factual message, “Serving the Central Valley since 1985.” A slim “Since 1985” visual spine may accompany the hero on larger screens. The remainder of the site stays quiet and disciplined so this moment carries the identity.

### Things the design must avoid

- Generic scales-of-justice, gavel, handshake, courtroom, or staged-lawyer stock imagery.
- Invented attorney portraits or generated representations of real people.
- Rounded SaaS-style card grids and decorative shadows on every container.
- All-caps labels above every heading.
- Repeated fade-and-slide animations.
- Overheated “fight,” “win,” or “relentless” language where it is not supported or appropriate.
- Decorative legal claims, fabricated testimonials, or unverified awards.

## 4. Information Architecture

All 11 existing practice areas remain individually accessible. The homepage and Practice Areas directory organize them into three understandable paths instead of displaying 11 equal, unrelated tiles.

### Business & Property

- Business Law
- Corporate Law
- Real Estate

### Disputes & Defense

- Civil Law
- Civil Litigation
- Criminal Defense
- Professional License Defense
- Restraining Orders

### Families & Estates

- Family Law
- Estate Planning
- Probate

This grouping is navigational only. It does not merge or remove the individual practice pages.

## 5. Route Plan

### Primary routes

- `/`
- `/practice-areas/`
- `/about/`
- `/contact/`
- `/accessibility/`
- `/business-law/`
- `/civil-law/`
- `/civil-litigation/`
- `/corporate-law/`
- `/criminal-defense/`
- `/estate-planning/`
- `/family-law/`
- `/probate/`
- `/professional-license-defense/`
- `/real-estate/`
- `/restraining-orders/`
- `/404.html`

### Legacy compatibility

The build must preserve or redirect the current public paths, including:

- `/services` to `/practice-areas/`
- `/about-us-page---freddie` to `/about/`
- `/professions-discipline-by-licensing-agencies` to `/professional-license-defense/`
- `/conservatorship-and-guardianship` to `/criminal-defense/`, because the current homepage incorrectly uses that route for Criminal Defense

Where the hosting platform cannot perform redirects, the build will generate lightweight compatibility pages with canonical links and immediate accessible navigation to the new route.

## 6. Page Specifications

### Homepage

1. Utility line with phone number, office location, and office hours.
2. Primary masthead with firm wordmark, navigation, and a visible “Call the office” action.
3. Hero with real firm imagery, “Serving the Central Valley since 1985,” a concise firm promise, a telephone action, and an “Explore practice areas” link.
4. Proof band for longevity, business clients, and clients served. The current “40+ years,” “300+ companies,” and “14,000+ clients” claims remain development content but must be confirmed by the firm before public release.
5. Three practice pathways with all 11 practices visible or reachable without a hidden interaction.
6. Firm distinction section explaining local depth, personal attention, practical counsel, and litigation capability.
7. Attorney introduction section for Michael D. Hakeem, Albert M. Ellis, Renee M. Marengo, and Stephen J. Baker.
8. Short firm-history section rooted in Stockton and the 1985 founding.
9. Contact panel with phone, email, hours, address, and directions.
10. Footer with disclaimer, accessibility, privacy, terms, and copyright.

### Practice Areas directory

- Introduces the firm's range without treating every matter as identical.
- Uses the three approved groupings.
- Includes concise, plain-language descriptions and links to every practice page.
- Provides a persistent phone action without covering page content.

### Practice detail template

Every practice page includes:

1. Practice title and short plain-language introduction.
2. A compact list of the matters handled.
3. Existing substantive content reorganized into clear sections with readable line length.
4. Relevant attorney names only where the public bios support that association.
5. Related practice links.
6. A contextual call-to-action using the office phone number.
7. The site-wide legal-information disclaimer.

The current content will be edited for grammar, duplication, tone, and readability. Legal meaning will not be expanded or changed. Any materially rewritten legal statement must be marked for firm review before publication.

### About

- Firm story and founding in Stockton in 1985.
- Mission and operating values.
- Four clear attorney profile sections with credentials, admissions, experience, and practice focus.
- Long biographies are divided into summary, experience, education/admissions, professional service, and selected matters where present.
- Birth dates will not be displayed because they do not help a prospective client evaluate representation.
- The layout must work without portraits. If the firm supplies approved portraits later, the component will accept them without structural redesign.

### Contact

- Telephone: `(209) 474-2800`
- Email: `info@hemlaw.com`
- Fax: `(209) 474-3654`
- Address: `3414 Brookside Rd. Ste 100, Stockton, CA 95219`
- Hours: Monday–Friday, 9:00 a.m.–5:00 p.m.
- Clear call, email, and directions actions.
- No contact form in the initial release. This prevents a static form from implying secure legal intake or silently failing.
- A short notice explains that contacting the firm does not by itself create an attorney-client relationship.

### Accessibility

- Replace the vendor-widget-focused page with a plain statement of the firm's accessibility commitment.
- Include the office phone and email as support contacts.
- Do not claim automated compliance or guaranteed conformance.
- Include the page's last-updated date.

### Privacy and terms

The current site sends these links to Broad Proximity documents. The replacement will not silently copy or invent legal policies. Until the firm supplies or approves local policies, preview builds will retain clearly labeled links to the currently published documents. Public launch requires an explicit decision to keep those links or replace them with approved local pages.

## 7. Design System

The system uses three token layers: primitive values, semantic purposes, and component-specific rules. Components must not contain unexplained raw colors, spacing, or typography values.

### Primitive colors

- Heritage burgundy: `#6D1118`
- Deep wine: `#3E080D`
- Courtroom ink: `#1A1C20`
- Paper: `#F7F3EA`
- Limestone: `#D8D0C4`
- Slate: `#565C64`
- Restrained brass: `#9B6A33`
- White: `#FFFFFF`

Brass is decorative and may not be used for small body text on light backgrounds.

### Semantic color roles

- Primary action: heritage burgundy.
- Primary action hover/active: deep wine.
- Page background: paper or white.
- Dark section background: courtroom ink.
- Primary text: courtroom ink.
- Secondary text: slate, only where contrast meets WCAG requirements.
- Border and divider: limestone.
- Focus ring: a high-contrast burgundy/white combination appropriate to the surface.

### Typography

- Display and editorial headings: `Newsreader`, serif fallback.
- Body, navigation, labels, and interface copy: `Source Sans 3`, system sans-serif fallback.
- Body copy: 1rem to 1.125rem depending on context, with generous line height.
- Long-form measure: no more than 68 characters per line.
- Hero heading: responsive clamp with a practical maximum near 5.5rem.
- Headings use sentence or title case. Navigation and labels do not use artificial tracking or mandatory all caps.

### Spacing and layout

- 4px base unit with a documented scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128px.
- 12-column desktop grid with a maximum content width of 1200px.
- Content collapses to a single-column reading flow on phones.
- Section spacing scales down intentionally rather than merely shrinking desktop values.
- Corners are square or subtly softened at 2px. Pills are reserved for true status labels and are not part of the main visual language.
- Shadows are limited to overlays such as the mobile navigation drawer.

### Motion

- One restrained hero entrance may combine opacity and transform.
- Navigation drawer and disclosure controls use short, interruptible motion.
- No automatic section-by-section scroll reveal.
- All motion honors `prefers-reduced-motion`.
- Animation uses opacity and transforms rather than layout properties.

## 8. Core Components

- Utility bar
- Masthead and desktop navigation
- Mobile navigation drawer
- Wordmark lockup
- Primary, secondary, and text-link actions
- Hero composition
- Proof band
- Practice group and practice link
- Attorney profile summary
- Biography detail block
- Page introduction
- Long-form content section
- Related practices list
- Contact panel
- Directions link
- Legal disclaimer
- Footer
- Mobile call action
- Accessible disclosure component where content genuinely benefits from expansion
- 404 page guidance

Every interactive component requires default, hover, active, focus-visible, and disabled states where applicable. Navigation actions use links; page actions use buttons only when they perform an in-page action.

## 9. Content and Asset Rules

- The current public site is the starting content source, not an unquestioned source of truth.
- Preserve real firm history, attorney credentials, contact information, practice coverage, and legal disclaimers.
- Remove template leftovers, empty headings, “Button” labels, fake phone numbers, placeholder email addresses, and vendor branding.
- Replace repetitive SEO language with clear client-centered copy while retaining meaningful search terms naturally.
- Use existing real office/building imagery if it is confirmed as firm-controlled and visually suitable.
- Do not reuse generic legal stock images unless a license record is available and the image materially supports the page.
- Do not create synthetic portraits of the attorneys.
- All images require useful alt text, explicit dimensions, and appropriate loading priority.
- Social links appear only after their destination is verified as an official firm profile.

## 10. Technical Architecture

The replacement will be a dependency-light, generated static site. It will not require a client-side application framework or server database.

### Proposed structure

```text
src/
  assets/
    css/
      tokens.css
      components.css
      pages.css
    fonts/
    images/
    js/
      site.js
  content/
    about/
    practices/
  data/
    site.json
    practices.json
    routes.json
  templates/
    components/
    layout.mjs
tools/
  build-site.mjs
  validate-site.mjs
dist/
docs/
  superpowers/
    specs/
```

### Build flow

1. Structured site and route data provides names, descriptions, contact details, metadata, and relationships.
2. Content fragments provide long-form practice and biography copy.
3. Shared templates render the masthead, navigation, page structures, contact panels, disclaimers, and footer.
4. A Node.js build script writes complete HTML pages to `dist/`.
5. A validation script checks required pages, internal links, assets, headings, metadata, and contact URLs.

The generated HTML contains complete navigation and content. JavaScript enhances the mobile menu and optional disclosures but is not required to read the site or follow primary links.

## 11. Failure Handling

- The build stops if required contact information, a route, a page title, or a referenced asset is missing.
- The validator reports broken internal links, placeholder values, duplicate IDs, missing alt text, missing image dimensions, and malformed telephone or email links.
- The 404 page explains that the page moved and offers Home, Practice Areas, Contact, and Call actions.
- If JavaScript fails, primary navigation and page content remain usable.
- No form can fail silently because the first release includes no form submission.

## 12. Accessibility and Responsive Requirements

- Semantic landmarks and one clear primary heading per page.
- Skip link to main content.
- Keyboard-operable navigation and disclosures.
- Visible `:focus-visible` states.
- Minimum WCAG AA contrast for text and interface components.
- Touch targets sized for phone use.
- No horizontal scrolling at 320px and wider.
- Sticky or fixed actions may not cover content or focused elements.
- Meaningful images have accurate alt text; decorative images have empty alt text.
- Reduced-motion behavior is verified.
- Phone numbers, email addresses, and directions remain usable without JavaScript.

## 13. Verification Plan

### Automated checks

- Build completes without warnings.
- All planned routes and legacy compatibility routes exist.
- No placeholder phone numbers, emails, headings, or button labels remain.
- No broken internal links or missing local assets.
- Every page has a unique title, description, canonical URL, and primary heading.
- Images have alt text rules, width, and height.
- Telephone links use `(209) 474-2800`; email links use `info@hemlaw.com`.

### Browser checks

- Home, Practice Areas, About, Contact, Accessibility, and every individual practice page.
- Desktop width near 1440px.
- Tablet widths near 768px and 1024px.
- Phone widths at 320px, 390px, and 430px.
- Keyboard navigation, focus order, menu behavior, and Escape handling.
- Reduced-motion mode.
- No content clipping, sideways scrolling, or fixed-element obstruction.
- Images load, navigation routes correctly, and contact actions use the intended destinations.

## 14. Release Boundaries

The first release includes the complete static public experience described above. It does not include:

- Client accounts or portals.
- Chat or automated legal advice.
- Online payments.
- Appointment booking.
- Form submission or case intake.
- Generated testimonials, reviews, awards, or attorney imagery.

Before any public launch, the firm must confirm numeric proof claims, attorney biographies, practice descriptions, privacy/terms handling, imagery rights, official social profiles, and final legal wording. Development previews remain private until that review is complete.

## 15. Completion Criteria

The project is complete when:

- The approved design system is implemented consistently.
- All planned and legacy routes work.
- All 11 practice areas, four attorney biographies, contact details, firm history, accessibility content, and disclaimer material are present.
- The site passes the automated and browser checks above.
- The phone experience has no horizontal overflow or content obstruction.
- No fake, placeholder, broken, or unverified public-facing contact detail remains.
- The result can be deployed as ordinary static files and maintained from shared data and templates.
