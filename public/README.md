# public/ assets

## Hero mascot

The hero renders `hero.image` from `src/lib/content.ts`, currently:

```
/fox-solutions-direction-b-fox-transparent.png
```

Drop that file **here** (`public/fox-solutions-direction-b-fox-transparent.png`)
and it appears in the hero automatically. Until it exists, `HeroMedia` falls
back to the built-in abstract gradient visual (no broken image).

### Ideal asset

- **Format:** transparent PNG (or SVG)
- **Contents:** the fox **only** — no baked-in code text, no "…any device"
  label, no background. The hero already renders its own live code card and
  feature labels; a fox with those baked in will duplicate/clash with them.
- **Background:** fully transparent (the hero supplies its own glow)
- **Size:** ~1200–1600px longest edge, compressed (< ~300 KB) for fast mobile load

To change the filename, update `hero.image` in `src/lib/content.ts`.
