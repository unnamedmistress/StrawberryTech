# Image Integration Plan

This plan explains how to incorporate a themed strawberry image on every page in the StrawberryTech application. These remote images are the only art assets that should appear in the UI.

## Available Assets

| File Name | Description | URL |
| --- | --- | --- |
| ChatGPT Image Jun 7, 2025, 07_51_28 PM.png | Detective-themed strawberry examining statement cards under magnifying glass to spot false claim. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_51_28%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_47_46 PM.png | Strawberry calling out sick wrapped in blanket, holding phone with polite sick day message bubble. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_47_29 PM.png | Another version of strawberry calling out sick, same description. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_29%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_24_00 PM.png | Strawberry throwing dart hitting "Clear Prompt" bullseye on prompt darts target. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_24_00%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_19_23 PM.png | Prompt recipe builder strawberry chef tossing cards labeled Action, Context, Format, Constraints. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_19_23%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_16_34 PM.png | Earlier prompt recipe builder with similar strawberry chef and cards. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_16_34%20PM.png |
| ChatGPT Image Jun 7, 2025, 07_12_36 PM.png | Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones. | https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png |

All images are hosted on GitHub. Use the direct URL in the `src` attribute of an `<img>` tag and include an `alt` text that matches the description above.

## Layout Guidelines

- Reuse existing classes such as `.hero-img`, `.brand-logo`, `.game-icon` or `.prompt-image` so that images inherit the app’s fonts, shadows and spacing.
- Constrain widths using existing utilities (e.g. `max-width: 100%`, `width: min(240px, 80%)`) to keep images responsive.
- Center standalone graphics with `display: block` and `margin: 0 auto` to mirror the hero section style.
- Apply rounded corners using the existing `border-radius: 6px` pattern to maintain a cohesive look.

## Page‑by‑Page Recommendations

### Splash & Home
- Use the **learning arcade mascot** image as the welcoming graphic.
- Place it inside the hero section using the `hero-img` class.

### Tone Puzzle
- Display the **earlier recipe builder** image beside the instructions or at the top of the page.
- Give it a width of 180–240&nbsp;px and apply the `.hero-img` or `.game-icon` class for consistent drop shadows.

### Hallucinations
- Insert the **detective strawberry** image above the quiz question area.
- Center it with a width around 200&nbsp;px.

### Prompt Recipe Builder
- Show the **chef tossing cards** image in the prompt preview area using the existing `.prompt-image` class.

### Prompt Darts
- Add the **dart hitting "Clear Prompt" bullseye** image near the dartboard component.

### Compose Tweet
- Use one of the **calling out sick** images as a decorative element above the tweet form. The second variant can appear on the results screen.

### Escape Room
- Replace the current Unsplash door art with the **learning arcade mascot** to keep branding consistent.

### Other Pages
- Profile, Leaderboard, Community and static pages (Terms, Privacy, Help, Stats) can reuse the mascot image in a small form (48&nbsp;px) via the `.brand-logo` style or as a sidebar decoration.

Following these steps will place a themed strawberry graphic on every page while keeping the design consistent with the existing React components and CSS classes.
