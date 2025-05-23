/**
 * Controller for Rental Cart operations
 */
public with sharing class RentalCartController {
    
    /**
     * Get a camping item by ID
     * @param itemId - ID of the camping item
     * @return Camping_Item__c record
     */
    @AuraEnabled
    public static Camping_Item__c getCampingItemById(Id itemId) {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Rate__c, Image_URL__c, 
                       Status__c, Category__c, Shop__c, Shop__r.Name
                FROM Camping_Item__c
                WHERE Id = :itemId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving camping item: ' + e.getMessage());
        }
    }
    
    /**
     * Create a rental record with items
     * @param rentalItems - List of camping items to rent
     * @param startDate - Start date of the rental
     * @param endDate - End date of the rental
     * @return ID of the created rental record
     */
    @AuraEnabled
    public static Id createRental(List<Map<String, Object>> rentalItems, Date startDate, Date endDate) {
        try {
            // Validate input
            if (rentalItems == null || rentalItems.isEmpty()) {
                throw new AuraHandledException('No items selected for rental');
            }
            
            if (startDate == null || endDate == null) {
                throw new AuraHandledException('Start and end dates are required');
            }
            
            if (startDate > endDate) {
                throw new AuraHandledException('End date must be after start date');
            }
            
            // Get the current user
            Id userId = UserInfo.getUserId();
            
            // Create the rental record
            Rental__c rental = new Rental__c(
                Renter__c = userId,
                Start_Date__c = startDate,
                End_Date__c = endDate,
                Status__c = 'Pending'
            );
            
            insert rental;
            
            // Create rental item records
            List<Rental_Item__c> rentalItemRecords = new List<Rental_Item__c>();
            
            for (Map<String, Object> item : rentalItems) {
                Id itemId = (Id)item.get('itemId');
                Integer quantity = Integer.valueOf(item.get('quantity'));
                
                Rental_Item__c rentalItem = new Rental_Item__c(
                    Rental__c = rental.Id,
                    Camping_Item__c = itemId,
                    Quantity__c = quantity
                );
                
                rentalItemRecords.add(rentalItem);
            }
            
            insert rentalItemRecords;
            
            return rental.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating rental: ' + e.getMessage());
        }
    }
}
