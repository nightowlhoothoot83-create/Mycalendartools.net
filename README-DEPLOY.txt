
MYCALENDARTOOLS.NET — DEPLOY + SAFE UPDATE WORKFLOW

1) FIRST DEPLOY
- Push the full repo to GitHub.
- Connect the repo to Cloudflare Pages.
- Build command: npm run build
- Output directory: dist
- Environment: production

2) BEFORE EVERY UPDATE
- Pull the latest repo first.
- Edit data files when possible instead of changing layouts or routes.
- Run: npm run check:data
- Then run: npm run build
- Only push when both complete cleanly.

3) BEST PRACTICE
- Use a dev branch for testing changes first.
- Keep main as live production only.
- Do not change URL structures casually once live.
- Keep one canonical host only: https://www.mycalendartools.net

4) SAFE CONTENT UPDATES
These should normally be done in JSON/data files:
- src/data/holidays.json
- src/data/uniqueHolidays.json
- src/data/historicalEvents.json
- src/data/celebrityBirthdays.json
- src/data/funFacts.json

5) HIGHER-RISK UPDATES
Test carefully before merging:
- src/layouts/
- src/components/
- src/pages/
- scripts/build.js
- scripts/generateCalendarICS.js

6) AFTER DEPLOY
- Submit /sitemap.xml in Google Search Console.
- Open /generated-sitemap.html to spot-check generated pages.
- Request indexing for homepage, school-holidays landing page, a country page, and a few generated region pages.

7) ADSENSE
- Publisher ID is already included.
- Replace placeholder ad slots only when ready.
- Never click your own ads.

8) DONATION LINKS
- Replace placeholder support links on the About page/footer with your real Buy Me a Coffee, Ko-fi, or PayPal links.
