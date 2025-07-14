import { callAI } from './api.js';

export async function classify(provider, apiKey, model, basePrompt, categories, profileText) {
    const systemMessage = `${basePrompt}

The available categories are: ${JSON.stringify(categories)}.`;

    const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: profileText },
    ];

    try {
        const result = await callAI(provider, apiKey, model, messages, 0, true);

        // Validate the response structure
        const { send, category, insight } = result;
        const validCategories = [...categories, 'Other'];
        if (typeof send !== 'boolean' || !validCategories.includes(category) || typeof insight !== 'string') {
            console.error('Invalid JSON structure from AI classifier:', result);
            throw new Error('Invalid JSON structure from AI classifier.');
        }

        if (send && !categories.includes(category)) {
            console.warn(`AI returned send:true for category '${category}', which is not a user-defined category. Overriding to send:false.`);
            result.send = false;
        }

        return result;
    } catch (error) {
        console.error('Error in classify:', error);
        return { send: false, category: 'Other', insight: '' }; // Fail-soft
    }
}
