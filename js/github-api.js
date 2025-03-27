/**
 * GitHub API Integration for KillPhilosophy
 * Handles GitHub repository interactions for contributions and pull requests
 */

class GitHubAPIManager {
    constructor() {
        this.apiUrl = 'https://api.github.com';
        this.repoOwner = '';
        this.repoName = '';
        this.token = '';
        this.isConnected = false;
        this.logs = [];
        
        // Try to load saved GitHub settings
        this._loadSettings();
    }
    
    /**
     * Load GitHub settings from localStorage
     * @private
     */
    _loadSettings() {
        try {
            const savedRepo = localStorage.getItem('killphilosophy_github_repo');
            const savedToken = localStorage.getItem('killphilosophy_github_token');
            
            if (savedRepo) {
                const [owner, name] = savedRepo.split('/');
                this.repoOwner = owner;
                this.repoName = name;
            }
            
            if (savedToken) {
                this.token = savedToken;
            }
            
            this.isConnected = !!(this.repoOwner && this.repoName);
            
            if (this.isConnected) {
                this._log('GitHub settings loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading GitHub settings:', error);
            this.isConnected = false;
        }
    }
    
    /**
     * Save GitHub settings to localStorage
     * @private
     * @returns {boolean} Success indicator
     */
    _saveSettings() {
        try {
            if (this.repoOwner && this.repoName) {
                localStorage.setItem('killphilosophy_github_repo', `${this.repoOwner}/${this.repoName}`);
            } else {
                localStorage.removeItem('killphilosophy_github_repo');
            }
            
            if (this.token) {
                localStorage.setItem('killphilosophy_github_token', this.token);
            } else {
                localStorage.removeItem('killphilosophy_github_token');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving GitHub settings:', error);
            return false;
        }
    }
    
    /**
     * Log messages for GitHub operations
     * @private
     * @param {string} message - Log message
     * @param {string} type - Log type (info, success, error)
     */
    _log(message, type = 'info') {
        const logEntry = {
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        this.logs.unshift(logEntry);
        
        // Keep logs from growing too large
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }
        
        // Log to console
        switch (type) {
            case 'error':
                console.error(`[GitHub] ${message}`);
                break;
            case 'success':
                console.log(`[GitHub] ${message}`);
                break;
            default:
                console.info(`[GitHub] ${message}`);
        }
        
        // Update UI log display if available
        this._updateLogDisplay();
    }
    
    /**
     * Update the GitHub log display in the UI
     * @private
     */
    _updateLogDisplay() {
        const logContainer = document.getElementById('github-log-content');
        if (!logContainer) return;
        
        // Clear existing logs
        logContainer.innerHTML = '';
        
        // Add logs
        this.logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry log-${log.type}`;
            
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            logElement.textContent = `[${timestamp}] ${log.message}`;
            
            logContainer.appendChild(logElement);
        });
    }
    
    /**
     * Make a request to the GitHub API
     * @private
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} - API response
     */
    async _makeRequest(endpoint, options = {}) {
        if (!this.isConnected) {
            throw new Error('GitHub repository not connected');
        }
        
        const url = `${this.apiUrl}${endpoint}`;
        
        const requestOptions = {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            ...options
        };
        
        // Add authorization if token is available
        if (this.token) {
            requestOptions.headers.Authorization = `token ${this.token}`;
        }
        
        try {
            const response = await fetch(url, requestOptions);
            
            // Check for rate limiting
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining && parseInt(remaining) < 10) {
                this._log(`GitHub API rate limit running low: ${remaining} requests remaining`, 'warning');
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `API request failed with status ${response.status}`);
            }
            
            // Return JSON response or empty object if no content
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            this._log(`API request failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Connect to a GitHub repository
     * @param {string} repo - Repository in format "owner/repo"
     * @param {string} token - GitHub personal access token (optional)
     * @returns {Promise<boolean>} - Success indicator
     */
    async connectToRepo(repo, token = '') {
        if (!repo || !repo.includes('/')) {
            this._log('Invalid repository format. Use "owner/repo"', 'error');
            return false;
        }
        
        const [owner, name] = repo.split('/');
        
        try {
            this.repoOwner = owner;
            this.repoName = name;
            this.token = token;
            
            // Test the connection
            await this._makeRequest(`/repos/${owner}/${name}`);
            
            this.isConnected = true;
            this._saveSettings();
            
            this._log(`Successfully connected to ${repo}`, 'success');
            return true;
        } catch (error) {
            this.isConnected = false;
            this._log(`Failed to connect to repository: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Disconnect from GitHub repository
     * @returns {boolean} - Success indicator
     */
    disconnect() {
        this.repoOwner = '';
        this.repoName = '';
        this.token = '';
        this.isConnected = false;
        this._saveSettings();
        
        this._log('Disconnected from GitHub repository', 'info');
        return true;
    }
    
    /**
     * Check connection status
     * @returns {boolean} - Connection status
     */
    isGitHubConnected() {
        return this.isConnected;
    }
    
    /**
     * Get GitHub logs
     * @returns {Array} - Array of log entries
     */
    getLogs() {
        return this.logs;
    }
    
    /**
     * Create a new file in the repository
     * @param {string} path - File path in the repository
     * @param {string} content - File content
     * @param {string} message - Commit message
     * @returns {Promise<Object>} - API response
     */
    async createFile(path, content, message) {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
            
            // Base64 encode the content
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            
            const response = await this._makeRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify({
                    message,
                    content: base64Content
                })
            });
            
            this._log(`File "${path}" created successfully`, 'success');
            return response;
        } catch (error) {
            this._log(`Error creating file "${path}": ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Update an existing file in the repository
     * @param {string} path - File path in the repository
     * @param {string} content - New file content
     * @param {string} message - Commit message
     * @returns {Promise<Object>} - API response
     */
    async updateFile(path, content, message) {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            // First, get the current file to get its SHA
            const fileData = await this._makeRequest(`/repos/${this.repoOwner}/${this.repoName}/contents/${path}`);
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;
            
            // Base64 encode the content
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            
            const response = await this._makeRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify({
                    message,
                    content: base64Content,
                    sha: fileData.sha
                })
            });
            
            this._log(`File "${path}" updated successfully`, 'success');
            return response;
        } catch (error) {
            this._log(`Error updating file "${path}": ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Create a pull request
     * @param {string} title - PR title
     * @param {string} body - PR description
     * @param {string} head - Source branch
     * @param {string} base - Target branch (usually 'main' or 'master')
     * @returns {Promise<Object>} - API response
     */
    async createPullRequest(title, body, head, base = 'main') {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/pulls`;
            
            const response = await this._makeRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    body,
                    head,
                    base
                })
            });
            
            this._log(`Pull request "${title}" created successfully`, 'success');
            return response;
        } catch (error) {
            this._log(`Error creating pull request: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Fork a repository
     * @returns {Promise<Object>} - API response
     */
    async forkRepository() {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/forks`;
            
            const response = await this._makeRequest(endpoint, {
                method: 'POST'
            });
            
            this._log(`Repository forked successfully`, 'success');
            return response;
        } catch (error) {
            this._log(`Error forking repository: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Get pull requests for the repository
     * @param {string} state - PR state (open, closed, all)
     * @returns {Promise<Array>} - Array of pull requests
     */
    async getPullRequests(state = 'open') {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/pulls?state=${state}`;
            
            const response = await this._makeRequest(endpoint);
            
            this._log(`Retrieved ${response.length} ${state} pull requests`, 'success');
            return response;
        } catch (error) {
            this._log(`Error getting pull requests: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Get repository issues
     * @param {string} state - Issue state (open, closed, all)
     * @returns {Promise<Array>} - Array of issues
     */
    async getIssues(state = 'open') {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            const endpoint = `/repos/${this.repoOwner}/${this.repoName}/issues?state=${state}`;
            
            const response = await this._makeRequest(endpoint);
            
            this._log(`Retrieved ${response.length} ${state} issues`, 'success');
            return response;
        } catch (error) {
            this._log(`Error getting issues: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Submit academic data to GitHub
     * @param {Object} academic - Academic data
     * @returns {Promise<boolean>} - Success indicator
     */
    async submitAcademicContribution(academic) {
        try {
            if (!this.isConnected) {
                throw new Error('GitHub repository not connected');
            }
            
            if (!academic || !academic.name) {
                throw new Error('Invalid academic data');
            }
            
            const normalizedName = academic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            // Get current academics.json file
            let academicsData = {};
            let fileSha = '';
            
            try {
                const fileData = await this._makeRequest(`/repos/${this.repoOwner}/${this.repoName}/contents/data/academics.json`);
                fileSha = fileData.sha;
                
                // Decode the content
                const content = atob(fileData.content);
                academicsData = JSON.parse(content);
            } catch (error) {
                // File might not exist yet, create it
                this._log('academics.json not found, will create new file', 'info');
            }
            
            // Add or update the academic entry
            academicsData[normalizedName] = academic;
            
            // Prepare the file content
            const content = JSON.stringify(academicsData, null, 2);
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            
            // Create branch for the contribution
            const branchName = `contribution/${normalizedName}-${Date.now()}`;
            
            // Get the default branch to use as base
            const repoInfo = await this._makeRequest(`/repos/${this.repoOwner}/${this.repoName}`);
            const defaultBranch = repoInfo.default_branch;
            
            // Get the reference to the default branch
            const refData = await this._makeRequest(`/repos/${this.repoOwner}/${this.repoName}/git/refs/heads/${defaultBranch}`);
            
            // Create a new branch
            await this._makeRequest(`/repos/${this.repoOwner}/${this.repoName}/git/refs`, {
                method: 'POST',
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: refData.object.sha
                })
            });
            
            // Update the file in the new branch
            const updateEndpoint = `/repos/${this.repoOwner}/${this.repoName}/contents/data/academics.json`;
            
            await this._makeRequest(updateEndpoint, {
                method: 'PUT',
                body: JSON.stringify({
                    message: `Add/update academic: ${academic.name}`,
                    content: base64Content,
                    branch: branchName,
                    sha: fileSha || undefined
                })
            });
            
            // Create a pull request
            await this.createPullRequest(
                `Add/update academic: ${academic.name}`,
                `This PR adds or updates information for ${academic.name}.`,
                branchName,
                defaultBranch
            );
            
            this._log(`Contribution for ${academic.name} submitted successfully`, 'success');
            return true;
        } catch (error) {
            this._log(`Error submitting academic contribution: ${error.message}`, 'error');
            return false;
        }
    }
}

// Initialize the GitHub API manager
const githubManager = new GitHubAPIManager();

// Make it available globally
window.githubManager = githubManager;

// Setup GitHub UI events once the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // GitHub connection form
    const connectForm = document.getElementById('connect-github');
    const repoInput = document.getElementById('github-repo');
    const tokenInput = document.getElementById('github-token');
    
    if (connectForm && repoInput) {
        connectForm.addEventListener('click', async () => {
            const repo = repoInput.value.trim();
            const token = tokenInput ? tokenInput.value.trim() : '';
            
            if (!repo) {
                window.displayErrorMessage('Please enter a repository in the format "username/repository"', 'github');
                return;
            }
            
            const statusPanel = document.getElementById('github-status-panel');
            if (statusPanel) {
                statusPanel.style.display = 'block';
            }
            
            const success = await githubManager.connectToRepo(repo, token);
            
            if (success) {
                // Update UI to show connected state
                connectForm.textContent = 'Disconnect';
                connectForm.classList.add('connected');
                
                // Update the contribution form to show GitHub submission option
                const githubSubmit = document.getElementById('github-submit');
                if (githubSubmit) {
                    githubSubmit.disabled = false;
                }
            }
        });
    }
    
    // Fetch pull requests button
    const fetchPRsButton = document.getElementById('fetch-pull-requests');
    if (fetchPRsButton) {
        fetchPRsButton.addEventListener('click', async () => {
            const prContainer = document.getElementById('pull-requests');
            
            if (!githubManager.isGitHubConnected()) {
                if (prContainer) {
                    prContainer.innerHTML = '<div class="error-message">GitHub repository not connected</div>';
                }
                return;
            }
            
            try {
                const pullRequests = await githubManager.getPullRequests();
                
                if (prContainer) {
                    if (pullRequests.length === 0) {
                        prContainer.innerHTML = '<div class="info-message">No open pull requests found</div>';
                        return;
                    }
                    
                    prContainer.innerHTML = '';
                    
                    pullRequests.forEach(pr => {
                        const prItem = document.createElement('div');
                        prItem.className = 'pr-item';
                        
                        const prTitle = document.createElement('h4');
                        prTitle.textContent = pr.title;
                        prItem.appendChild(prTitle);
                        
                        const prDetails = document.createElement('div');
                        prDetails.className = 'pr-details';
                        prDetails.innerHTML = `
                            <p>Author: ${pr.user.login}</p>
                            <p>Created: ${new Date(pr.created_at).toLocaleDateString()}</p>
                            <p>Status: ${pr.state}</p>
                        `;
                        prItem.appendChild(prDetails);
                        
                        const prLink = document.createElement('a');
                        prLink.href = pr.html_url;
                        prLink.textContent = 'View on GitHub';
                        prLink.target = '_blank';
                        prItem.appendChild(prLink);
                        
                        prContainer.appendChild(prItem);
                    });
                }
            } catch (error) {
                if (prContainer) {
                    prContainer.innerHTML = `<div class="error-message">Error fetching pull requests: ${error.message}</div>`;
                }
            }
        });
    }
});
