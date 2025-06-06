# StrawberryTech Learning Games - UX Review

This document summarizes action items for improving the user experience of the StrawberryTech Learning Games app. Recommendations are grounded in inclusive design principles and a user-centered approach.

## Navigation

- **Clarify first-time flow**
  - Redirect new visitors straight to the age/name form before the home page, or provide a clear call-to-action on the splash screen.
  - Offer concise onboarding tips so first-time users understand how progress is saved locally.
- **Simplify menu on mobile**
  - Ensure the hamburger menu button has an accessible label (currently handled via `aria-label`).
  - When expanded, keep focus within the menu until it is closed to aid keyboard and screen-reader users.
- **Consistent back navigation**
  - Add a visible "Back" link or button on game and profile pages so users can easily return to the home screen.

## Accessibility

- **Color contrast**
  - Review all color combinations, especially gradient backgrounds and button text, to meet WCAG AA contrast ratios.
  - Provide a high-contrast theme toggle so users with low vision can switch to more readable colors.
- **Screen reader support**
  - Ensure dynamic content such as toast notifications and game score changes announce updates via ARIA live regions.
  - Add descriptive ARIA labels for game controls, e.g. the draggable adjectives and drop areas in the Match‑3 game.
- **Keyboard interactions**
  - Verify that all interactive elements are reachable via keyboard. The RobotChat icon already supports `Enter` and `Space`; extend this pattern to other custom controls.

## Visual Design

- **Typography hierarchy**
  - Increase the base font size slightly (e.g. from 16px to 18px) for better readability.
  - Use consistent heading styles across pages so users can quickly scan the content.
- **Spacing and alignment**
  - Provide more spacing between form fields and buttons in the age input and profile pages.
  - Align labels and inputs vertically to reduce cognitive load.
- **Responsive layout**
  - Test on small screens to ensure cards and sidebars don’t overflow. Collapse multi‑column layouts to a single column when the viewport is narrow.

## User Feedback Mechanisms

- **In‑context help**
  - Add tooltips or an on‑boarding overlay that introduces key features like earning badges and using the RobotChat.
- **Feedback channel**
  - Integrate a simple feedback form or link to an email address in the footer so users can report issues.
  - After game rounds, prompt for quick emoji reactions (👍/👎) to gather sentiment on difficulty and enjoyment.

## Research Methodology Suggestions

- **Remote usability testing**
  - Recruit participants of varying ages and technical skills to play through the games while sharing their screens and narrating their thoughts.
  - Pay special attention to how quickly new users understand the goals of each game and whether any instructions are confusing.
- **Diary study**
  - Ask a small set of users to play the games over a week and keep short daily notes about what was fun or frustrating.
  - Review entries for recurring pain points or accessibility hurdles.

---

Applying these recommendations will help make StrawberryTech more intuitive and inclusive, enhancing learning outcomes for all players.
