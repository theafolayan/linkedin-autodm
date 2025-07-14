async function callOpenAI(apiKey, systemMessage, userMessage, temperature, model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage },
            ],
            temperature,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export async function classify(apiKey, basePrompt, categories, profileText) {
    const systemMessage = `${basePrompt}

The available categories are: ${JSON.stringify(categories)}.`;

    try {
        const result = await callOpenAI(apiKey, systemMessage, profileText, 0, 'gpt-4o-mini');

        // Validate the response structure
        const { send, category, insight } = result;
        const validCategories = [...categories, 'Other'];
        if (typeof send !== 'boolean' || !validCategories.includes(category) || typeof insight !== 'string') {
            console.error('Invalid JSON structure from OpenAI classifier:', result);
            throw new Error('Invalid JSON structure from OpenAI classifier.');
        }

        // Ensure "send" is only true for one of the user-defined categories
        if (send && !categories.includes(category)) {
             console.warn(`OpenAI returned send:true for category '${category}', which is not a user-defined category. Overriding to send:false.`);
             result.send = false;
        }


        return result;
    } catch (error) {
        console.error('Error in classify:', error);
        return { send: false, category: 'Other', insight: '' }; // Fail-soft
    }
}
