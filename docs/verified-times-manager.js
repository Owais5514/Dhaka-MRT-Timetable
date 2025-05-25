// Verified Times Update System
// This script handles updating the verified-times.json file through GitHub API

class VerifiedTimesManager {
    constructor() {
        this.githubToken = null; // Will be set by admin
        this.githubRepo = 'Owais5514/Dhaka-MRT-Timetable';
        this.filePath = 'docs/verified-times.json';
    }

    // Set GitHub token for authenticated requests
    setToken(token) {
        this.githubToken = token;
    }

    // Update verified times file on GitHub
    async updateVerifiedTimesFile(newVerification) {
        if (!this.githubToken) {
            console.log('GitHub token not set, verification saved locally only');
            return;
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

    // Alternative: Use simple webhook approach
    async submitToWebhook(verification) {
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
}

// Initialize the manager
const verifiedTimesManager = new VerifiedTimesManager();

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerifiedTimesManager;
}
