/**
 * Contribution Handler for KillPhilosophy
 * Manages the contribution form and submission process
 */

class ContributionHandler {
    constructor() {
        this.currentAcademic = null;
        this.taxonomyCategories = null;
        
        // Initialize once the DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeContributionForm();
        });
    }
    
    /**
     * Initialize the contribution form
     */
    initializeContributionForm() {
        // Get necessary form elements
        const academicNameInput = document.getElementById('academic-name');
        const contributionType = document.getElementById('contribution-type');
        const contributionDetails = document.getElementById('contribution-details');
        const submitButton = document.getElementById('submit-contribution');
        const contributionResult = document.getElementById('contribution-result');
        
        if (!academicNameInput || !contributionType || !contributionDetails || !submitButton) {
            console.warn('Contribution form elements not found');
            return;
        }
        
        // Get taxonomy categories from database manager if available
        if (typeof databaseManager !== 'undefined') {
            this.taxonomyCategories = databaseManager.getAllTaxonomyCategories();
        }
        
        // Handle contribution type change
        contributionType.addEventListener('change', () => {
            this.updateContributionForm(
                academicNameInput.value, 
                contributionType.value, 
                contributionDetails
            );
        });
        
        // Handle academic name input
        academicNameInput.addEventListener('input', () => {
            this.updateContributionForm(
                academicNameInput.value, 
                contributionType.value, 
                contributionDetails
            );
        });
        
        // Handle form submission
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleContributionSubmit();
            });
        }
    }
    
    /**
     * Update the contribution form based on the selected type
     * @param {string} academicName - Academic name
     * @param {string} contributionType - Type of contribution
     * @param {HTMLElement} container - Container for contribution details
     */
    updateContributionForm(academicName, contributionType, container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Try to load the academic if it exists
        if (academicName && typeof databaseManager !== 'undefined') {
            this.currentAcademic = databaseManager.getAcademic(academicName);
        } else {
            this.currentAcademic = null;
        }
        
        // Create form fields based on contribution type
        switch (contributionType) {
            case 'paper':
                this.createPaperForm(container);
                break;
            case 'event':
                this.createEventForm(container);
                break;
            case 'connection':
                this.createConnectionForm(container);
                break;
            case 'taxonomy':
                this.createTaxonomyForm(container);
                break;
            case 'bio':
                this.createBioForm(container);
                break;
            default:
                container.innerHTML = '<div class="error-message">Unknown contribution type</div>';
        }
    }
    
    /**
     * Create form for paper contribution
     * @param {HTMLElement} container - Container for form fields
     */
    createPaperForm(container) {
        const formHTML = `
            <div class="form-group">
                <label for="paper-title">Paper Title:</label>
                <input type="text" id="paper-title" placeholder="Enter paper title" required>
            </div>
            
            <div class="form-group">
                <label for="paper-year">Year:</label>
                <input type="number" id="paper-year" min="1800" max="${new Date().getFullYear()}" placeholder="Publication year">
            </div>
            
            <div class="form-group">
                <label for="paper-coauthors">Co-authors (comma separated):</label>
                <input type="text" id="paper-coauthors" placeholder="Co-author 1, Co-author 2, ...">
            </div>
            
            <div class="form-group">
                <label for="paper-url">URL (optional):</label>
                <input type="url" id="paper-url" placeholder="https://...">
            </div>
        `;
        
        container.innerHTML = formHTML;
    }
    
    /**
     * Create form for event contribution
     * @param {HTMLElement} container - Container for form fields
     */
    createEventForm(container) {
        const formHTML = `
            <div class="form-group">
                <label for="event-title">Event Title:</label>
                <input type="text" id="event-title" placeholder="Enter event title" required>
            </div>
            
            <div class="form-group">
                <label for="event-year">Year:</label>
                <input type="number" id="event-year" min="1800" max="${new Date().getFullYear()}" placeholder="Event year">
            </div>
            
            <div class="form-group">
                <label for="event-location">Location:</label>
                <input type="text" id="event-location" placeholder="Event location">
            </div>
            
            <div class="form-group">
                <label for="event-description">Description (optional):</label>
                <textarea id="event-description" rows="3" placeholder="Event description"></textarea>
            </div>
        `;
        
        container.innerHTML = formHTML;
    }
    
    /**
     * Create form for connection contribution
     * @param {HTMLElement} container - Container for form fields
     */
    createConnectionForm(container) {
        let options = '<option value="">Select an academic...</option>';
        
        // Add options from database if available
        if (typeof databaseManager !== 'undefined') {
            const academics = databaseManager.getAllAcademics();
            
            academics.forEach(academic => {
                if (this.currentAcademic && academic.name === this.currentAcademic.name) {
                    return; // Skip the current academic
                }
                options += `<option value="${academic.name}">${academic.name}</option>`;
            });
        }
        
        const formHTML = `
            <div class="form-group">
                <label for="connection-academic">Connected Academic:</label>
                <select id="connection-academic" required>
                    ${options}
                </select>
            </div>
            
            <div class="form-group">
                <label for="connection-new-academic">Or add a new academic:</label>
                <input type="text" id="connection-new-academic" placeholder="New academic name">
            </div>
            
            <div class="form-group">
                <label for="connection-description">Connection Description (optional):</label>
                <textarea id="connection-description" rows="3" placeholder="Describe the connection"></textarea>
            </div>
        `;
        
        container.innerHTML = formHTML;
    }
    
    /**
     * Create form for taxonomy contribution
     * @param {HTMLElement} container - Container for form fields
     */
    createTaxonomyForm(container) {
        if (!this.taxonomyCategories) {
            // Use default taxonomy categories if not available from database
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
        }
        
        let taxonomyHTML = '';
        
        // Create form fields for each taxonomy category
        for (const category in this.taxonomyCategories) {
            const categoryValues = this.taxonomyCategories[category];
            
            // Get existing values for the current academic if available
            const existingValues = this.currentAcademic?.taxonomies?.[category] || [];
            
            taxonomyHTML += `
                <div class="taxonomy-category-field">
                    <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div class="taxonomy-checkboxes">
            `;
            
            // Create checkboxes for existing values
            categoryValues.forEach(value => {
                const isChecked = existingValues.includes(value);
                taxonomyHTML += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="taxonomy-${category}-${value.replace(/\s+/g, '-')}" 
                            name="taxonomy-${category}" value="${value}" ${isChecked ? 'checked' : ''}>
                        <label for="taxonomy-${category}-${value.replace(/\s+/g, '-')}">${value}</label>
                    </div>
                `;
            });
            
            // Add field for new value
            taxonomyHTML += `
                    </div>
                    <div class="form-group">
                        <label for="new-${category}">Add new ${category}:</label>
                        <input type="text" id="new-${category}" placeholder="New ${category} value">
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = taxonomyHTML;
    }
    
    /**
     * Create form for biography contribution
     * @param {HTMLElement} container - Container for form fields
     */
    createBioForm(container) {
        const currentBio = this.currentAcademic?.bio || '';
        
        const formHTML = `
            <div class="form-group">
                <label for="bio-text">Biography:</label>
                <textarea id="bio-text" rows="6" placeholder="Enter biographical information">${currentBio}</textarea>
            </div>
            
            <div class="form-group">
                <label for="bio-birth-year">Birth Year (optional):</label>
                <input type="number" id="bio-birth-year" min="1000" max="${new Date().getFullYear()}" placeholder="Birth year">
            </div>
            
            <div class="form-group">
                <label for="bio-death-year">Death Year (if applicable):</label>
                <input type="number" id="bio-death-year" min="1000" max="${new Date().getFullYear()}" placeholder="Death year">
            </div>
        `;
        
        container.innerHTML = formHTML;
    }
    
    /**
     * Handle contribution form submission
     */
    handleContributionSubmit() {
        // Get form elements
        const academicNameInput = document.getElementById('academic-name');
        const contributionTypeSelect = document.getElementById('contribution-type');
        const contributorNameInput = document.getElementById('contributor-name');
        const githubSubmitCheckbox = document.getElementById('github-submit');
        const contributionResult = document.getElementById('contribution-result');
        
        if (!academicNameInput || !contributionTypeSelect) {
            this._displayError('Form elements not found');
            return;
        }
        
        const academicName = academicNameInput.value.trim();
        const contributionType = contributionTypeSelect.value;
        const contributorName = contributorNameInput ? contributorNameInput.value.trim() : '';
        const submitToGitHub = githubSubmitCheckbox ? githubSubmitCheckbox.checked : false;
        
        if (!academicName) {
            this._displayError('Please enter an academic name');
            return;
        }
        
        // Validate contribution data based on type
        let contributionData;
        
        try {
            switch (contributionType) {
                case 'paper':
                    contributionData = this._validatePaperContribution();
                    break;
                case 'event':
                    contributionData = this._validateEventContribution();
                    break;
                case 'connection':
                    contributionData = this._validateConnectionContribution();
                    break;
                case 'taxonomy':
                    contributionData = this._validateTaxonomyContribution();
                    break;
                case 'bio':
                    contributionData = this._validateBioContribution();
                    break;
                default:
                    throw new Error('Unknown contribution type');
            }
        } catch (error) {
            this._displayError(error.message);
            return;
        }
        
        // Prepare the submission
        const submission = {
            academicName,
            contributionType,
            contributorName,
            data: contributionData,
            timestamp: new Date().toISOString()
        };
        
        // Submit the contribution
        this._submitContribution(submission, submitToGitHub);
    }
    
    /**
     * Validate paper contribution
     * @private
     * @returns {Object} - Validated paper data
     */
    _validatePaperContribution() {
        const titleInput = document.getElementById('paper-title');
        const yearInput = document.getElementById('paper-year');
        const coauthorsInput = document.getElementById('paper-coauthors');
        const urlInput = document.getElementById('paper-url');
        
        if (!titleInput || !titleInput.value.trim()) {
            throw new Error('Paper title is required');
        }
        
        const title = titleInput.value.trim();
        let year = null;
        
        if (yearInput && yearInput.value) {
            year = parseInt(yearInput.value);
            
            if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
                throw new Error('Invalid year');
            }
        }
        
        const coauthors = coauthorsInput && coauthorsInput.value 
            ? coauthorsInput.value.split(',').map(name => name.trim()).filter(name => name)
            : [];
            
        const url = urlInput && urlInput.value ? urlInput.value.trim() : null;
        
        return {
            type: 'paper',
            paper: {
                title,
                year,
                coauthors,
                url
            }
        };
    }
    
    /**
     * Validate event contribution
     * @private
     * @returns {Object} - Validated event data
     */
    _validateEventContribution() {
        const titleInput = document.getElementById('event-title');
        const yearInput = document.getElementById('event-year');
        const locationInput = document.getElementById('event-location');
        const descriptionInput = document.getElementById('event-description');
        
        if (!titleInput || !titleInput.value.trim()) {
            throw new Error('Event title is required');
        }
        
        const title = titleInput.value.trim();
        let year = null;
        
        if (yearInput && yearInput.value) {
            year = parseInt(yearInput.value);
            
            if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
                throw new Error('Invalid year');
            }
        }
        
        const location = locationInput && locationInput.value ? locationInput.value.trim() : null;
        const description = descriptionInput && descriptionInput.value ? descriptionInput.value.trim() : null;
        
        return {
            type: 'event',
            event: {
                title,
                year,
                location,
                description
            }
        };
    }
    
    /**
     * Validate connection contribution
     * @private
     * @returns {Object} - Validated connection data
     */
    _validateConnectionContribution() {
        const academicSelect = document.getElementById('connection-academic');
        const newAcademicInput = document.getElementById('connection-new-academic');
        const descriptionInput = document.getElementById('connection-description');
        
        // Either select an existing academic or add a new one
        let connectedAcademic;
        
        if (academicSelect && academicSelect.value) {
            connectedAcademic = academicSelect.value;
        } else if (newAcademicInput && newAcademicInput.value.trim()) {
            connectedAcademic = newAcademicInput.value.trim();
        } else {
            throw new Error('Please select or enter a connected academic');
        }
        
        const description = descriptionInput && descriptionInput.value ? descriptionInput.value.trim() : null;
        
        return {
            type: 'connection',
            connection: {
                connectedAcademic,
                description
            }
        };
    }
    
    /**
     * Validate taxonomy contribution
     * @private
     * @returns {Object} - Validated taxonomy data
     */
    _validateTaxonomyContribution() {
        const taxonomies = {};
        
        // Process each taxonomy category
        for (const category in this.taxonomyCategories) {
            taxonomies[category] = [];
            
            // Get selected checkbox values
            const checkboxes = document.querySelectorAll(`input[name="taxonomy-${category}"]:checked`);
            checkboxes.forEach(checkbox => {
                taxonomies[category].push(checkbox.value);
            });
            
            // Check for new value
            const newValueInput = document.getElementById(`new-${category}`);
            if (newValueInput && newValueInput.value.trim()) {
                taxonomies[category].push(newValueInput.value.trim());
            }
        }
        
        return {
            type: 'taxonomy',
            taxonomies
        };
    }
    
    /**
     * Validate bio contribution
     * @private
     * @returns {Object} - Validated bio data
     */
    _validateBioContribution() {
        const bioTextarea = document.getElementById('bio-text');
        const birthYearInput = document.getElementById('bio-birth-year');
        const deathYearInput = document.getElementById('bio-death-year');
        
        if (!bioTextarea || !bioTextarea.value.trim()) {
            throw new Error('Biography text is required');
        }
        
        const bio = bioTextarea.value.trim();
        let birthYear = null;
        let deathYear = null;
        
        if (birthYearInput && birthYearInput.value) {
            birthYear = parseInt(birthYearInput.value);
            
            if (isNaN(birthYear) || birthYear < 1000 || birthYear > new Date().getFullYear()) {
                throw new Error('Invalid birth year');
            }
        }
        
        if (deathYearInput && deathYearInput.value) {
            deathYear = parseInt(deathYearInput.value);
            
            if (isNaN(deathYear) || deathYear < 1000 || deathYear > new Date().getFullYear()) {
                throw new Error('Invalid death year');
            }
            
            if (birthYear && deathYear && deathYear < birthYear) {
                throw new Error('Death year cannot be before birth year');
            }
        }
        
        return {
            type: 'bio',
            bio: {
                text: bio,
                birthYear,
                deathYear
            }
        };
    }
    
    /**
     * Submit a contribution
     * @private
     * @param {Object} submission - Contribution data
     * @param {boolean} submitToGitHub - Whether to submit to GitHub
     */
    _submitContribution(submission, submitToGitHub) {
        const contributionResult = document.getElementById('contribution-result');
        
        if (!contributionResult) {
            console.error('Contribution result element not found');
            return;
        }
        
        // Show loading state
        contributionResult.innerHTML = '<div class="info-message">Processing contribution...</div>';
        contributionResult.classList.add('visible');
        contributionResult.style.display = 'block';
        
        // Process the contribution
        try {
            // First, check if the academic exists
            let academic;
            
            if (typeof databaseManager !== 'undefined') {
                academic = databaseManager.getAcademic(submission.academicName);
            }
            
            // If academic doesn't exist, create it
            if (!academic) {
                academic = {
                    name: submission.academicName,
                    papers: [],
                    events: [],
                    connections: [],
                    taxonomies: {}
                };
            }
            
            // Update the academic with the contribution
            switch (submission.data.type) {
                case 'paper':
                    if (!academic.papers) {
                        academic.papers = [];
                    }
                    academic.papers.push(submission.data.paper);
                    break;
                    
                case 'event':
                    if (!academic.events) {
                        academic.events = [];
                    }
                    academic.events.push(submission.data.event);
                    break;
                    
                case 'connection':
                    if (!academic.connections) {
                        academic.connections = [];
                    }
                    
                    const connectedAcademic = submission.data.connection.connectedAcademic;
                    
                    if (!academic.connections.includes(connectedAcademic)) {
                        academic.connections.push(connectedAcademic);
                    }
                    break;
                    
                case 'taxonomy':
                    if (!academic.taxonomies) {
                        academic.taxonomies = {};
                    }
                    
                    for (const category in submission.data.taxonomies) {
                        if (!academic.taxonomies[category]) {
                            academic.taxonomies[category] = [];
                        }
                        
                        submission.data.taxonomies[category].forEach(value => {
                            if (!academic.taxonomies[category].includes(value)) {
                                academic.taxonomies[category].push(value);
                            }
                        });
                    }
                    break;
                    
                case 'bio':
                    academic.bio = submission.data.bio.text;
                    
                    if (submission.data.bio.birthYear) {
                        academic.birthYear = submission.data.bio.birthYear;
                    }
                    
                    if (submission.data.bio.deathYear) {
                        academic.deathYear = submission.data.bio.deathYear;
                    }
                    break;
            }
            
            // Save the academic to the database
            let databaseSuccess = false;
            
            if (typeof databaseManager !== 'undefined') {
                databaseSuccess = databaseManager.addOrUpdateAcademic(academic);
                
                // Add to pending submissions if configured
                databaseManager.addPendingSubmission(submission);
            }
            
            // Submit to GitHub if requested
            let githubSuccess = false;
            
            if (submitToGitHub && typeof githubManager !== 'undefined' && githubManager.isGitHubConnected()) {
                githubManager.submitAcademicContribution(academic)
                    .then(success => {
                        if (success) {
                            contributionResult.innerHTML += '<div class="success-message">Contribution submitted to GitHub successfully.</div>';
                        } else {
                            contributionResult.innerHTML += '<div class="error-message">Failed to submit to GitHub.</div>';
                        }
                    })
                    .catch(error => {
                        contributionResult.innerHTML += `<div class="error-message">GitHub error: ${error.message}</div>`;
                    });
            }
            
            // Show success message
            contributionResult.innerHTML = '<div class="success-message">Contribution submitted successfully!</div>';
            
            if (databaseSuccess) {
                contributionResult.innerHTML += '<div class="info-message">Academic data updated in the local database.</div>';
            }
            
            // Clear the form
            const academicNameInput = document.getElementById('academic-name');
            const contributionDetails = document.getElementById('contribution-details');
            
            if (academicNameInput && contributionDetails) {
                academicNameInput.value = '';
                contributionDetails.innerHTML = '';
            }
            
            // Add a novelty tile for the contribution
            if (typeof databaseManager !== 'undefined') {
                databaseManager.addNoveltyTile({
                    title: `New Contribution: ${submission.academicName}`,
                    content: `New ${submission.data.type} information added for ${submission.academicName}.`,
                    date: new Date().toISOString(),
                    type: submission.data.type
                });
            }
        } catch (error) {
            this._displayError(error.message);
        }
    }
    
    /**
     * Display an error message
     * @private
     * @param {string} message - Error message
     */
    _displayError(message) {
        const contributionResult = document.getElementById('contribution-result');
        
        if (contributionResult) {
            contributionResult.innerHTML = `<div class="error-message">Error: ${message}</div>`;
            contributionResult.classList.add('visible');
            contributionResult.style.display = 'block';
        } else {
            console.error('Contribution error:', message);
        }
    }
}

// Initialize the contribution handler
const contributionHandler = new ContributionHandler();

// Make it available globally
window.contributionHandler = contributionHandler;
