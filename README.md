# Handle.ph

A skills-for-hire marketplace prototype connecting Filipino tradespeople and freelancers with people who need work done — built in support of UN SDG 8 (Decent Work and Economic Growth).

## What's included

- **Home** — search hero + a smart-match preview
- **Browse skills** — search and filter listings by keyword, category, and location
- **Post a skill** — form to list your own skill (goes live immediately)
- **My requests** — tracks messages you've sent to listings

This is a static, front-end-only prototype. Listings and requests are stored in the browser's `localStorage`, so data persists per-device but isn't shared between users or synced to a server.

## Running locally

Just open `index.html` in a browser — no build step, no dependencies.

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `handle-ph`).
2. Push these three files to the repo root: `index.html`, `style.css`, `app.js`.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Save — GitHub will give you a live URL like `https://<your-username>.github.io/handle-ph/` within a minute or two.

## Resetting demo data

To clear all posted listings and requests and restore the original seed listings, open the browser console on the site and run:

```js
localStorage.removeItem("handleph_listings");
localStorage.removeItem("handleph_requests");
location.reload();
```

## Next steps if you want to go further

- Swap `localStorage` for a real backend (Firebase, Supabase, or a small Node/Express API) so listings are shared across users and devices.
- Add basic auth so people can edit or remove only their own listings.
- Add image uploads for listings (profile photo, work samples).
