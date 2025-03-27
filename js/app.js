/**
 * KillPhilosophy Application
 * Main application logic for the interactive academic network visualization tool
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing KillPhilosophy application...');
    
    // Check for browser compatibility
    checkFeatureSupport();
    
    // Setup error handling
    setupGlobalErrorHandling();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set Search as the default and only visible view
    hideAllSections();
    setActiveNavItem('nav-search');
    document.getElementById('search-container').style.display = 'block';
    
    // Initialize terminal cursor blinking
    initializeTerminalCursor();
    
    // Initialize network visualization
    initializeNetworkVisualization();
    
    // Initialize logo animation
    initializeLogoAnimation();
    
    // Load search history
    loadSearchHistory();
    
    // Check for admin access
    checkAdminAccess();
    
    // Add visualization container if not present
    addVisualizationContainer();
});

/**
 * Setup global error handling
 */
function setupGlobalErrorHandling() {
    window.displayErrorMessage = function(message, context = 'general') {
        console.error(`[${context}] Error:`, message);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Find appropriate container based on context
        let container;
        switch (context) {
            case 'github':
                container = document.getElementById('github-status-panel') || 
                           document.getElementById('contribution-result');
                break;
            case 'deepsearch':
                container = document.getElementById('deep-search-results');
                break;
            case 'database':
                container = document.getElementById('database-status') || 
                           document.querySelector('.search-status');
                break;
            default:
                // Try to find a suitable container
                container = document.querySelector('.status-container') || 
                           document.querySelector('main') || 
                           document.body;
        }
        
        if (container) {
            // Remove any existing errors
            const existingErrors = container.querySelectorAll('.error-message');
            existingErrors.forEach(el => el.remove());
            
            // Add the new error
            container.prepend(errorElement);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                errorElement.style.opacity = '0';
                setTimeout(() => errorElement.remove(), 1000);
            }, 10000);
        }
    };
    
    // Global error handler
    window.addEventListener('error', (event) => {
        displayErrorMessage(`Script error: ${event.message}`, 'global');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        displayErrorMessage(`Promise error: ${event.reason}`, 'global');
    });
}

/**
 * Add visualization container if not present
 */
function addVisualizationContainer() {
    // Check if visualization container exists
    let vizContainer = document.getElementById('visualization-container');
    
    if (!vizContainer) {
        // Find a suitable parent element
        const parent = document.getElementById('results-container') || 
                       document.getElementById('deep-search-container') || 
                       document.getElementById('database-container') || 
                       document.body;
        
        // Create the container
        vizContainer = document.createElement('div');
        vizContainer.id = 'visualization-container';
        vizContainer.className = 'visualization-content';
        vizContainer.setAttribute('data-description', 'Network visualization of academic connections');
        
        // Add to DOM
        parent.appendChild(vizContainer);
    }
}

/**
 * Enhanced browser compatibility check with user notification
 */
function checkFeatureSupport() {
    let incompatibilities = [];
    
    // Check for localStorage support
    const localStorageSupported = checkLocalStorageSupport();
    if (!localStorageSupported) {
        console.warn('localStorage not supported. Data will not be saved between sessions.');
        incompatibilities.push('Local storage is not supported - your data won\'t be saved between sessions.');
    }
    
    // Check for Fetch API
    const fetchSupported = 'fetch' in window;
    if (!fetchSupported) {
        console.warn('Fetch API not supported. GitHub and DeepSearch features will be limited.');
        incompatibilities.push('Fetch API not supported - GitHub and DeepSearch features will be limited.');
        disableAPIFeatures();
    }
    
    // Check for ES6 features
    const es6Supported = typeof Symbol !== 'undefined';
    if (!es6Supported) {
        console.warn('ES6 not fully supported. Some features may not work correctly.');
        incompatibilities.push('ES6 features not fully supported - some functionality may be limited.');
    }
    
    // Check for D3.js
    const d3Supported = typeof d3 !== 'undefined';
    if (!d3Supported) {
        console.warn('D3.js not loaded. Network visualization will not be available.');
        incompatibilities.push('D3.js library not loaded - network visualization will not be available.');
    }
    
    // Display incompatibility warnings to user if needed
    if (incompatibilities.length > 0) {
        showBrowserCompatibilityWarning(incompatibilities);
    }
}

/**
 * Display browser compatibility warning to the user
 * @param {Array} issues - List of compatibility issues
 */
function showBrowserCompatibilityWarning(issues) {
    // Create warning container
    const warningContainer = document.createElement('div');
    warningContainer.className = 'browser-compatibility-warning';
    warningContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(50, 50, 50, 0.9);
        border: 1px solid var(--accent-color);
        padding: 15px;
        max-width: 300px;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        font-family: var(--font-mono);
        color: var(--text-color);
    `;
    
    // Add warning header
    const header = document.createElement('h3');
    header.textContent = 'Browser Compatibility Issues';
    header.style.cssText = 'margin-top: 0; color: var(--error-color);';
    warningContainer.appendChild(header);
    
    // Add issues list
    const issuesList = document.createElement('ul');
    issues.forEach(issue => {
        const item = document.createElement('li');
        item.textContent = issue;
        item.style.margin = '5px 0';
        issuesList.appendChild(item);
    });
    warningContainer.appendChild(issuesList);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Dismiss';
    closeButton.style.cssText = `
        background-color: var(--accent-color);
        border: none;
        padding: 5px 10px;
        margin-top: 10px;
        cursor: pointer;
        font-family: var(--font-mono);
        color: var(--text-color);
    `;
    closeButton.onclick = () => warningContainer.remove();
    warningContainer.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(warningContainer);
}

/**
 * Check for localStorage support
 */
function checkLocalStorageSupport() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Disable API-dependent features when not supported
 */
function disableAPIFeatures() {
    // Hide Deep Search container
    const deepSearchContainer = document.getElementById('deep-search-container');
    if (deepSearchContainer) {
        deepSearchContainer.innerHTML = '<div class="error-message">Deep Search requires a modern browser with Fetch API support.</div>';
    }
    
    // Disable Deep Search navigation
    const navDeepSearch = document.getElementById('nav-deep-search');
    if (navDeepSearch) {
        navDeepSearch.classList.add('disabled');
        navDeepSearch.setAttribute('aria-disabled', 'true');
        navDeepSearch.addEventListener('click', (e) => {
            e.preventDefault();
            displayErrorMessage('Deep Search requires a modern browser with Fetch API support.', 'deepsearch');
        }, { capture: true });
    }
}

/**
 * Hide all sections
 */
function hideAllSections() {
    const sections = [
        'search-container',
        'results-container',
        'database-container',
        'novelty-tiles-container',
        'deep-search-container',
        'about-container',
        'contribute-container',
        'admin-container'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

/**
 * Enhanced setActiveNavItem function to handle ARIA attributes
 */
function setActiveNavItem(id) {
    // Remove active class from all nav items
    document.querySelectorAll('nav a').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Add active class to selected nav item
    const navItem = document.getElementById(id);
    if (navItem) {
        navItem.classList.add('active');
        navItem.setAttribute('aria-pressed', 'true');
    }
    
    // Make all navigation items visible since we've navigated past the initial state
    const navItems = document.querySelectorAll('nav a');
    navItems.forEach(item => {
        item.style.display = 'inline-block';
    });
}

/**
 * Initialize terminal cursor blinking
 */
function initializeTerminalCursor() {
    // Create cursor element if it doesn't exist
    let cursor = document.querySelector('.terminal-cursor');
    if (!cursor) {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            cursor = document.createElement('span');
            cursor.className = 'terminal-cursor';
            cursor.textContent = '█';
            searchBox.parentNode.insertBefore(cursor, searchBox.nextSibling);
        }
    }
    
    // Set up blinking
    if (cursor) {
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }
}

/**
 * Make sure the logo works correctly as a home button
 */
function initializeLogoAnimation() {
    const mainLogo = document.getElementById('main-logo');
    if (!mainLogo) return;
    
    mainLogo.addEventListener('click', () => {
        console.log('Logo clicked, returning to home view');
        
        // Reset to home view
        hideAllSections();
        document.getElementById('search-container').style.display = 'block';
        setActiveNavItem('nav-search');
        
        // Focus the search box
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.focus();
        }
        
        // Add animation class
        mainLogo.classList.add('animated');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            mainLogo.classList.remove('animated');
        }, 2000);
        
        // Show glitch effect
        showGlitchEffect();
    });
}

/**
 * Show glitch effect on the screen
 */
function showGlitchEffect() {
    // Create glitch overlay if it doesn't exist
    let glitchOverlay = document.getElementById('glitch-overlay');
    if (!glitchOverlay) {
        glitchOverlay = document.createElement('div');
        glitchOverlay.id = 'glitch-overlay';
        glitchOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 255, 0, 0.05);
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        `;
        document.body.appendChild(glitchOverlay);
    }
    
    // Show the glitch effect
    glitchOverlay.style.opacity = '1';
    
    // Add some random glitch elements
    for (let i = 0; i < 10; i++) {
        const glitch = document.createElement('div');
        glitch.className = 'glitch-element';
        glitch.style.cssText = `
            position: absolute;
            background-color: rgba(0, 255, 0, 0.2);
            height: ${Math.random() * 5}px;
            width: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: glitch-move 0.2s linear;
        `;
        glitchOverlay.appendChild(glitch);
    }
    
    // Hide the glitch effect after a short time
    setTimeout(() => {
        glitchOverlay.style.opacity = '0';
        
        // Remove glitch elements after animation completes
        setTimeout(() => {
            glitchOverlay.innerHTML = '';
        }, 200);
    }, 300);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Navigation event listeners
    const navSearchEl = document.getElementById('nav-search');
    const navDatabaseEl = document.getElementById('nav-database');
    const navNoveltyTilesEl = document.getElementById('nav-novelty-tiles');
    const navDeepSearchEl = document.getElementById('nav-deep-search');
    const navAboutEl = document.getElementById('nav-about');
    const navContributeEl = document.getElementById('nav-contribute');
    
    if (navSearchEl) navSearchEl.addEventListener('click', navSearchHandler);
    if (navDatabaseEl) navDatabaseEl.addEventListener('click', navDatabaseHandler);
    if (navNoveltyTilesEl) navNoveltyTilesEl.addEventListener('click', navNoveltyHandler);
    if (navDeepSearchEl) navDeepSearchEl.addEventListener('click', navDeepSearchHandler);
    if (navAboutEl) navAboutEl.addEventListener('click', navAboutHandler);
    if (navContributeEl) navContributeEl.addEventListener('click', navContributeHandler);
    
    // Setup search listeners
    setupSearchListeners();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + S for search
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            navSearchHandler();
        }
        // Alt + D for database
        else if (e.altKey && e.key === 'd') {
            e.preventDefault();
            navDatabaseHandler();
        }
        // Alt + N for novelty tiles
        else if (e.altKey && e.key === 'n') {
            e.preventDefault();
            navNoveltyHandler();
        }
        // Alt + F for deep search
        else if (e.altKey && e.key === 'f') {
            e.preventDefault();
            navDeepSearchHandler();
        }
        // Alt + A for about
        else if (e.altKey && e.key === 'a') {
            e.preventDefault();
            navAboutHandler();
        }
        // Alt + C for contribute
        else if (e.altKey && e.key === 'c') {
            e.preventDefault();
            navContributeHandler();
        }
        // Escape to return to search
        else if (e.key === 'Escape') {
            // Only trigger if not in an input field
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                navSearchHandler();
            }
        }
    });
}

/**
 * Navigation handlers
 */
function navSearchHandler() {
    hideAllSections();
    document.getElementById('search-container').style.display = 'block';
    setActiveNavItem('nav-search');
    
    // Focus the search box
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.focus();
    }
}

function navDatabaseHandler() {
    hideAllSections();
    document.getElementById('database-container').style.display = 'block';
    setActiveNavItem('nav-database');
    
    // Load database listing if not already loaded
    loadDatabaseListing();
}

function navNoveltyHandler() {
    hideAllSections();
    document.getElementById('novelty-tiles-container').style.display = 'block';
    setActiveNavItem('nav-novelty-tiles');
    
    // Load novelty tiles if not already loaded
    loadNoveltyTiles();
}

function navDeepSearchHandler() {
    hideAllSections();
    document.getElementById('deep-search-container').style.display = 'block';
    setActiveNavItem('nav-deep-search');
    
    // Focus the deep search input
    const deepSearchInput = document.getElementById('deep-search-input');
    if (deepSearchInput) {
        deepSearchInput.focus();
    }
}

function navAboutHandler() {
    hideAllSections();
    document.getElementById('about-container').style.display = 'block';
    setActiveNavItem('nav-about');
}

function navContributeHandler() {
    hideAllSections();
    document.getElementById('contribute-container').style.display = 'block';
    setActiveNavItem('nav-contribute');
}

function navAdminHandler() {
    showGlitchEffect();
    hideAllSections();
    document.getElementById('admin-container').style.display = 'block';
    setActiveNavItem('nav-admin');
}

/**
 * Load database listing
 */
function loadDatabaseListing() {
    const databaseContent = document.getElementById('database-content');
    if (!databaseContent) return;
    
    // Clear existing content
    databaseContent.innerHTML = '';
    
    // Check if database manager is available
    if (typeof databaseManager === 'undefined') {
        databaseContent.innerHTML = '<div class="error-message">Database manager not available</div>';
        return;
    }
    
    // Get all academics
    const academics = databaseManager.getAllAcademics();
    
    if (!academics || academics.length === 0) {
        databaseContent.innerHTML = '<div class="info-message">No academics found in the database</div>';
        return;
    }
    
    // Sort academics by name
    academics.sort((a, b) => a.name.localeCompare(b.name));
    
    // Group academics by first letter
    const groupedAcademics = {};
    academics.forEach(academic => {
        const firstLetter = academic.name.charAt(0).toUpperCase();
        if (!groupedAcademics[firstLetter]) {
            groupedAcademics[firstLetter] = [];
        }
        groupedAcademics[firstLetter].push(academic);
    });
    
    // Create alphabet navigation
    const alphabetNav = document.createElement('div');
    alphabetNav.className = 'alphabet-nav';
    
    // Get all letters that have academics
    const letters = Object.keys(groupedAcademics).sort();
    
    // Add all letters A-Z with disabled state for those without academics
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const letterLink = document.createElement('a');
        letterLink.textContent = letter;
        letterLink.href = `#letter-${letter}`;
        
        if (!letters.includes(letter)) {
            letterLink.className = 'disabled';
        }
        
        alphabetNav.appendChild(letterLink);
    }
    
    databaseContent.appendChild(alphabetNav);
    
    // Create academic listings by letter
    letters.forEach(letter => {
        const letterSection = document.createElement('div');
        letterSection.className = 'letter-section';
        letterSection.id = `letter-${letter}`;
        
        const letterHeader = document.createElement('h2');
        letterHeader.textContent = letter;
        letterSection.appendChild(letterHeader);
        
        const academicsList = document.createElement('div');
        academicsList.className = 'academics-list';
        
        groupedAcademics[letter].forEach(academic => {
            const academicItem = document.createElement('div');
            academicItem.className = 'academic-item';
            
            const academicLink = document.createElement('a');
            academicLink.textContent = academic.name;
            academicLink.href = '#';
            academicLink.addEventListener('click', (e) => {
                e.preventDefault();
                displayAcademic(academic);
                
                // Switch to results view
                hideAllSections();
                document.getElementById('results-container').style.display = 'block';
            });
            
            academicItem.appendChild(academicLink);
            
            // Add discipline tags if available
            if (academic.taxonomies && academic.taxonomies.discipline) {
                const tags = document.createElement('div');
                tags.className = 'taxonomy-tags';
                
                academic.taxonomies.discipline.forEach(discipline => {
                    const tag = document.createElement('span');
                    tag.className = 'taxonomy-tag';
                    tag.textContent = discipline;
                    tags.appendChild(tag);
                });
                
                academicItem.appendChild(tags);
            }
            
            academicsList.appendChild(academicItem);
        });
        
        letterSection.appendChild(academicsList);
        databaseContent.appendChild(letterSection);
    });
}

/**
 * Load novelty tiles
 */
function loadNoveltyTiles() {
    const noveltyContent = document.getElementById('novelty-tiles-content');
    if (!noveltyContent) return;
    
    // Clear existing content
    noveltyContent.innerHTML = '';
    
    // Check if database manager is available
    if (typeof databaseManager === 'undefined') {
        noveltyContent.innerHTML = '<div class="error-message">Database manager not available</div>';
        return;
    }
    
    // Get recent novelty tiles
    const tiles = databaseManager.getRecentNoveltyTiles(20);
    
    if (!tiles || tiles.length === 0) {
        noveltyContent.innerHTML = '<div class="info-message">No novelty tiles found</div>';
        return;
    }
    
    // Create novelty tiles
    tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = 'novelty-tile';
        
        // Add type class if available
        if (tile.type) {
            tileElement.classList.add(`tile-type-${tile.type}`);
        }
        
        const tileTitle = document.createElement('h3');
        tileTitle.className = 'tile-title';
        tileTitle.textContent = tile.title;
        tileElement.appendChild(tileTitle);
        
        const tileContent = document.createElement('div');
        tileContent.className = 'tile-content';
        tileContent.textContent = tile.content;
        tileElement.appendChild(tileContent);
        
        const tileDate = document.createElement('div');
        tileDate.className = 'tile-date';
        tileDate.textContent = new Date(tile.date).toLocaleDateString();
        tileElement.appendChild(tileDate);
        
        noveltyContent.appendChild(tileElement);
    });
}

/**
 * Display academic profile
 * @param {Object} academic - Academic object
 */
function displayAcademic(academic) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    const profileContainer = resultsContainer.querySelector('.academic-profile') || 
                            document.createElement('div');
    profileContainer.className = 'academic-profile';
    profileContainer.innerHTML = '';
    
    // Create academic header
    const header = document.createElement('div');
    header.className = 'academic-header';
    
    const name = document.createElement('h2');
    name.className = 'academic-name';
    name.textContent = academic.name;
    header.appendChild(name);
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    // Favorite button
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'action-btn favorite-btn';
    favoriteButton.innerHTML = '★';
    favoriteButton.title = 'Add to favorites';
    favoriteButton.addEventListener('click', () => {
        if (typeof databaseManager !== 'undefined') {
            const favorites = databaseManager.getFavorites();
            if (favorites.includes(academic.name)) {
                databaseManager.removeFromFavorites(academic.name);
                favoriteButton.classList.remove('active');
                favoriteButton.title = 'Add to favorites';
            } else {
                databaseManager.addToFavorites(academic.name);
                favoriteButton.classList.add('active');
                favoriteButton.title = 'Remove from favorites';
            }
        }
    });
    
    // Check if already in favorites
    if (typeof databaseManager !== 'undefined') {
        const favorites = databaseManager.getFavorites();
        if (favorites.includes(academic.name)) {
            favoriteButton.classList.add('active');
            favoriteButton.title = 'Remove from favorites';
        }
    }
    
    actionButtons.appendChild(favoriteButton);
    
    // Visualize button
    const visualizeButton = document.createElement('button');
    visualizeButton.className = 'action-btn visualize-btn';
    visualizeButton.innerHTML = '◉';
    visualizeButton.title = 'Visualize connections';
    visualizeButton.addEventListener('click', () => {
        visualizeAcademic(academic);
    });
    actionButtons.appendChild(visualizeButton);
    
    header.appendChild(actionButtons);
    profileContainer.appendChild(header);
    
    // Add bio
    if (academic.bio) {
        const bio = document.createElement('div');
        bio.className = 'academic-bio';
        bio.textContent = academic.bio;
        profileContainer.appendChild(bio);
    }
    
    // Add taxonomies
    if (academic.taxonomies && Object.keys(academic.taxonomies).length > 0) {
        const taxonomies = document.createElement('div');
        taxonomies.className = 'academic-taxonomies';
        
        for (const [category, values] of Object.entries(academic.taxonomies)) {
            if (values && values.length > 0) {
                const taxonomyCategory = document.createElement('div');
                taxonomyCategory.className = 'taxonomy-category';
                
                const categoryLabel = document.createElement('span');
                categoryLabel.className = 'category-label';
                categoryLabel.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ':';
                taxonomyCategory.appendChild(categoryLabel);
                
                const categoryValues = document.createElement('div');
                categoryValues.className = 'category-values';
                
                values.forEach(value => {
                    const valueTag = document.createElement('span');
                    valueTag.className = 'taxonomy-value';
                    valueTag.textContent = value;
                    valueTag.addEventListener('click', () => {
                        const criteria = {};
                        criteria[category] = value;
                        searchByTaxonomy(criteria);
                    });
                    categoryValues.appendChild(valueTag);
                });
                
                taxonomyCategory.appendChild(categoryValues);
                taxonomies.appendChild(taxonomyCategory);
            }
        }
        
        profileContainer.appendChild(taxonomies);
    }
    
    // Add papers
    if (academic.papers && academic.papers.length > 0) {
        const papersSection = document.createElement('div');
        papersSection.className = 'academic-section';
        
        const papersHeader = document.createElement('h3');
        papersHeader.textContent = 'Papers';
        papersSection.appendChild(papersHeader);
        
        const papersList = document.createElement('ul');
        papersList.className = 'papers-list';
        
        // Sort papers by year (descending)
        const sortedPapers = [...academic.papers].sort((a, b) => b.year - a.year);
        
        sortedPapers.forEach(paper => {
            const paperItem = document.createElement('li');
            paperItem.className = 'paper-item';
            
            let paperText = paper.title;
            if (paper.year) {
                paperText += ` (${paper.year})`;
            }
            
            if (paper.coauthors && paper.coauthors.length > 0) {
                paperText += ` with ${paper.coauthors.join(', ')}`;
            }
            
            paperItem.textContent = paperText;
            papersList.appendChild(paperItem);
        });
        
        papersSection.appendChild(papersList);
        profileContainer.appendChild(papersSection);
    }
    
    // Add events
    if (academic.events && academic.events.length > 0) {
        const eventsSection = document.createElement('div');
        eventsSection.className = 'academic-section';
        
        const eventsHeader = document.createElement('h3');
        eventsHeader.textContent = 'Events';
        eventsSection.appendChild(eventsHeader);
        
        const eventsList = document.createElement('ul');
        eventsList.className = 'events-list';
        
        // Sort events by year (descending)
        const sortedEvents = [...academic.events].sort((a, b) => b.year - a.year);
        
        sortedEvents.forEach(event => {
            const eventItem = document.createElement('li');
            eventItem.className = 'event-item';
            
            let eventText = event.title;
            if (event.year) {
                eventText += ` (${event.year})`;
            }
            
            if (event.location) {
                eventText += `, ${event.location}`;
            }
            
            eventItem.textContent = eventText;
            eventsList.appendChild(eventItem);
        });
        
        eventsSection.appendChild(eventsList);
        profileContainer.appendChild(eventsSection);
    }
    
    // Add connections
    if (academic.connections && academic.connections.length > 0) {
        const connectionsSection = document.createElement('div');
        connectionsSection.className = 'academic-section';
        
        const connectionsHeader = document.createElement('h3');
        connectionsHeader.textContent = 'Connections';
        connectionsSection.appendChild(connectionsHeader);
        
        const connectionsList = document.createElement('div');
        connectionsList.className = 'connections-list';
        
        // Sort connections alphabetically
        const sortedConnections = [...academic.connections].sort();
        
        sortedConnections.forEach(connection => {
            const connectionItem = document.createElement('span');
            connectionItem.className = 'connection-item';
            connectionItem.textContent = connection;
            connectionItem.addEventListener('click', () => {
                const connectedAcademic = databaseManager.getAcademic(connection);
                if (connectedAcademic) {
                    displayAcademic(connectedAcademic);
                } else {
                    displayErrorMessage(`Academic not found: ${connection}`, 'database');
                }
            });
            connectionsList.appendChild(connectionItem);
        });
        
        connectionsSection.appendChild(connectionsList);
        profileContainer.appendChild(connectionsSection);
    }
    
    // Append the profile container to the results container
    if (!resultsContainer.querySelector('.academic-profile')) {
        resultsContainer.appendChild(profileContainer);
    }
}

/**
 * Search by taxonomy criteria
 * @param {Object} criteria - Taxonomy criteria
 */
function searchByTaxonomy(criteria) {
    if (typeof databaseManager === 'undefined') {
        displayErrorMessage('Database manager not available', 'database');
        return;
    }
    
    // Search for academics matching the criteria
    const results = databaseManager.searchAcademics(criteria);
    
    if (!results || results.length === 0) {
        displayErrorMessage(`No academics found matching the criteria`, 'database');
        return;
    }
    
    // Display the first result
    displayAcademic(results[0]);
    
    // Show all results if there are multiple
    if (results.length > 1) {
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            let relatedContainer = resultsContainer.querySelector('.related-academics');
            
            if (!relatedContainer) {
                relatedContainer = document.createElement('div');
                relatedContainer.className = 'related-academics';
                resultsContainer.appendChild(relatedContainer);
            }
            
            relatedContainer.innerHTML = '';
            
            const header = document.createElement('h3');
            header.textContent = `Related Academics (${results.length})`;
            relatedContainer.appendChild(header);
            
            const relatedList = document.createElement('div');
            relatedList.className = 'related-list';
            
            results.slice(1).forEach(academic => {
                const relatedItem = document.createElement('div');
                relatedItem.className = 'related-item';
                relatedItem.textContent = academic.name;
                relatedItem.addEventListener('click', () => {
                    displayAcademic(academic);
                });
                relatedList.appendChild(relatedItem);
            });
            
            relatedContainer.appendChild(relatedList);
        }
    }
    
    // Switch to results view
    hideAllSections();
    document.getElementById('results-container').style.display = 'block';
}

/**
 * Persistent search history
 */
let commandHistory = [];
let historyIndex = -1;

function loadSearchHistory() {
    try {
        const history = localStorage.getItem('killphilosophy_searchHistory');
        if (history) {
            commandHistory = JSON.parse(history);
            updateCommandHistoryDisplay();
        }
    } catch (error) {
        console.error('Error loading search history:', error);
    }
}

function saveSearchHistory() {
    try {
        localStorage.setItem('killphilosophy_searchHistory', JSON.stringify(commandHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

function updateCommandHistoryDisplay() {
    const historyList = document.querySelector('.command-history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    // Show the 10 most recent commands
    commandHistory.slice(-10).reverse().forEach(command => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = command;
        historyItem.addEventListener('click', () => {
            const searchBox = document.querySelector('.search-box');
            if (searchBox) {
                searchBox.value = command;
                searchBox.focus();
            }
        });
        historyList.appendChild(historyItem);
    });
}

/**
 * Update search functionality to save history
 */
window.handleSearch = function(query) {
    if (!query || query.trim() === '') return;
    
    // Add to command history if not already the most recent
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== query) {
        commandHistory.push(query);
        // Keep command history manageable
        if (commandHistory.length > 20) {
            commandHistory = commandHistory.slice(-20);
        }
        historyIndex = -1;
        updateCommandHistoryDisplay();
        
        // Save search history
        saveSearchHistory();
    }
    
    // Show search status
    const searchStatus = document.querySelector('.search-status');
    if (searchStatus) {
        searchStatus.style.display = 'block';
        document.querySelector('.search-status-text').textContent = `Searching for "${query}"...`;
    }
    
    // Simulate search delay for effect (matches the retro aesthetic)
    setTimeout(() => {
        // Search the database
        if (typeof databaseManager !== 'undefined') {
            const academic = databaseManager.getAcademic(query);
            
            if (academic) {
                // Academic found - display profile
                displayAcademic(academic);
                
                // Hide search status
                if (searchStatus) {
                    searchStatus.style.display = 'none';
                }
                
                // Switch to academic profile view
                hideAllSections();
                document.getElementById('results-container').style.display = 'block';
            } else {
                // No direct match, try a broader search
                const results = databaseManager.searchAcademics({ name: query });
                
                if (results && results.length > 0) {
                    // Matches found - display first result
                    displayAcademic(results[0]);
                    
                    // Hide search status
                    if (searchStatus) {
                        searchStatus.style.display = 'none';
                    }
                    
                    // Switch to academic profile view
                    hideAllSections();
                    document.getElementById('results-container').style.display = 'block';
                } else {
                    // No matches found
                    if (searchStatus) {
                        searchStatus.style.display = 'block';
                        document.querySelector('.search-status-text').textContent = `No results found for "${query}"`;
                    }
                }
            }
        } else {
            // Database not available
            if (searchStatus) {
                searchStatus.style.display = 'block';
                document.querySelector('.search-status-text').textContent = 'Database not available. Please try again later.';
            }
        }
    }, 800); // 800ms delay for retro terminal effect
};

// Debounce function for performance optimization
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Enhanced search listeners with debouncing
 */
function setupSearchListeners() {
    const searchBox = document.querySelector('.search-box');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const commandHistoryList = document.querySelector('.command-history-list');
    const searchStatus = document.querySelector('.search-status');
    
    if (!searchBox) return;
    
    // Add debounced input handler for better performance
    searchBox.addEventListener('input', debounce(() => {
        const query = searchBox.value.trim();
        
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        // Get matching academics
        if (typeof databaseManager !== 'undefined') {
            const academics = databaseManager.getAllAcademics();
            const matches = academics.filter(academic => 
                academic.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions
            
            // Display suggestions
            if (matches.length > 0) {
                suggestionsContainer.innerHTML = '';
                matches.forEach((academic, index) => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion-item';
                    suggestion.setAttribute('role', 'option');
                    suggestion.setAttribute('aria-selected', 'false');
                    suggestion.textContent = academic.name;
                    suggestion.addEventListener('click', () => {
                        searchBox.value = academic.name;
                        suggestionsContainer.innerHTML = '';
                        handleSearch(academic.name);
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
                
                // Add ARIA attributes to suggestions container
                suggestionsContainer.setAttribute('role', 'listbox');
                suggestionsContainer.setAttribute('aria-label', 'Search suggestions');
            } else {
                suggestionsContainer.innerHTML = '';
            }
        }
    }, 300));
    
    // Handle form submission
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchBox.value.trim();
            if (query) {
                handleSearch(query);
                suggestionsContainer.innerHTML = '';
            }
        });
    }
    
    // Handle keyboard navigation for command history
    searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                if (historyIndex === -1) {
                    historyIndex = commandHistory.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                searchBox.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    searchBox.value = commandHistory[historyIndex];
                } else {
                    historyIndex = -1;
                    searchBox.value = '';
                }
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.innerHTML = '';
        }
    });
}

/**
 * Check admin access
 */
function checkAdminAccess() {
    // Check if URL has admin parameter
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    
    // Check if localStorage has admin flag
    const adminFlag = localStorage.getItem('killphilosophy_admin');
    
    // Show admin link if either check passes
    if (adminParam === 'true' || adminFlag === 'true') {
        const adminLink = document.getElementById('nav-admin');
        if (adminLink) {
            adminLink.style.display = 'inline-block';
            
            // Add event listener if not already added
            if (!adminLink.hasAttribute('data-listener-added')) {
                adminLink.addEventListener('click', navAdminHandler);
                adminLink.setAttribute('data-listener-added', 'true');
            }
        }
        
        // Store admin flag in localStorage for persistence
        localStorage.setItem('killphilosophy_admin', 'true');
    }
}

// Make all navigation handlers globally available
window.navSearchHandler = navSearchHandler;
window.navDatabaseHandler = navDatabaseHandler;
window.navNoveltyHandler = navNoveltyHandler;
window.navDeepSearchHandler = navDeepSearchHandler;
window.navAboutHandler = navAboutHandler;
window.navContributeHandler = navContributeHandler;
window.navAdminHandler = navAdminHandler;
