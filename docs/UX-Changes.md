# Implemented UX Improvements

The following updates were applied across the codebase based on the UX review:

- **High contrast theme toggle** via new `ThemeToggle` component and `high-contrast` styles. The user's preference now persists in `localStorage`.
- **Accessible notifications** by giving `Toaster` an ARIA live region.
- **Consistent back navigation** with “Return Home” links on game and profile pages.
- **Improved form layout** in `AgeInputForm` using flexbox and spacing.
- **Keyboard friendly drag‑and‑drop** with ARIA labels and key handlers in `Match3Game`.

