// Verified Times Manager - Legacy Support
// This script provides fallback functionality for manual token-based updates
// The main system now uses automated GitHub Actions (see script.js)

class VerifiedTimesManager {
    constructor() {
        // Use environment configuration if available
        const config = window.APP_CONFIG || {};
        this.githubToken = null; // Token-based updates are deprecated
        this.githubRepo = `${config.GITHUB_OWNER || 'Owais5514'}/${config.GITHUB_REPO || 'Dhaka-MRT-Timetable'}`;
        this.filePath = 'docs/verified-times.json';
        
        console.warn('VerifiedTimesManager: Token-based updates are deprecated. Using automated GitHub Actions instead.');
    }

    // Set GitHub token for authenticated requests (DEPRECATED)
    setToken(token) {
        console.warn('setToken() is deprecated. The system now uses automated GitHub Actions.');
        this.githubToken = token;
    }

    // Update verified times file on GitHub (DEPRECATED - use automated GitHub Actions instead)
    async updateVerifiedTimesFile(newVerification) {
        console.warn('updateVerifiedTimesFile() is deprecated. Use saveVerifiedTimes() from script.js instead.');
        
        if (!this.githubToken) {
            console.log('GitHub token not set. Using automated GitHub Actions workflow instead.');
            // Delegate to the main verification system
            if (typeof saveVerifiedTimes === 'function') {
                return await saveVerifiedTimes(newVerification);
            }
            return false;
        }

        try {
            // Get current file content
            const currentFileResponse = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${this.filePath}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!currentFileResponse.ok) {
                throw new Error('Failed to fetch current file');
            }

            const currentFile = await currentFileResponse.json();
            const currentContent = JSON.parse(atob(currentFile.content));

            // Add new verification
            currentContent.verified_times[newVerification.timeId] = newVerification;
            currentContent.last_updated = new Date().toISOString();
            currentContent.version = (currentContent.version || 0) + 1;

            // Update file on GitHub
            const updateResponse = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${this.filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update verified times - ${newVerification.timeId}`,
                    content: btoa(JSON.stringify(currentContent, null, 2)),
                    sha: currentFile.sha
                })
            });

            if (updateResponse.ok) {
                console.log('Verified times updated on GitHub successfully');
                return true;
            } else {
                throw new Error('Failed to update file on GitHub');
            }
        } catch (error) {
            console.error('Error updating verified times file:', error);
            return false;
        }
    }

    // Alternative: Use automated GitHub Actions (RECOMMENDED)
    async submitViaGitHubActions(verification) {
        console.log('Delegating to automated GitHub Actions workflow...');
        
        // Use the main verification system from script.js
        if (typeof saveVerifiedTimes === 'function') {
            return await saveVerifiedTimes(verification);
        } else {
            console.error('saveVerifiedTimes function not available. Make sure script.js is loaded.');
            return false;
        }
    }

    // Legacy webhook approach (DEPRECATED)
    async submitToWebhook(verification) {
        console.warn('submitToWebhook() is deprecated. Use automated GitHub Actions instead.');
        
        try {
            // Submit to a webhook service that can update the file
            const response = await fetch('https://your-webhook-url.com/update-verified-times', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verification)
            });

            return response.ok;
        } catch (error) {
            console.error('Webhook submission failed:', error);
            return false;
        }
    }
    
    // Recommended method for submitting verifications
    async submitVerification(verification) {
        return await this.submitViaGitHubActions(verification);
    }
}

// Initialize the manager
const verifiedTimesManager = new VerifiedTimesManager();

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerifiedTimesManager;
}
