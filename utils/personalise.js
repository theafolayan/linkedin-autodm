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
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}


export async function personalise(apiKey, template, fname, insight) {
    const systemMessage = `You are a concise sales copywriter.
Insert the first name and the given pain-point insight into the template.
Return the final message ONLY, max 70 words.`;

    const userMessage = JSON.stringify({
        template,
        fname,
        insight,
    });

    try {
        const result = await callOpenAI(apiKey, systemMessage, userMessage, 0.7, 'gpt-4o-mini');
        return result;
    } catch (error) {
        console.error('Error in personalise:', error);
        // Return template with placeholders filled as a fallback
        return template.replace('{{fname}}', fname).replace('{{insight}}', insight);
    }
}
