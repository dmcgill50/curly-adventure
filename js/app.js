// Main Application Controller
class SharedCalApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingEvent = null;
        this.events = [];
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.renderCalendar();
        this.updateCurrentMonth();
        this.handleURLParams();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextMonth());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // Modal controls
        document.getElementById('addEventBtn').addEventListener('click', () => this.showAddEventModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDetailModal').addEventListener('click', () => this.closeDetailModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.closeDetailModal());

        // Form submission
        document.getElementById('eventForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Event actions
        document.getElementById('editEventBtn').addEventListener('click', () => this.editCurrentEvent());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteCurrentEvent());

        // Modal backdrop clicks
        document.getElementById('eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') this.closeModal();
        });
        
        document.getElementById('eventDetailModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventDetailModal') this.closeDetailModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleURLParams() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        
        if (action === 'add-event') {
            this.showAddEventModal();
        } else if (action === 'today') {
            this.goToToday();
        }
        
        // Clean up URL
        if (params.has('action')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    handleKeyboard(e) {
        // Close modals with Escape
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeDetailModal();
        }
        
        // Quick add with 'n' or '+'
        if ((e.key === 'n' || e.key === '+') && !e.target.matches('input, textarea')) {
            this.showAddEventModal();
        }
        
        // Navigation with arrow keys
        if (!e.target.matches('input, textarea, select')) {
            if (e.key === 'ArrowLeft') {
                this.previousMonth();
            } else if (e.key === 'ArrowRight') {
                this.nextMonth();
            } else if (e.key === 't') {
                this.goToToday();
            }
        }
    }

    handleResize() {
        // Re-render calendar on resize for responsive adjustments
        this.renderCalendar();
    }

    loadEvents() {
        this.events = StorageManager.getEvents();
    }

    saveEvents() {
        StorageManager.saveEvents(this.events);
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.updateCurrentMonth();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.updateCurrentMonth();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
        this.updateCurrentMonth();
    }

    updateCurrentMonth() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendar() {
        CalendarRenderer.render(this.currentDate, this.events, {
            onDayClick: (date) => this.handleDayClick(date),
            onEventClick: (event) => this.showEventDetail(event)
        });
    }

    handleDayClick(date) {
        this.selectedDate = date;
        this.showAddEventModal(date);
    }

    showAddEventModal(date = null) {
        this.editingEvent = null;
        document.getElementById('modalTitle').textContent = 'Add New Event';
        document.getElementById('deleteBtn').style.display = 'none';
        
        // Reset form
        document.getElementById('eventForm').reset();
        
        // Set date if provided
        if (date) {
            document.getElementById('eventDate').value = this.formatDateForInput(date);
        } else if (this.selectedDate) {
            document.getElementById('eventDate').value = this.formatDateForInput(this.selectedDate);
        }
        
        // Set default color
        document.querySelector('input[name="color"]:checked').checked = true;
        
        this.showModal('eventModal');
    }

    showEventDetail(event) {
        document.getElementById('detailTitle').textContent = event.title;
        
        const detailsContainer = document.getElementById('eventDetails');
        detailsContainer.innerHTML = this.buildEventDetailsHTML(event);
        
        this.editingEvent = event;
        this.showModal('eventDetailModal');
    }

    buildEventDetailsHTML(event) {
        let html = '';
        
        if (event.icon) {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Icon</div>
                <div class="event-detail-value">${event.icon}</div>
            </div>`;
        }
        
        html += `<div class="event-detail-item">
            <div class="event-detail-label">Date</div>
            <div class="event-detail-value">${this.formatDate(new Date(event.date))}</div>
        </div>`;
        
        if (event.startTime && event.endTime) {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Time</div>
                <div class="event-detail-value">${event.startTime} - ${event.endTime}</div>
            </div>`;
        } else if (event.startTime) {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Time</div>
                <div class="event-detail-value">${event.startTime}</div>
            </div>`;
        } else {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Time</div>
                <div class="event-detail-value">All day</div>
            </div>`;
        }
        
        if (event.description) {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Description</div>
                <div class="event-detail-value">${event.description}</div>
            </div>`;
        }
        
        html += `<div class="event-detail-item">
            <div class="event-detail-label">Color</div>
            <div class="event-detail-value">
                <span style="display: inline-block; width: 20px; height: 20px; background-color: ${event.color}; border-radius: 50%; border: 2px solid #ccc;"></span>
            </div>
        </div>`;
        
        if (event.sharedWith && event.sharedWith.length > 0) {
            html += `<div class="event-detail-item">
                <div class="event-detail-label">Shared With</div>
                <div class="event-detail-value">${event.sharedWith.join(', ')}</div>
            </div>`;
        }
        
        return html;
    }

    editCurrentEvent() {
        if (!this.editingEvent) return;
        
        this.closeDetailModal();
        
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('deleteBtn').style.display = 'inline-flex';
        
        // Populate form with event data
        this.populateForm(this.editingEvent);
        
        this.showModal('eventModal');
    }

    populateForm(event) {
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventDate').value = event.date || '';
        document.getElementById('eventStartTime').value = event.startTime || '';
        document.getElementById('eventEndTime').value = event.endTime || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventIcon').value = event.icon || '';
        document.getElementById('eventSharedWith').value = event.sharedWith ? event.sharedWith.join(', ') : '';
        
        // Set color
        const colorInput = document.querySelector(`input[name="color"][value="${event.color}"]`);
        if (colorInput) {
            colorInput.checked = true;
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            id: this.editingEvent ? this.editingEvent.id : Date.now().toString(),
            title: formData.get('title'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            description: formData.get('description'),
            color: formData.get('color'),
            icon: formData.get('icon'),
            sharedWith: formData.get('sharedWith') ? 
                formData.get('sharedWith').split(',').map(email => email.trim()).filter(email => email) : []
        };
        
        if (this.editingEvent) {
            // Update existing event
            const index = this.events.findIndex(e => e.id === this.editingEvent.id);
            if (index !== -1) {
                this.events[index] = eventData;
            }
        } else {
            // Add new event
            this.events.push(eventData);
        }
        
        this.saveEvents();
        this.renderCalendar();
        this.closeModal();
        
        // Show success message
        this.showToast(`Event ${this.editingEvent ? 'updated' : 'created'} successfully!`);
        
        this.editingEvent = null;
    }

    deleteCurrentEvent() {
        if (!this.editingEvent || !confirm('Are you sure you want to delete this event?')) return;
        
        this.events = this.events.filter(e => e.id !== this.editingEvent.id);
        this.saveEvents();
        this.renderCalendar();
        this.closeModal();
        
        this.showToast('Event deleted successfully!');
        this.editingEvent = null;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('eventModal').classList.remove('show');
        document.body.style.overflow = '';
        this.editingEvent = null;
    }

    closeDetailModal() {
        document.getElementById('eventDetailModal').classList.remove('show');
        document.body.style.overflow = '';
        this.editingEvent = null;
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-hover);
            z-index: 1002;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
}

// CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SharedCalApp();
});