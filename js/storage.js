// Local Storage Management
class StorageManager {
    static STORAGE_KEY = 'sharedcal_events';
    static SETTINGS_KEY = 'sharedcal_settings';
    static VERSION_KEY = 'sharedcal_version';
    static CURRENT_VERSION = '1.0.0';

    static init() {
        this.migrateData();
        this.setupStorageListener();
    }

    // Event Management
    static getEvents() {
        try {
            const eventsJson = localStorage.getItem(this.STORAGE_KEY);
            if (!eventsJson) return [];
            
            const events = JSON.parse(eventsJson);
            return Array.isArray(events) ? events : [];
        } catch (error) {
            console.error('Error loading events from storage:', error);
            return [];
        }
    }

    static saveEvents(events) {
        try {
            if (!Array.isArray(events)) {
                console.error('Events must be an array');
                return false;
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
            this.updateVersion();
            return true;
        } catch (error) {
            console.error('Error saving events to storage:', error);
            return false;
        }
    }

    static addEvent(event) {
        const events = this.getEvents();
        event.id = event.id || Date.now().toString();
        event.createdAt = new Date().toISOString();
        event.updatedAt = new Date().toISOString();
        
        events.push(event);
        return this.saveEvents(events);
    }

    static updateEvent(eventId, updatedEvent) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === eventId);
        
        if (index === -1) return false;
        
        events[index] = {
            ...events[index],
            ...updatedEvent,
            updatedAt: new Date().toISOString()
        };
        
        return this.saveEvents(events);
    }

    static deleteEvent(eventId) {
        const events = this.getEvents();
        const filteredEvents = events.filter(e => e.id !== eventId);
        return this.saveEvents(filteredEvents);
    }

    static getEvent(eventId) {
        const events = this.getEvents();
        return events.find(e => e.id === eventId) || null;
    }

    // Settings Management
    static getSettings() {
        try {
            const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
            if (!settingsJson) return this.getDefaultSettings();
            
            const settings = JSON.parse(settingsJson);
            return { ...this.getDefaultSettings(), ...settings };
        } catch (error) {
            console.error('Error loading settings from storage:', error);
            return this.getDefaultSettings();
        }
    }

    static saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const mergedSettings = { ...currentSettings, ...settings };
            
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(mergedSettings));
            return true;
        } catch (error) {
            console.error('Error saving settings to storage:', error);
            return false;
        }
    }

    static getDefaultSettings() {
        return {
            theme: 'light',
            startOfWeek: 0, // 0 = Sunday, 1 = Monday
            timeFormat: 12, // 12 or 24 hour
            defaultEventDuration: 60, // minutes
            showWeekends: true,
            compactView: false,
            notifications: true,
            defaultView: 'month',
            autoSave: true,
            language: 'en'
        };
    }

    // Data Import/Export
    static exportData() {
        const data = {
            events: this.getEvents(),
            settings: this.getSettings(),
            version: this.CURRENT_VERSION,
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.events || !Array.isArray(data.events)) {
                throw new Error('Invalid data format: events array missing');
            }
            
            // Validate events structure
            const validEvents = data.events.filter(event => 
                event.title && event.date && event.id
            );
            
            if (validEvents.length !== data.events.length) {
                console.warn('Some events were skipped due to invalid format');
            }
            
            // Save events
            this.saveEvents(validEvents);
            
            // Save settings if provided
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return {
                success: true,
                eventsImported: validEvents.length,
                eventsSkipped: data.events.length - validEvents.length
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Backup and Sync
    static createBackup() {
        const backup = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            data: this.exportData()
        };
        
        const backups = this.getBackups();
        backups.push(backup);
        
        // Keep only last 10 backups
        if (backups.length > 10) {
            backups.shift();
        }
        
        localStorage.setItem('sharedcal_backups', JSON.stringify(backups));
        return backup.id;
    }

    static getBackups() {
        try {
            const backupsJson = localStorage.getItem('sharedcal_backups');
            return backupsJson ? JSON.parse(backupsJson) : [];
        } catch (error) {
            console.error('Error loading backups:', error);
            return [];
        }
    }

    static restoreBackup(backupId) {
        const backups = this.getBackups();
        const backup = backups.find(b => b.id === backupId);
        
        if (!backup) {
            return { success: false, error: 'Backup not found' };
        }
        
        return this.importData(backup.data);
    }

    // Storage Utilities
    static getStorageSize() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('sharedcal_')) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    static clearAllData() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('sharedcal_'));
        keys.forEach(key => localStorage.removeItem(key));
    }

    static migrateData() {
        const currentVersion = localStorage.getItem(this.VERSION_KEY);
        
        if (!currentVersion) {
            // First time setup
            this.updateVersion();
            return;
        }
        
        // Handle version migrations here if needed in the future
        if (currentVersion !== this.CURRENT_VERSION) {
            console.log(`Migrating from version ${currentVersion} to ${this.CURRENT_VERSION}`);
            this.updateVersion();
        }
    }

    static updateVersion() {
        localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    }

    // Cross-tab synchronization
    static setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                // Events changed in another tab
                this.notifyDataChange('events');
            } else if (e.key === this.SETTINGS_KEY) {
                // Settings changed in another tab
                this.notifyDataChange('settings');
            }
        });
    }

    static notifyDataChange(type) {
        const event = new CustomEvent('sharedcal:datachange', {
            detail: { type }
        });
        window.dispatchEvent(event);
    }

    // Search and Filter
    static searchEvents(query, options = {}) {
        const events = this.getEvents();
        const searchTerm = query.toLowerCase();
        
        return events.filter(event => {
            // Text search
            const textMatch = 
                event.title.toLowerCase().includes(searchTerm) ||
                (event.description && event.description.toLowerCase().includes(searchTerm));
            
            // Date range filter
            if (options.startDate && options.endDate) {
                const eventDate = new Date(event.date);
                const start = new Date(options.startDate);
                const end = new Date(options.endDate);
                
                if (eventDate < start || eventDate > end) {
                    return false;
                }
            }
            
            // Category filter
            if (options.category && event.category !== options.category) {
                return false;
            }
            
            // Shared filter
            if (options.sharedOnly && (!event.sharedWith || event.sharedWith.length === 0)) {
                return false;
            }
            
            return textMatch;
        });
    }

    // Statistics
    static getStatistics() {
        const events = this.getEvents();
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        return {
            totalEvents: events.length,
            thisMonth: events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= thisMonth && eventDate < nextMonth;
            }).length,
            upcomingEvents: events.filter(e => new Date(e.date) > now).length,
            completedEvents: events.filter(e => e.status === 'completed').length,
            sharedEvents: events.filter(e => e.sharedWith && e.sharedWith.length > 0).length,
            storageUsed: this.getStorageSize()
        };
    }

    // Offline support
    static isOnline() {
        return navigator.onLine;
    }

    static queueForSync(action, data) {
        if (!this.isOnline()) {
            const queue = this.getSyncQueue();
            queue.push({
                id: Date.now().toString(),
                action,
                data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('sharedcal_sync_queue', JSON.stringify(queue));
        }
    }

    static getSyncQueue() {
        try {
            const queueJson = localStorage.getItem('sharedcal_sync_queue');
            return queueJson ? JSON.parse(queueJson) : [];
        } catch (error) {
            console.error('Error loading sync queue:', error);
            return [];
        }
    }

    static clearSyncQueue() {
        localStorage.removeItem('sharedcal_sync_queue');
    }
}

// Initialize storage manager
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}