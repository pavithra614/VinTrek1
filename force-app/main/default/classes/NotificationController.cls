/**
 * Controller for the notifications component
 */
public with sharing class NotificationController {
    
    /**
     * Get notifications for the current user
     * @return List<Notification__c> - List of notifications
     */
    @AuraEnabled(cacheable=true)
    public static List<Notification__c> getNotifications() {
        Id userId = UserInfo.getUserId();
        
        return [
            SELECT Id, Title__c, Message__c, Type__c, Is_Read__c, Related_Record_Id__c, CreatedDate
            FROM Notification__c
            WHERE User__c = :userId
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }
    
    /**
     * Get unread notification count for the current user
     * @return Integer - Number of unread notifications
     */
    @AuraEnabled(cacheable=true)
    public static Integer getUnreadCount() {
        Id userId = UserInfo.getUserId();
        
        return [
            SELECT COUNT()
            FROM Notification__c
            WHERE User__c = :userId
            AND Is_Read__c = false
        ];
    }
    
    /**
     * Mark a notification as read
     * @param notificationId - Id of the notification to mark as read
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean markAsRead(Id notificationId) {
        try {
            Notification__c notification = [
                SELECT Id, Is_Read__c
                FROM Notification__c
                WHERE Id = :notificationId
                LIMIT 1
            ];
            
            notification.Is_Read__c = true;
            update notification;
            
            return true;
        } catch (Exception e) {
            System.debug('Error marking notification as read: ' + e.getMessage());
            throw new AuraHandledException('Error marking notification as read: ' + e.getMessage());
        }
    }
    
    /**
     * Mark all notifications as read for the current user
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean markAllAsRead() {
        try {
            Id userId = UserInfo.getUserId();
            
            List<Notification__c> notifications = [
                SELECT Id
                FROM Notification__c
                WHERE User__c = :userId
                AND Is_Read__c = false
            ];
            
            for (Notification__c notification : notifications) {
                notification.Is_Read__c = true;
            }
            
            if (!notifications.isEmpty()) {
                update notifications;
            }
            
            return true;
        } catch (Exception e) {
            System.debug('Error marking all notifications as read: ' + e.getMessage());
            throw new AuraHandledException('Error marking all notifications as read: ' + e.getMessage());
        }
    }
    
    /**
     * Delete a notification
     * @param notificationId - Id of the notification to delete
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean deleteNotification(Id notificationId) {
        try {
            Notification__c notification = [
                SELECT Id
                FROM Notification__c
                WHERE Id = :notificationId
                LIMIT 1
            ];
            
            delete notification;
            
            return true;
        } catch (Exception e) {
            System.debug('Error deleting notification: ' + e.getMessage());
            throw new AuraHandledException('Error deleting notification: ' + e.getMessage());
        }
    }
}
