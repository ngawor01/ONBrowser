# ON Browser - Design Guidelines

## Architecture Decisions

### Authentication
**No Auth Required** - This is a utility/single-user browser application with local data storage.

**Profile/Settings Implementation:**
- User-customizable avatar with 3 preset options (shield icons in blue/green variations)
- Display name field (default: "ON User")
- Comprehensive privacy settings panel
- No login/signup required

### Navigation
**Root Navigation:** Stack-Only with Floating Controls
- The browser operates as a single continuous experience
- Floating tab switcher button (top-right corner)
- Settings accessible via menu icon (top-left or bottom toolbar)
- No tab bar navigation due to browser's immersive nature

**Navigation Architecture:**
1. **Browser Stack** (Main)
   - Browser View (home/active tab)
   - Tab Manager (modal overlay)
   - Bookmarks (modal sheet)
   - History (modal sheet)
2. **Settings Stack** (Modal)
   - Settings Home
   - Privacy Suite Controls
   - AdBlock Configuration
   - UserScript Manager

### Screen Specifications

#### 1. Browser View (Main Screen)
**Purpose:** Primary browsing interface with privacy controls

**Layout:**
- **Header:** Custom transparent header with floating controls
  - Left: Menu icon (opens settings drawer)
  - Center: URL bar (rounded, collapsible)
  - Right: Tab counter badge (e.g., "3"), Shield icon (privacy status indicator)
- **Main Content:** 
  - Full-screen WebView (scrollable)
  - No default safe area constraints (browser controls float over content)
- **Floating Elements:**
  - Bottom toolbar with: Back, Forward, Refresh, Bookmarks, Share buttons
  - Privacy indicator badge (floating top-right, shows active protections count)
  - Safe area: bottom inset = insets.bottom + Spacing.xl

**Components:** WebView, URL bar with SSL indicator, floating action buttons, status badges

#### 2. Tab Manager
**Purpose:** Switch between and manage open browser tabs

**Layout:**
- **Header:** Custom header with gradient background
  - Title: "Tabs"
  - Right: "New Tab" button (+ icon)
  - Non-transparent header
- **Main Content:** 
  - Scrollable grid of tab cards (2 columns on phones, 3 on tablets)
  - Each card shows: webpage thumbnail, title, close button
  - Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl
- **Floating Elements:**
  - "Close All Tabs" button (bottom, centered)
  - Safe area: bottom = insets.bottom + Spacing.xl

**Components:** Grid cards, thumbnail previews, floating danger button

#### 3. Privacy Suite Settings
**Purpose:** Configure advanced fingerprint protection features

**Layout:**
- **Header:** Default navigation header
  - Title: "Privacy Suite"
  - Left: Back button
- **Main Content:** 
  - Scrollable form with toggle sections
  - Each protection has: Toggle switch, name, description
  - Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Toggle Sections (in order):**
1. Canvas Fingerprint Protection
2. WebGL Spoofing
3. Font Fingerprint Blocking
4. Audio Context Protection
5. Resolution Spoofing
6. WebRTC Complete Blocking
7. Anti Proxy Detection
8. Smart Timezone (auto-detect from IP)
9. Random User Agent (with preset selector)

**Components:** Toggle switches, expandable cards, info tooltips

#### 4. AdBlock Configuration
**Purpose:** Manage ad-blocking rules and homepage allowance

**Layout:**
- **Header:** Default navigation header
  - Title: "AdBlock Settings"
  - Left: Back button
- **Main Content:** 
  - Scrollable form
  - Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Form Elements:**
- Master toggle: "Enable AdBlock"
- Toggle: "Allow ads on homepage" (default: ON)
- Section: Custom filter lists (expandable)
- Stats display: Ads blocked count, Data saved estimate

**Components:** Toggle switches, stats cards, list items

#### 5. UserScript Manager
**Purpose:** Manage custom JavaScript scripts (Tampermonkey-style)

**Layout:**
- **Header:** Default navigation header
  - Title: "UserScripts"
  - Right: "+ Add" button
- **Main Content:** 
  - Scrollable list of installed scripts
  - Each script shows: name, enabled toggle, edit/delete actions
  - Empty state: "No scripts installed" with "Browse Scripts" CTA
  - Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:** List items with toggles, swipeable actions, code editor (for script editing)

## Design System

### Color Palette
**Primary Colors:**
- Primary Blue: #2196F3 (from ON Browser logo)
- Primary Green: #4CAF50 (from ON Browser logo)
- Accent: Gradient from Blue to Green

**Semantic Colors:**
- Background: #FFFFFF (light mode), #121212 (dark mode)
- Surface: #F5F5F5 (light), #1E1E1E (dark)
- Text Primary: #212121 (light), #FFFFFF (dark)
- Text Secondary: #757575 (light), #AAAAAA (dark)
- Error/Danger: #F44336
- Success: #4CAF50 (matches brand green)
- Warning: #FF9800
- Privacy Active: Gradient (Blue→Green) indicates protections active

**Browser UI Colors:**
- URL Bar Background: Surface color with subtle border
- SSL Secure: #4CAF50 (green padlock)
- SSL Insecure: #F44336 (red warning)
- Tab Counter Badge: Primary Blue with white text

### Typography
- **Header:** System Bold, 20px
- **URL Bar:** System Medium, 16px
- **Body:** System Regular, 15px
- **Caption:** System Regular, 13px
- **Button Text:** System Semibold, 16px

### Visual Design

**Browser Chrome:**
- URL bar: 44px height, rounded corners (12px radius), subtle drop shadow
- Bottom toolbar: 60px height, frosted glass effect (blur background)
- Tab counter badge: 28px × 28px circle, bold number

**Touchable Feedback:**
- Browser controls: Scale down to 0.95 on press, no shadow
- URL bar: Subtle highlight on tap
- Tab cards: Scale to 0.98, lift shadow on press
- Floating buttons: Use subtle drop shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

**Privacy Indicator:**
- Floating badge (top-right): Shield icon with active protection count
- Gradient background when protections are active
- Pulsing animation when blocking occurs
- Tappable to show quick privacy summary

**Icons:**
- Use Feather icons from @expo/vector-icons
- Browser controls: chevron-left, chevron-right, refresh-cw, bookmark, share-2
- Privacy: shield, lock, eye-off, wifi-off
- Settings: settings, sliders, code, filter
- Tabs: square, x, plus

**Critical Assets:**
1. **ON Browser Logo** (already provided) - Use in splash screen and about section
2. **Privacy Shield Icons** (3 variations) - For user avatars:
   - Blue gradient shield
   - Green gradient shield
   - Blue-green split shield
3. **Empty State Illustrations:**
   - No tabs open (browser icon)
   - No bookmarks (star icon with dashed border)
   - No scripts installed (code brackets)

**Design Principles:**
- Minimal UI chrome to maximize browsing space
- Floating controls with frosted glass/blur effects
- Gradient accents to indicate active privacy features
- Fast, responsive animations (max 200ms duration)
- High contrast for readability
- Dark mode optimized for night browsing