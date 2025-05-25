# Complete GitHub Actions Setup Guide

## 🚀 Setting Up Fully Automated Verification System

This guide will help you set up a completely automated verification system that requires **zero manual intervention** after initial setup.

## Step 1: Repository Permissions Setup

### Enable GitHub Actions Permissions

1. **Go to your GitHub repository**
2. **Navigate to Settings → Actions → General**
3. **Set Workflow permissions to "Read and write permissions"**
4. **Enable "Allow GitHub Actions to create and approve pull requests"**

This allows the automated workflow to commit verification updates directly to your repository.

## Step 2: Set Up Repository Secrets (Optional but Recommended)

### Add Admin Password Secret

1. **Go to Settings → Secrets and variables → Actions**
2. **Click "New repository secret"**
3. **Name**: `ADMIN_PASSWORD`
4. **Value**: Your secure admin password (e.g., `MySecureAdminPassword123!`)
5. **Click "Add secret"**

This ensures your admin password is not exposed in public builds.

## Step 3: Environment Configuration

### For Local Development

```bash
# Clone the repository
git clone https://github.com/Owais5514/Dhaka-MRT-Timetable.git
cd Dhaka-MRT-Timetable

# Set up your local environment
cp .env.example .env.local

# Edit .env.local with your preferred settings
nano .env.local
```

**Example .env.local:**
```bash
ADMIN_PASSWORD=yourSecureLocalPassword
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
ENABLE_VERIFICATION_SYSTEM=true
ENABLE_ADMIN_PANEL=true
AUTO_REFRESH_INTERVAL=300000
DEBUG_MODE=false
```

### Build and Run Locally

```bash
# Build with your configuration
npm run build

# Start development server
npm run dev
```

## Step 4: Production Deployment

### GitHub Pages Deployment (Recommended)

The repository includes an automated deployment workflow that:
- Builds the application with environment variables
- Deploys to GitHub Pages automatically
- Uses your repository secrets for secure configuration

**To deploy:**

1. **Push your changes to the main branch:**
```bash
git add .
git commit -m "Update configuration"
git push origin main
```

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - The deployment workflow will run automatically

### Alternative: Manual Deployment

```bash
# Set environment variables for production
export ADMIN_PASSWORD="yourProductionPassword"
export GITHUB_OWNER="your-username"
export GITHUB_REPO="your-repo"

# Build for production
npm run build

# Deploy the docs/ folder to your web server
```

## Step 5: Verification System Operation

### How the Automated System Works

1. **User clicks on a train time** → Feedback modal opens
2. **User provides feedback** (correct/incorrect with delay info)
3. **Immediate local update** → User sees verification instantly
4. **GitHub Action triggers automatically** → No tokens required for public repos
5. **File updates within 2-10 minutes** → All users see the verification

### Timeline Breakdown

| Step | Duration | Description |
|------|----------|-------------|
| User feedback | 0 seconds | Instant local update |
| GitHub API call | 1-5 seconds | Triggers repository dispatch |
| Workflow execution | 30-90 seconds | Updates verified-times.json |
| GitHub Pages rebuild | 30-120 seconds | Deploys updated site |
| Global visibility | 2-10 minutes | All users see the update |

## Step 6: Monitoring and Troubleshooting

### Monitor Automated Updates

1. **Check GitHub Actions tab** in your repository
2. **Look for "Update Verified Times" workflows**
3. **Each verification creates a commit** with timestamp
4. **Failed workflows show error details**

### Browser Console Monitoring

Open developer tools and check for these messages:
- ✅ `"Loaded X verified times from server"`
- ✅ `"Verification submitted successfully - automated update triggered"`
- ❌ `"Error submitting verification"` (falls back to local storage)

### Common Issues and Solutions

#### Verifications Not Saving
- **Check**: Repository permissions in Settings → Actions
- **Solution**: Enable "Read and write permissions"

#### Admin Panel Password Not Working
- **Check**: `window.APP_CONFIG` in browser console
- **Solution**: Run `npm run build` to regenerate config

#### GitHub Actions Failing
- **Check**: Actions tab for error logs
- **Solution**: Verify repository permissions and file structure

## Step 7: Advanced Configuration

### Custom Refresh Intervals

```bash
# Check for updates every 2 minutes
AUTO_REFRESH_INTERVAL=120000 npm run build

# Check for updates every 10 minutes
AUTO_REFRESH_INTERVAL=600000 npm run build
```

### Disable Features for Testing

```bash
# Disable verification system
ENABLE_VERIFICATION_SYSTEM=false npm run build

# Disable admin panel
ENABLE_ADMIN_PANEL=false npm run build

# Enable debug mode
DEBUG_MODE=true npm run build
```

### Multiple Environment Builds

```bash
# Development build
NODE_ENV=development ADMIN_PASSWORD="devPass" npm run build

# Production build
NODE_ENV=production ADMIN_PASSWORD="${ADMIN_PASSWORD}" npm run build
```

## Security Considerations

### ✅ What's Secure
- Admin passwords stored in GitHub Secrets
- Environment variables not committed to Git
- Public API endpoints (no authentication tokens needed)
- User verifications are anonymous

### ⚠️ Important Notes
- This system works for **public repositories**
- No sensitive GitHub tokens required
- Admin password is build-time configuration only
- All verification data is public (by design)

## Performance Optimization

### GitHub Actions Efficiency
- Workflows only run when verifications are submitted
- Minimal resource usage (30-90 seconds per update)
- No manual intervention required
- Automatic error handling and fallbacks

### User Experience
- Instant feedback for users
- Background synchronization
- Offline support with local storage fallback
- Auto-refresh keeps data current

## ✨ Summary

You now have a **fully automated verification system** that:

🔧 **Requires zero configuration** for basic operation
🔒 **Supports secure password management** via environment variables  
⚡ **Updates automatically** within 2-10 minutes
🌐 **Shares verifications globally** across all users
💾 **Has robust fallbacks** for offline scenarios
📊 **Provides full monitoring** via GitHub Actions

The system is designed to be maintenance-free while providing valuable community-driven improvements to train schedule accuracy.

## Next Steps

1. **Test the system** by clicking on train times and providing feedback
2. **Monitor the Actions tab** to see automated updates
3. **Customize the admin password** for your security needs
4. **Deploy to production** using GitHub Pages or your preferred hosting

The verification system will automatically improve the accuracy of the MRT timetable through community contributions, without requiring any ongoing technical maintenance.
