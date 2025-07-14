# LinkedIn Auto-DM Chrome Extension

This Chrome extension automates sending personalized direct messages to new connections on LinkedIn. It uses either OpenAI or Google Gemini to analyze profiles, classify them according to your custom rules, and generate personalized messages from your templates.

## Features

- **Multi-Provider Support:** Choose between OpenAI and Google Gemini for AI-powered features.
- **Custom Model Selection:** Specify the exact model name you want to use (e.g., `gpt-4o-mini`, `gemini-1.5-flash-latest`).
- **Automatic Profile Scraping:** When a new connection is detected, the extension automatically scrapes their profile information in the background.
- **AI-Powered Classification:** Uses your chosen AI provider to classify profiles into categories you define.
- **Fully Customizable Prompts:** You have full control over the system prompt used for classification, allowing you to tailor the AI's behavior to your specific needs.
- **Dynamic & Extensible Categories:** Create, rename, and delete an unlimited number of categories. Each category has its own message template.
- **Personalized Message Generation:** If a profile is classified into one of your categories, the extension uses AI to generate a personalized message based on your template and a generated insight.
- **Queued Processing:** Processes one profile at a time to avoid overwhelming your browser and to mimic human behavior.
- **Configurable Options:** A comprehensive options page allows you to manage your API key, AI provider, model name, classifier prompt, and all categories and templates.

## How to Use

1.  **Load the Extension:**
    -   Download or clone this repository.
    -   Open Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode".
    -   Click "Load unpacked" and select the directory containing the extension's files.
2.  **Configure Options:**
    -   Click the extension's icon to open the options page.
    -   **Enter your API key.** This is required. Make sure it corresponds to the selected AI provider.
    -   **Select your AI Provider** (OpenAI or Gemini).
    -   **Enter the Model Name** you wish to use. Default models are provided.
    -   **(Optional) Customize the Classifier Prompt:** Modify the base system prompt to change how the AI analyzes and classifies profiles.
    -   **Manage Categories:**
        -   Add new categories by clicking the "Add New Category" button.
        -   Rename categories by editing the name field.
        -   Delete categories by clicking the "Remove" button.
    -   **Set Templates:** For each category, define a message template. You can use `{{fname}}` for the person's first name and `{{insight}}` for the AI-generated pain point.
    -   **Click "Save All Settings".**
3.  **Run the Extension:**
    -   The extension will automatically start running in the background. It will periodically check for new connections and process them according to your settings.

**Disclaimer:** This extension is for educational and experimental purposes only. Use it responsibly and be aware of LinkedIn's and your AI provider's terms of service. Automating interactions on platforms may be against their policies.
