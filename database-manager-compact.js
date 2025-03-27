/**
 * Enhanced Database Manager for KillPhilosophy
 * Handles academic data, persistence, and search functionality with improved efficiency
 */
class DatabaseManager {
    constructor() {
        this.academics = {};
        this.noveltyTiles = [];
        this.favorites = [];
        this.pendingSubmissions = [];
        this.taxonomyCategories = {
            discipline: ["Philosophy", "Sociology", "Literary Theory", "Political Science", 
                       "History", "Gender Studies", "Anthropology", "Psychology"],
            tradition: ["Existentialism", "Post-structuralism", "Phenomenology", 
                      "Critical Theory", "Marxism", "Hermeneutics", "Pragmatism"],
            era: ["20th Century", "21st Century", "Contemporary", "Modern", "Ancient", "Medieval"],
            methodology: ["Textual Analysis", "Dialectical Method", "Genealogy", 
                        "Deconstruction", "Ethnography", "Discourse Analysis"],
            theme: ["Power", "Identity", "Language", "Justice", "Ethics", "Consciousness", 
                  "Embodiment", "Capitalism", "Democracy", "Technology"]
        };
        
        // Check localStorage support early to avoid trying to use it if not available
        this.localStorageSupported = this._checkLocalStorageSupport();
        
        // Initialize with default data or load from localStorage
        this._initializeData();
        
        // Setup periodic auto-save
        this._setupAutoSave();
        
        // Log initialization
        console.log(`Database initialized with ${Object.keys(this.academics).length} academics.`);
    }

    /**
     * Check if localStorage is supported
     * @private
     * @returns {boolean} - Whether localStorage is supported
     */
    _checkLocalStorageSupport() {
        try {
            const testKey = 'killphilosophy_test';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not supported. Data will not be saved between sessions.');
            return false;
        }
    }

    /**
     * Initialize database with data from localStorage or defaults
     * @private
     */
    _initializeData() {
        // Try to load from localStorage first
        if (this.localStorageSupported) {
            const loadSuccessful = this._loadFromLocalStorage();
            
            // If loading failed or no data was found, initialize with defaults
            if (!loadSuccessful || Object.keys(this.academics).length === 0) {
                this._initializeDefaultData();
                this.saveToLocalStorage();
            }
        } else {
            // No localStorage, just use defaults
            this._initializeDefaultData();
        }
    }

    /**
     * Initialize with default data
     * @private
     */
    _initializeDefaultData() {
        console.log('Initializing database with default data...');
        
        // Default to a minimal sample entry if no data is available
        this.academics = {
            "sample-academic": {
                name: "Sample Academic",
                bio: "This is a sample academic entry.",
                taxonomies: {
                    discipline: ["Philosophy"],
                    tradition: ["Critical Theory"],
                    era: ["Contemporary"],
                    methodology: ["Textual Analysis"],
                    theme: ["Power"]
                },
                papers: [
                    { title: "Sample Paper", year: 2020, coauthors: [] }
                ],
                events: [
                    { title: "Sample Event", year: 2021, location: "Virtual Conference" }
                ],
                connections: ["Jacques Derrida", "Michel Foucault"]
            }
        };
        
        // Try to fetch academics.json if we're in a browser environment
        try {
            fetch('academics.json')
                .then(response => response.json())
                .then(data => {
                    if (data && Object.keys(data).length > 0) {
                        this.academics = data;
                        console.log(`Loaded ${Object.keys(data).length} academics from academics.json`);
                        this.saveToLocalStorage();
                    }
                })
                .catch(error => {
                    console.log('Could not load academics.json, using default data');
                });
        } catch (fetchError) {
            console.log('Could not fetch academics.json, using default data');
        }
    }

    /**
     * Load data from localStorage
     * @private
     * @returns {boolean} - Success indicator
     */
    _loadFromLocalStorage() {
        if (!this.localStorageSupported) return false;
        
        try {
            const savedAcademics = localStorage.getItem('killphilosophy_academics');
            const savedNoveltyTiles = localStorage.getItem('killphilosophy_noveltyTiles');
            const savedFavorites = localStorage.getItem('killphilosophy_favorites');
            const savedSubmissions = localStorage.getItem('killphilosophy_pendingSubmissions');
            
            let loadedData = false;
            
            if (savedAcademics) {
                try {
                    const parsed = JSON.parse(savedAcademics);
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        this.academics = parsed;
                        console.log(`Loaded ${Object.keys(parsed).length} academics from localStorage`);
                        loadedData = true;
                    }
                } catch (parseError) {
                    console.error('Error parsing academics from localStorage:', parseError);
                }
            }
            
            if (savedNoveltyTiles) {
                try {
                    const parsed = JSON.parse(savedNoveltyTiles);
                    if (Array.isArray(parsed)) {
                        this.noveltyTiles = parsed;
                        console.log(`Loaded ${parsed.length} novelty tiles from localStorage`);
                    }
                } catch (parseError) {
                    console.error('Error parsing novelty tiles from localStorage:', parseError);
                }
            }
            
            if (savedFavorites) {
                try {
                    const parsed = JSON.parse(savedFavorites);
                    if (Array.isArray(parsed)) {
                        this.favorites = parsed;
                        console.log(`Loaded ${parsed.length} favorites from localStorage`);
                    }
                } catch (parseError) {
                    console.error('Error parsing favorites from localStorage:', parseError);
                }
            }
            
            if (savedSubmissions) {
                try {
                    const parsed = JSON.parse(savedSubmissions);
                    if (Array.isArray(parsed)) {
                        this.pendingSubmissions = parsed;
                        console.log(`Loaded ${parsed.length} pending submissions from localStorage`);
                    }
                } catch (parseError) {
                    console.error('Error parsing pending submissions from localStorage:', parseError);
                }
            }
            
            return loadedData;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return false;
        }
    }
    
    /**
     * Setup automatic saving at regular intervals
     * @private
     */
    _setupAutoSave() {
        if (this.localStorageSupported) {
            // Save data every 5 minutes
            setInterval(() => {
                this.saveToLocalStorage();
            }, 5 * 60 * 1000);
        }
    }
    
    /**
     * Normalize a name for use as a key
     * @private
     * @param {string} name - Name to normalize
     * @returns {string} - Normalized name
     */
    _normalizeNameKey(name) {
        if (!name) return '';
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }

    /**
     * Create a backup of data before saving to localStorage
     * @private
     */
    _createBackup() {
        if (!this.localStorageSupported) return;
        
        try {
            const currentData = localStorage.getItem('killphilosophy_academics');
            if (currentData) {
                localStorage.setItem('killphilosophy_academics_backup', currentData);
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    /**
     * Restore data from backup if save fails
     * @private
     * @returns {boolean} - Success indicator
     */
    _restoreFromBackup() {
        if (!this.localStorageSupported) return false;
        
        try {
            const backup = localStorage.getItem('killphilosophy_academics_backup');
            if (!backup) {
                console.error('No backup found to restore');
                return false;
            }
            
            const backupData = JSON.parse(backup);
            if (backupData && typeof backupData === 'object') {
                this.academics = backupData;
                
                // Save changes to reinstate the data
                localStorage.setItem('killphilosophy_academics', backup);
                
                console.log('Database restored from backup');
                return true;
            } else {
                console.error('Invalid backup data');
                return false;
            }
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    /**
     * Save data to localStorage with error handling
     * @returns {boolean} - Success indicator
     */
    saveToLocalStorage() {
        if (!this.localStorageSupported) {
            console.warn('localStorage not supported. Data will not be saved.');
            return false;
        }
        
        try {
            // Create backup of existing data first
            this._createBackup();
            
            // Save academics data
            localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
            
            // Save novelty tiles (keep only most recent 50 to save space)
            const sortedTiles = [...this.noveltyTiles].sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentTiles = sortedTiles.slice(0, 50);
            localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(recentTiles));
            
            // Save favorites
            localStorage.setItem('killphilosophy_favorites', JSON.stringify(this.favorites));
            
            // Save pending submissions
            localStorage.setItem('killphilosophy_pendingSubmissions', JSON.stringify(this.pendingSubmissions));
            
            // Verify academics data was saved properly
            try {
                const savedAcademics = localStorage.getItem('killphilosophy_academics');
                const parsed = JSON.parse(savedAcademics);
                if (!parsed || typeof parsed !== 'object') {
                    console.error('Verification failed: academics not properly saved');
                    this._restoreFromBackup();
                    return false;
                }
            } catch (verifyError) {
                console.error('Error verifying saved data:', verifyError);
                this._restoreFromBackup();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            // If localStorage is full, try to clear space
            if (error.name === 'QuotaExceededError') {
                try {
                    console.warn('localStorage quota exceeded, attempting to free space');
                    
                    // Trim novelty tiles
                    if (this.noveltyTiles.length > 20) {
                        console.warn('Trimming novelty tiles to save space');
                        const sortedTiles = [...this.noveltyTiles].sort((a, b) => new Date(b.date) - new Date(a.date));
                        this.noveltyTiles = sortedTiles.slice(0, 20);
                        localStorage.setItem('killphilosophy_noveltyTiles', JSON.stringify(this.noveltyTiles));
                    }
                    
                    // Try again with reduced data
                    localStorage.setItem('killphilosophy_academics', JSON.stringify(this.academics));
                    console.log('Successfully saved academics after freeing space');
                    return true;
                } catch (fallbackError) {
                    console.error('Error in fallback save operation:', fallbackError);
                    return false;
                }
            }
            
            return false;
        }
    }
    
    /**
     * Get a specific academic by name with improved matching
     * @param {string} name - Academic name
     * @returns {Object|null} - Academic object or null if not found
     */
    getAcademic(name) {
        if (!name) return null;
        
        // Look for exact key match first
        const normalizedKey = this._normalizeNameKey(name);
        if (this.academics[normalizedKey]) {
            return this.academics[normalizedKey];
        }
        
        // Try case-insensitive name match
        const lowerName = name.toLowerCase();
        for (const academic of Object.values(this.academics)) {
            if (academic.name.toLowerCase() === lowerName) {
                return academic;
            }
        }
        
        // Try partial name match as a fallback
        for (const academic of Object.values(this.academics)) {
            if (academic.name.toLowerCase().includes(lowerName) || 
                lowerName.includes(academic.name.toLowerCase())) {
                return academic;
            }
        }
        
        return null;
    }
    
    /**
     * Enhanced search academics with better filtering
     * @param {Object} criteria - Search criteria
     * @returns {Array} - Array of matching academics
     */
    searchAcademics(criteria = {}) {
        const results = [];
        
        for (const academic of Object.values(this.academics)) {
            let match = true;
            
            // Check name search (partial match)
            if (criteria.name) {
                const nameMatch = academic.name.toLowerCase().includes(criteria.name.toLowerCase());
                if (!nameMatch) {
                    match = false;
                }
            }
            
            // Check taxonomy criteria with more flexible matching
            const taxonomyFields = ['discipline', 'tradition', 'era', 'methodology', 'theme'];
            
            for (const field of taxonomyFields) {
                if (criteria[field]) {
                    const criteriaValue = criteria[field].toLowerCase();
                    
                    // Skip if academic has no taxonomies or the specific field
                    if (!academic.taxonomies || !academic.taxonomies[field]) {
                        match = false;
                        continue;
                    }
                    
                    // Check for partial matches within the taxonomy field
                    const fieldMatch = academic.taxonomies[field].some(value => 
                        value.toLowerCase().includes(criteriaValue) || 
                        criteriaValue.includes(value.toLowerCase())
                    );
                    
                    if (!fieldMatch) {
                        match = false;
                    }
                }
            }
            
            // Add to results if all criteria match
            if (match) {
                results.push(academic);
            }
        }
        
        // Sort results by relevance (exact matches first, then partial matches)
        if (criteria.name) {
            const nameQuery = criteria.name.toLowerCase();
            results.sort((a, b) => {
                const aNameMatch = a.name.toLowerCase() === nameQuery;
                const bNameMatch = b.name.toLowerCase() === nameQuery;
                
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                // Secondary sort by how early the match appears in the name
                const aNameIndex = a.name.toLowerCase().indexOf(nameQuery);
                const bNameIndex = b.name.toLowerCase().indexOf(nameQuery);
                
                if (aNameIndex !== -1 && bNameIndex !== -1) {
                    return aNameIndex - bNameIndex;
                }
                
                return a.name.localeCompare(b.name);
            });
        }
        
        return results;
    }
    
    /**
     * Get all academics as an array
     * @returns {Array} - Array of all academic objects
     */
    getAllAcademics() {
        return Object.values(this.academics);
    }
    
    /**
     * Add or update an academic with improved merging
     * @param {Object} academic - Academic object
     * @returns {boolean} - Success indicator
     */
    addOrUpdateAcademic(academic) {
        if (!academic || !academic.name) {
            console.error('Cannot add academic without a name');
            return false;
        }
        
        try {
            // Normalize the key
            const key = this._normalizeNameKey(academic.name);
            
            // If academic already exists, merge data
            if (this.academics[key]) {
                const existing = this.academics[key];
                
                // Update bio if provided and different
                if (academic.bio && academic.bio !== existing.bio) {
                    existing.bio = academic.bio;
                }
                
                // Merge taxonomies
                if (academic.taxonomies) {
                    if (!existing.taxonomies) {
                        existing.taxonomies = {};
                    }
                    
                    for (const category in academic.taxonomies) {
                        if (!existing.taxonomies[category]) {
                            existing.taxonomies[category] = [];
                        }
                        
                        // Add new values that don't already exist
                        academic.taxonomies[category].forEach(value => {
                            if (!existing.taxonomies[category].includes(value)) {
                                existing.taxonomies[category].push(value);
                            }
                        });
                    }
                }
                
                // Merge papers with deduplication
                if (academic.papers && academic.papers.length > 0) {
                    if (!existing.papers) {
                        existing.papers = [];
                    }
                    
                    academic.papers.forEach(paper => {
                        // Check if paper already exists by comparing title
                        const paperExists = existing.papers.some(p => 
                            p.title.toLowerCase() === paper.title.toLowerCase() &&
                            (!p.year || !paper.year || p.year === paper.year)
                        );
                        
                        if (!paperExists) {
                            existing.papers.push(paper);
                        }
                    });
                }
                
                // Merge events with deduplication
                if (academic.events && academic.events.length > 0) {
                    if (!existing.events) {
                        existing.events = [];
                    }
                    
                    academic.events.forEach(event => {
                        // Check if event already exists
                        const eventExists = existing.events.some(e => 
                            e.title.toLowerCase() === event.title.toLowerCase() &&
                            (!e.year || !event.year || e.year === event.year)
                        );
                        
                        if (!eventExists) {
                            existing.events.push(event);
                        }
                    });
                }
                
                // Merge connections with deduplication
                if (academic.connections && academic.connections.length > 0) {
                    if (!existing.connections) {
                        existing.connections = [];
                    }
                    
                    academic.connections.forEach(connection => {
                        if (!existing.connections.includes(connection)) {
                            existing.connections.push(connection);
                        }
                    });
                }
            } else {
                // Add new academic
                this.academics[key] = academic;
                
                // Add a novelty tile for the new academic
                this.addNoveltyTile({
                    title: `New Academic: ${academic.name}`,
                    content: `${academic.name} has been added to the database.`,
                    date: new Date().toISOString(),
                    type: 'academic'
                });
            }
            
            // Save changes
            this.saveToLocalStorage();
            
            console.log(`Successfully ${this.academics[key] ? 'updated' : 'added'} academic: ${academic.name}`);
            return true;
        } catch (error) {
            console.error('Error adding/updating academic:', error);
            return false;
        }
    }
    
    /**
     * Add a novelty tile
     * @param {Object} tile - Novelty tile object
     * @returns {boolean} - Success indicator
     */
    addNoveltyTile(tile) {
        if (!tile || !tile.title) {
            console.error('Cannot add novelty tile without a title');
            return false;
        }
        
        try {
            // Add date if not provided
            if (!tile.date) {
                tile.date = new Date().toISOString();
            }
            
            // Add to novelty tiles
            this.noveltyTiles.unshift(tile);
            
            // Keep list manageable
            if (this.noveltyTiles.length > 100) {
                this.noveltyTiles = this.noveltyTiles.slice(0, 100);
            }
            
            // Save changes
            this.saveToLocalStorage();
            
            console.log(`Added novelty tile: ${tile.title}`);
            return true;
        } catch (error) {
            console.error('Error adding novelty tile:', error);
            return false;
        }
    }
    
    /**
     * Get recent novelty tiles
     * @param {number} limit - Maximum number of tiles to return
     * @returns {Array} - Array of novelty tiles
     */
    getRecentNoveltyTiles(limit = 10) {
        // Sort by date (newest first) and limit
        return [...this.noveltyTiles]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    /**
     * Add an academic to favorites
     * @param {string} academicName - Name of academic to favorite
     * @returns {boolean} - Success indicator
     */
    addToFavorites(academicName) {
        if (!academicName) return false;
        
        try {
            // Check if already in favorites
            if (!this.favorites.includes(academicName)) {
                this.favorites.push(academicName);
                this.saveToLocalStorage();
                console.log(`Added ${academicName} to favorites`);
            }
            return true;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    }
    
    /**
     * Remove an academic from favorites
     * @param {string} academicName - Name of academic to remove
     * @returns {boolean} - Success indicator
     */
    removeFromFavorites(academicName) {
        if (!academicName) return false;
        
        try {
            const index = this.favorites.indexOf(academicName);
            if (index !== -1) {
                this.favorites.splice(index, 1);
                this.saveToLocalStorage();
                console.log(`Removed ${academicName} from favorites`);
            }
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    }
    
    /**
     * Get all favorites
     * @returns {Array} - Array of favorite academic names
     */
    getFavorites() {
        return this.favorites;
    }
    
    /**
     * Get taxonomy categories
     * @param {string} category - Category name
     * @returns {Array} - Array of taxonomy values
     */
    getTaxonomyCategory(category) {
        return this.taxonomyCategories[category] || [];
    }
    
    /**
     * Get all taxonomy categories
     * @returns {Object} - Taxonomy categories object
     */
    getAllTaxonomyCategories() {
        return this.taxonomyCategories;
    }
    
    /**
     * Get academics by connection
     * @param {string} academicName - Name of the academic to find connections for
     * @returns {Array} - Array of connected academics
     */
    getAcademicsByConnection(academicName) {
        if (!academicName) return [];
        
        const connected = [];
        const allAcademics = this.getAllAcademics();
        
        // Find academics that list this academic as a connection
        for (const academic of allAcademics) {
            if (academic.connections && academic.connections.includes(academicName)) {
                connected.push(academic);
            }
        }
        
        return connected;
    }
    
    /**
     * Get network data for visualization
     * @returns {Object} - Network data with nodes and links
     */
    getNetworkData() {
        const nodes = [];
        const links = [];
        const academicMap = new Map();
        
        // Create nodes from academics
        Object.values(this.academics).forEach(academic => {
            if (academic.name) {
                const discipline = academic.taxonomies?.discipline?.[0] || 'Unknown';
                nodes.push({
                    id: academic.name,
                    group: discipline
                });
                academicMap.set(academic.name, academic);
            }
        });
        
        // Create links from connections
        Object.values(this.academics).forEach(academic => {
            if (academic.connections && Array.isArray(academic.connections)) {
                academic.connections.forEach(connection => {
                    // Check if the connected academic exists in our dataset
                    if (academicMap.has(connection)) {
                        links.push({
                            source: academic.name,
                            target: connection,
                            value: 1
                        });
                    }
                });
            }
        });
        
        return { nodes, links };
    }
    
    /**
     * Export database to JSON for sharing or backup
     * @returns {string} - JSON string of the database
     */
    exportToJSON() {
        try {
            const exportData = {
                academics: this.academics,
                taxonomyCategories: this.taxonomyCategories,
                exportDate: new Date().toISOString()
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting database:', error);
            return null;
        }
    }
    
    /**
     * Import database from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} - Success indicator
     */
    importFromJSON(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            
            if (!importedData.academics || typeof importedData.academics !== 'object') {
                console.error('Invalid import data: academics missing or invalid');
                return false;
            }
            
            // Store current data in case import fails
            const backupAcademics = { ...this.academics };
            
            // Update the database
            this.academics = importedData.academics;
            
            // Update taxonomy categories if provided
            if (importedData.taxonomyCategories) {
                this.taxonomyCategories = importedData.taxonomyCategories;
            }
            
            // Save to localStorage
            const saveSuccess = this.saveToLocalStorage();
            
            if (!saveSuccess) {
                // Restore backup if save failed
                this.academics = backupAcademics;
                console.error('Import failed: could not save to localStorage');
                return false;
            }
            
            // Add import notification
            this.addNoveltyTile({
                title: 'Database Import',
                content: `Database imported with ${Object.keys(importedData.academics).length} academics.`,
                date: new Date().toISOString(),
                type: 'system'
            });
            
            console.log(`Database imported with ${Object.keys(importedData.academics).length} academics`);
            return true;
        } catch (error) {
            console.error('Error importing database:', error);
            return false;
        }
    }
    
    /**
     * Clear the database (for admin purposes)
     * @returns {boolean} - Success indicator
     */
    clearDatabase() {
        try {
            // Store backup
            const backupAcademics = JSON.stringify(this.academics);
            if (this.localStorageSupported) {
                localStorage.setItem('killphilosophy_academics_backup_before_clear', backupAcademics);
            }
            
            // Clear data
            this.academics = {};
            this.noveltyTiles = [];
            this.favorites = [];
            this.pendingSubmissions = [];
            
            // Save changes
            this.saveToLocalStorage();
            
            console.log('Database cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing database:', error);
            return false;
        }
    }
    
    /**
     * Add a pending submission
     * @param {Object} submission - Submission data
     * @returns {boolean} - Success indicator
     */
    addPendingSubmission(submission) {
        if (!submission || !submission.academicName || !submission.type) {
            console.error('Invalid submission data');
            return false;
        }
        
        try {
            this.pendingSubmissions.push(submission);
            this.saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error adding pending submission:', error);
            return false;
        }
    }
    
    /**
     * Get all pending submissions
     * @returns {Array} - Array of pending submissions
     */
    getPendingSubmissions() {
        return this.pendingSubmissions;
    }
    
    /**
     * Remove a pending submission
     * @param {number} index - Index of submission to remove
     * @returns {boolean} - Success indicator
     */
    removePendingSubmission(index) {
        if (index < 0 || index >= this.pendingSubmissions.length) {
            console.error('Invalid submission index');
            return false;
        }
        
        try {
            this.pendingSubmissions.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error removing pending submission:', error);
            return false;
        }
    }
}

// Initialize the database manager
const databaseManager = new DatabaseManager();

// Make it available globally
window.databaseManager = databaseManager;

// Try to fetch and load academics.json on startup
document.addEventListener('DOMContentLoaded', () => {
    // After app is loaded, try to load academics.json if database is empty
    if (Object.keys(databaseManager.academics).length <= 1) {
        try {
            fetch('academics.json')
                .then(response => response.json())
                .then(data => {
                    if (data && Object.keys(data).length > 0) {
                        databaseManager.academics = data;
                        console.log(`Loaded ${Object.keys(data).length} academics from academics.json`);
                        databaseManager.saveToLocalStorage();
                        
                        // Add novelty tile
                        databaseManager.addNoveltyTile({
                            title: 'Database Loaded',
                            content: `${Object.keys(data).length} academics loaded from source data.`,
                            date: new Date().toISOString(),
                            type: 'system'
                        });
                        
                        // Update UI if on database page
                        if (typeof loadDatabaseListing === 'function') {
                            loadDatabaseListing();
                        }
                    }
                })
                .catch(error => {
                    console.log('Could not load academics.json:', error);
                });
        } catch (fetchError) {
            console.log('Could not fetch academics.json:', fetchError);
        }
    }
});
