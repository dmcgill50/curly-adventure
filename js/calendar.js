// Calendar Rendering Logic
class CalendarRenderer {
    static render(currentDate, events, callbacks = {}) {
        const container = document.getElementById('calendarGrid');
        if (!container) return;

        container.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            container.appendChild(header);
        });

        // Get calendar data
        const calendarData = this.getCalendarData(currentDate, events);
        
        // Render days
        calendarData.days.forEach(dayData => {
            const dayElement = this.createDayElement(dayData, callbacks);
            container.appendChild(dayElement);
        });
    }

    static getCalendarData(currentDate, events) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // First day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Start from Sunday of the week containing the first day
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDay.getDay());
        
        // End on Saturday of the week containing the last day
        const endDate = new Date(lastDay);
        endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
        
        const days = [];
        const currentDateObj = new Date(startDate);
        
        while (currentDateObj <= endDate) {
            const dateString = this.formatDateString(currentDateObj);
            const dayEvents = events.filter(event => event.date === dateString);
            
            days.push({
                date: new Date(currentDateObj),
                dayNumber: currentDateObj.getDate(),
                isCurrentMonth: currentDateObj.getMonth() === month,
                isToday: this.isToday(currentDateObj),
                isWeekend: currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6,
                events: dayEvents.sort((a, b) => {
                    // Sort events by time, all-day events first
                    if (!a.startTime && b.startTime) return -1;
                    if (a.startTime && !b.startTime) return 1;
                    if (!a.startTime && !b.startTime) return 0;
                    return a.startTime.localeCompare(b.startTime);
                })
            });
            
            currentDateObj.setDate(currentDateObj.getDate() + 1);
        }
        
        return { days };
    }

    static createDayElement(dayData, callbacks) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add classes for styling
        if (!dayData.isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        if (dayData.isToday) {
            dayElement.classList.add('today');
        }
        if (dayData.isWeekend) {
            dayElement.classList.add('weekend');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = dayData.dayNumber;
        dayElement.appendChild(dayNumber);
        
        // Events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        // Render events (max 3 visible on desktop, 2 on mobile)
        const maxVisible = window.innerWidth > 768 ? 3 : 2;
        const visibleEvents = dayData.events.slice(0, maxVisible);
        const hiddenCount = dayData.events.length - visibleEvents.length;
        
        visibleEvents.forEach(event => {
            const eventElement = this.createEventElement(event, callbacks);
            eventsContainer.appendChild(eventElement);
        });
        
        // Show "more events" indicator if needed
        if (hiddenCount > 0) {
            const moreElement = document.createElement('div');
            moreElement.className = 'more-events';
            moreElement.textContent = `+${hiddenCount} more`;
            moreElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showAllDayEvents(dayData.date, dayData.events);
            });
            eventsContainer.appendChild(moreElement);
        }
        
        dayElement.appendChild(eventsContainer);
        
        // Add click handler for day
        dayElement.addEventListener('click', () => {
            if (callbacks.onDayClick) {
                callbacks.onDayClick(dayData.date);
            }
        });
        
        return dayElement;
    }

    static createEventElement(event, callbacks) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        
        // Add color
        if (event.color) {
            eventElement.style.backgroundColor = event.color;
        }
        
        // Add decorative classes based on event properties
        this.addDecorativeClasses(eventElement, event);
        
        // Event content
        let content = '';
        
        // Icon
        if (event.icon) {
            content += `<span class="event-icon">${event.icon}</span>`;
            eventElement.classList.add('has-icon');
        }
        
        // Title
        content += `<span class="event-title">${event.title}</span>`;
        
        // Time (if not all-day)
        if (event.startTime) {
            const timeText = event.endTime ? 
                `${this.formatTime(event.startTime)}` : 
                this.formatTime(event.startTime);
            content += `<span class="event-time">${timeText}</span>`;
        } else {
            eventElement.classList.add('all-day');
        }
        
        eventElement.innerHTML = content;
        
        // Click handler
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onEventClick) {
                callbacks.onEventClick(event);
            }
        });
        
        return eventElement;
    }

    static addDecorativeClasses(element, event) {
        // Add classes based on event properties for TimeTree-like styling
        
        // Priority-based styling
        if (event.priority) {
            element.classList.add(`priority-${event.priority}`);
        }
        
        // Category-based styling
        if (event.category) {
            element.classList.add(event.category);
        }
        
        // Special occasion detection
        const title = event.title.toLowerCase();
        
        if (title.includes('birthday') || title.includes('bday')) {
            element.classList.add('birthday');
        } else if (title.includes('holiday') || title.includes('vacation')) {
            element.classList.add('holiday');
        } else if (title.includes('anniversary')) {
            element.classList.add('anniversary');
        } else if (title.includes('meeting') || title.includes('call')) {
            element.classList.add('meeting');
        } else if (title.includes('deadline') || title.includes('due')) {
            element.classList.add('deadline');
        } else if (title.includes('reminder')) {
            element.classList.add('reminder');
        }
        
        // Status-based styling
        if (event.status) {
            element.classList.add(event.status);
        }
        
        // Shared event styling
        if (event.sharedWith && event.sharedWith.length > 0) {
            element.classList.add('shared');
        }
        
        // Pattern-based styling (could be extended based on user preferences)
        if (event.pattern) {
            element.classList.add(`pattern-${event.pattern}`);
        }
        
        // Time-sensitive styling
        const eventDate = new Date(event.date);
        const now = new Date();
        
        if (eventDate < now && event.status !== 'completed') {
            element.classList.add('overdue');
        }
        
        // Urgency based on time until event
        const hoursUntil = (eventDate - now) / (1000 * 60 * 60);
        if (hoursUntil > 0 && hoursUntil < 24 && event.priority === 'high') {
            element.classList.add('urgent');
        }
    }

    static showAllDayEvents(date, events) {
        // Create and show a modal with all events for the day
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.zIndex = '1001';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '400px';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>Events for ${this.formatDate(date)}</h2>
            <button class="close-btn">&times;</button>
        `;
        
        const body = document.createElement('div');
        body.style.padding = 'var(--spacing)';
        
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.style.cssText = `
                padding: 8px;
                margin-bottom: 8px;
                background-color: ${event.color || 'var(--primary-color)'};
                color: white;
                border-radius: var(--border-radius);
                cursor: pointer;
            `;
            
            let content = '';
            if (event.icon) content += `${event.icon} `;
            content += event.title;
            if (event.startTime) content += ` (${this.formatTime(event.startTime)})`;
            
            eventDiv.innerHTML = content;
            eventDiv.addEventListener('click', () => {
                modal.remove();
                if (window.app) {
                    window.app.showEventDetail(event);
                }
            });
            
            body.appendChild(eventDiv);
        });
        
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modal.appendChild(modalContent);
        
        // Close handlers
        const closeBtn = header.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    static formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${displayHour}:${minutes} ${ampm}`;
    }

    static formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric'
        });
    }

    static formatDateString(date) {
        return date.toISOString().split('T')[0];
    }

    static isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // Utility method for responsive breakpoints
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isSmallMobile() {
        return window.innerWidth <= 480;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarRenderer;
}