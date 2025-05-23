/**
 * Test class for RentalCartController
 */
@isTest
private class RentalCartControllerTest {
    
    /**
     * Setup test data
     */
    @TestSetup
    static void setupTestData() {
        // Create test shop
        Shop__c testShop = new Shop__c(
            Name = 'Test Camping Shop',
            Location__c = 'Test Location',
            Phone__c = '1234567890',
            Email__c = 'test@example.com'
        );
        insert testShop;
        
        // Create test camping items
        List<Camping_Item__c> testItems = new List<Camping_Item__c>();
        
        testItems.add(new Camping_Item__c(
            Name = 'Test Tent',
            Description__c = 'A test tent for camping',
            Daily_Rate__c = 25.00,
            Status__c = 'Available',
            Category__c = 'Tent',
            Shop__c = testShop.Id
        ));
        
        testItems.add(new Camping_Item__c(
            Name = 'Test Stove',
            Description__c = 'A test stove for camping',
            Daily_Rate__c = 15.00,
            Status__c = 'Available',
            Category__c = 'Cooking',
            Shop__c = testShop.Id
        ));
        
        insert testItems;
    }
    
    /**
     * Test getCampingItemById method
     */
    @isTest
    static void testGetCampingItemById() {
        // Get a test item
        Camping_Item__c testItem = [SELECT Id FROM Camping_Item__c WHERE Name = 'Test Tent' LIMIT 1];
        
        // Call the method
        Test.startTest();
        Camping_Item__c retrievedItem = RentalCartController.getCampingItemById(testItem.Id);
        Test.stopTest();
        
        // Verify results
        System.assertNotEquals(null, retrievedItem, 'Should return a camping item');
        System.assertEquals('Test Tent', retrievedItem.Name, 'Should return the correct item');
        System.assertEquals(25.00, retrievedItem.Daily_Rate__c, 'Should return the correct daily rate');
        System.assertEquals('Tent', retrievedItem.Category__c, 'Should return the correct category');
    }
    
    /**
     * Test createRental method
     */
    @isTest
    static void testCreateRental() {
        // Get test items
        List<Camping_Item__c> testItems = [SELECT Id FROM Camping_Item__c];
        
        // Prepare rental items
        List<Map<String, Object>> rentalItems = new List<Map<String, Object>>();
        
        Map<String, Object> item1 = new Map<String, Object>();
        item1.put('itemId', testItems[0].Id);
        item1.put('quantity', 2);
        rentalItems.add(item1);
        
        Map<String, Object> item2 = new Map<String, Object>();
        item2.put('itemId', testItems[1].Id);
        item2.put('quantity', 1);
        rentalItems.add(item2);
        
        // Set rental dates
        Date startDate = Date.today();
        Date endDate = startDate.addDays(3);
        
        // Call the method
        Test.startTest();
        Id rentalId = RentalCartController.createRental(rentalItems, startDate, endDate);
        Test.stopTest();
        
        // Verify rental was created
        System.assertNotEquals(null, rentalId, 'Should return a rental ID');
        
        // Verify rental details
        Rental__c rental = [
            SELECT Id, Start_Date__c, End_Date__c, Status__c, 
                   (SELECT Id, Camping_Item__c, Quantity__c FROM Rental_Items__r)
            FROM Rental__c
            WHERE Id = :rentalId
        ];
        
        System.assertEquals(startDate, rental.Start_Date__c, 'Should set the correct start date');
        System.assertEquals(endDate, rental.End_Date__c, 'Should set the correct end date');
        System.assertEquals('Pending', rental.Status__c, 'Should set the status to Pending');
        System.assertEquals(2, rental.Rental_Items__r.size(), 'Should create 2 rental items');
    }
    
    /**
     * Test createRental method with invalid input
     */
    @isTest
    static void testCreateRentalWithInvalidInput() {
        // Test with empty rental items
        List<Map<String, Object>> emptyRentalItems = new List<Map<String, Object>>();
        Date startDate = Date.today();
        Date endDate = startDate.addDays(3);
        
        try {
            Test.startTest();
            RentalCartController.createRental(emptyRentalItems, startDate, endDate);
            Test.stopTest();
            System.assert(false, 'Should throw an exception for empty rental items');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('No items selected'), 'Should throw the correct exception message');
        }
        
        // Test with invalid dates
        List<Camping_Item__c> testItems = [SELECT Id FROM Camping_Item__c];
        List<Map<String, Object>> rentalItems = new List<Map<String, Object>>();
        
        Map<String, Object> item = new Map<String, Object>();
        item.put('itemId', testItems[0].Id);
        item.put('quantity', 1);
        rentalItems.add(item);
        
        Date invalidEndDate = startDate.addDays(-1); // End date before start date
        
        try {
            RentalCartController.createRental(rentalItems, startDate, invalidEndDate);
            System.assert(false, 'Should throw an exception for invalid dates');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('End date must be after'), 'Should throw the correct exception message');
        }
    }
}
