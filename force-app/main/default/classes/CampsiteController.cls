/**
 * Controller for Campsite related operations
 */
public with sharing class CampsiteController {

    /**
     * Get all campsites (for admin view)
     * @return List of Campsite__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Campsite__c> getCampsites() {
        try {
            // Query for all campsites (admin view)
            return [
                SELECT Id, Name, Description__c, Daily_Fee__c, Capacity__c,
                       Facilities__c, Latitude__c, Longitude__c, Trail__c, Trail__r.Name
                FROM Campsite__c
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving campsites: ' + e.getMessage());
        }
    }

    /**
     * Get all campsites for the current user (service provider)
     * @return List of Campsite__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Campsite__c> getServiceProviderCampsites() {
        try {
            // Get the current user's ID
            Id userId = UserInfo.getUserId();

            // Query for campsites owned by the current user
            return [
                SELECT Id, Name, Description__c, Daily_Fee__c, Capacity__c,
                       Facilities__c, Latitude__c, Longitude__c, Trail__c, Trail__r.Name
                FROM Campsite__c
                WHERE OwnerId = :userId
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service provider campsites: ' + e.getMessage());
        }
    }

    /**
     * Delete a campsite
     * @param campsiteId - Id of the campsite to delete
     * @return Boolean indicating success
     */
    @AuraEnabled
    public static Boolean deleteCampsite(Id campsiteId) {
        try {
            Campsite__c campsite = [SELECT Id FROM Campsite__c WHERE Id = :campsiteId];
            delete campsite;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting campsite: ' + e.getMessage());
        }
    }

    /**
     * Search for trails and campsites by name
     * @param searchTerm - The search term to use
     * @return Map containing lists of trails and campsites
     */
    @AuraEnabled
    public static Map<String, Object> searchTrailsAndCampsites(String searchTerm) {
        Map<String, Object> result = new Map<String, Object>();

        try {
            // Search for trails
            List<Trail__c> trails = [
                SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                       Elevation_m__c, Location__c
                FROM Trail__c
                WHERE Name LIKE :('%' + searchTerm + '%')
                ORDER BY Name ASC
                LIMIT 50
            ];

            // Search for campsites
            List<Campsite__c> campsites = [
                SELECT Id, Name, Description__c, Capacity__c, Daily_Fee__c,
                       Facilities__c, Trail__c, Trail__r.Name
                FROM Campsite__c
                WHERE Name LIKE :('%' + searchTerm + '%')
                ORDER BY Name ASC
                LIMIT 50
            ];

            result.put('trails', trails);
            result.put('campsites', campsites);

        } catch (Exception e) {
            throw new AuraHandledException('Error searching: ' + e.getMessage());
        }

        return result;
    }

    /**
     * Get a trail with its associated campsites
     * @param trailId - The ID of the trail
     * @return Trail__c with Campsites relationship
     */
    @AuraEnabled
    public static Trail__c getTrailWithCampsites(String trailId) {
        try {
            return [
                SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                       Elevation_m__c, Location__c
                FROM Trail__c
                WHERE Id = :trailId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving trail: ' + e.getMessage());
        }
    }

    /**
     * Get a campsite with its associated rental items
     * @param campsiteId - The ID of the campsite
     * @return Campsite__c with available camping items
     */
    @AuraEnabled
    public static Campsite__c getCampsiteWithRentalItems(String campsiteId) {
        try {
            // First get the campsite
            Campsite__c campsite = [
                SELECT Id, Name, Description__c, Capacity__c, Daily_Fee__c,
                       Facilities__c, Trail__c, Trail__r.Name
                FROM Campsite__c
                WHERE Id = :campsiteId
                LIMIT 1
            ];

            // Then get available rental items
            List<Camping_Item__c> rentalItems = [
                SELECT Id, Name, Description__c, Daily_Rate__c, Status__c,
                       Category__c, Shop__c, Shop__r.Name, Image_URL__c
                FROM Camping_Item__c
                WHERE Status__c = 'Available'
                ORDER BY Name ASC
                LIMIT 100
            ];

            // Create a wrapper to return both
            Map<String, Object> result = new Map<String, Object>();
            result.put('campsite', campsite);
            result.put('rentalItems', rentalItems);

            return campsite;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving campsite: ' + e.getMessage());
        }
    }

    /**
     * Get all available rental items
     * @return List of Camping_Item__c records
     */
    @AuraEnabled
    public static List<Camping_Item__c> getRentalItems() {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Rate__c, Image_URL__c,
                       Status__c, Category__c, Shop__c, Shop__r.Name
                FROM Camping_Item__c
                WHERE Status__c = 'Available'
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving rental items: ' + e.getMessage());
        }
    }


}
