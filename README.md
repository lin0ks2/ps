# MOYAMOVA Landing

Static landing page for **moyamova.com** presenting the MOYAMOVA web trainer at **https://moyamova.online/** and the RU/UA YouTube channels.

## Deploy

No build step is required. Publish the repository root with GitHub Pages, Cloudflare Pages, Netlify, or any static hosting.

## YouTube setup

Open `assets/js/config.js` and add both channel IDs and (optionally) explicit channel URLs:

```js
channels: {
  uk: { channelId: 'UC...', channelUrl: 'https://youtube.com/@...' },
  ru: { channelId: 'UC...', channelUrl: 'https://youtube.com/@...' }
}
```

When a valid channel ID is set, the page embeds that channel's **Uploads playlist** automatically. This does not require a YouTube API key.

## Trainer popup

Desktop: opens `moyamova.online` in a centered ~430 px wide app window.
Mobile: opens the trainer in a normal new browser tab because mobile browsers do not reliably support custom popup dimensions.

## Structure

- `index.html` — main landing page
- `assets/css/main.css` — responsive design
- `assets/js/app.js` — popup, language switcher, YouTube embeds
- `assets/js/config.js` — external links/channel IDs
- `assets/img/` — MOYAMOVA logo and real trainer screenshots
- `legal/` — privacy, terms, impressum inherited from the previous project

## Before production

Review and replace the inherited legal text where required. It was carried over from the old landing project and should not be treated as final legal advice.
