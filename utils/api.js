async function callOpenAI(apiKey, model, messages, temperature, isJson) {
    const body = {
        model,
        messages,
        temperature,
    };
    if (isJson) {
        body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API request failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return isJson ? JSON.parse(content) : content.trim();
}

async function callGemini(apiKey, model, messages, temperature, isJson) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Gemini uses a different message format
    const contents = messages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Gemini doesn't have a 'system' role
        parts: [{ text: msg.content }],
    }));

    // Gemini separates system prompt from the rest of the messages
    const systemInstruction = messages.find(msg => msg.role === 'system');

    const body = {
        contents: systemInstruction ? contents.filter(c => c.role !== 'user' || !c.parts[0].text.includes(systemInstruction.content)) : contents,
        generationConfig: {
            temperature,
            response_mime_type: isJson ? 'application/json' : 'text/plain',
        },
    };

    if(systemInstruction){
        body.system_instruction = {
            parts: [{ text: systemInstruction.content }]
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API request failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    return isJson ? JSON.parse(content) : content.trim();
}


export async function callAI(provider, apiKey, model, messages, temperature, isJson = false) {
    if (provider === 'openai') {
        return callOpenAI(apiKey, model, messages, temperature, isJson);
    } else if (provider === 'gemini') {
        return callGemini(apiKey, model, messages, temperature, isJson);
    } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
}
