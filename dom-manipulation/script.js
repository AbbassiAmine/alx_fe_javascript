let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Wisdom" }
];

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const category = document.getElementById('categorySelect')?.value || 'all';
    const filteredQuotes = category === 'all' ? quotes : quotes.filter(quote => quote.category === category);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
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
    
    // Clear previous content and append new elements
    quoteDisplay.innerHTML = '';
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(categoryText);
}

function createCategoryFilter() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    const filterContainer = document.getElementById('categoryFilter');
    
    // Create select element
    const select = document.createElement('select');
    select.id = 'categorySelect';
    
    // Add options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        select.appendChild(option);
    });
    
    // Clear previous filter and append new select
    filterContainer.innerHTML = 'Filter by category: ';
    filterContainer.appendChild(select);
    
    // Add change event listener
    select.addEventListener('change', showRandomQuote);
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        // Add new quote to array
        quotes.push({ text: quoteText, category: quoteCategory });
        
        // Clear input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        // Update category filter
        createCategoryFilter();
        
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create category filter
    createCategoryFilter();
    
    // Show initial random quote
    showRandomQuote();
    
    // Add event listener for new quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
});