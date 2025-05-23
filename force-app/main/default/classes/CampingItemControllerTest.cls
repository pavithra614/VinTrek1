/**
 * Test class for CampingItemController
 */
@isTest
private class CampingItemControllerTest {
    
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
        
        // Available items
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
        
        // Unavailable item
        testItems.add(new Camping_Item__c(
            Name = 'Unavailable Lantern',
            Description__c = 'An unavailable lantern',
            Daily_Rate__c = 10.00,
            Status__c = 'Rented',
            Category__c = 'Lighting',
            Shop__c = testShop.Id
        ));
        
        insert testItems;
    }
    
    /**
     * Test getCampingItems method
     */
    @isTest
    static void testGetCampingItems() {
        // Call the method
        Test.startTest();
        List<Camping_Item__c> items = CampingItemController.getCampingItems();
        Test.stopTest();
        
        // Verify results
        System.assertEquals(2, items.size(), 'Should return only available items');
        
        // Verify item details
        Boolean foundTent = false;
        Boolean foundStove = false;
        
        for (Camping_Item__c item : items) {
            if (item.Name == 'Test Tent') {
                foundTent = true;
                System.assertEquals('Tent', item.Category__c);
                System.assertEquals(25.00, item.Daily_Rate__c);
            } else if (item.Name == 'Test Stove') {
                foundStove = true;
                System.assertEquals('Cooking', item.Category__c);
                System.assertEquals(15.00, item.Daily_Rate__c);
            }
        }
        
        System.assert(foundTent, 'Test Tent should be in the results');
        System.assert(foundStove, 'Test Stove should be in the results');
    }
    
    /**
     * Test getCampingItemsByShop method
     */
    @isTest
    static void testGetCampingItemsByShop() {
        // Get the test shop
        Shop__c testShop = [SELECT Id FROM Shop__c WHERE Name = 'Test Camping Shop' LIMIT 1];
        
        // Call the method
        Test.startTest();
        List<Camping_Item__c> items = CampingItemController.getCampingItemsByShop(testShop.Id);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(2, items.size(), 'Should return only available items for the shop');
        
        // Verify all items belong to the test shop
        for (Camping_Item__c item : items) {
            System.assertEquals(testShop.Id, item.Shop__c, 'Item should belong to the test shop');
            System.assertEquals('Available', item.Status__c, 'Item should be available');
        }
    }
    
    /**
     * Test getCampingItemsByCategory method
     */
    @isTest
    static void testGetCampingItemsByCategory() {
        // Call the method for Tent category
        Test.startTest();
        List<Camping_Item__c> tentItems = CampingItemController.getCampingItemsByCategory('Tent');
        Test.stopTest();
        
        // Verify results
        System.assertEquals(1, tentItems.size(), 'Should return only available items in Tent category');
        System.assertEquals('Test Tent', tentItems[0].Name, 'Should return the Test Tent');
        
        // Call the method for Cooking category
        List<Camping_Item__c> cookingItems = CampingItemController.getCampingItemsByCategory('Cooking');
        
        // Verify results
        System.assertEquals(1, cookingItems.size(), 'Should return only available items in Cooking category');
        System.assertEquals('Test Stove', cookingItems[0].Name, 'Should return the Test Stove');
    }
}
