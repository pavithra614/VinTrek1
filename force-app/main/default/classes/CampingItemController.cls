/**
 * Controller for Camping Item related operations
 */
public with sharing class CampingItemController {
    
    /**
     * Get camping items owned by the current service provider
     * @return List of Camping_Item__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Camping_Item__c> getServiceProviderItems() {
        try {
            // Get the current user's ID
            Id userId = UserInfo.getUserId();
            
            // Query for camping items owned by the current user
            return [
                SELECT Id, Name, Description__c, Daily_Rate__c, Image_URL__c, 
                       Status__c, Category__c, Shop__c, Shop__r.Name
                FROM Camping_Item__c
                WHERE OwnerId = :userId
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service provider items: ' + e.getMessage());
        }
    }
    
    /**
     * Get all available camping items
     * @return List of Camping_Item__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Camping_Item__c> getCampingItems() {
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
            throw new AuraHandledException('Error retrieving camping items: ' + e.getMessage());
        }
    }
    
    /**
     * Get camping items by shop
     * @param shopId - Id of the shop
     * @return List of Camping_Item__c records for the specified shop
     */
    @AuraEnabled(cacheable=true)
    public static List<Camping_Item__c> getCampingItemsByShop(Id shopId) {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Rate__c, Image_URL__c, 
                       Status__c, Category__c, Shop__c, Shop__r.Name
                FROM Camping_Item__c
                WHERE Shop__c = :shopId
                AND Status__c = 'Available'
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving camping items for shop: ' + e.getMessage());
        }
    }
    
    /**
     * Get camping items by category
     * @param category - Category of camping items
     * @return List of Camping_Item__c records for the specified category
     */
    @AuraEnabled(cacheable=true)
    public static List<Camping_Item__c> getCampingItemsByCategory(String category) {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Rate__c, Image_URL__c, 
                       Status__c, Category__c, Shop__c, Shop__r.Name
                FROM Camping_Item__c
                WHERE Category__c = :category
                AND Status__c = 'Available'
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving camping items for category: ' + e.getMessage());
        }
    }
    
    /**
     * Delete a camping item
     * @param itemId - Id of the camping item to delete
     * @return Boolean indicating success
     */
    @AuraEnabled
    public static Boolean deleteCampingItem(Id itemId) {
        try {
            Camping_Item__c item = [SELECT Id FROM Camping_Item__c WHERE Id = :itemId];
            delete item;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting camping item: ' + e.getMessage());
        }
    }
}
