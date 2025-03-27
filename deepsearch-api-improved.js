/**
 * DeepSearch API Integration for KillPhilosophy
 * 
 * This module handles interactions with Jina.ai services to perform deep searches
 * and analysis of academics, their connections, and intellectual traditions.
 */

class DeepSearchAPI {
    constructor() {
        // Jina.ai API endpoint
        this.endpoint = 'https://api.jina.ai/v1/chat/completions';
        
        // Fallback endpoints in case primary is unavailable
        this.fallbackEndpoints = [
            'https://api-fallback.jina.ai/v1/chat/completions',
            'https://api-backup.jina.ai/v1/chat/completions'
        ];
        
        // Default API key - pre-configured for ease of use
        this.apiKey = 'jina_3e0cba1e1cd14761b53309d362e69bf3yeToVynAVCMHf-CpFgwq_NE1UKzs';
        this.model = 'jina-large'; // Using Jina's large model
        this.maxTokens = 4000;
        this.retryAttempts = 3; // Number of retry attempts for API calls
        
        // Load API key from localStorage if available
        this._loadApiKey();
    }
    
    /**
     * Load API key from localStorage
     * @private
     */
    _loadApiKey() {
        try {
            const storedApiKey = localStorage.getItem('killphilosophy_deepsearch_api_key');
            if (storedApiKey) {
                this.apiKey = storedApiKey;
                console.log('DeepSearch API key loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading API key from localStorage:', error);
        }
    }
    
    /**
     * Save API key to localStorage
     * @param {string} apiKey - API key
     * @returns {boolean} - Success indicator
     */
    saveApiKey(apiKey) {
        if (!apiKey) return false;
        
        this.apiKey = apiKey;
        
        try {
            localStorage.setItem('killphilosophy_deepsearch_api_key', apiKey);
            console.log('DeepSearch API key saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving API key to localStorage:', error);
            return false;
        }
    }
    
    /**
     * Display error message in the UI
     * @private
     * @param {string} message - Error message
     */
    _showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        const resultsContainer = document.getElementById('deep-search-results');
        if (resultsContainer) {
            // Clear previous errors
            const existingErrors = resultsContainer.querySelectorAll('.error-message');
            existingErrors.forEach(el => el.remove());
            
            // Add new error
            resultsContainer.prepend(errorElement);
            
            // Hide progress indicator
            const progressContainer = document.querySelector('.search-status-container');
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                errorElement.style.opacity = '0';
                setTimeout(() => errorElement.remove(), 1000);
            }, 10000);
        }
    }
    
    /**
     * Display success message in the UI
     * @private
     * @param {string} message - Success message
     */
    _showSuccessMessage(message) {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        
        const resultsContainer = document.getElementById('deep-search-results');
        if (resultsContainer) {
            resultsContainer.prepend(successElement);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                successElement.style.opacity = '0';
                setTimeout(() => successElement.remove(), 1000);
            }, 5000);
        }
    }
    
    /**
     * Perform a deep search with improved error handling and retry logic
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object|ReadableStream>} - Search results or stream
     */
    async search(query, options = {}) {
        // Default options
        const defaultOptions = {
            stream: true,
            depth: 'medium', // 'basic', 'medium', or 'deep'
            academicFilters: {
                papers: true,
                events: true,
                citations: true,
                influences: true
            }
        };

        // Merge default options with user options
        const searchOptions = { ...defaultOptions, ...options };

        // Construct the message content based on search parameters
        let content = query;
        
        // If searching for connections between two academics
        if (options.academicName1 && options.academicName2) {
            content = `Analyze the connections between ${options.academicName1} and ${options.academicName2}.`;
        } else if (options.academicName1) {
            content = `Provide detailed information about ${options.academicName1}`;
        }

        // Add depth parameter to refine the search
        if (searchOptions.depth === 'deep') {
            content += ' Include comprehensive details, obscure connections, and thorough analysis.';
        } else if (searchOptions.depth === 'basic') {
            content += ' Provide a brief overview with essential information only.';
        }

        // Include filter specifications
        if (!searchOptions.academicFilters.papers) {
            content += ' Exclude papers and publications.';
        }
        if (!searchOptions.academicFilters.events) {
            content += ' Exclude events and appearances.';
        }
        if (!searchOptions.academicFilters.citations) {
            content += ' Exclude citation information.';
        }
        if (!searchOptions.academicFilters.influences) {
            content += ' Exclude information about academic influences.';
        }

        // Add instructions to format response for database enrichment
        content += ` Please format your response to include the following sections for database enrichment:
        - Name: Full name of the academic
        - Bio: Brief biography
        - Papers: List of major publications with years
        - Events: Notable events, lectures, or appointments with years and locations
        - Connections: Other academics they influenced or were influenced by
        - Taxonomies: Categories such as discipline, tradition, era, methodology, and themes`;

        // Prepare the request payload
        const payload = {
            messages: [{ role: 'user', content: content }],
            max_tokens: this.maxTokens,
            stream: searchOptions.stream,
            model: this.model
        };

        // Validate API key before making request
        if (!this.apiKey || this.apiKey.trim() === '') {
            throw new Error('No API key provided. Please configure your API key first.');
        }

        // Try the request with the primary endpoint and fallbacks
        let lastError = null;
        let endpoints = [this.endpoint, ...this.fallbackEndpoints];
        
        for (let i = 0; i < this.retryAttempts; i++) {
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        // Try to get detailed error message
                        let errorMessage = `API request failed with status ${response.status}`;
                        try {
                            const errorData = await response.json();
                            if (errorData.message) {
                                errorMessage = `API Error: ${errorData.message}`;
                            } else if (errorData.error) {
                                errorMessage = `API Error: ${errorData.error}`;
                            }
                        } catch (e) {
                            // If we can't parse JSON, use response status text
                            errorMessage = `API Error: ${response.statusText || 'Unknown error'}`;
                        }
                        
                        throw new Error(errorMessage);
                    }

                    // Handle streaming responses
                    if (searchOptions.stream) {
                        return response.body;
                    } else {
                        // For non-streaming, return the full response
                        return await response.json();
                    }
                } catch (error) {
                    console.error(`DeepSearch error (attempt ${i+1} with ${endpoint}):`, error);
                    lastError = error;
                    // Continue to the next endpoint or retry
                    continue;
                }
            }
            
            // If we get here, all endpoints failed. Wait before retrying.
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
        
        // If we get here, all retries failed
        this._showErrorMessage(lastError?.message || 'Failed to connect to DeepSearch API after multiple attempts');
        throw lastError || new Error('Failed to connect to DeepSearch API');
    }
    
    /**
     * Process and handle the streaming response
     * @param {ReadableStream} stream - Response stream
     * @param {function} onChunk - Callback for each chunk
     * @param {function} onComplete - Callback when stream is complete
     * @param {function} onError - Callback for errors
     * @returns {Promise<string>} - Full response text
     */
    async handleStream(stream, onChunk, onComplete, onError) {
        try {
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let resultText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last incomplete line in the buffer
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6); // Remove 'data: ' prefix
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            // Extract content from Jina.ai's response format
                            if (parsed.choices && parsed.choices[0]) {
                                // Check different possible response formats
                                let content = '';
                                
                                if (parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                    content = parsed.choices[0].delta.content;
                                } else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                                    content = parsed.choices[0].message.content;
                                } else if (parsed.choices[0].content) {
                                    content = parsed.choices[0].content;
                                }
                                
                                if (content) {
                                    resultText += content;
                                    
                                    // Call the onChunk callback
                                    if (typeof onChunk === 'function') {
                                        onChunk(content);
                                    }
                                }
                            }
                        } catch (parseError) {
                            console.error('Error parsing stream data:', parseError, 'Line:', line);
                        }
                    }
                }
            }
            
            // Process any remaining content in the buffer
            if (buffer && buffer.startsWith('data: ')) {
                const data = buffer.slice(6);
                
                if (data !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(data);
                        
                        // Extract content from Jina.ai's response format
                        if (parsed.choices && parsed.choices[0]) {
                            // Check different possible response formats
                            let content = '';
                            
                            if (parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                content = parsed.choices[0].delta.content;
                            } else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                                content = parsed.choices[0].message.content;
                            } else if (parsed.choices[0].content) {
                                content = parsed.choices[0].content;
                            }
                            
                            if (content) {
                                resultText += content;
                                
                                // Call the onChunk callback
                                if (typeof onChunk === 'function') {
                                    onChunk(content);
                                }
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing final stream data:', parseError);
                    }
                }
            }
            
            // Call the onComplete callback
            if (typeof onComplete === 'function') {
                onComplete(resultText);
            }
            
            return resultText;
        } catch (error) {
            console.error('Error handling stream:', error);
            
            // Call the onError callback
            if (typeof onError === 'function') {
                onError(error);
            } else {
                this._showErrorMessage(`Error reading response: ${error.message}`);
            }
            
            throw error;
        }
    }
    
    /**
     * Update progress bar in the UI
     * @param {number} value - Progress value (0-100)
     */
    updateProgressBar(value) {
        const progressBar = document.querySelector('.deep-search-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(Math.max(value, 0), 100)}%`;
        }
    }
    
    /**
     * Enrich the database with information from DeepSearch results
     * @param {Object} academicData - Academic data to add to the database
     * @returns {boolean} - Success indicator
     */
    enrichDatabase(academicData) {
        if (!academicData || !academicData.name) {
            console.error('Invalid academic data for database enrichment');
            return false;
        }
        
        try {
            // Check if database manager is available
            if (typeof databaseManager === 'undefined') {
                this._showErrorMessage('Database manager not available');
                return false;
            }
            
            // Add or update the academic in the database
            const success = databaseManager.addOrUpdateAcademic(academicData);
            
            if (success) {
                this._showSuccessMessage(`Database enriched with information about ${academicData.name}`);
                
                // Add a novelty tile for the update
                databaseManager.addNoveltyTile({
                    title: `Database Enriched: ${academicData.name}`,
                    content: `New information about ${academicData.name} has been added to the database from DeepSearch.`,
                    date: new Date().toISOString(),
                    type: 'academic'
                });
                
                // If there are connections, try to enrich those academics as well
                if (academicData.connections && academicData.connections.length > 0) {
                    // Add connection entries for linked academics
                    academicData.connections.forEach(connection => {
                        const connectedAcademic = databaseManager.getAcademic(connection);
                        if (connectedAcademic) {
                            // Add reciprocal connection if it doesn't exist
                            if (!connectedAcademic.connections) {
                                connectedAcademic.connections = [];
                            }
                            
                            if (!connectedAcademic.connections.includes(academicData.name)) {
                                connectedAcademic.connections.push(academicData.name);
                                databaseManager.addOrUpdateAcademic(connectedAcademic);
                                
                                // Add novelty tile for the new connection
                                databaseManager.addNoveltyTile({
                                    title: `New Connection: ${connectedAcademic.name} → ${academicData.name}`,
                                    content: `A connection between ${connectedAcademic.name} and ${academicData.name} has been established.`,
                                    date: new Date().toISOString(),
                                    type: 'connection'
                                });
                            }
                        }
                    });
                }
                
                return true;
            } else {
                this._showErrorMessage(`Failed to enrich database with ${academicData.name}`);
                return false;
            }
        } catch (error) {
            console.error('Error enriching database:', error);
            this._showErrorMessage(`Error enriching database: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Extract academic information from search results
     * @param {string} text - Search result text
     * @returns {Object|null} - Extracted academic data or null if not found
     */
    extractAcademicData(text) {
        try {
            // Check if text contains academic information
            if (!text || !text.includes('name') || !text.includes('bio')) {
                return null;
            }
            
            // Try to find JSON data - this is the preferred format
            const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
            const jsonMatch = text.match(jsonRegex);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const jsonData = JSON.parse(jsonMatch[1].trim());
                    if (jsonData.name) {
                        return jsonData;
                    }
                } catch (jsonError) {
                    console.error('Error parsing JSON from result:', jsonError);
                }
            }
            
            // Try to extract academic data using section-based parsing
            const academic = {
                name: '',
                bio: '',
                taxonomies: {},
                papers: [],
                events: [],
                connections: []
            };
            
            // Extract name (try multiple formats)
            const namePatterns = [
                /Name:\s*([^\n]+)/i,
                /\*\*Name:\*\*\s*([^\n]+)/i,
                /^([^:\n]+)(?:\n|$)/m // First line that doesn't contain a colon
            ];
            
            for (const pattern of namePatterns) {
                const nameMatch = text.match(pattern);
                if (nameMatch && nameMatch[1].trim()) {
                    academic.name = nameMatch[1].trim();
                    break;
                }
            }
            
            // If no name found, can't proceed
            if (!academic.name) {
                return null;
            }
            
            // Extract bio using multiple patterns
            const bioPatterns = [
                /Bio(?:graphy)?:\s*([^\n]+(?:\n(?!Papers|Events|Connections|Taxonomies).+)*)/i,
                /\*\*Bio(?:graphy)?:\*\*\s*([^\n]+(?:\n(?!Papers|Events|Connections|Taxonomies).+)*)/i,
                /^(?:About|Background):\s*([^\n]+(?:\n(?!Papers|Events|Connections|Taxonomies).+)*)/im
            ];
            
            for (const pattern of bioPatterns) {
                const bioMatch = text.match(pattern);
                if (bioMatch && bioMatch[1].trim()) {
                    academic.bio = bioMatch[1].trim().replace(/\n\s*/g, ' ');
                    break;
                }
            }
            
            // Extract papers with better pattern matching
            const papersPatterns = [
                /Papers(?:\s*\/\s*Publications)?:\s*([\s\S]*?)(?=(?:Events|Connections|Taxonomies):|\n\s*\n|$)/i,
                /Publications:\s*([\s\S]*?)(?=(?:Events|Connections|Taxonomies):|\n\s*\n|$)/i,
                /Major Works:\s*([\s\S]*?)(?=(?:Events|Connections|Taxonomies):|\n\s*\n|$)/i
            ];
            
            for (const pattern of papersPatterns) {
                const papersMatch = text.match(pattern);
                if (papersMatch && papersMatch[1].trim()) {
                    const papersText = papersMatch[1].trim();
                    const paperItems = papersText.split(/\n\s*[-*•]\s*/);
                    
                    for (const item of paperItems) {
                        if (item.trim() && !item.trim().startsWith('Publications:')) {
                            // Try to extract year
                            const yearMatch = item.match(/\((\d{4})\)/) || item.match(/,\s*(\d{4})/);
                            const year = yearMatch ? parseInt(yearMatch[1]) : null;
                            
                            // Remove year from title
                            let title = item.replace(/\(\d{4}\)/, '').replace(/,\s*\d{4}/, '').trim();
                            
                            // Extract coauthors if present
                            const coauthors = [];
                            const coauthorsMatch = title.match(/with\s+([^\.]+)/i);
                            if (coauthorsMatch) {
                                const coauthorsText = coauthorsMatch[1];
                                coauthors.push(...coauthorsText.split(/(?:,|\sand\s)/g).map(c => c.trim()).filter(c => c));
                                title = title.replace(/with\s+([^\.]+)/i, '').trim();
                            }
                            
                            academic.papers.push({
                                title,
                                year: year || 0,
                                coauthors
                            });
                        }
                    }
                    break;
                }
            }
            
            // Extract connections with better pattern matching
            const connectionsPatterns = [
                /Connections:\s*([\s\S]*?)(?=(?:Events|Papers|Taxonomies):|\n\s*\n|$)/i,
                /Influences:\s*([\s\S]*?)(?=(?:Events|Papers|Taxonomies):|\n\s*\n|$)/i,
                /Related Academics:\s*([\s\S]*?)(?=(?:Events|Papers|Taxonomies):|\n\s*\n|$)/i
            ];
            
            for (const pattern of connectionsPatterns) {
                const connectionsMatch = text.match(pattern);
                if (connectionsMatch && connectionsMatch[1].trim()) {
                    const connectionsText = connectionsMatch[1].trim();
                    let connectionItems;
                    
                    // Try to match list items or comma-separated values
                    if (connectionsText.includes('-') || connectionsText.includes('*') || connectionsText.includes('•')) {
                        connectionItems = connectionsText.split(/\n\s*[-*•]\s*/);
                    } else {
                        connectionItems = connectionsText.split(/,\s*/);
                    }
                    
                    for (const item of connectionItems) {
                        const connection = item.trim();
                        if (connection && !connection.startsWith('Connections:')) {
                            academic.connections.push(connection.replace(/^\d+\.\s*/, ''));
                        }
                    }
                    break;
                }
            }
            
            // Extract taxonomies with better pattern matching
            const taxonomyPatterns = [
                /Taxonomies:\s*([\s\S]*?)(?=(?:Events|Papers|Connections):|\n\s*\n|$)/i,
                /Categories:\s*([\s\S]*?)(?=(?:Events|Papers|Connections):|\n\s*\n|$)/i,
                /Classifications:\s*([\s\S]*?)(?=(?:Events|Papers|Connections):|\n\s*\n|$)/i
            ];
            
            for (const pattern of taxonomyPatterns) {
                const taxonomyMatch = text.match(pattern);
                if (taxonomyMatch && taxonomyMatch[1].trim()) {
                    const taxonomyText = taxonomyMatch[1].trim();
                    const taxonomyLines = taxonomyText.split('\n');
                    
                    for (const line of taxonomyLines) {
                        const categoryMatch = line.match(/[-*•]?\s*(discipline|tradition|era|methodology|theme)[s]?[:\s]+(.+)/i);
                        if (categoryMatch) {
                            const category = categoryMatch[1].toLowerCase();
                            const values = categoryMatch[2].split(/,\s*/).map(v => v.trim());
                            
                            if (!academic.taxonomies[category]) {
                                academic.taxonomies[category] = [];
                            }
                            
                            academic.taxonomies[category].push(...values);
                        }
                    }
                    break;
                }
            }
            
            // Extract events with better pattern matching
            const eventsPatterns = [
                /Events:\s*([\s\S]*?)(?=(?:Papers|Connections|Taxonomies):|\n\s*\n|$)/i,
                /Key Dates:\s*([\s\S]*?)(?=(?:Papers|Connections|Taxonomies):|\n\s*\n|$)/i,
                /Timeline:\s*([\s\S]*?)(?=(?:Papers|Connections|Taxonomies):|\n\s*\n|$)/i
            ];
            
            for (const pattern of eventsPatterns) {
                const eventsMatch = text.match(pattern);
                if (eventsMatch && eventsMatch[1].trim()) {
                    const eventsText = eventsMatch[1].trim();
                    const eventItems = eventsText.split(/\n\s*[-*•]\s*/);
                    
                    for (const item of eventItems) {
                        if (item.trim() && !item.trim().startsWith('Events:')) {
                            // Try to extract year
                            const yearMatch = item.match(/\((\d{4})\)/) || item.match(/,\s*(\d{4})/);
                            const year = yearMatch ? parseInt(yearMatch[1]) : null;
                            
                            // Try to extract location
                            const locationMatch = item.match(/,\s*([^,\d]+)$/);
                            const location = locationMatch ? locationMatch[1].trim() : '';
                            
                            // Remove year and location from title
                            let title = item.replace(/\(\d{4}\)/, '').replace(/,\s*\d{4}/, '').trim();
                            if (location) {
                                title = title.replace(new RegExp(`,\\s*${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '').trim();
                            }
                            
                            academic.events.push({
                                title,
                                year: year || 0,
                                location: location || ''
                            });
                        }
                    }
                    break;
                }
            }
            
            return academic.name ? academic : null;
        } catch (error) {
            console.error('Error extracting academic data:', error);
            return null;
        }
    }
}

// Initialize the DeepSearch API with the provided Jina.ai key
const deepSearchAPI = new DeepSearchAPI();

// Make it available globally
window.deepSearchAPI = deepSearchAPI;

// Initialize API key configuration when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup API key configuration
    setupApiKeyConfiguration();
    
    // Initialize DeepSearch interface
    initializeDeepSearch();
});

/**
 * Set up API key configuration UI
 */
function setupApiKeyConfiguration() {
    const apiKeyLink = document.getElementById('api-key-link');
    const apiKeyConfig = document.getElementById('api-key-config');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    
    if (!apiKeyLink || !apiKeyConfig || !apiKeyInput || !saveApiKeyButton) return;
    
    // Toggle API key configuration visibility
    apiKeyLink.addEventListener('click', (e) => {
        e.preventDefault();
        apiKeyConfig.classList.toggle('visible');
    });
    
    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            // Update the API key in the DeepSearchAPI instance
            if (typeof deepSearchAPI !== 'undefined') {
                deepSearchAPI.saveApiKey(apiKey);
                
                // Show confirmation
                const confirmationElement = document.createElement('div');
                confirmationElement.className = 'success-message';
                confirmationElement.textContent = 'API key saved successfully!';
                apiKeyConfig.prepend(confirmationElement);
                
                // Auto-remove after 3 seconds
                setTimeout(() => {
                    confirmationElement.remove();
                    apiKeyConfig.classList.remove('visible');
                }, 3000);
            }
        } else {
            // Show error for empty API key
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Please enter a valid API key.';
            apiKeyConfig.prepend(errorElement);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                errorElement.remove();
            }, 3000);
        }
    });
    
    // Load stored API key on page load
    try {
        const storedApiKey = localStorage.getItem('killphilosophy_deepsearch_api_key');
        if (storedApiKey) {
            apiKeyInput.value = storedApiKey;
        } else {
            // Set the default Jina.ai API key
            apiKeyInput.value = deepSearchAPI.apiKey;
        }
    } catch (error) {
        console.error('Error loading API key from localStorage:', error);
    }
}

/**
 * Initialize Deep Search functionality
 */
function initializeDeepSearch() {
    const runDeepSearchButton = document.getElementById('run-deep-search');
    const deepSearchInput = document.getElementById('deep-search-input');
    const deepSearchResults = document.getElementById('deep-search-results');
    const searchStatusContainer = document.querySelector('.search-status-container');
    const searchDepthSelector = document.getElementById('search-depth');
    
    if (!runDeepSearchButton || !deepSearchInput || !deepSearchResults) return;
    
    // Add validation for API key before search
    runDeepSearchButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const query = deepSearchInput.value.trim();
        if (!query) {
            deepSearchAPI._showErrorMessage('Please enter a search query');
            return;
        }
        
        // Clear previous results
        deepSearchResults.innerHTML = '<div class="deep-search-result-content"></div>';
        const resultContent = deepSearchResults.querySelector('.deep-search-result-content');
        
        // Show search status
        if (searchStatusContainer) {
            searchStatusContainer.style.display = 'block';
            deepSearchAPI.updateProgressBar(5);
        }
        
        // Get search depth
        const searchDepth = searchDepthSelector ? searchDepthSelector.value : 'medium';
        
        try {
            // Run the search
            const stream = await deepSearchAPI.search(query, {
                stream: true,
                depth: searchDepth
            });
            
            // Process the stream
            let progress = 10;
            await deepSearchAPI.handleStream(
                stream,
                // On chunk
                (chunk) => {
                    if (resultContent) {
                        resultContent.innerHTML += chunk;
                        resultContent.scrollTop = resultContent.scrollHeight;
                    }
                    
                    // Update progress
                    progress += 5;
                    if (progress > 90) progress = 90;
                    deepSearchAPI.updateProgressBar(progress);
                },
                // On complete
                (fullText) => {
                    // Update progress to 100%
                    deepSearchAPI.updateProgressBar(100);
                    
                    // Hide status after a short delay
                    setTimeout(() => {
                        if (searchStatusContainer) {
                            searchStatusContainer.style.display = 'none';
                        }
                    }, 1000);
                    
                    // Try to extract academic data
                    const academicData = deepSearchAPI.extractAcademicData(fullText);
                    if (academicData && academicData.name) {
                        // Add a button to save to database
                        const saveButton = document.createElement('button');
                        saveButton.className = 'save-academic-btn';
                        saveButton.textContent = `Save ${academicData.name} to Database`;
                        saveButton.addEventListener('click', () => {
                            deepSearchAPI.enrichDatabase(academicData);
                        });
                        
                        deepSearchResults.appendChild(saveButton);
                        
                        // Display a notification about potential database enrichment
                        const enrichNotice = document.createElement('div');
                        enrichNotice.className = 'info-message';
                        enrichNotice.textContent = `Information about ${academicData.name} can be added to the database. Click the button above to save.`;
                        deepSearchResults.appendChild(enrichNotice);
                    }
                },
                // On error
                (error) => {
                    if (searchStatusContainer) {
                        searchStatusContainer.style.display = 'none';
                    }
                    deepSearchAPI._showErrorMessage(`Search error: ${error.message}`);
                }
            );
        } catch (error) {
            console.error('Error during deep search:', error);
            
            if (searchStatusContainer) {
                searchStatusContainer.style.display = 'none';
            }
            
            deepSearchAPI._showErrorMessage(`Search failed: ${error.message}`);
        }
    });
    
    // Add keyboard shortcut (Ctrl+Enter) to run search
    deepSearchInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runDeepSearchButton.click();
        }
    });
}
