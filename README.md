# SharedCal - Collaborative Calendar App

A modern, installable web application for shared calendar management with TimeTree-like decorative features. SharedCal helps coordinate and share schedules with beautiful, customizable events and real-time collaboration features.

## ✨ Features

### 🗓️ Core Calendar Functionality
- **Month View**: Clean, responsive calendar grid similar to Google Calendar
- **Event Management**: Create, edit, delete, and view detailed events
- **All-day Events**: Support for all-day and timed events
- **Smart Navigation**: Previous/next month navigation with "Today" quick access

### 🎨 TimeTree-like Decorative Features
- **Color Coding**: Assign custom colors to events for easy categorization
- **Event Icons**: Add emojis and icons to events (🎉, 💼, 🏥, 🎓, etc.)
- **Decorative Patterns**: Special styling for birthdays, holidays, anniversaries
- **Priority Indicators**: Visual priority levels (high, medium, low)
- **Status Badges**: Completed, in-progress, cancelled event states
- **Mood-based Styling**: Excited, calm, focused event themes

### 👥 Collaboration & Sharing
- **Event Sharing**: Share events with multiple people via email
- **Shared Event Indicators**: Visual indicators for collaborative events
- **Privacy Controls**: Private events with lock indicators

### 📱 Progressive Web App (PWA)
- **Installable**: Install on mobile and desktop devices
- **Offline Support**: Works without internet connection
- **Push Notifications**: Event reminders and updates
- **Background Sync**: Sync changes when back online
- **Responsive Design**: Optimized for all screen sizes

### 💾 Data Management
- **Local Storage**: All data stored locally in browser
- **Data Export/Import**: Backup and restore calendar data
- **Cross-device Sync**: Share data between devices (via export/import)
- **Auto-backup**: Automatic local backups

## 🚀 Getting Started

### Installation Options

#### Option 1: Install as PWA (Recommended)
1. Visit the app in a modern web browser
2. Look for the "Install" prompt or button
3. Click "Install" to add to your device
4. Launch from home screen or app menu

#### Option 2: Use in Browser
1. Open `index.html` in any modern web browser
2. Bookmark for easy access
3. Works offline after first visit

### First Time Setup
1. **Add Your First Event**: Click the "+ Add Event" button
2. **Customize Colors**: Choose from predefined color schemes
3. **Add Icons**: Select from available emoji icons
4. **Enable Notifications**: Allow notifications for reminders

## 📖 User Guide

### Creating Events
1. Click "+ Add Event" or click on any calendar day
2. Fill in event details:
   - **Title**: Event name (required)
   - **Date**: Event date (required)
   - **Time**: Start and end time (optional for all-day events)
   - **Description**: Additional details
   - **Color**: Choose from color palette
   - **Icon**: Select emoji icon
   - **Share With**: Enter email addresses for collaboration

### Event Decorations
- **Colors**: 6 predefined colors (blue, green, orange, red, purple, teal)
- **Icons**: 10 categories (party, work, medical, education, travel, dining, exercise, family, personal, home)
- **Auto-styling**: Automatic decoration based on event title keywords
  - "birthday" → 🎂 cake icon and special styling
  - "meeting" → 💼 work styling
  - "doctor" → 🏥 medical styling
  - "vacation" → ✈️ travel styling

### Keyboard Shortcuts
- **Escape**: Close modals
- **N or +**: Add new event
- **←/→**: Navigate months
- **T**: Go to today

### Managing Data
- **Export Data**: Use browser menu or PWA settings
- **Import Data**: Upload exported JSON file
- **Clear Data**: Reset all events and settings
- **Backups**: Automatic backups stored locally

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Workers, Web App Manifest
- **Storage**: Local Storage API
- **Icons**: SVG icons for scalability
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties

### Browser Compatibility
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **PWA Features**: Chrome/Edge (full support), Firefox (partial), Safari (basic)
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+, Samsung Internet 12+

### File Structure
```
curly-adventure/
├── index.html          # Main application
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── styles/
│   ├── main.css       # Base styles
│   ├── calendar.css   # Calendar-specific styles
│   └── event-decorations.css # TimeTree-like decorations
├── js/
│   ├── app.js         # Main application logic
│   ├── calendar.js    # Calendar rendering
│   ├── events.js      # Event management
│   ├── storage.js     # Data persistence
│   └── pwa.js         # PWA features
└── icons/             # App icons (SVG)
```

### Performance Features
- **Lazy Loading**: Efficient event rendering
- **Caching**: Service Worker caches for offline use
- **Responsive Images**: SVG icons scale perfectly
- **Minimal Dependencies**: No external frameworks
- **Optimized Storage**: Efficient local data management

## 🎯 Use Cases

### Personal Use
- Track personal appointments and events
- Set reminders for important dates
- Organize daily/weekly schedules
- Manage birthdays and anniversaries

### Family Coordination
- Share family events and activities
- Coordinate school and work schedules
- Plan vacations and outings
- Track medical appointments

### Small Teams
- Coordinate team meetings
- Share project deadlines
- Track company events
- Manage shared resources

### Event Planning
- Plan parties and celebrations
- Coordinate group activities
- Manage event logistics
- Track RSVPs and attendees

## 🔒 Privacy & Security

- **Local Data**: All data stored locally on your device
- **No Tracking**: No analytics or tracking scripts
- **Offline First**: Works without internet connection
- **Secure**: No data transmitted to external servers
- **Export Control**: You own and control your data

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

### Development Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. Use browser dev tools for debugging
4. Test PWA features with Chrome DevTools

### Future Enhancements
- [ ] Backend integration for real-time collaboration
- [ ] Advanced recurrence patterns
- [ ] Calendar integrations (Google, Outlook)
- [ ] Advanced theming options
- [ ] Multi-language support
- [ ] Advanced notification settings

## 📝 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🐛 Bug Reports & Feature Requests

Please open issues for any bugs or feature requests. Include:
- Browser and version
- Device type
- Steps to reproduce
- Expected vs actual behavior

## 🎉 Acknowledgments

Inspired by:
- **Google Calendar** for clean calendar design
- **TimeTree** for decorative event features
- **Modern PWA practices** for offline-first approach

---

**SharedCal** - Making calendar sharing beautiful and collaborative! 📅✨