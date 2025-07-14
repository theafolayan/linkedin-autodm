console.log("Messenger script injected.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SEND_DM') {
        const { text, id } = request;
        console.log(`Sending DM for ID ${id}: ${text}`);

        // This is a placeholder. A real implementation would involve:
        // 1. Clicking the "Message" button on the profile.
        // 2. Waiting for the message composer to appear.
        // 3. Typing the text into the message box.
        // 4. Clicking the "Send" button.
        // This is complex and requires careful handling of the LinkedIn DOM.

        console.log(`DUMMY SEND: Message for ${id} would be: "${text}"`);

        // Simulate sending the message and then notify background script
        setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'DM_SENT', id });
        }, 2000); // Simulate network delay
    }
});
