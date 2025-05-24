import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getNotifications from '@salesforce/apex/NotificationController.getNotifications';
import getUnreadCount from '@salesforce/apex/NotificationController.getUnreadCount';
import markAsRead from '@salesforce/apex/NotificationController.markAsRead';
import markAllAsRead from '@salesforce/apex/NotificationController.markAllAsRead';
import deleteNotification from '@salesforce/apex/NotificationController.deleteNotification';

export default class NotificationCenter extends LightningElement {
    @track notifications = [];
    @track unreadCount = 0;
    @track isLoading = true;
    @track error;
    @track showNotifications = false;

    wiredNotificationsResult;
    wiredUnreadCountResult;

    // Computed property for notification panel class
    get notificationPanelClass() {
        return this.showNotifications ? 'notification-panel show' : 'notification-panel';
    }

    // Wire the Apex methods
    @wire(getNotifications)
    wiredNotifications(result) {
        this.wiredNotificationsResult = result;
        this.isLoading = true;
        if (result.data) {
            this.notifications = result.data.map(notification => {
                return {
                    ...notification,
                    iconName: this.getIconForType(notification.Type__c),
                    formattedDate: this.formatDate(notification.CreatedDate)
                };
            });
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.notifications = [];
            console.error('Error loading notifications', result.error);
        }
        this.isLoading = false;
    }

    @wire(getUnreadCount)
    wiredUnreadCount(result) {
        this.wiredUnreadCountResult = result;
        if (result.data !== undefined) {
            this.unreadCount = result.data;
        } else if (result.error) {
            console.error('Error loading unread count', result.error);
        }
    }

    // Get icon name based on notification type
    getIconForType(type) {
        switch(type) {
            case 'Weather Alert':
                return 'utility:warning';
            case 'Booking Reminder':
                return 'utility:reminder';
            case 'System Message':
                return 'utility:info';
            case 'Trail Update':
                return 'utility:trail';
            default:
                return 'utility:notification';
        }
    }

    // Format date to readable string
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    // Toggle notifications panel
    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    // Mark notification as read
    handleMarkAsRead(event) {
        const notificationId = event.currentTarget.dataset.id;

        markAsRead({ notificationId: notificationId })
            .then(() => {
                return refreshApex(this.wiredNotificationsResult);
            })
            .then(() => {
                return refreshApex(this.wiredUnreadCountResult);
            })
            .catch(error => {
                console.error('Error marking notification as read', error);
            });
    }

    // Mark all notifications as read
    handleMarkAllAsRead() {
        markAllAsRead()
            .then(() => {
                return refreshApex(this.wiredNotificationsResult);
            })
            .then(() => {
                return refreshApex(this.wiredUnreadCountResult);
            })
            .catch(error => {
                console.error('Error marking all notifications as read', error);
            });
    }

    // Delete notification
    handleDeleteNotification(event) {
        const notificationId = event.currentTarget.dataset.id;

        deleteNotification({ notificationId: notificationId })
            .then(() => {
                return refreshApex(this.wiredNotificationsResult);
            })
            .then(() => {
                return refreshApex(this.wiredUnreadCountResult);
            })
            .catch(error => {
                console.error('Error deleting notification', error);
            });
    }

    // Refresh notifications
    handleRefresh() {
        refreshApex(this.wiredNotificationsResult);
        refreshApex(this.wiredUnreadCountResult);
    }
}
