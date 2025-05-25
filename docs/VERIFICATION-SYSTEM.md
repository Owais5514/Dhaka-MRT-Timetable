# Centralized Train Time Verification System

## Overview
The train time verification system has been upgraded from localStorage to a centralized system where verified times are shared across all users.

## How It Works

### 1. User Verification Process
- Users click on train times and provide feedback (correct/incorrect)
- Correct times are immediately marked as verified locally
- All verifications are submitted to the central system

### 2. Centralized Storage
- **Primary Method**: Verifications are submitted via Pageclip for admin review
- **Secondary Method**: GitHub Actions workflow for immediate updates (when configured)
- **Fallback**: localStorage for session persistence

### 3. Data Synchronization
- Verified times are loaded from `verified-times.json` on page load
- Auto-refresh every 5 minutes to get latest verifications from other users
- Cache busting ensures fresh data is always loaded

### 4. Admin Management
- Admin panel includes verified times management
- Admins can refresh verified times manually
- Admins can clear all verifications if needed
- Real-time count and data display

## Files Structure

```
docs/
├── verified-times.json          # Central storage for verified times
├── verified-times-manager.js    # Helper functions for managing verifications
├── script.js                    # Main application with verification system
└── index.html                   # UI including admin panel
```

## Admin Workflow

1. **Receiving Verifications**: All user verifications are submitted via Pageclip
2. **Review Process**: Admin reviews feedback and can approve/reject verifications
3. **Update Central File**: Admin manually updates `verified-times.json` or uses GitHub Actions
4. **Distribution**: All users automatically receive updates within 5 minutes

## GitHub Actions Integration (Optional)

The system includes a GitHub Actions workflow that can be triggered to automatically update the verified times file:

- **Trigger**: Repository dispatch event or manual workflow dispatch
- **Process**: Updates `verified-times.json` and commits changes
- **Result**: All users get immediate updates

## Configuration for Immediate Updates

To enable immediate updates via GitHub Actions:

1. Create a GitHub Personal Access Token with repo permissions
2. Add it as a repository secret named `GITHUB_TOKEN`
3. Configure the webhook in your deployment environment

## Fallback Strategy

If the centralized system fails:
- Verifications are stored in localStorage as backup
- Users can still provide feedback (stored locally)
- Admin can manually collect and merge localStorage data

## Benefits

✅ **Shared Verifications**: All users see verifications from other users
✅ **Real-time Updates**: New verifications appear within 5 minutes
✅ **Admin Control**: Complete management of verification data
✅ **Reliability**: Multiple fallback mechanisms
✅ **Scalability**: Can handle many users and verifications

## Data Format

```json
{
  "verified_times": {
    "station-platform-direction-time": {
      "timeId": "station-platform-direction-time",
      "time": "08:30",
      "platform": "1",
      "direction": "To Motijheel",
      "verifiedAt": "2025-05-25T10:30:00.000Z",
      "status": "correct",
      "station": "Uttara North"
    }
  },
  "last_updated": "2025-05-25T10:30:00.000Z",
  "version": 1
}
```
