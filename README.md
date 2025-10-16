# LinguaSpark — Local Language Learning Demo

This is a small single-page demo app for learning vocabulary and phrases.

Features:
- Flashcards with translations
- Daily lesson (3 random items)
- Quiz (5-question multiple choice)
- Pronunciation using Web Speech API
- Local progress saved to localStorage
- Optional Firebase sync example (see `firebase-example.js`)

How to run:
1. Open `index.html` in a browser (Chrome/Edge/Firefox). For TTS, use a browser that supports the Web Speech API.
2. Use the category list to switch lessons, press "Today's Lesson" for a quick set, or start a quiz.

Notes on Firebase:
- To enable sync, configure `firebase-example.js` with your Firebase project and import/initialize in `index.html`.

Extensions you can add:
- More languages and lessons in `data/lessons.json`
- User accounts and remote sync
- Spaced repetition scheduling

Project structure:
- `index.html` — app UI
- `styles.css` — basic styles
- `app.js` — application logic
- `data/lessons.json` — sample learning data
- `firebase-example.js` — stub for optional sync

