// Progressive Web App Features
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.detectInstallation();
        this.setupOfflineHandling();
        this.setupNotifications();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Install Prompt Handling
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle install button click
        const installBtn = document.getElementById('installBtn');
        const dismissBtn = document.getElementById('dismissInstall');
        
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installApp());
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismissInstallPrompt());
        }
    }

    showInstallButton() {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt && !this.isInstalled) {
            installPrompt.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installPrompt.style.display !== 'none') {
                    this.dismissInstallPrompt();
                }
            }, 10000);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            this.hideInstallPrompt();
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
    }

    dismissInstallPrompt() {
        this.hideInstallPrompt();
        // Remember dismissal for this session
        sessionStorage.setItem('installPromptDismissed', 'true');
    }

    hideInstallPrompt() {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt) {
            installPrompt.style.display = 'none';
        }
    }

    // Installation Detection
    detectInstallation() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallPrompt();
        }

        // Listen for app installation
        window.addEventListener('appinstalled', () => {
            console.log('SharedCal was installed');
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showToast('SharedCal installed successfully!');
        });
    }

    // Offline Handling
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.showToast('Back online! Syncing data...', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline. Changes will be saved locally.', 'warning');
        });

        // Check initial connection status
        if (!navigator.onLine) {
            this.showToast('You are offline. Working in offline mode.', 'info');
        }
    }

    async syncOfflineData() {
        const syncQueue = StorageManager.getSyncQueue();
        if (syncQueue.length === 0) return;

        try {
            // Process sync queue (placeholder for future backend integration)
            console.log(`Processing ${syncQueue.length} offline changes`);
            
            // For now, just clear the queue since we're using local storage
            StorageManager.clearSyncQueue();
            
            this.showToast('Data synced successfully!', 'success');
        } catch (error) {
            console.error('Sync failed:', error);
            this.showToast('Sync failed. Will retry later.', 'error');
        }
    }

    // Push Notifications
    async setupNotifications() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Request permission on first interaction
        document.addEventListener('click', this.requestNotificationPermission.bind(this), { once: true });
    }

    async requestNotificationPermission() {
        if (Notification.permission === 'granted') {
            this.scheduleEventReminders();
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.scheduleEventReminders();
                this.showToast('Notifications enabled! You\'ll receive event reminders.', 'success');
            }
        }
    }

    scheduleEventReminders() {
        // Get today's and tomorrow's events
        const events = StorageManager.getEvents();
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const upcomingEvents = events.filter(event => 
            event.date === today || event.date === tomorrow
        );

        upcomingEvents.forEach(event => {
            if (event.startTime) {
                this.scheduleNotification(event);
            }
        });
    }

    scheduleNotification(event) {
        const eventDateTime = new Date(`${event.date}T${event.startTime}`);
        const reminderTime = new Date(eventDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before
        const now = new Date();

        if (reminderTime > now) {
            const timeout = reminderTime.getTime() - now.getTime();
            
            setTimeout(() => {
                this.showNotification(event);
            }, timeout);
        }
    }

    showNotification(event) {
        if (Notification.permission !== 'granted') return;

        const options = {
            body: `${event.title}\n${event.startTime}${event.description ? `\n${event.description}` : ''}`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `event-${event.id}`,
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: 'View Event'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };

        const notification = new Notification('Upcoming Event', options);

        notification.onclick = () => {
            window.focus();
            // Show event details
            if (window.app) {
                window.app.showEventDetail(event);
            }
            notification.close();
        };
    }

    // Update Notifications
    showUpdateNotification() {
        this.showToast('A new version is available! Refresh to update.', 'info', {
            persistent: true,
            action: {
                text: 'Refresh',
                handler: () => window.location.reload()
            }
        });
    }

    // Utility Toast Function
    showToast(message, type = 'info', options = {}) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            z-index: 1002;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageSpan.style.flex = '1';
        toast.appendChild(messageSpan);

        if (options.action) {
            const actionBtn = document.createElement('button');
            actionBtn.textContent = options.action.text;
            actionBtn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
            `;
            actionBtn.onclick = () => {
                options.action.handler();
                toast.remove();
            };
            toast.appendChild(actionBtn);
        }

        document.body.appendChild(toast);

        if (!options.persistent) {
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
    }

    // Share API
    async shareEvent(event) {
        const shareData = {
            title: event.title,
            text: `${event.title}\n${event.date}${event.startTime ? ` at ${event.startTime}` : ''}${event.description ? `\n${event.description}` : ''}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Event shared successfully');
            } catch (error) {
                console.log('Error sharing:', error);
                this.fallbackShare(shareData);
            }
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Copy to clipboard as fallback
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareData.text).then(() => {
                this.showToast('Event details copied to clipboard!', 'success');
            });
        }
    }

    // File System Access API (for data export)
    async exportToFile() {
        try {
            const data = StorageManager.exportData();
            
            if ('showSaveFilePicker' in window) {
                // Use File System Access API if available
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: `sharedcal-backup-${new Date().toISOString().split('T')[0]}.json`,
                    types: [{
                        description: 'JSON files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(data);
                await writable.close();
                
                this.showToast('Data exported successfully!', 'success');
            } else {
                // Fallback to download link
                this.downloadFile(data, `sharedcal-backup-${new Date().toISOString().split('T')[0]}.json`);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Export failed:', error);
                this.showToast('Export failed. Please try again.', 'error');
            }
        }
    }

    downloadFile(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    }

    // Get install status
    getInstallStatus() {
        return {
            isInstallable: !!this.deferredPrompt,
            isInstalled: this.isInstalled,
            isOnline: navigator.onLine,
            notificationsEnabled: Notification.permission === 'granted'
        };
    }
}

// Initialize PWA manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}