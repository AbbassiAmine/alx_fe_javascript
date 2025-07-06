let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Motivation", lastModified: new Date().toISOString() },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life", lastModified: new Date().toISOString() },
    { id: 3, text: "Stay hungry, stay foolish.", category: "Motivation", lastModified: new Date().toISOString() },
    { id: 4, text: "The journey of a thousand miles begins with a single step.", category: "Wisdom", lastModified: new Date().toISOString() }
];

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            const parsedQuotes = JSON.parse(storedQuotes);
            if (Array.isArray(parsedQuotes)) {
                quotes = parsedQuotes;
            }
        } catch (e) {
            console.error('Error loading quotes from localStorage:', e);
        }
    }
}

function saveQuotes() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    } catch (e) {
        console.error('Error saving quotes to localStorage:', e);
    }
}

function loadLastCategory() {
    return localStorage.getItem('lastCategory') || 'all';
}

function saveLastCategory(category) {
    try {
        localStorage.setItem('lastCategory', category);
    } catch (e) {
        console.error('Error saving last category to localStorage:', e);
    }
}

function showNotification(message) {
    const notificationArea = document.getElementById('notificationArea');
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 5000);
}

function showConflictModal(serverQuote, localQuote) {
    const conflictModal = document.getElementById('conflictModal');
    const conflictMessage = document.getElementById('conflictMessage');
    conflictMessage.innerHTML = `Conflict detected for quote ID ${serverQuote.id}:<br>
        Server: "${serverQuote.text}" (Category: ${serverQuote.category})<br>
        Local: "${localQuote.text}" (Category: ${localQuote.category})<br>
        Choose which version to keep.`;
    conflictModal.style.display = 'block';
}

function resolveConflict(choice, serverQuote, localQuote) {
    const conflictModal = document.getElementById('conflictModal');
    if (choice === 'server') {
        const index = quotes.findIndex(q => q.id === serverQuote.id);
        if (index !== -1) {
            quotes[index] = serverQuote;
        } else {
            quotes.push(serverQuote);
        }
        showNotification('Conflict resolved: Server data used.');
    } else {
        showNotification('Conflict resolved: Local data retained.');
    }
    saveQuotes();
    populateCategories();
    showRandomQuote();
    conflictModal.style.display = 'none';
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const filteredQuotes = category === 'all' ? quotes : quotes.filter(quote => quote.category === category);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
    // Save last viewed quote to session storage
    try {
        sessionStorage.setItem('lastQuote', JSON.stringify(quote));
    } catch (e) {
        console.error('Error saving last quote to sessionStorage:', e);
    }
    
    // Create quote element
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote';
    
    // Create quote text element
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;
    quoteText.style.fontStyle = 'italic';
    
    // Create category element
    const categoryText = document.createElement('p');
    categoryText.textContent = `Category: ${quote.category}`;
    categoryText.style.fontWeight = 'bold';
    
    // Display last viewed quote from session storage (if available and matches category)
    const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
    if (lastQuote && (category === 'all' || lastQuote.category === category)) {
        quoteText.textContent = `"${lastQuote.text}"`;
        categoryText.textContent = `Category: ${lastQuote.category} (Last Viewed)`;
    }
    
    // Clear previous content and append new elements
    quoteDisplay.innerHTML = '';
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(categoryText);
}

function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    const select = document.getElementById('categoryFilter');
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        select.appendChild(option);
    });
    
    // Restore last selected category
    const lastCategory = loadLastCategory();
    select.value = lastCategory;
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    saveLastCategory(selectedCategory);
    showRandomQuote();
}

function createAddQuoteForm() {
    const formContainer = document.getElementById('quoteFormContainer');
    
    // Create form elements
    const formDiv = document.createElement('div');
    
    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';
    
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);
    
    // Append elements to form div
    formDiv.appendChild(quoteInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);
    
    // Clear container and append form
    formContainer.innerHTML = '';
    formContainer.appendChild(formDiv);
}

async function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        const newQuote = {
            id: Math.max(...quotes.map(q => q.id), 0) + 1,
            text: quoteText,
            category: quoteCategory,
            lastModified: new Date().toISOString()
        };
        
        // Add to local quotes
        quotes.push(newQuote);
        saveQuotes();
        
        // Post to server
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: quoteText, body: quoteCategory, userId: 1 })
            });
            if (response.ok) {
                showNotification('Quote synced with server.');
            } else {
                showNotification('Failed to sync quote with server.');
            }
        } catch (e) {
            console.error('Error syncing quote with server:', e);
            showNotification('Error syncing quote with server.');
        }
        
        // Clear input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        // Update category filter
        populateCategories();
        
        // Show the newly added quote
        showRandomQuote();
        
        // Add visual feedback
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.style.backgroundColor = '#e6ffe6';
        setTimeout(() => {
            quoteDisplay.style.backgroundColor = 'white';
        }, 1000);
    } else {
        alert('Please enter both quote and category');
    }
}

function exportToJsonFile() {
    const jsonStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = async function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                for (const quote of importedQuotes) {
                    if (!quote.id) {
                        quote.id = Math.max(...quotes.map(q => q.id), 0) + 1;
                        quote.lastModified = new Date().toISOString();
                    }
                    const existingQuote = quotes.find(q => q.id === quote.id);
                    if (existingQuote) {
                        if (existingQuote.lastModified < quote.lastModified) {
                            showConflictModal(quote, existingQuote);
                            return;
                        }
                    } else {
                        quotes.push(quote);
                    }
                }
                saveQuotes();
                populateCategories();
                showRandomQuote();
                showNotification('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format: Quotes must be an array of objects with text and category properties.');
            }
        } catch (e) {
            alert('Error importing quotes: Invalid JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

async function syncWithServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (response.ok) {
            const serverQuotes = await response.json();
            let conflicts = [];
            
            for (const serverQuote of serverQuotes.slice(0, 10)) { // Limit to 10 for demo
                const localQuote = quotes.find(q => q.id === serverQuote.id);
                const serverQuoteFormatted = {
                    id: serverQuote.id,
                    text: serverQuote.title,
                    category: serverQuote.body.split(' ')[0], // Simplified category extraction
                    lastModified: new Date().toISOString()
                };
                
                if (localQuote) {
                    if (localQuote.lastModified < serverQuoteFormatted.lastModified) {
                        conflicts.push({ server: serverQuoteFormatted, local: localQuote });
                    }
                } else {
                    quotes.push(serverQuoteFormatted);
                }
            }
            
            if (conflicts.length > 0) {
                showConflictModal(conflicts[0].server, conflicts[0].local);
            } else {
                saveQuotes();
                populateCategories();
                showRandomQuote();
                showNotification('Data synced with server successfully.');
            }
        } else {
            showNotification('Failed to sync with server.');
        }
    } catch (e) {
        console.error('Error syncing with server:', e);
        showNotification('Error syncing with server.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load quotes from local storage
    loadQuotes();
    
    // Create category filter
    populateCategories();
    
    // Create quote form
    createAddQuoteForm();
    
    // Show initial random quote
    showRandomQuote();
    
    // Add event listener for new quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Start periodic server sync (every 30 seconds)
    syncWithServer();
    setInterval(syncWithServer, 30000);
});