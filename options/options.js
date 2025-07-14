const storage = {
    get: (keys) => chrome.storage.local.get(keys),
    set: (items) => chrome.storage.local.set(items),
};

const apiKeyInput = document.getElementById('apiKey');
const basePromptTextarea = document.getElementById('basePrompt');
const categoriesContainer = document.getElementById('categories-container');
const addCategoryButton = document.getElementById('add-category');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

const DEFAULT_PROMPT = `You are a LinkedIn profile classifier. Analyze the provided profile text (headline, summary, experience) and determine if the person falls into one of the custom categories provided.
Return JSON with "send", "category", and "insight".
- "send" should be true ONLY if the profile matches one of the provided categories (not "Other").
- "category" must be one of the provided category names, or "Other".
- "insight" should be a concise pain point (max 15 words) relevant to their role. Example: "managing burnout for a remote team of 50".`;

function createCategoryElement(name = '', template = '', isNew = false) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'category-header';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Category Name (e.g., Executive)';
    nameInput.value = name;
    nameInput.className = 'category-name';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-category';
    removeButton.onclick = () => categoryDiv.remove();

    headerDiv.appendChild(nameInput);
    headerDiv.appendChild(removeButton);

    const templateLabel = document.createElement('label');
    templateLabel.textContent = 'Template:';
    const templateTextarea = document.createElement('textarea');
    templateTextarea.placeholder = 'Message template for this category...';
    templateTextarea.value = template;
    templateTextarea.className = 'category-template';

    categoryDiv.appendChild(headerDiv);
    categoryDiv.appendChild(templateLabel);
    categoryDiv.appendChild(templateTextarea);

    categoriesContainer.appendChild(categoryDiv);

    if (isNew) {
        nameInput.focus();
    }
}

async function loadOptions() {
    const data = await storage.get(['apiKey', 'basePrompt', 'categories']);
    apiKeyInput.value = data.apiKey || '';
    basePromptTextarea.value = data.basePrompt || DEFAULT_PROMPT;

    categoriesContainer.innerHTML = '';
    const categories = data.categories || [
        { name: 'Executive', template: 'Hi {{fname}}, noticed your executive role. I imagine {{insight}} is a constant challenge. Worth a chat?' },
        { name: 'HR', template: 'Hi {{fname}}, with your HR background, I bet {{insight}} is top of mind. Could we explore solutions?' },
        { name: 'HMO', template: 'Hi {{fname}}, in the HMO space, {{insight}} must be a key focus. Open to discussing how we can help?' },
    ];

    if (categories.length > 0) {
        categories.forEach(cat => createCategoryElement(cat.name, cat.template));
    }
}

async function saveOptions() {
    const apiKey = apiKeyInput.value;
    const basePrompt = basePromptTextarea.value;
    const categories = [];

    document.querySelectorAll('.category').forEach(catDiv => {
        const name = catDiv.querySelector('.category-name').value.trim();
        const template = catDiv.querySelector('.category-template').value.trim();
        if (name) { // Only save if name is not empty
            categories.push({ name, template });
        }
    });

    if (!apiKey) {
        statusDiv.textContent = 'Error: API Key is required.';
        statusDiv.style.color = 'red';
        return;
    }

    if (categories.length === 0) {
        statusDiv.textContent = 'Error: At least one category is required.';
        statusDiv.style.color = 'red';
        return;
    }


    await storage.set({ apiKey, basePrompt, categories });
    statusDiv.textContent = 'Settings saved.';
    statusDiv.style.color = 'green';
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 2000);
}

addCategoryButton.addEventListener('click', () => createCategoryElement('', '', true));
saveButton.addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', loadOptions);
