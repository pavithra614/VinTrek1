/**
 * Controller for the Availability Calendar component
 */
public with sharing class AvailabilityController {
    
    /**
     * Get availability for a campsite
     * @param campsiteId - Id of the campsite to get availability for
     * @param startDate - Start date of the range to check
     * @param endDate - End date of the range to check
     * @return List<Availability__c> - List of availability records
     */
    @AuraEnabled(cacheable=true)
    public static List<Availability__c> getCampsiteAvailability(Id campsiteId, Date startDate, Date endDate) {
        try {
            return [
                SELECT Id, Start_Date__c, End_Date__c, Status__c, Notes__c
                FROM Availability__c
                WHERE Campsite__c = :campsiteId
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                ORDER BY Start_Date__c
            ];
        } catch (Exception e) {
            System.debug('Error getting campsite availability: ' + e.getMessage());
            throw new AuraHandledException('Error getting campsite availability: ' + e.getMessage());
        }
    }
    
    /**
     * Get availability for a camping item
     * @param campingItemId - Id of the camping item to get availability for
     * @param startDate - Start date of the range to check
     * @param endDate - End date of the range to check
     * @return List<Availability__c> - List of availability records
     */
    @AuraEnabled(cacheable=true)
    public static List<Availability__c> getCampingItemAvailability(Id campingItemId, Date startDate, Date endDate) {
        try {
            return [
                SELECT Id, Start_Date__c, End_Date__c, Status__c, Notes__c
                FROM Availability__c
                WHERE Camping_Item__c = :campingItemId
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                ORDER BY Start_Date__c
            ];
        } catch (Exception e) {
            System.debug('Error getting camping item availability: ' + e.getMessage());
            throw new AuraHandledException('Error getting camping item availability: ' + e.getMessage());
        }
    }
    
    /**
     * Check if a campsite is available for a specific date range
     * @param campsiteId - Id of the campsite to check
     * @param startDate - Start date of the range to check
     * @param endDate - End date of the range to check
     * @return Boolean - True if available, false otherwise
     */
    @AuraEnabled
    public static Boolean isCampsiteAvailable(Id campsiteId, Date startDate, Date endDate) {
        try {
            // Check for existing bookings
            List<Rental__c> existingBookings = [
                SELECT Id
                FROM Rental__c
                WHERE Campsite__c = :campsiteId
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                LIMIT 1
            ];
            
            if (!existingBookings.isEmpty()) {
                return false;
            }
            
            // Check for unavailability records
            List<Availability__c> unavailabilityRecords = [
                SELECT Id
                FROM Availability__c
                WHERE Campsite__c = :campsiteId
                AND Status__c != 'Available'
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                LIMIT 1
            ];
            
            return unavailabilityRecords.isEmpty();
        } catch (Exception e) {
            System.debug('Error checking campsite availability: ' + e.getMessage());
            throw new AuraHandledException('Error checking campsite availability: ' + e.getMessage());
        }
    }
    
    /**
     * Check if a camping item is available for a specific date range
     * @param campingItemId - Id of the camping item to check
     * @param startDate - Start date of the range to check
     * @param endDate - End date of the range to check
     * @return Boolean - True if available, false otherwise
     */
    @AuraEnabled
    public static Boolean isCampingItemAvailable(Id campingItemId, Date startDate, Date endDate) {
        try {
            // Check for existing rentals
            List<Rental__c> existingRentals = [
                SELECT Id
                FROM Rental__c
                WHERE Camping_Item__c = :campingItemId
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                LIMIT 1
            ];
            
            if (!existingRentals.isEmpty()) {
                return false;
            }
            
            // Check for unavailability records
            List<Availability__c> unavailabilityRecords = [
                SELECT Id
                FROM Availability__c
                WHERE Camping_Item__c = :campingItemId
                AND Status__c != 'Available'
                AND ((Start_Date__c >= :startDate AND Start_Date__c <= :endDate)
                    OR (End_Date__c >= :startDate AND End_Date__c <= :endDate)
                    OR (Start_Date__c <= :startDate AND End_Date__c >= :endDate))
                LIMIT 1
            ];
            
            return unavailabilityRecords.isEmpty();
        } catch (Exception e) {
            System.debug('Error checking camping item availability: ' + e.getMessage());
            throw new AuraHandledException('Error checking camping item availability: ' + e.getMessage());
        }
    }
    
    /**
     * Create an availability record
     * @param availability - Availability__c object to create
     * @return Id - Id of the created availability record
     */
    @AuraEnabled
    public static Id createAvailability(Availability__c availability) {
        try {
            insert availability;
            return availability.Id;
        } catch (Exception e) {
            System.debug('Error creating availability: ' + e.getMessage());
            throw new AuraHandledException('Error creating availability: ' + e.getMessage());
        }
    }
    
    /**
     * Update an availability record
     * @param availability - Availability__c object to update
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean updateAvailability(Availability__c availability) {
        try {
            update availability;
            return true;
        } catch (Exception e) {
            System.debug('Error updating availability: ' + e.getMessage());
            throw new AuraHandledException('Error updating availability: ' + e.getMessage());
        }
    }
    
    /**
     * Delete an availability record
     * @param availabilityId - Id of the availability record to delete
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean deleteAvailability(Id availabilityId) {
        try {
            delete [SELECT Id FROM Availability__c WHERE Id = :availabilityId];
            return true;
        } catch (Exception e) {
            System.debug('Error deleting availability: ' + e.getMessage());
            throw new AuraHandledException('Error deleting availability: ' + e.getMessage());
        }
    }
}
