# WordLens – Instant Meanings

A Chrome extension that gives you instant dictionary definitions and AI-powered explanations for any word or phrase you select on any webpage.

---

## Features

- **Auto-triggers on selection** — just highlight any word or phrase, no clicks needed
- **Dictionary tab** — definitions, phonetics, part of speech, examples, synonyms (free, no key needed)
- **AI Explain tab** — context-aware plain English explanation powered by Groq (free API key required)
- **No bot, no tracking** — runs entirely in your browser
- **Works on any webpage** — Google Meet, news sites, docs, anywhere

---

## Installation

1. Download and unzip the extension folder
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top right)
4. Click **Load unpacked** → select the unzipped folder
5. WordLens is now installed

---

## Setup (AI Explain)

The Dictionary tab works out of the box with no setup.

For AI explanations:

1. Go to [console.groq.com](https://console.groq.com) and sign up (free)
2. Create an API key
3. Click the **WordLens icon** in your Chrome toolbar
4. Paste your key (starts with `gsk_`) → click **Save Settings**

---

## How to Use

1. Go to any webpage
2. Select any word or phrase (up to 10 words) with your mouse
3. A popup appears automatically near your selection
4. Switch between **Dictionary** and **AI Explain** tabs

---

## Tech Stack

| Part | Tech |
|---|---|
| Extension type | Chrome Manifest V3 |
| Dictionary | [Free Dictionary API](https://dictionaryapi.dev/) — no key needed |
| AI Explain | [Groq API](https://groq.com) — `llama-3.1-8b-instant` model |
| Styling | Vanilla CSS with dark theme |

---

## Development

Since this is a load-unpacked extension, the dev workflow is:

1. Edit files directly in the unzipped folder
2. Go to `chrome://extensions` → click the **refresh icon** on WordLens
3. Test on any webpage

**Debugging:**
- `content.js` logs → right-click page → Inspect → Console
- `background.js` logs → `chrome://extensions` → click **Service Worker** under WordLens

---

## File Structure

```
word-meaning-extension/
├── manifest.json       # Extension config
├── content.js          # Selection detection + popup logic
├── popup.css           # Popup styles
├── background.js       # Groq API calls (service worker)
├── settings.html       # API key settings page
├── settings.js         # Settings save/load logic
├── icon16.png
├── icon48.png
└── icon128.png
```

---

## API Key Security

Your Groq API key is stored in Chrome's local storage (`chrome.storage.sync`) on your machine only. It is never hardcoded in the source and never sent anywhere except directly to Groq's API. Safe to push this repo to GitHub as-is.
