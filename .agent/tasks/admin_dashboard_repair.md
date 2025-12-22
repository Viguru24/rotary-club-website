# Admin Dashboard Repair & Polish Plan

## Objective
To stabilize the Admin Dashboard layout, definitively fix the "fold away" menu behavior, and ensure the requested "premium glassmorphism" aesthetic with vibrant gradients is consistently applied across all pages.

## Current Issues Identified
1.  **Sidebar Collapse Failure:** The menu does not visually "fold away" to icons-only as expected. Text elements may persist or layout may break.
2.  **Inconsistent Aesthetics:** The vibrant purple/blue gradient is not visible globally (e.g., managed events, blog posts) or looks "worse" due to opacity issues.
3.  **Interaction Confusion:** The method to toggle the menu (hamburger button vs. brand click) is causing frustration.

## Implementation Steps

### Phase 1: Sidebar "Fold Away" Repair
**Goal:** Create a rock-solid, smooth transition between "Expanded" (280px) and "Collapsed" (90px) states.

1.  **Structure Simplification:**
    *   Review `AdminLayout.jsx` to ensure HTML structure supports smooth CSS transitions.
    *   Restore the dedicated "Hamburger Menu" button in the header as the primary toggle (standard UI pattern).
    *   Keep the "Brand Click" as a secondary hidden feature if desired, but prioritize the visible button.
2.  **Strict CSS Control:**
    *   Define `.sidebar` (width: 280px) and `.sidebar.collapsed` (width: 90px).
    *   Target `.sidebar.collapsed .text-element` (links, brand name, user info) with `display: none !important` to strictly remove text.
    *   Center all icons in the `.sidebar.collapsed` state.
3.  **Verification:**
    *   Test distinct "Open" and "Closed" states.
    *   Confirm no text "ghosts" remain active.

### Phase 2: Global Gradient & Glassmorphism
**Goal:** Apply the "Lovely Gradient" consistently behind all admin content.

1.  **Unified Background:**
    *   Apply the vibrant linear gradient (`#c084fc` -> `#60a5fa` -> `#22d3ee`) to the fixed root container `.admin-container` only.
    *   Remove any conflicting backgrounds from child pages or prose containers.
2.  **Glass Panel Tuning:**
    *   Set Sidebar and Header backgrounds to high transparency (e.g., `rgba(255, 255, 255, 0.15)`).
    *   Apply `backdrop-filter: blur(12px)` to maintain legibility without hiding the gradient.
    *   Ensure the Active Menu Link uses the requested vibrant gradient to pop against the glass.

### Phase 3: System Stability Check
**Goal:** Ensure the backend connection remains intact during UI fixes.

1.  **Service Verification:**
     *   Double-check `memberService.js` and others are still pointed to `/api/...`.
     *   Confirm `node server/server.cjs` is running and accessible.

## Execution Strategy
We will tackle **Phase 1 (Sidebar)** first to stop the interaction frustration, then immediately apply **Phase 2 (Aesthetics)**. We will verify each step with a screenshot before asking for review.
