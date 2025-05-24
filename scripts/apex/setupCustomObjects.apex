/**
 * Script to check custom objects for VinTrek application
 * Run this script in your Salesforce org to check if the necessary custom objects exist
 */

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

// Provide manual instructions for creating objects
System.debug('Please create the custom objects manually through the Salesforce UI:');
System.debug('1. Go to Setup > Object Manager > Create > Custom Object');
System.debug('2. Create the following custom objects:');

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

if (!trailExists) {
    System.debug('   - Trail__c:');
    System.debug('     - Label: Trail');
    System.debug('     - Plural Label: Trails');
    System.debug('     - Fields: Name (Text), Description__c (Text Area), Start_Location__c (Text), End_Location__c (Text), Difficulty__c (Picklist)');
}


