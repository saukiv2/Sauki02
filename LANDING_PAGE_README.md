# Landing Page Documentation

## Overview

The SaukiMart landing page is built with Apple.com-level polish and attention to detail. It's a fully responsive, modern landing page designed to convert visitors into users.

**Live at**: `/` (root) and `/landing`

---

## Page Structure

The landing page consists of 8 main sections, each with its own component:

### 1. **Navbar** (`navbar.tsx`)
- Sticky navigation with backdrop-blur on scroll
- Responsive mobile menu with hamburger toggle
- Logo, navigation links (Services, How It Works, Contact)
- Sign In CTA button
- Auto-hides mobile menu when navigating

**Features**:
- Smooth scroll detection
- Mobile overlay menu (full-screen)
- Smooth transitions between states

### 2. **Hero Section** (`hero-section.tsx`)
- Full viewport height
- Gradient background with subtle blob animation
- Main headline: "Nigeria's Smart Financial Platform"
- Subheadline with value proposition
- Dual CTA buttons: "Get Started" + "See How It Works"
- Trust indicators at bottom

**Design**:
- Playfair Display headline (64-72px)
- Clean white background with blue gradient blob (opacity 0.05)
- Responsive padding and text sizing

### 3. **Services/Features** (`features-section.tsx`)
- 3 service cards: Data Plans, Electricity Bills, Gadgets Store
- Icon, title, description per card
- "Learn more" CTA link on each
- Hover effects with shadow and border color change
- Grid layout: 1 column mobile, 3 columns desktop

**Features**:
- Lucide React icons
- Smooth hover transitions
- Link arrows that animate on hover

### 4. **How It Works** (`how-it-works.tsx`)
- 3 numbered steps with visual circles
- Clean flow visualization
- Connector lines between steps (desktop only)
- Each step has title and description

**Design**:
- Blue circle numbers (1, 2, 3)
- Step cards with white background
- Gradient connector lines (desktop)

### 5. **Wallet Highlight** (`wallet-highlight.tsx`)
- Split layout: Left (mockup) + Right (benefits)
- Wallet card mockup with gradient background
- Interactive card with balance, account number, buttons
- 6 benefit bullets with checkmark icons
- Green CTA button

**Features**:
- 3D-like wallet card mockup
- Hover scale animation on card
- Checkmark icon styling
- Balance display format

### 6. **Agent Program** (`agent-program.tsx`)
- Full-width blue background section
- 3 benefit cards with icons
- Hero headline and subheading
- "Apply Now" CTA
- Semi-transparent card design with backdrop-blur

**Design**:
- Brand blue background
- White semi-transparent cards
- Icons from Lucide React
- Decorative background blurs

### 7. **Download App** (`download-app.tsx`)
- Split layout: Left (phone mockup) + Right (content)
- iPhone-like mockup design
- Feature bullets with emoji icons
- Dual download CTAs (APK + Google Play)

**Features**:
- CSS-only phone mockup (no image)
- Notch and home indicator styling
- Feature list with icons
- Responsive layout

### 8. **CTA Section** (`cta-section.tsx`)
- Full-width gradient blue background
- Main headline + subheading
- Dual CTAs (Create Account + Login)
- Trust badges at bottom
- Decorative background blurs

**Features**:
- Compelling copy for final conversion
- Trust indicators (BVN, Instant, Trusted)
- Animated button scales

### 9. **Footer** (`footer.tsx`)
- 4-column layout (desktop, 1 column mobile)
- Brand section with logo + tagline
- Links: Platform, Legal, Contact
- Contact information (phone, email)
- Social media links (WhatsApp, Twitter, Instagram)
- Copyright year (auto-calculated)

**Features**:
- Logo in white (`logo_white.svg`)
- Responsive grid layout
- Social media icons
- Dynamic copyright year

---

## Component Architecture

```
src/components/landing/
├── navbar.tsx              # Sticky navigation
├── hero-section.tsx        # Hero with CTA
├── features-section.tsx    # Services (3 cards)
├── how-it-works.tsx        # Steps (1, 2, 3)
├── wallet-highlight.tsx    # Split layout (card + benefits)
├── agent-program.tsx       # Blue section with benefits
├── download-app.tsx        # Phone mockup + features
├── cta-section.tsx         # Final call-to-action
└── footer.tsx              # Footer with links
```

---

## Page Entry Points

### Root Page (`/src/app/page.tsx`)
```tsx
- Serves as the main landing page at `/`
- Imports and composes all landing components
- Client-rendered with 'use client'
```

### Landing Page (`/src/app/landing/page.tsx`)
```tsx
- Alternative route at `/landing`
- Identical composition to root page
- For flexibility/SEO purposes
```

---

## Design System

### Colors
- **Brand Blue**: `#0066FF` (`bg-brand-blue`)
- **Gray**: `#6E6E73` (subheadings)
- **White**: `#FFFFFF` (backgrounds)
- **Dark Gray**: `#333333` (headings)

### Typography
- **Headline Font**: Playfair Display (Serif, elegant)
- **Body Font**: Inter (Sans-serif, modern)
- **Sizes**:
  - Hero H1: 64px (mobile) → 72px (desktop)
  - Section H2: 40px (mobile) → 48px (desktop)
  - Body: 16px baseline

### Spacing
- **Section Gap**: `py-20` (80px vertical)
- **Container Padding**: `px-6` (24px horizontal)
- **Max Width**: `max-w-7xl` for content

### Responsive Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `md:` (768px+)
- **Large**: `lg:` (1024px+)

---

## Interactive Features

### Sticky Navbar
- Triggers on scroll > 50px
- Adds `bg-white/80 backdrop-blur-sm` classes
- Mobile menu auto-closes on navigation

### Hover Effects
- Service cards: Border color + shadow change
- CTA buttons: Scale animation (scale-105)
- Links: Arrow emoji animation
- Wallet card: Scale-up on hover

### Smooth Scrolling
- All anchor links use smooth scroll behavior
- Navigation links scroll to sections (#services, #how-it-works, #contact)

---

## Logo Usage

### Logo Files
- **Dark Background**: `/public/logo.svg` (blue background + white text)
- **Light Background**: `/public/logo_white.svg` (white text only)

### Implementation
```tsx
<Image src="/logo.svg" alt="SaukiMart" width={140} height={35} />
```

### Navbar Logo
- Size: 140x35
- Position: Top left in navbar
- Navigation: Links to `/`

### Footer Logo
- Size: 140x35 (same as navbar)
- Color: White version (`logo_white.svg`)
- Below tagline

---

## Call-to-Action Flows

### Get Started (Hero)
**Button**: "Get Started"  
**Link**: `/auth/register`  
**Purpose**: New user signup

### Sign In (Navbar)
**Button**: "Sign In"  
**Link**: `/auth/login`  
**Purpose**: Existing user login

### See How It Works (Hero)
**Button**: "See How It Works"  
**Link**: `#how-it-works`  
**Purpose**: Scroll to How It Works section

### Apply Now (Agent Program)
**Button**: "Apply Now →"  
**Link**: `#contact`  
**Purpose**: Scroll to contact section

### Create Account (Final CTA)
**Button**: "Create Account Now"  
**Link**: `/auth/register`  
**Purpose**: Final conversion attempt

---

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Alt text on all images
- ✅ Color contrast ratios meet WCAG AA
- ✅ Keyboard navigation support
- ✅ Mobile-responsive design
- ✅ Focus states on interactive elements

---

## Performance Optimizations

- ✅ Static page generation (ISR)
- ✅ SVG logos (no image requests)
- ✅ CSS-only phone mockup (no images)
- ✅ Image optimization (Next.js Image component)
- ✅ Minimal CSS bundle (Tailwind purge)

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Development

### Editing Components

To modify a section:

1. Find the component in `/src/components/landing/`
2. Edit the JSX/styling
3. Run `npm run dev` to see live changes
4. Verify responsive design on mobile and desktop

### Adding New Sections

1. Create new component in `/src/components/landing/`
2. Import in `/src/app/page.tsx`
3. Add to component composition
4. Test typing: `npm run type-check`
5. Build: `npm run build`

### Styling

All styling uses Tailwind CSS:
- No inline styles
- No CSS files (Tailwind utilities)
- Responsive classes: `sm:`, `md:`, `lg:`

---

## SEO Considerations

- ✅ Semantic HTML structure
- ✅ Meta tags in layout
- ✅ Open Graph tags for social sharing
- ✅ Mobile-first responsive design
- ✅ Fast Core Web Vitals (static page)

---

## Future Enhancements

- [ ] Add testimonials section (social proof)
- [ ] Add pricing comparison table
- [ ] Add FAQ accordion
- [ ] Add blog or resources section
- [ ] Add video hero section
- [ ] Add newsletter signup
- [ ] Add live chat widget

---

**Last Updated**: After Phase 10
**Status**: Production Ready ✅
