let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Wisdom" }
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

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        // Add new quote to array
        quotes.push({ text: quoteText, category: quoteCategory });
        
        // Save to local storage
        saveQuotes();
        
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
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            // Validate imported quotes
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                showRandomQuote();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format: Quotes must be an array of objects with text and category properties.');
            }
        } catch (e) {
            alert('Error importing quotes: Invalid JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
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
});