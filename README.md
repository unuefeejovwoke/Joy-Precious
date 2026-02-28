# Clean Minimal Wedding Invite (Redesign)

This is a lightweight redesign inspired by the clean wedding invite layout on webgency.tilda.ws.

## What you get
- Modern minimal typography
- Sticky top navigation + mobile menu
- Smooth reveal-on-scroll animations
- RSVP form with basic validation
- Demo RSVP storage in browser localStorage
- Google Maps embed

## How to run
Option 1
- Double click `index.html`

Option 2
- Serve locally (recommended)
  - Python: `python -m http.server 5500`
  - Then open: http://localhost:5500

## Customization
Open `index.html` and change:
- Names, date, city, venue
- Timeline items
- Contact details
- Images

Images are hotlinked from Unsplash (black couples and guests). Replace with your own photos when ready.

## Connecting RSVP to a real endpoint
Right now the form stores the last submission in localStorage.
To send to Google Forms, Supabase, or any API:
- Edit `script.js` where the `payload` is created.
# Joy-Precious
