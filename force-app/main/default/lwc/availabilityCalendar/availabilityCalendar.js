import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getCampsiteAvailability from '@salesforce/apex/AvailabilityController.getCampsiteAvailability';
import getCampingItemAvailability from '@salesforce/apex/AvailabilityController.getCampingItemAvailability';
import createAvailability from '@salesforce/apex/AvailabilityController.createAvailability';
import updateAvailability from '@salesforce/apex/AvailabilityController.updateAvailability';
import deleteAvailability from '@salesforce/apex/AvailabilityController.deleteAvailability';

// Static resources
import fullCalendar from '@salesforce/resourceUrl/fullCalendar';

export default class AvailabilityCalendar extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api showAddAvailability = true;
    @api isReadOnly = false;
    @api height = 'auto';
    
    @track isLoading = true;
    @track error;
    @track events = [];
    @track showAddEventModal = false;
    @track newEvent = {
        start: null,
        end: null,
        status: 'Available',
        notes: ''
    };
    @track selectedEvent = null;
    @track showEditEventModal = false;
    
    calendar;
    fullCalendarInitialized = false;
    wiredAvailabilityResult;
    
    // Date range for availability query
    startDate = new Date();
    endDate = new Date();
    
    connectedCallback() {
        // Set default date range to current month plus 3 months
        this.startDate = new Date();
        this.startDate.setDate(1); // First day of current month
        
        this.endDate = new Date(this.startDate);
        this.endDate.setMonth(this.endDate.getMonth() + 3); // 3 months from start
    }
    
    renderedCallback() {
        if (!this.fullCalendarInitialized) {
            this.initializeFullCalendar();
        }
    }
    
    initializeFullCalendar() {
        Promise.all([
            loadScript(this, fullCalendar + '/lib/main.js'),
            loadStyle(this, fullCalendar + '/lib/main.css')
        ])
        .then(() => {
            this.initializeCalendar();
            this.fullCalendarInitialized = true;
        })
        .catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading calendar',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }
    
    initializeCalendar() {
        const calendarEl = this.template.querySelector('.calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth'
            },
            height: this.height,
            editable: !this.isReadOnly,
            selectable: this.showAddAvailability && !this.isReadOnly,
            events: this.events,
            select: (info) => {
                if (this.showAddAvailability && !this.isReadOnly) {
                    this.handleDateSelect(info);
                }
            },
            eventClick: (info) => {
                if (!this.isReadOnly) {
                    this.handleEventClick(info);
                }
            },
            eventDrop: (info) => {
                if (!this.isReadOnly) {
                    this.handleEventDrop(info);
                }
            },
            eventResize: (info) => {
                if (!this.isReadOnly) {
                    this.handleEventResize(info);
                }
            },
            datesSet: (info) => {
                this.handleDatesSet(info);
            }
        });
        
        this.calendar.render();
        this.loadAvailabilityData();
    }
    
    loadAvailabilityData() {
        this.isLoading = true;
        
        // Format dates for Apex
        const formattedStartDate = this.formatDateForApex(this.startDate);
        const formattedEndDate = this.formatDateForApex(this.endDate);
        
        // Call appropriate Apex method based on object type
        let availabilityPromise;
        
        if (this.objectApiName === 'Campsite__c') {
            availabilityPromise = getCampsiteAvailability({
                campsiteId: this.recordId,
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
        } else if (this.objectApiName === 'Camping_Item__c') {
            availabilityPromise = getCampingItemAvailability({
                campingItemId: this.recordId,
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
        } else {
            this.isLoading = false;
            this.error = 'Unsupported object type: ' + this.objectApiName;
            return;
        }
        
        availabilityPromise
            .then(result => {
                this.processAvailabilityData(result);
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.events = [];
                console.error('Error loading availability data', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    processAvailabilityData(availabilityRecords) {
        // Convert availability records to calendar events
        this.events = availabilityRecords.map(record => {
            return {
                id: record.Id,
                title: record.Status__c + (record.Notes__c ? ': ' + record.Notes__c : ''),
                start: record.Start_Date__c,
                end: this.addDays(record.End_Date__c, 1), // FullCalendar uses exclusive end dates
                allDay: true,
                backgroundColor: this.getStatusColor(record.Status__c),
                borderColor: this.getStatusColor(record.Status__c),
                extendedProps: {
                    status: record.Status__c,
                    notes: record.Notes__c
                }
            };
        });
        
        // Update calendar events
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.events);
        }
    }
    
    getStatusColor(status) {
        switch(status) {
            case 'Available':
                return '#04844b'; // Green
            case 'Unavailable':
                return '#e57373'; // Red
            case 'Maintenance':
                return '#ffb75d'; // Orange
            default:
                return '#1589ee'; // Blue
        }
    }
    
    handleDateSelect(info) {
        // Open modal to add new availability
        this.newEvent = {
            start: this.formatDateForDisplay(info.start),
            end: this.formatDateForDisplay(info.end),
            status: 'Available',
            notes: ''
        };
        this.showAddEventModal = true;
    }
    
    handleEventClick(info) {
        // Open modal to edit existing availability
        const event = info.event;
        
        this.selectedEvent = {
            id: event.id,
            start: this.formatDateForDisplay(event.start),
            end: this.formatDateForDisplay(this.subtractDays(event.end, 1)), // Adjust for FullCalendar's exclusive end date
            status: event.extendedProps.status,
            notes: event.extendedProps.notes
        };
        
        this.showEditEventModal = true;
    }
    
    handleEventDrop(info) {
        // Update availability after drag and drop
        const event = info.event;
        
        const availability = {
            Id: event.id,
            Start_Date__c: this.formatDateForApex(event.start),
            End_Date__c: this.formatDateForApex(this.subtractDays(event.end, 1)), // Adjust for FullCalendar's exclusive end date
            Status__c: event.extendedProps.status,
            Notes__c: event.extendedProps.notes
        };
        
        this.updateAvailabilityRecord(availability);
    }
    
    handleEventResize(info) {
        // Update availability after resize
        const event = info.event;
        
        const availability = {
            Id: event.id,
            Start_Date__c: this.formatDateForApex(event.start),
            End_Date__c: this.formatDateForApex(this.subtractDays(event.end, 1)), // Adjust for FullCalendar's exclusive end date
            Status__c: event.extendedProps.status,
            Notes__c: event.extendedProps.notes
        };
        
        this.updateAvailabilityRecord(availability);
    }
    
    handleDatesSet(info) {
        // Update date range when calendar view changes
        const newStartDate = info.start;
        const newEndDate = info.end;
        
        // Only reload if date range has changed significantly
        if (this.startDate.getTime() > newStartDate.getTime() || 
            this.endDate.getTime() < newEndDate.getTime()) {
            
            this.startDate = newStartDate;
            this.endDate = newEndDate;
            this.loadAvailabilityData();
        }
    }
    
    handleAddEvent() {
        // Create new availability record
        const availability = {
            Start_Date__c: this.formatDateForApex(new Date(this.newEvent.start)),
            End_Date__c: this.formatDateForApex(new Date(this.newEvent.end)),
            Status__c: this.newEvent.status,
            Notes__c: this.newEvent.notes
        };
        
        // Set the appropriate lookup field based on object type
        if (this.objectApiName === 'Campsite__c') {
            availability.Campsite__c = this.recordId;
        } else if (this.objectApiName === 'Camping_Item__c') {
            availability.Camping_Item__c = this.recordId;
        }
        
        this.isLoading = true;
        
        createAvailability({ availability: availability })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Availability created successfully',
                        variant: 'success'
                    })
                );
                this.showAddEventModal = false;
                this.loadAvailabilityData();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    handleUpdateEvent() {
        // Update existing availability record
        const availability = {
            Id: this.selectedEvent.id,
            Start_Date__c: this.formatDateForApex(new Date(this.selectedEvent.start)),
            End_Date__c: this.formatDateForApex(new Date(this.selectedEvent.end)),
            Status__c: this.selectedEvent.status,
            Notes__c: this.selectedEvent.notes
        };
        
        this.updateAvailabilityRecord(availability);
    }
    
    handleDeleteEvent() {
        // Delete existing availability record
        if (confirm('Are you sure you want to delete this availability record?')) {
            this.isLoading = true;
            
            deleteAvailability({ availabilityId: this.selectedEvent.id })
                .then(result => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Availability deleted successfully',
                            variant: 'success'
                        })
                    );
                    this.showEditEventModal = false;
                    this.loadAvailabilityData();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    }
    
    updateAvailabilityRecord(availability) {
        this.isLoading = true;
        
        updateAvailability({ availability: availability })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Availability updated successfully',
                        variant: 'success'
                    })
                );
                this.showEditEventModal = false;
                this.loadAvailabilityData();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Helper methods
    formatDateForApex(date) {
        const d = new Date(date);
        return d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' + 
               String(d.getDate()).padStart(2, '0');
    }
    
    formatDateForDisplay(date) {
        const d = new Date(date);
        return d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' + 
               String(d.getDate()).padStart(2, '0');
    }
    
    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date;
    }
    
    subtractDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() - days);
        return result;
    }
    
    // Event handlers for modals
    handleCloseAddModal() {
        this.showAddEventModal = false;
    }
    
    handleCloseEditModal() {
        this.showEditEventModal = false;
    }
    
    handleNewEventStartChange(event) {
        this.newEvent.start = event.target.value;
    }
    
    handleNewEventEndChange(event) {
        this.newEvent.end = event.target.value;
    }
    
    handleNewEventStatusChange(event) {
        this.newEvent.status = event.target.value;
    }
    
    handleNewEventNotesChange(event) {
        this.newEvent.notes = event.target.value;
    }
    
    handleSelectedEventStartChange(event) {
        this.selectedEvent.start = event.target.value;
    }
    
    handleSelectedEventEndChange(event) {
        this.selectedEvent.end = event.target.value;
    }
    
    handleSelectedEventStatusChange(event) {
        this.selectedEvent.status = event.target.value;
    }
    
    handleSelectedEventNotesChange(event) {
        this.selectedEvent.notes = event.target.value;
    }
    
    get statusOptions() {
        return [
            { label: 'Available', value: 'Available' },
            { label: 'Unavailable', value: 'Unavailable' },
            { label: 'Maintenance', value: 'Maintenance' }
        ];
    }
}
