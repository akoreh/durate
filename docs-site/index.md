---
layout: home

hero:
  name: durate
  tagline: Tiny millisecond conversion utility
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API Reference
      link: /api/parse
---

<div class="badges">
  <span>Drop-in ms replacement</span>
  <span>Zero deps</span>
  <span>TypeScript-first</span>
  <span>ESM + CJS + IIFE</span>
</div>

```ts
import durate from 'durate';

durate('2 days')                     // 172_800_000
durate(172_800_000)                  // '2d'
durate(172_800_000, { long: true })  // '2 days'
```
