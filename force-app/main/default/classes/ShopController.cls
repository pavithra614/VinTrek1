/**
 * Controller for Shop related operations
 */
public with sharing class ShopController {

    /**
     * Get all shops (for admin view)
     * @return List of Shop__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Shop__c> getShops() {
        try {
            return [
                SELECT Id, Name, Location__c, Description__c, Address__c, Contact_Email__c,
                       Contact_Phone__c
                FROM Shop__c
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving shops: ' + e.getMessage());
        }
    }

    /**
     * Create a new shop
     * @param shop - Shop__c record to create
     * @return Id of the created shop
     */
    @AuraEnabled
    public static Id createShop(Shop__c shop) {
        try {
            insert shop;
            return shop.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating shop: ' + e.getMessage());
        }
    }

    /**
     * Update an existing shop
     * @param shop - Shop__c record to update
     * @return Boolean indicating success
     */
    @AuraEnabled
    public static Boolean updateShop(Shop__c shop) {
        try {
            update shop;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating shop: ' + e.getMessage());
        }
    }

    /**
     * Delete a shop
     * @param shopId - Id of the shop to delete
     * @return Boolean indicating success
     */
    @AuraEnabled
    public static Boolean deleteShop(Id shopId) {
        try {
            Shop__c shop = [SELECT Id FROM Shop__c WHERE Id = :shopId];
            delete shop;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting shop: ' + e.getMessage());
        }
    }
}
