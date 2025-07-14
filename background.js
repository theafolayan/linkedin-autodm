import { classify } from './utils/classify.js';
import { personalise } from './utils/personalise.js';
import { randomDelay } from './utils/delay.js';

const storage = {
    get: (keys) => chrome.storage.local.get(keys),
    set: (items) => chrome.storage.local.set(items),
};

let settings = {
    apiKey: null,
    aiProvider: 'openai',
    modelName: 'gpt-4o-mini',
    basePrompt: '',
    categories: [],
};
let queue = [];
let isProcessing = false;

async function loadInitialData() {
    const data = await storage.get(['apiKey', 'aiProvider', 'modelName', 'basePrompt', 'categories']);
    settings = {
        apiKey: data.apiKey,
        aiProvider: data.aiProvider || 'openai',
        modelName: data.modelName || 'gpt-4o-mini',
        basePrompt: data.basePrompt,
        categories: data.categories || [],
    };
    console.log("Initial settings loaded.", settings);
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("LinkedIn Auto-DM extension installed.");
    loadInitialData();
});

chrome.runtime.onStartup.addListener(() => {
    loadInitialData();
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        console.log("Settings changed, reloading...");
        loadInitialData();
    }
});

function startMockScanner() {
    console.log("Starting mock scanner...");
    setInterval(() => {
        if (queue.length === 0 && !isProcessing) {
            console.log("Mock scanner found a new connection.");
            const mockProfile = {
                id: `mock-${Date.now()}`,
                url: 'https://www.linkedin.com/in/williamhgates/',
            };
            queue.push(mockProfile);
            pump();
        }
    }, 20000);
}

startMockScanner();

async function pump() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;
    const currentProfile = queue.shift();
    console.log("Processing profile:", currentProfile);

    if (!settings.apiKey || !settings.modelName || !settings.categories || settings.categories.length === 0) {
        console.error("API key, model name, or categories not configured.");
        markDone(currentProfile.id);
        return;
    }

    try {
        const tab = await chrome.tabs.create({ url: currentProfile.url, active: false });

        const tabListener = async (message, sender) => {
            if (sender.tab?.id !== tab.id || message.id !== currentProfile.id) return;
            chrome.runtime.onMessage.removeListener(tabListener);
            if (message.type === 'PROFILE_TEXT') {
                await handleProfileText(message, tab.id);
            } else if (message.type === 'PROFILE_TEXT_FAILURE') {
                console.error(`Failed to scrape profile for ID: ${currentProfile.id}`);
                await chrome.tabs.remove(tab.id);
                markDone(currentProfile.id);
            }
        };
        chrome.runtime.onMessage.addListener(tabListener);

        const onUpdatedListener = async (tabId, info) => {
            if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(onUpdatedListener);
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content/profileScraper.js']
                });
                await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_PROFILE', id: currentProfile.id });
            }
        };
        chrome.tabs.onUpdated.addListener(onUpdatedListener);
    } catch (error) {
        console.error("Error opening profile tab:", error);
        markDone(currentProfile.id);
    }
}

async function handleProfileText({ id, text, fname }, tabId) {
    try {
        const categoryNames = settings.categories.map(c => c.name);
        const { send, category, insight } = await classify(settings.aiProvider, settings.apiKey, settings.modelName, settings.basePrompt, categoryNames, text);
        console.log("Classification result:", { send, category, insight });

        if (!send) {
            console.log(`Not sending DM to ${fname} (category: ${category}).`);
            await chrome.tabs.remove(tabId);
            markDone(id);
            return;
        }

        const categoryConfig = settings.categories.find(c => c.name === category);
        if (!categoryConfig || !categoryConfig.template) {
            console.error(`No template found for category: ${category}`);
            await chrome.tabs.remove(tabId);
            markDone(id);
            return;
        }

        const dmText = await personalise(settings.aiProvider, settings.apiKey, settings.modelName, categoryConfig.template, fname, insight);
        console.log(`Personalised message for ${fname}: ${dmText}`);

        const dmListener = async (message) => {
            if (message.type === 'DM_SENT' && message.id === id) {
                chrome.runtime.onMessage.removeListener(dmListener);
                console.log("DM sending confirmed for:", id);
                await randomDelay(10, 30);
                await chrome.tabs.remove(tabId);
                markDone(id);
            }
        };
        chrome.runtime.onMessage.addListener(dmListener);

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content/messenger.js']
        });
        await chrome.tabs.sendMessage(tabId, { type: 'SEND_DM', text: dmText, id });
    } catch (error) {
        console.error("Error during processing:", error);
        await chrome.tabs.remove(tabId);
        markDone(id);
    }
}

function markDone(id) {
    console.log(`Finished processing for ID: ${id}.`);
    isProcessing = false;
    pump();
}
