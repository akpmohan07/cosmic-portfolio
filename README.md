# cosmic-portfolio
🌌 Create stunning 3D cosmic portfolios with interactive orbital navigation

Served at [mohanverse.dev](https://mohanverse.dev) via GitHub Pages. Plain HTML, CSS and JS, no build step.

## Layout

```
index.html            mohanverse.dev — the site's front page (currently a "coming soon" screen)
blogs/                pages embedded in, or linked from, posts on blogs.mohanverse.dev
  downlink.html       log card rendered from an OLP-1 packet (?p=<hex>)
  encode.html         builds packets and the iframe code for a post
  map.html            globe that flies to a log's place and moment
  log.html            classic log card (query-string fields)
  terminal.html       classic card, retro terminal style
  shared/orbits.js    the orbit list: code, name, emoji, colour
  shared/olp.js       OLP-1 encode / decode / CRC
docs/olp-1.md         the packet format
```

## Adding a log to a post

1. Open `https://mohanverse.dev/blogs/encode.html`.
2. Fill in the orbit, time, location, status and objective.
3. Copy the iframe and paste it at the top of the post.
