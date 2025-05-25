# Setup Guide - Dhaka MRT Timetable

## Quick Start

The application is designed to work out of the box with no setup required!

### For Users
1. Open the website
2. Click on any train time to provide feedback
3. Your verification helps make the timetable more accurate for everyone

### For Developers

#### Local Development
1. Clone the repository:
```bash
git clone https://github.com/Owais5514/Dhaka-MRT-Timetable.git
cd Dhaka-MRT-Timetable
```

2. Serve the files locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have it)
npx http-server docs/

# Or just open docs/index.html in your browser
```

3. Open `http://localhost:8000/docs/` in your browser

#### Features Overview

##### ✨ Train Time Verification System
- **Fully Automated**: No configuration required
- **Real-time Sync**: All verifications shared across users automatically
- **GitHub Actions**: Automated updates via repository dispatch
- **Fallback Storage**: Local storage backup for offline functionality

##### 🚇 Core Features
- Real-time train schedules for MRT Line 6
- Platform-specific departures (Platform 1 & 2)
- Direction-based filtering (Northbound/Southbound)
- Time-based filtering (First train, Last train, Next trains)
- Mobile-responsive design

##### 🔧 Admin Features
- Time override for testing different scenarios
- Show all trains toggle
- Pause/resume clock functionality
- Password-protected admin panel

## Technical Architecture

### Verification System
```
User clicks train time → Modal opens → User provides feedback → 
GitHub Action triggered → verified-times.json updated → 
Auto-refresh loads latest data → All users see verification
```

### File Structure
```
docs/                           # Main application files
├── index.html                  # Main UI
├── script.js                   # Application logic + verification system
├── styles.css                  # Styling + verification UI
├── verified-times.json         # Centralized verification storage
├── service-worker.js           # PWA functionality
├── manifest.webmanifest        # App manifest
└── assets/                     # Images and icons

.github/workflows/              # Automation
└── update-verified-times.yml   # Auto-update workflow
```

### Verification Data Flow
1. **User Interaction**: Click on train time → Open feedback modal
2. **Local Update**: Immediate UI update for instant feedback
3. **Remote Sync**: GitHub API call triggers automated workflow
4. **File Update**: GitHub Action updates verified-times.json
5. **Global Sync**: All users receive updates via auto-refresh

## Advanced Configuration

### GitHub Repository Settings
The automation requires these repository settings (already configured):

#### Actions Permissions
- Go to Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

#### Repository Dispatch
- The system uses `repository_dispatch` events
- No tokens or secrets required for public repositories
- Automatic file updates via GitHub Actions

### Customization Options

#### Train Schedule Data
Edit the JSON files:
- `docs/mrt-6.json` - Weekday schedules
- `docs/mrt-6-fri.json` - Friday schedules  
- `docs/mrt-6-sat.json` - Weekend schedules

#### Styling
Modify `docs/styles.css` for:
- Color schemes and themes
- Mobile responsiveness
- Verification UI appearance

#### Admin Panel
Default password: `12345678`
Change in the admin unlock event listener in `script.js`

## Deployment

### GitHub Pages (Recommended)
1. Push changes to the main branch
2. Go to Settings → Pages
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/docs" folder
5. Your site will be available at `https://username.github.io/repository-name/`

### Other Hosting Platforms
The application is a static site that works on any web server:
- Netlify: Connect your GitHub repository
- Vercel: Import from GitHub
- Any web hosting: Upload the `docs/` folder contents

## Troubleshooting

### Verification System Issues
- **Check GitHub Actions**: Visit the "Actions" tab to see workflow status
- **Browser Console**: Look for verification-related log messages
- **Local Storage**: Check for `pendingVerifications` if submissions fail

### General Issues
- **Train times not showing**: Check console for JSON loading errors
- **Styling issues**: Verify all CSS files are loading correctly
- **Mobile problems**: Test responsive design in browser dev tools

## Contributing

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues
- Use GitHub Issues for bug reports
- Include browser and device information
- Provide steps to reproduce the problem

## Security Considerations

### User Data
- No personal information is collected
- Verifications are anonymous
- Only train time feedback is stored

### API Security
- Uses GitHub's public API (no authentication needed)
- Repository dispatch events are public for public repos
- No sensitive tokens or credentials required

The verification system is designed to be completely secure and maintenance-free while providing valuable community-driven improvements to the train schedule accuracy.
