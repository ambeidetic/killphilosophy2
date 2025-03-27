/**
 * DeepSearch API Integration for KillPhilosophy
 * Handles AI-powered deep search functionality to discover connections between academics
 */

class DeepSearchAPI {
    constructor() {
        this.apiKey = '';
        this.endpoint = 'https://api.example.com/deepsearch'; // Replace with actual endpoint
        this.isInitialized = false;
        this.searchInProgress = false;
        this.searchDepth = 'medium';
        this.searchCache = {};
        
        // Load API key from localStorage if available
        this._loadAPIKey();
    }
    
    /**
     * Load API key from localStorage
     * @private
     */
    _loadAPIKey() {
        try {
            const savedKey = localStorage.getItem('killphilosophy_deepsearch_api_key');
            if (savedKey) {
                this.apiKey = savedKey;
                this.isInitialized = true;
                console.log('DeepSearch API key loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading DeepSearch API key:', error);
        }
    }
    
    /**
     * Save API key to localStorage
     * @private
     * @param {string} apiKey - API key to save
     * @returns {boolean} - Success indicator
     */
    _saveAPIKey(apiKey) {
        try {
            if (apiKey) {
                localStorage.setItem('killphilosophy_deepsearch_api_key', apiKey);
                return true;
            } else {
                localStorage.removeItem('killphilosophy_deepsearch_api_key');
                return false;
            }
        } catch (error) {
            console.error('Error saving DeepSearch API key:', error);
            return false;
        }
    }
    
    /**
     * Set the API key for DeepSearch
     * @param {string} apiKey - API key
     * @returns {boolean} - Success indicator
     */
    setAPIKey(apiKey) {
        if (!apiKey) {
            console.error('Invalid API key');
            return false;
        }
        
        this.apiKey = apiKey;
        this.isInitialized = true;
        
        // Save to localStorage
        this._saveAPIKey(apiKey);
        
        console.log('DeepSearch API key set successfully');
        return true;
    }
    
    /**
     * Clear the API key
     * @returns {boolean} - Success indicator
     */
    clearAPIKey() {
        this.apiKey = '';
        this.isInitialized = false;
        
        // Remove from localStorage
        this._saveAPIKey('');
        
        console.log('DeepSearch API key cleared');
        return true;
    }
    
    /**
     * Set search depth level
     * @param {string} depth - Search depth level ('basic', 'medium', 'deep')
     */
    setSearchDepth(depth) {
        const validDepths = ['basic', 'medium', 'deep'];
        
        if (validDepths.includes(depth)) {
            this.searchDepth = depth;
            console.log(`Search depth set to: ${depth}`);
            return true;
        } else {
            console.error(`Invalid search depth: ${depth}. Valid options are: ${validDepths.join(', ')}`);
            return false;
        }
    }
    
    /**
     * Check if API is initialized with a key
     * @returns {boolean} - Initialization status
     */
    isAPIInitialized() {
        return this.isInitialized;
    }
    
    /**
     * Check if a search is in progress
     * @returns {boolean} - Search status
     */
    isSearching() {
        return this.searchInProgress;
    }
    
    /**
     * Check if a search query is in the cache
     * @param {string} query - Search query
     * @param {string} depth - Search depth
     * @returns {boolean} - Cache hit status
     */
    isQueryCached(query, depth) {
        const cacheKey = `${query}_${depth}`;
        return !!this.searchCache[cacheKey];
    }
    
    /**
     * Get cached results for a query
     * @param {string} query - Search query
     * @param {string} depth - Search depth
     * @returns {Object|null} - Cached results or null
     */
    getCachedResults(query, depth) {
        const cacheKey = `${query}_${depth}`;
        return this.searchCache[cacheKey] || null;
    }
    
    /**
     * Mock demo search function for when API is not available or for testing
     * This simulates the search process locally
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async demoSearch(query) {
        console.log('Running demo search with query:', query);
        
        // Simulate API call with a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // Get academics from database manager
                let academics = [];
                if (typeof databaseManager !== 'undefined') {
                    academics = databaseManager.getAllAcademics();
                }
                
                // Process the query to find relevant keywords
                const keywords = query.toLowerCase()
                    .split(/\s+/)
                    .filter(word => word.length > 3)
                    .map(word => word.replace(/[^\w]/g, ''));
                
                console.log('Extracted keywords:', keywords);
                
                // Find matching academics
                const matches = [];
                
                // Score each academic based on the query
                academics.forEach(academic => {
                    let score = 0;
                    
                    // Check name match
                    const nameLower = academic.name.toLowerCase();
                    const nameMatch = keywords.some(keyword => nameLower.includes(keyword));
                    if (nameMatch) score += 5;
                    
                    // Check bio match
                    if (academic.bio) {
                        const bioLower = academic.bio.toLowerCase();
                        keywords.forEach(keyword => {
                            if (bioLower.includes(keyword)) score += 2;
                        });
                    }
                    
                    // Check taxonomy match
                    if (academic.taxonomies) {
                        for (const category in academic.taxonomies) {
                            const values = academic.taxonomies[category];
                            if (values && Array.isArray(values)) {
                                values.forEach(value => {
                                    const valueLower = value.toLowerCase();
                                    keywords.forEach(keyword => {
                                        if (valueLower.includes(keyword)) score += 3;
                                    });
                                });
                            }
                        }
                    }
                    
                    // Check papers and events match
                    if (academic.papers) {
                        academic.papers.forEach(paper => {
                            const titleLower = paper.title.toLowerCase();
                            keywords.forEach(keyword => {
                                if (titleLower.includes(keyword)) score += 1;
                            });
                        });
                    }
                    
                    if (academic.events) {
                        academic.events.forEach(event => {
                            const titleLower = event.title.toLowerCase();
                            keywords.forEach(keyword => {
                                if (titleLower.includes(keyword)) score += 1;
                            });
                        });
                    }
                    
                    // Add to matches if score is above threshold
                    if (score > 0) {
                        matches.push({
                            academic,
                            score
                        });
                    }
                });
                
                // Sort matches by score
                matches.sort((a, b) => b.score - a.score);
                
                // Generate connections between top matches
                const connections = [];
                
                for (let i = 0; i < Math.min(matches.length, 5); i++) {
                    for (let j = i + 1; j < Math.min(matches.length, 5); j++) {
                        const academicA = matches[i].academic;
                        const academicB = matches[j].academic;
                        
                        // Check for direct connection
                        const isDirectlyConnected = 
                            academicA.connections?.includes(academicB.name) || 
                            academicB.connections?.includes(academicA.name);
                        
                        // Generate a synthetic connection based on shared taxonomies
                        const sharedTaxonomies = [];
                        
                        if (academicA.taxonomies && academicB.taxonomies) {
                            for (const category in academicA.taxonomies) {
                                const valuesA = academicA.taxonomies[category];
                                const valuesB = academicB.taxonomies[category];
                                
                                if (valuesA && valuesB) {
                                    const shared = valuesA.filter(value => valuesB.includes(value));
                                    if (shared.length > 0) {
                                        sharedTaxonomies.push({
                                            category,
                                            values: shared
                                        });
                                    }
                                }
                            }
                        }
                        
                        if (isDirectlyConnected || sharedTaxonomies.length > 0) {
                            connections.push({
                                academicA: academicA.name,
                                academicB: academicB.name,
                                isDirectlyConnected,
                                sharedTaxonomies,
                                strength: (isDirectlyConnected ? 5 : 0) + sharedTaxonomies.length * 2
                            });
                        }
                    }
                }
                
                // Prepare the response
                const results = {
                    query,
                    timestamp: new Date().toISOString(),
                    matches: matches.slice(0, 10).map(match => ({
                        name: match.academic.name,
                        score: match.score,
                        relevance: (match.score / Math.max(...matches.map(m => m.score)) * 100).toFixed(1) + '%'
                    })),
                    connections: connections.sort((a, b) => b.strength - a.strength),
                    analysis: `Found ${matches.length} academics and ${connections.length} connections related to "${query}".
The most relevant academic is ${matches[0]?.academic.name || 'none'}.`
                };
                
                resolve(results);
            }, 2000); // 2 second delay for realism
        });
    }
    
    /**
     * Execute a deep search
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} - Search results
     */
    async executeSearch(query, options = {}) {
        if (!query || query.trim() === '') {
            throw new Error('Empty search query');
        }
        
        query = query.trim();
        
        // Check for cached results
        const depth = options.depth || this.searchDepth;
        const cacheKey = `${query}_${depth}`;
        
        if (this.searchCache[cacheKey]) {
            console.log(`Using cached results for query: ${query}`);
            return this.searchCache[cacheKey];
        }
        
        // Set search in progress
        this.searchInProgress = true;
        
        try {
            let results;
            
            // If API is initialized, use the real API
            if (this.isInitialized) {
                // Prepare request
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        query,
                        depth,
                        ...options
                    })
                };
                
                // Execute request
                const response = await fetch(this.endpoint, requestOptions);
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `API request failed with status ${response.status}`);
                }
                
                results = await response.json();
            } else {
                // Use demo search if API is not initialized
                results = await this.demoSearch(query);
            }
            
            // Cache the results
            this.searchCache[cacheKey] = results;
            
            // Limit cache size
            const cacheKeys = Object.keys(this.searchCache);
            if (cacheKeys.length > 20) {
                delete this.searchCache[cacheKeys[0]];
            }
            
            return results;
        } catch (error) {
            console.error('DeepSearch error:', error);
            throw error;
        } finally {
            // Clear search in progress
            this.searchInProgress = false;
        }
    }
    
    /**
     * Convert search results to a network visualization format
     * @param {Object} results - Deep search results
     * @returns {Object} - Network visualization data
     */
    convertToNetworkData(results) {
        if (!results || !results.connections) {
            return { nodes: [], links: [] };
        }
        
        const nodes = new Map();
        const links = [];
        
        // Add nodes from match results
        if (results.matches) {
            results.matches.forEach(match => {
                nodes.set(match.name, {
                    id: match.name,
                    group: 'match',
                    score: parseFloat(match.score) || 1
                });
            });
        }
        
        // Process connections
        results.connections.forEach(connection => {
            // Add nodes if they don't exist
            if (!nodes.has(connection.academicA)) {
                nodes.set(connection.academicA, {
                    id: connection.academicA,
                    group: 'related',
                    score: 1
                });
            }
            
            if (!nodes.has(connection.academicB)) {
                nodes.set(connection.academicB, {
                    id: connection.academicB,
                    group: 'related',
                    score: 1
                });
            }
            
            // Add link
            links.push({
                source: connection.academicA,
                target: connection.academicB,
                value: connection.strength || 1,
                type: connection.isDirectlyConnected ? 'direct' : 'indirect'
            });
        });
        
        return {
            nodes: Array.from(nodes.values()),
            links
        };
    }
    
    /**
     * Process academic search results to database format
     * @param {Object} results - Deep search results
     * @returns {Object} - Formatted academic data
     */
    formatAcademicData(results) {
        if (!results || !results.matches || !results.matches.length) {
            return null;
        }
        
        // Get the top match
        const topMatch = results.matches[0];
        
        // Find all connections for this academic
        const connections = results.connections.filter(conn => 
            conn.academicA === topMatch.name || conn.academicB === topMatch.name
        );
        
        // Extract connection names
        const connectionNames = connections.map(conn => 
            conn.academicA === topMatch.name ? conn.academicB : conn.academicA
        );
        
        // Find taxonomy information
        const taxonomies = {};
        
        connections.forEach(conn => {
            if (conn.sharedTaxonomies) {
                conn.sharedTaxonomies.forEach(taxonomy => {
                    if (!taxonomies[taxonomy.category]) {
                        taxonomies[taxonomy.category] = [];
                    }
                    
                    taxonomy.values.forEach(value => {
                        if (!taxonomies[taxonomy.category].includes(value)) {
                            taxonomies[taxonomy.category].push(value);
                        }
                    });
                });
            }
        });
        
        // Create formatted academic data
        const academic = {
            name: topMatch.name,
            bio: `This academic was found through a DeepSearch query: "${results.query}"`,
            taxonomies,
            connections: connectionNames,
            papers: [],
            events: []
        };
        
        return academic;
    }
}

// Initialize the DeepSearch API
const deepSearchAPI = new DeepSearchAPI();

// Make it available globally
window.deepSearchAPI = deepSearchAPI;

// Setup DeepSearch UI events once the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // API key management
    const apiKeyLink = document.getElementById('api-key-link');
    const apiKeyConfig = document.getElementById('api-key-config');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    
    // Deep search form
    const deepSearchInput = document.getElementById('deep-search-input');
    const searchDepthSelect = document.getElementById('search-depth');
    const runDeepSearchBtn = document.getElementById('run-deep-search');
    const searchStatusContainer = document.querySelector('.search-status-container');
    const deepSearchResults = document.getElementById('deep-search-results');
    
    // Setup API key configuration
    if (apiKeyLink && apiKeyConfig) {
        apiKeyLink.addEventListener('click', (e) => {
            e.preventDefault();
            apiKeyConfig.classList.toggle('visible');
            apiKeyConfig.style.display = apiKeyConfig.classList.contains('visible') ? 'block' : 'none';
        });
    }
    
    // Save API key
    if (saveApiKeyBtn && apiKeyInput) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            
            if (apiKey) {
                deepSearchAPI.setAPIKey(apiKey);
                apiKeyInput.value = '';
                apiKeyConfig.style.display = 'none';
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'API key saved successfully.';
                
                if (apiKeyConfig.parentNode) {
                    apiKeyConfig.parentNode.insertBefore(successMessage, apiKeyConfig);
                    
                    // Remove after 3 seconds
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
                }
            } else {
                // Clear API key
                deepSearchAPI.clearAPIKey();
                
                // Show message
                const infoMessage = document.createElement('div');
                infoMessage.className = 'info-message';
                infoMessage.textContent = 'API key cleared. Using demo mode.';
                
                if (apiKeyConfig.parentNode) {
                    apiKeyConfig.parentNode.insertBefore(infoMessage, apiKeyConfig);
                    
                    // Remove after 3 seconds
                    setTimeout(() => {
                        infoMessage.remove();
                    }, 3000);
                }
            }
        });
    }
    
    // Set search depth
    if (searchDepthSelect) {
        searchDepthSelect.addEventListener('change', () => {
            deepSearchAPI.setSearchDepth(searchDepthSelect.value);
        });
        
        // Initialize with default value
        deepSearchAPI.setSearchDepth(searchDepthSelect.value);
    }
    
    // Run deep search
    if (runDeepSearchBtn && deepSearchInput) {
        runDeepSearchBtn.addEventListener('click', async () => {
            const query = deepSearchInput.value.trim();
            
            if (!query) {
                if (deepSearchResults) {
                    deepSearchResults.innerHTML = '<div class="error-message">Please enter a search query</div>';
                }
                return;
            }
            
            // Show search status
            if (searchStatusContainer) {
                searchStatusContainer.style.display = 'block';
                
                // Set up progress bar animation
                const progressBar = searchStatusContainer.querySelector('.deep-search-progress-bar');
                if (progressBar) {
                    progressBar.style.width = '0%';
                    
                    // Animate progress
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += 5;
                        if (progress > 90) {
                            progress = 90;  // Max out at 90% until complete
                            clearInterval(progressInterval);
                        }
                        progressBar.style.width = `${progress}%`;
                    }, 200);
                }
            }
            
            // Clear previous results
            if (deepSearchResults) {
                deepSearchResults.innerHTML = '';
            }
            
            try {
                // Execute search
                const depth = searchDepthSelect ? searchDepthSelect.value : 'medium';
                const results = await deepSearchAPI.executeSearch(query, { depth });
                
                // Complete progress bar
                if (searchStatusContainer) {
                    const progressBar = searchStatusContainer.querySelector('.deep-search-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '100%';
                    }
                    
                    // Hide after a short delay
                    setTimeout(() => {
                        searchStatusContainer.style.display = 'none';
                    }, 500);
                }
                
                // Display results
                if (deepSearchResults) {
                    // Clear previous results
                    deepSearchResults.innerHTML = '';
                    
                    // Create results header
                    const resultsHeader = document.createElement('h3');
                    resultsHeader.textContent = `Results for "${query}"`;
                    deepSearchResults.appendChild(resultsHeader);
                    
                    // Create results content
                    const resultsContent = document.createElement('div');
                    resultsContent.className = 'deep-search-result-content';
                    
                    // Add analysis text
                    if (results.analysis) {
                        resultsContent.textContent = results.analysis;
                    }
                    
                    deepSearchResults.appendChild(resultsContent);
                    
                    // Add matches section
                    if (results.matches && results.matches.length > 0) {
                        const matchesHeader = document.createElement('h4');
                        matchesHeader.textContent = 'Top Matches';
                        deepSearchResults.appendChild(matchesHeader);
                        
                        const matchesList = document.createElement('ul');
                        matchesList.className = 'matches-list';
                        
                        results.matches.forEach(match => {
                            const matchItem = document.createElement('li');
                            matchItem.className = 'match-item';
                            matchItem.innerHTML = `<strong>${match.name}</strong> (Relevance: ${match.relevance})`;
                            
                            // Add click handler to view academic
                            matchItem.addEventListener('click', () => {
                                if (typeof handleSearch === 'function') {
                                    handleSearch(match.name);
                                }
                            });
                            
                            matchesList.appendChild(matchItem);
                        });
                        
                        deepSearchResults.appendChild(matchesList);
                    }
                    
                    // Add connections section
                    if (results.connections && results.connections.length > 0) {
                        const connectionsHeader = document.createElement('h4');
                        connectionsHeader.textContent = 'Discovered Connections';
                        deepSearchResults.appendChild(connectionsHeader);
                        
                        const connectionsList = document.createElement('ul');
                        connectionsList.className = 'connections-list';
                        
                        results.connections.forEach(connection => {
                            const connectionItem = document.createElement('li');
                            connectionItem.className = 'connection-item';
                            
                            let connectionText = `<strong>${connection.academicA}</strong> ↔ <strong>${connection.academicB}</strong>`;
                            
                            if (connection.isDirectlyConnected) {
                                connectionText += ' (Direct connection)';
                            }
                            
                            if (connection.sharedTaxonomies && connection.sharedTaxonomies.length > 0) {
                                connectionText += '<br>Shared: ';
                                connection.sharedTaxonomies.forEach((taxonomy, index) => {
                                    if (index > 0) connectionText += ', ';
                                    connectionText += `${taxonomy.category} (${taxonomy.values.join(', ')})`;
                                });
                            }
                            
                            connectionItem.innerHTML = connectionText;
                            connectionsList.appendChild(connectionItem);
                        });
                        
                        deepSearchResults.appendChild(connectionsList);
                    }
                    
                    // Add network visualization option
                    if (typeof visualizeNetwork === 'function') {
                        const visualizeButton = document.createElement('button');
                        visualizeButton.className = 'action-btn';
                        visualizeButton.textContent = 'Visualize Network';
                        visualizeButton.addEventListener('click', () => {
                            // Convert search results to network data
                            const networkData = deepSearchAPI.convertToNetworkData(results);
                            
                            // Display in visualization container
                            const container = document.getElementById('visualization-container');
                            if (container) {
                                container.style.display = 'block';
                                
                                // Clear previous visualization
                                container.innerHTML = '';
                                
                                // Add title
                                const title = document.createElement('h3');
                                title.className = 'visualization-title';
                                title.textContent = `Network for "${query}"`;
                                container.appendChild(title);
                                
                                // Add close button
                                const closeButton = document.createElement('button');
                                closeButton.className = 'close-visualization-btn';
                                closeButton.textContent = '×';
                                closeButton.addEventListener('click', () => {
                                    container.style.display = 'none';
                                });
                                container.appendChild(closeButton);
                                
                                // Create visualization
                                if (typeof d3 !== 'undefined') {
                                    // D3.js visualization code here
                                    // (Similar to what's in network-visualization.js)
                                } else {
                                    container.innerHTML += '<div class="error-message">D3.js library not loaded</div>';
                                }
                            }
                        });
                        
                        deepSearchResults.appendChild(visualizeButton);
                    }
                    
                    // Add option to save as academic
                    if (results.matches && results.matches.length > 0) {
                        // Format academic data from search results
                        const academicData = deepSearchAPI.formatAcademicData(results);
                        
                        if (academicData) {
                            const saveButton = document.createElement('button');
                            saveButton.className = 'save-academic-btn';
                            saveButton.textContent = `Save "${results.matches[0].name}" to Database`;
                            
                            saveButton.addEventListener('click', () => {
                                if (typeof databaseManager !== 'undefined') {
                                    const success = databaseManager.addOrUpdateAcademic(academicData);
                                    
                                    if (success) {
                                        const successMessage = document.createElement('div');
                                        successMessage.className = 'success-message';
                                        successMessage.textContent = `Academic "${academicData.name}" saved successfully.`;
                                        deepSearchResults.appendChild(successMessage);
                                        
                                        // Remove after 5 seconds
                                        setTimeout(() => {
                                            successMessage.remove();
                                        }, 5000);
                                    } else {
                                        const errorMessage = document.createElement('div');
                                        errorMessage.className = 'error-message';
                                        errorMessage.textContent = 'Failed to save academic to database.';
                                        deepSearchResults.appendChild(errorMessage);
                                    }
                                } else {
                                    const errorMessage = document.createElement('div');
                                    errorMessage.className = 'error-message';
                                    errorMessage.textContent = 'Database manager not available.';
                                    deepSearchResults.appendChild(errorMessage);
                                }
                            });
                            
                            deepSearchResults.appendChild(saveButton);
                        }
                    }
                }
            } catch (error) {
                console.error('Deep search error:', error);
                
                // Hide search status
                if (searchStatusContainer) {
                    searchStatusContainer.style.display = 'none';
                }
                
                // Show error
                if (deepSearchResults) {
                    deepSearchResults.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
                }
            }
        });
    }
});
