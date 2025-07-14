console.log("Profile scraper injected.");

function getProfileText() {
    try {
        const profileCard = document.querySelector('.pv-top-card');
        const aboutSection = document.querySelector('.pv-about-section');
        const experienceSection = document.getElementById('experience-section');

        const headline = profileCard?.querySelector('h2.top-card-layout__headline')?.innerText || '';
        const fname = profileCard?.querySelector('h1.top-card-layout__title')?.innerText.split(' ')[0] || '';

        const about = aboutSection?.querySelector('p')?.innerText || '';

        let experienceText = '';
        if (experienceSection) {
            const experienceItems = Array.from(experienceSection.querySelectorAll('.pv-position-entity')).slice(0, 3);
            experienceText = experienceItems.map(item => item.innerText).join('\n\n');
        }

        const companyName = document.querySelector('.pv-top-card-v2-section__company-name')?.innerText || '';

        const fullText = `Headline: ${headline}\n\nAbout: ${about}\n\nExperience:\n${experienceText}\n\nCurrent Company: ${companyName}`;

        return { text: fullText, fname };
    } catch (error) {
        console.error("Error scraping profile:", error);
        return { text: '', fname: '' };
    }
}


// The message listener in background.js will provide the id
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SCRAPE_PROFILE') {
        console.log('Scraping profile for ID:', request.id);
        const { text, fname } = getProfileText();

        if (text && fname) {
            chrome.runtime.sendMessage({
                type: 'PROFILE_TEXT',
                id: request.id,
                text,
                fname
            });
        } else {
             console.error("Could not scrape profile text or fname.");
             // Send failure message back to background script
             chrome.runtime.sendMessage({
                type: 'PROFILE_TEXT_FAILURE',
                id: request.id,
             });
        }
    }
});
