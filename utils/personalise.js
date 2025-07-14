import { callAI } from './api.js';

export async function personalise(provider, apiKey, model, template, fname, insight) {
    const systemMessage = `You are a concise sales copywriter.
Insert the first name and the given pain-point insight into the template.
Return the final message ONLY, max 70 words.`;

    const userMessage = JSON.stringify({
        template,
        fname,
        insight,
    });

    const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
    ];

    try {
        const result = await callAI(provider, apiKey, model, messages, 0.7, false);
        return result;
    } catch (error) {
        console.error('Error in personalise:', error);
        // Return template with placeholders filled as a fallback
        return template.replace('{{fname}}', fname).replace('{{insight}}', insight);
    }
}
