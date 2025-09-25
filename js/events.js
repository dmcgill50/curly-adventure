// Event Management System
class EventManager {
    constructor() {
        this.eventTypes = {
            WORK: 'work',
            PERSONAL: 'personal',
            FAMILY: 'family',
            HEALTH: 'health',
            TRAVEL: 'travel',
            EDUCATION: 'education',
            SOCIAL: 'social',
            HOLIDAY: 'holiday'
        };
        
        this.priorities = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high'
        };
        
        this.statuses = {
            SCHEDULED: 'scheduled',
            IN_PROGRESS: 'in-progress',
            COMPLETED: 'completed',
            CANCELLED: 'cancelled'
        };
    }

    // Event Validation
    validateEvent(eventData) {
        const errors = [];
        
        if (!eventData.title || eventData.title.trim() === '') {
            errors.push('Event title is required');
        }
        
        if (!eventData.date) {
            errors.push('Event date is required');
        } else {
            const eventDate = new Date(eventData.date);
            if (isNaN(eventDate.getTime())) {
                errors.push('Invalid event date');
            }
        }
        
        if (eventData.startTime && eventData.endTime) {
            if (eventData.startTime >= eventData.endTime) {
                errors.push('End time must be after start time');
            }
        }
        
        if (eventData.color && !this.isValidColor(eventData.color)) {
            errors.push('Invalid color format');
        }
        
        if (eventData.sharedWith && Array.isArray(eventData.sharedWith)) {
            const invalidEmails = eventData.sharedWith.filter(email => 
                !this.isValidEmail(email.trim())
            );
            if (invalidEmails.length > 0) {
                errors.push(`Invalid email addresses: ${invalidEmails.join(', ')}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidColor(color) {
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        return hexPattern.test(color) || rgbPattern.test(color);
    }

    isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Event Creation Helpers
    createEvent(title, date, options = {}) {
        const event = {
            id: options.id || this.generateId(),
            title: title.trim(),
            date: date,
            startTime: options.startTime || null,
            endTime: options.endTime || null,
            description: options.description || '',
            color: options.color || '#2196F3',
            icon: options.icon || '',
            category: options.category || this.eventTypes.PERSONAL,
            priority: options.priority || this.priorities.MEDIUM,
            status: options.status || this.statuses.SCHEDULED,
            sharedWith: options.sharedWith || [],
            reminders: options.reminders || [],
            location: options.location || '',
            url: options.url || '',
            isRecurring: options.isRecurring || false,
            recurrenceRule: options.recurrenceRule || null,
            parentEventId: options.parentEventId || null,
            tags: options.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return event;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event Recurrence
    createRecurringEvents(baseEvent, recurrenceRule, endDate) {
        const events = [];
        const startDate = new Date(baseEvent.date);
        const end = new Date(endDate);
        let currentDate = new Date(startDate);
        
        while (currentDate <= end) {
            if (currentDate.getTime() !== startDate.getTime()) {
                const recurringEvent = {
                    ...baseEvent,
                    id: this.generateId(),
                    date: this.formatDateString(currentDate),
                    parentEventId: baseEvent.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                events.push(recurringEvent);
            }
            
            currentDate = this.getNextRecurringDate(currentDate, recurrenceRule);
        }
        
        return events;
    }

    getNextRecurringDate(date, rule) {
        const next = new Date(date);
        
        switch (rule.frequency) {
            case 'daily':
                next.setDate(next.getDate() + (rule.interval || 1));
                break;
            case 'weekly':
                next.setDate(next.getDate() + (7 * (rule.interval || 1)));
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + (rule.interval || 1));
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + (rule.interval || 1));
                break;
        }
        
        return next;
    }

    // Event Suggestions
    suggestEventDetails(title) {
        const suggestions = {
            category: this.eventTypes.PERSONAL,
            color: '#2196F3',
            icon: '',
            priority: this.priorities.MEDIUM
        };
        
        const titleLower = title.toLowerCase();
        
        // Work-related keywords
        if (this.containsAny(titleLower, ['meeting', 'call', 'conference', 'presentation', 'deadline', 'project'])) {
            suggestions.category = this.eventTypes.WORK;
            suggestions.color = '#FF9800';
            suggestions.icon = '💼';
            suggestions.priority = this.priorities.HIGH;
        }
        
        // Health-related keywords
        else if (this.containsAny(titleLower, ['doctor', 'dentist', 'appointment', 'medical', 'checkup', 'surgery'])) {
            suggestions.category = this.eventTypes.HEALTH;
            suggestions.color = '#F44336';
            suggestions.icon = '🏥';
            suggestions.priority = this.priorities.HIGH;
        }
        
        // Family-related keywords
        else if (this.containsAny(titleLower, ['family', 'birthday', 'anniversary', 'graduation', 'wedding'])) {
            suggestions.category = this.eventTypes.FAMILY;
            suggestions.color = '#4CAF50';
            suggestions.icon = '👨‍👩‍👧‍👦';
        }
        
        // Travel-related keywords
        else if (this.containsAny(titleLower, ['flight', 'vacation', 'trip', 'travel', 'hotel', 'airport'])) {
            suggestions.category = this.eventTypes.TRAVEL;
            suggestions.color = '#00BCD4';
            suggestions.icon = '✈️';
        }
        
        // Education-related keywords
        else if (this.containsAny(titleLower, ['class', 'lecture', 'exam', 'study', 'school', 'university'])) {
            suggestions.category = this.eventTypes.EDUCATION;
            suggestions.color = '#673AB7';
            suggestions.icon = '🎓';
        }
        
        // Social-related keywords
        else if (this.containsAny(titleLower, ['party', 'dinner', 'lunch', 'coffee', 'drinks', 'social'])) {
            suggestions.category = this.eventTypes.SOCIAL;
            suggestions.color = '#E91E63';
            suggestions.icon = '🍽️';
        }
        
        // Special occasions
        if (this.containsAny(titleLower, ['birthday', 'bday'])) {
            suggestions.icon = '🎂';
        } else if (this.containsAny(titleLower, ['holiday', 'christmas', 'thanksgiving', 'easter'])) {
            suggestions.category = this.eventTypes.HOLIDAY;
            suggestions.icon = '🎉';
        }
        
        return suggestions;
    }

    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    // Event Conflict Detection
    findConflicts(newEvent, existingEvents) {
        if (!newEvent.startTime || !newEvent.endTime) {
            return []; // All-day events don't conflict by time
        }
        
        const conflicts = [];
        const newStart = this.parseDateTime(newEvent.date, newEvent.startTime);
        const newEnd = this.parseDateTime(newEvent.date, newEvent.endTime);
        
        existingEvents.forEach(event => {
            if (event.id === newEvent.id) return; // Skip self
            if (event.date !== newEvent.date) return; // Different day
            if (!event.startTime || !event.endTime) return; // Skip all-day events
            
            const existingStart = this.parseDateTime(event.date, event.startTime);
            const existingEnd = this.parseDateTime(event.date, event.endTime);
            
            // Check for overlap
            if (newStart < existingEnd && newEnd > existingStart) {
                conflicts.push(event);
            }
        });
        
        return conflicts;
    }

    parseDateTime(date, time) {
        return new Date(`${date}T${time}:00`);
    }

    // Event Statistics and Analytics
    getEventStatistics(events) {
        const stats = {
            total: events.length,
            byCategory: {},
            byPriority: {},
            byStatus: {},
            byMonth: {},
            averageEventsPerDay: 0,
            mostActiveDay: null
        };
        
        // Initialize counters
        Object.values(this.eventTypes).forEach(type => {
            stats.byCategory[type] = 0;
        });
        
        Object.values(this.priorities).forEach(priority => {
            stats.byPriority[priority] = 0;
        });
        
        Object.values(this.statuses).forEach(status => {
            stats.byStatus[status] = 0;
        });
        
        const dayCount = {};
        
        events.forEach(event => {
            // Category stats
            if (event.category) {
                stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
            }
            
            // Priority stats
            if (event.priority) {
                stats.byPriority[event.priority]++;
            }
            
            // Status stats
            if (event.status) {
                stats.byStatus[event.status]++;
            }
            
            // Monthly stats
            const month = event.date.substring(0, 7); // YYYY-MM
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
            
            // Daily stats
            const dayOfWeek = new Date(event.date).getDay();
            dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
        });
        
        // Find most active day
        let maxCount = 0;
        let mostActiveDay = 0;
        Object.entries(dayCount).forEach(([day, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostActiveDay = parseInt(day);
            }
        });
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        stats.mostActiveDay = dayNames[mostActiveDay];
        
        // Average events per day (rough estimate)
        if (events.length > 0) {
            const uniqueDays = new Set(events.map(e => e.date)).size;
            stats.averageEventsPerDay = (events.length / uniqueDays).toFixed(1);
        }
        
        return stats;
    }

    // Event Templates
    getEventTemplates() {
        return [
            {
                name: 'Work Meeting',
                title: 'Team Meeting',
                category: this.eventTypes.WORK,
                color: '#FF9800',
                icon: '💼',
                duration: 60,
                priority: this.priorities.HIGH
            },
            {
                name: 'Doctor Appointment',
                title: 'Doctor Appointment',
                category: this.eventTypes.HEALTH,
                color: '#F44336',
                icon: '🏥',
                duration: 30,
                priority: this.priorities.HIGH
            },
            {
                name: 'Birthday Party',
                title: 'Birthday Celebration',
                category: this.eventTypes.FAMILY,
                color: '#E91E63',
                icon: '🎂',
                duration: 180,
                priority: this.priorities.MEDIUM
            },
            {
                name: 'Study Session',
                title: 'Study Session',
                category: this.eventTypes.EDUCATION,
                color: '#673AB7',
                icon: '📚',
                duration: 120,
                priority: this.priorities.MEDIUM
            },
            {
                name: 'Workout',
                title: 'Workout Session',
                category: this.eventTypes.PERSONAL,
                color: '#4CAF50',
                icon: '🏃',
                duration: 60,
                priority: this.priorities.LOW
            }
        ];
    }

    // Utility Methods
    formatDateString(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(dateString) {
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    }

    isTomorrow(dateString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return dateString === this.formatDateString(tomorrow);
    }

    isThisWeek(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return eventDate >= weekStart && eventDate <= weekEnd;
    }

    getDaysUntil(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Create global instance
window.EventManager = new EventManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}