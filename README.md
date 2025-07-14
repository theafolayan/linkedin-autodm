# LinkedIn Auto-DM Chrome Extension

This Chrome extension automates sending personalized direct messages to new connections on LinkedIn. It uses OpenAI to analyze profiles, classify them, and generate personalized messages.

## Features

- **Automatic Profile Scraping:** When a new connection is detected, the extension automatically scrapes their profile information in the background.
- **AI-Powered Classification:** Uses OpenAI's GPT-4o-mini to classify profiles into categories (Executive, HR, HMO, or Other).
- **Personalized Message Generation:** If a profile is classified as a target category, the extension uses OpenAI to generate a personalized message based on a template and a generated insight.
- **Queued Processing:** Processes one profile at a time to avoid overwhelming the user's browser and to mimic human behavior.
- **Configurable Options:** An options page allows the user to set their OpenAI API key and customize message templates for different categories.

## How to Use

1.  **Load the Extension:**
    -   Download or clone this repository.
    -   Open Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode".
    -   Click "Load unpacked" and select the directory containing the extension's files.
2.  **Configure Options:**
    -   Click the extension's icon to open the options page.
    -   Enter your OpenAI API key.
    -   Customize the message templates for the "Executive", "HR", and "HMO" categories. You can use `{{fname}}` and `{{insight}}` as placeholders.
    -   Click "Save".
3.  **Run the Extension:**
    -   The extension will automatically start running in the background. It will periodically check for new connections and process them according to your settings.

**Disclaimer:** This extension is for educational purposes only. Use it responsibly and be aware of LinkedIn's terms of service. Automating interactions on the platform may be against their policies.
