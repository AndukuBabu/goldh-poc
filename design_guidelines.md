# GOLDH Crypto Intelligence Platform - Design Guidelines

## Design Approach
**Reference-Based Approach**: Modern fintech/crypto platform aesthetic combining professional financial interfaces (like Coinbase, Stripe) with accessible beginner-friendly design. Clean, elegant, and FOMO-driven for crypto convention launch.

## Brand Identity & Color System

### Primary Palette
```
Gold Primary: #C7AE6A (primary highlights, CTAs, accent elements)
Soft Gold: #d5c28f (secondary accents, hover states)
Strong Gold: #b99a45 (active states, important highlights)
Off-Gold: #e3d6b4 (subtle backgrounds, dividers)
Dark Background: #1a1a1a (section backgrounds)
Base Black: #000000 (main background)
```

### Color Usage Strategy
- Black backgrounds with gold accents for premium crypto feel
- Gold for all primary CTAs and important highlights
- Dark sections (#1a1a1a) alternate with black (#000000) for depth
- Off-gold for subtle UI elements and borders

## Typography System

### Hierarchy
- **Headlines**: Large, bold, professional fintech aesthetic
- **Body**: Clean, readable, beginner-friendly tone
- **CTAs**: Strong, clear, action-oriented
- **Tone**: Simple language for crypto beginners with FOMO appeal

### Font Families
Use Tailwind default font stack for professional, clean appearance

## Layout System

### Spacing Primitives
Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

### Grid Structure
- Landing hero: Asymmetric two-column (logo left, content right)
- Feature tiles: Card grid layout with consistent spacing
- News feed: Horizontal auto-scroll strip
- Learning hub: Single column with expandable accordions

## Component Library

### Navigation Header
- GOLDH logo integrated visually (not just dropped as image block)
- Smooth-scroll anchor links to page sections
- Consistent across all pages
- Dark background with gold accent on active states

### Hero Section (Landing)
- Two-column layout: Logo left, tagline + CTAs right
- Primary CTA: "Start Free" (gold button)
- Secondary CTA: "Learn More" (outlined gold)
- Smooth scroll behavior, no jumps

### FOMO Content Boxes
- "GOLDH Token Launching Soon": Prominent gold-bordered card with teaser copy
- "Early User Status": Benefits banner with exclusive perks messaging
- Dark backgrounds with gold accents for premium feel

### Feature Tiles
- Simple card grid layout
- Icon or visual element at top
- Short headline + description
- Beginner-friendly copy
- Gold accent on hover

### Auto-Scrolling News Feed
- Horizontal scrolling strip of crypto headlines
- Clickable headline links
- Seamless loop animation
- Dark background with gold text highlights

### Sign-In Component
- Email + password fields
- Magic link option (secondary)
- Optional MetaMask wallet connection
- Clear messaging: wallet connection is optional
- Premium badge indicator for 5000+ GOLDH tokens

### Dashboard Layout
- Protected/gated access
- "GOLDH Features Coming Soon" teaser (FOMO style)
- Crypto news feed section
- Premium badge display for qualified wallets
- No token claiming or address display sections

### Learning Hub (/learn)
- Search bar at top for term lookup
- Accordion-style topic sections
- Auto-scroll and expand on search selection
- Topics: Blockchain, Wallets, Airdrops, Tokens, Staking, TVL, APY, Smart Contracts, BSC, GOLDH platform
- Non-technical, welcoming tone
- "You might also like" cross-links between related topics

## Interactive Elements

### Buttons
- Primary: Solid gold background (#C7AE6A)
- Secondary: Gold outlined with transparent background
- Hover: Shift to strong gold (#b99a45)
- Large, clear touch targets
- Blurred backgrounds when overlaying images

### Smooth Scrolling
- All anchor links scroll smoothly (not jump)
- "Learn More" button smooth-scrolls to Features section
- Search results auto-scroll to relevant accordion

### Accordions/Dropdowns
- Clean expand/collapse animations
- Gold accent on active state
- Clear open/close indicators

## Images & Assets

### Logo Integration
- GOLDH logo (logo.png) integrated into layout design
- Not displayed as standalone image block
- Part of header/hero composition

### News Feed
- Mock crypto headline thumbnails
- Consistent aspect ratios
- Auto-scrolling behavior

## Mobile Responsiveness
- All components must be mobile-friendly
- Touch-optimized accordions and CTAs
- Readable text sizes for crypto beginners
- Horizontal scroll optimized for news feed

## Accessibility & UX

### Beginner-Friendly Approach
- Simple, clear language throughout
- Non-technical explanations in learning hub
- Clear onboarding flow
- Optional wallet connection (don't force)

### FOMO & Conversion Optimization
- "Launching Soon" messaging
- "Early User Benefits" emphasis
- Premium status badges
- Clear CTAs with action verbs

### Performance Considerations
- Smooth animations (no jank)
- Auto-scroll optimization
- Fast page loads critical for convention demo

## Page-Specific Guidelines

**Landing**: Hero with integrated logo, FOMO boxes, features grid, auto-scroll news  
**Sign-In**: Clean auth form, optional wallet connection, clear next steps  
**Dashboard**: Gated content, premium status, coming soon teaser, news feed  
**Learn**: Searchable knowledge base, expandable accordions, beginner-focused content