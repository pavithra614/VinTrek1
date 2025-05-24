// Create test data for VinTrek Admin tabs

// Create test shops
List<Shop__c> shops = new List<Shop__c>();
shops.add(new Shop__c(
    Name = 'Mountain Gear Shop',
    Location__c = 'Colombo',
    Address__c = '123 Mountain View Road, Colombo',
    Contact_Email__c = 'info@mountaingear.lk',
    Contact_Phone__c = '+94 11 234 5678'
));

shops.add(new Shop__c(
    Name = 'Adventure Outfitters',
    Location__c = 'Kandy',
    Address__c = '456 Adventure Lane, Kandy',
    Contact_Email__c = 'contact@adventureoutfitters.lk',
    Contact_Phone__c = '+94 81 987 6543'
));

shops.add(new Shop__c(
    Name = 'Trail Essentials',
    Location__c = 'Galle',
    Address__c = '789 Trail Street, Galle',
    Contact_Email__c = 'hello@trailessentials.lk',
    Contact_Phone__c = '+94 91 555 1234'
));

insert shops;
System.debug('Created ' + shops.size() + ' shops');

// Create test camping items
List<Camping_Item__c> campingItems = new List<Camping_Item__c>();
campingItems.add(new Camping_Item__c(
    Name = 'Two-Person Tent',
    Daily_Rate__c = 800.00,
    Category__c = 'Tent',
    Status__c = 'Available',
    Shop__c = shops[0].Id
));

campingItems.add(new Camping_Item__c(
    Name = 'Portable Gas Stove',
    Daily_Rate__c = 400.00,
    Category__c = 'Cooking',
    Status__c = 'Available',
    Shop__c = shops[1].Id
));

campingItems.add(new Camping_Item__c(
    Name = 'Sleeping Bag',
    Daily_Rate__c = 600.00,
    Category__c = 'Sleeping Gear',
    Status__c = 'Available',
    Shop__c = shops[2].Id
));

campingItems.add(new Camping_Item__c(
    Name = 'Hiking Backpack',
    Daily_Rate__c = 500.00,
    Category__c = 'Other',
    Status__c = 'Available',
    Shop__c = shops[0].Id
));

insert campingItems;
System.debug('Created ' + campingItems.size() + ' camping items');

System.debug('Test data creation completed successfully!');
System.debug('Shops: ' + shops.size());
System.debug('Camping Items: ' + campingItems.size());
