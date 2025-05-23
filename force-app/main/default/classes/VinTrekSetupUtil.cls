/**
 * Utility class for setting up VinTrek custom objects
 */
public class VinTrekSetupUtil {
    
    /**
     * Create all custom objects needed for VinTrek
     */
    public static void createCustomObjects() {
        // This method will provide instructions for creating custom objects
        // Since we can't use Metadata API directly in anonymous Apex
        
        // Check if the objects exist in the schema
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        Boolean trailExists = globalDescribe.containsKey('Trail__c');
        Boolean camperProfileExists = globalDescribe.containsKey('Camper_Profile__c');
        Boolean campingItemExists = globalDescribe.containsKey('Camping_Item__c');
        Boolean shopExists = globalDescribe.containsKey('Shop__c');
        Boolean rentalExists = globalDescribe.containsKey('Rental__c');
        
        System.debug('Trail__c exists: ' + trailExists);
        System.debug('Camper_Profile__c exists: ' + camperProfileExists);
        System.debug('Camping_Item__c exists: ' + campingItemExists);
        System.debug('Shop__c exists: ' + shopExists);
        System.debug('Rental__c exists: ' + rentalExists);
        
        // Provide instructions for creating objects
        if (!trailExists || !camperProfileExists || !campingItemExists || !shopExists || !rentalExists) {
            System.debug('Some custom objects need to be created. Please follow these instructions:');
            System.debug('1. Go to Setup > Object Manager > Create > Custom Object');
            System.debug('2. Create the following custom objects:');
            
            if (!trailExists) {
                System.debug('   - Trail__c:');
                System.debug('     - Label: Trail');
                System.debug('     - Plural Label: Trails');
                System.debug('     - Fields: Name (Text), Description__c (Text Area), Start_Location__c (Text), End_Location__c (Text), Difficulty__c (Picklist)');
            }
            
            if (!camperProfileExists) {
                System.debug('   - Camper_Profile__c:');
                System.debug('     - Label: Camper Profile');
                System.debug('     - Plural Label: Camper Profiles');
                System.debug('     - Fields: Name (Text), User__c (Lookup to User), Bio__c (Text Area), Experience_Level__c (Picklist)');
            }
            
            if (!campingItemExists) {
                System.debug('   - Camping_Item__c:');
                System.debug('     - Label: Camping Item');
                System.debug('     - Plural Label: Camping Items');
                System.debug('     - Fields: Name (Text), Description__c (Text Area), Daily_Rate__c (Currency), Image_URL__c (URL), Status__c (Picklist), Category__c (Picklist), Shop__c (Lookup to Shop__c)');
            }
            
            if (!shopExists) {
                System.debug('   - Shop__c:');
                System.debug('     - Label: Shop');
                System.debug('     - Plural Label: Shops');
                System.debug('     - Fields: Name (Text), Owner__c (Lookup to User), Description__c (Text Area), Location__c (Text)');
            }
            
            if (!rentalExists) {
                System.debug('   - Rental__c:');
                System.debug('     - Label: Rental');
                System.debug('     - Plural Label: Rentals');
                System.debug('     - Fields: Name (Auto Number), Camper__c (Lookup to User), Camping_Item__c (Lookup to Camping_Item__c), Start_Date__c (Date), End_Date__c (Date), Status__c (Picklist), Total_Price__c (Currency)');
            }
        } else {
            System.debug('All required custom objects exist.');
        }
    }
    
    /**
     * Create sample data for testing
     */
    public static void createSampleData() {
        try {
            // Check if the objects exist in the schema
            Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
            Boolean trailExists = globalDescribe.containsKey('Trail__c');
            Boolean camperProfileExists = globalDescribe.containsKey('Camper_Profile__c');
            Boolean campingItemExists = globalDescribe.containsKey('Camping_Item__c');
            Boolean shopExists = globalDescribe.containsKey('Shop__c');
            Boolean rentalExists = globalDescribe.containsKey('Rental__c');
            
            // Create sample data only if all objects exist
            if (trailExists && camperProfileExists && campingItemExists && shopExists && rentalExists) {
                // Create sample trails
                List<SObject> trails = new List<SObject>();
                Schema.SObjectType trailType = globalDescribe.get('Trail__c');
                
                SObject trail1 = trailType.newSObject();
                trail1.put('Name', 'Mountain Vista Trail');
                trail1.put('Description__c', 'A beautiful mountain trail with scenic views');
                trail1.put('Start_Location__c', 'North Trailhead');
                trail1.put('End_Location__c', 'South Trailhead');
                trail1.put('Difficulty__c', 'Moderate');
                trails.add(trail1);
                
                SObject trail2 = trailType.newSObject();
                trail2.put('Name', 'Riverside Path');
                trail2.put('Description__c', 'A relaxing trail along the river');
                trail2.put('Start_Location__c', 'River Entrance');
                trail2.put('End_Location__c', 'Waterfall Exit');
                trail2.put('Difficulty__c', 'Easy');
                trails.add(trail2);
                
                insert trails;
                System.debug('Created ' + trails.size() + ' sample trails');
                
                // Create sample shops
                List<SObject> shops = new List<SObject>();
                Schema.SObjectType shopType = globalDescribe.get('Shop__c');
                
                SObject shop1 = shopType.newSObject();
                shop1.put('Name', 'Mountain Gear Outfitters');
                shop1.put('Description__c', 'Quality camping equipment for all your outdoor needs');
                shop1.put('Location__c', 'Mountain View, CA');
                shops.add(shop1);
                
                SObject shop2 = shopType.newSObject();
                shop2.put('Name', 'River Adventures Supply');
                shop2.put('Description__c', 'Specialized equipment for water adventures');
                shop2.put('Location__c', 'Riverside, CA');
                shops.add(shop2);
                
                insert shops;
                System.debug('Created ' + shops.size() + ' sample shops');
                
                // Create sample camping items
                List<SObject> items = new List<SObject>();
                Schema.SObjectType itemType = globalDescribe.get('Camping_Item__c');
                
                SObject item1 = itemType.newSObject();
                item1.put('Name', '4-Person Tent');
                item1.put('Description__c', 'Spacious 4-person tent with rainfly');
                item1.put('Daily_Rate__c', 25);
                item1.put('Status__c', 'Available');
                item1.put('Category__c', 'Tent');
                item1.put('Shop__c', shops[0].Id);
                items.add(item1);
                
                SObject item2 = itemType.newSObject();
                item2.put('Name', 'Sleeping Bag');
                item2.put('Description__c', 'Warm sleeping bag rated for 20°F');
                item2.put('Daily_Rate__c', 10);
                item2.put('Status__c', 'Available');
                item2.put('Category__c', 'Sleeping Bag');
                item2.put('Shop__c', shops[0].Id);
                items.add(item2);
                
                SObject item3 = itemType.newSObject();
                item3.put('Name', 'Portable Stove');
                item3.put('Description__c', 'Compact camping stove with fuel');
                item3.put('Daily_Rate__c', 15);
                item3.put('Status__c', 'Available');
                item3.put('Category__c', 'Cooking');
                item3.put('Shop__c', shops[1].Id);
                items.add(item3);
                
                insert items;
                System.debug('Created ' + items.size() + ' sample camping items');
                
                System.debug('Sample data created successfully');
            } else {
                System.debug('Cannot create sample data because some objects do not exist');
            }
        } catch (Exception e) {
            System.debug('Error creating sample data: ' + e.getMessage());
            System.debug(e.getStackTraceString());
        }
    }
}
