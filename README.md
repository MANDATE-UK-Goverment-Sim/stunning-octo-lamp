# UR Election Night Live

A static GitHub Pages-ready election-night presentation and control room for the fictional country of Usher.

## Files
- `index.html` — live presentation
- `control.html` — control room
- `styles.css` — shared styling
- `data.js` — persistent election state
- `app.js` — presentation logic
- `control.js` — control room logic

## GitHub Pages
1. Create a repository.
2. Upload all files to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.

Then open:
- `/index.html` for the live presentation
- `/control.html` for the control room

## Important
The build contains 650 placeholder constituency names (`Usher Constituency 001` … `650`) because the original constituency dataset was not available to import during this build.

You can rename them by editing state through JSON export/import now, or replace the generated seat list in `data.js` with your real constituency dataset.

Default constitutional settings:
- House of Senate: 650 seats
- Majority: 326
- Landslide: 400+
- Office: Prime Minister
- Default matchup: Maison Sanders vs Hala Ramen

State is stored in the browser using `localStorage`, so the control room and presentation stay in sync when opened on the same device/browser.
