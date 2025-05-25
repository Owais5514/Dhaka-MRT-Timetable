# Environment Variable Configuration Guide

## Overview

The Dhaka MRT Timetable application now supports environment variable configuration for security and flexibility. This guide explains how to set up and customize your deployment.

## Quick Setup

### 1. Local Development

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your preferred settings
nano .env.local

# Build the application with your configuration
npm run build

# Start the development server
npm run dev
```

### 2. Production Deployment

For GitHub Pages or other hosting platforms, set environment variables in your deployment pipeline.

## Environment Variables

### Security Settings

#### `ADMIN_PASSWORD`
- **Purpose**: Password for accessing the admin panel
- **Default**: `12345678`
- **Recommendation**: Use a strong, unique password for production
- **Example**: `ADMIN_PASSWORD=mySecurePassword123!`

### Repository Configuration

#### `GITHUB_OWNER`
- **Purpose**: GitHub username/organization for automated updates
- **Default**: `Owais5514`
- **Example**: `GITHUB_OWNER=your-username`

#### `GITHUB_REPO`
- **Purpose**: Repository name for automated updates
- **Default**: `Dhaka-MRT-Timetable`
- **Example**: `GITHUB_REPO=your-repo-name`

### Feature Toggles

#### `ENABLE_VERIFICATION_SYSTEM`
- **Purpose**: Enable/disable the train time verification system
- **Default**: `true`
- **Values**: `true` or `false`

#### `ENABLE_ADMIN_PANEL`
- **Purpose**: Enable/disable the admin panel completely
- **Default**: `true`
- **Values**: `true` or `false`

#### `AUTO_REFRESH_INTERVAL`
- **Purpose**: Interval for auto-refreshing verified times (milliseconds)
- **Default**: `300000` (5 minutes)
- **Example**: `AUTO_REFRESH_INTERVAL=600000` (10 minutes)

#### `DEBUG_MODE`
- **Purpose**: Enable debug logging in browser console
- **Default**: `false`
- **Values**: `true` or `false`

## Deployment Scenarios

### GitHub Pages with Secrets

1. **Set Repository Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add `ADMIN_PASSWORD` with your secure password

2. **Deploy**:
   ```bash
   git push origin main
   ```
   
   The GitHub Actions workflow will automatically build with your environment variables.

### Manual Deployment

1. **Set Environment Variables**:
   ```bash
   export ADMIN_PASSWORD="yourSecurePassword"
   export GITHUB_OWNER="your-username"
   export GITHUB_REPO="your-repo"
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   # Copy docs/ folder to your web server
   ```

### Local Testing with Different Passwords

```bash
# Test with different admin passwords
ADMIN_PASSWORD="testPassword1" npm run build && npm start

# Test with verification system disabled
ENABLE_VERIFICATION_SYSTEM=false npm run build && npm start

# Test with debug mode enabled
DEBUG_MODE=true npm run build && npm start
```

### Docker Deployment

```dockerfile
FROM node:alpine
WORKDIR /app
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

```bash
# Build with environment variables
docker build --build-arg ADMIN_PASSWORD=yourSecurePassword -t mrt-timetable .
docker run -p 8000:8000 mrt-timetable
```

## Security Best Practices

### Password Security
- Use a strong password with mixed case, numbers, and symbols
- Never commit passwords to version control
- Use different passwords for development and production
- Consider using a password manager to generate secure passwords

### Environment File Security
- Never commit `.env.local` or `.env` files to Git
- Use `.env.example` for documenting required variables
- Set appropriate file permissions: `chmod 600 .env.local`

### Production Security
- Use GitHub Secrets for sensitive values
- Enable two-factor authentication on your GitHub account
- Regularly rotate admin passwords
- Monitor access logs if available

## Troubleshooting

### Config File Not Loading
```javascript
// Check if config is loaded in browser console
console.log(window.APP_CONFIG);
```

### Build Issues
```bash
# Clean build
rm docs/config.js
npm run build
```

### Password Not Working
1. Check that the config file was generated: `cat docs/config.js`
2. Verify the password in the file matches your expectation
3. Clear browser cache and reload

### GitHub Actions Deployment
- Check the Actions tab for build logs
- Verify that ADMIN_PASSWORD secret is set
- Ensure workflow has write permissions

## Advanced Configuration

### Custom Configuration File
If you need more complex configuration, you can modify `build.js`:

```javascript
// Add custom config options
const config = {
    // ... existing config
    CUSTOM_FEATURE: process.env.CUSTOM_FEATURE || 'default'
};
```

### Environment-Specific Builds
```bash
# Development build
NODE_ENV=development npm run build

# Production build
NODE_ENV=production ADMIN_PASSWORD="prodPassword" npm run build

# Staging build
NODE_ENV=staging ADMIN_PASSWORD="stagingPassword" npm run build
```

## Verification Timeline

### How long does it take to upload verified times to GitHub Pages?

The verification update process works as follows:

1. **User Submits Feedback**: Instant (0 seconds)
   - User sees immediate visual feedback
   - Local state updates immediately

2. **GitHub Action Triggers**: 1-5 seconds
   - API call to GitHub repository dispatch
   - GitHub queues the workflow

3. **Workflow Execution**: 30-90 seconds
   - Checkout repository
   - Update verified-times.json
   - Commit and push changes

4. **GitHub Pages Rebuild**: 30-120 seconds
   - GitHub Pages detects file changes
   - Rebuilds and deploys the site
   - CDN cache refresh

5. **User Sees Update**: Next auto-refresh (up to 5 minutes)
   - Other users get updates on their next page refresh
   - Auto-refresh checks for updates every 5 minutes

**Total Time**: 2-10 minutes for global visibility

### Factors Affecting Speed:
- **GitHub Actions Queue**: During peak times, workflows may be queued longer
- **Repository Size**: Larger repositories take longer to process
- **GitHub Pages Cache**: CDN caching can delay updates by a few minutes
- **Network Conditions**: User's internet speed affects API calls

### Monitoring Updates:
- Check the "Actions" tab in your GitHub repository
- Look for "Update Verified Times" workflows
- Each successful verification creates a commit in the repository

This timeline ensures that the system remains responsive for users while providing reliable, persistent updates that benefit the entire community.
