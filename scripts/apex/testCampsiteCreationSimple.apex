// Test campsite creation without Trail__c field
System.debug('=== Testing Simple Campsite Creation ===');

try {
    // Create a test campsite with all required fields
    Campsite__c testCampsite = new Campsite__c(
        Name = 'Test Campsite - ' + DateTime.now().format('yyyy-MM-dd HH:mm:ss'),
        Location__c = 'Test Location',
        Daily_Fee__c = 25.00,
        Capacity__c = 10,
        Max_Capacity__c = 15
    );

    insert testCampsite;
    System.debug('✅ Successfully created test campsite with ID: ' + testCampsite.Id);

    // Query the created campsite
    Campsite__c createdCampsite = [
        SELECT Id, Name, Location__c, Daily_Fee__c, Capacity__c
        FROM Campsite__c
        WHERE Id = :testCampsite.Id
    ];

    System.debug('Created Campsite: ' + createdCampsite.Name);
    System.debug('Location: ' + createdCampsite.Location__c);
    System.debug('Daily Fee: ' + createdCampsite.Daily_Fee__c);
    System.debug('Capacity: ' + createdCampsite.Capacity__c);

    // Clean up - delete the test campsite
    delete createdCampsite;
    System.debug('✅ Test campsite deleted successfully');

    System.debug('=== Test completed successfully ===');

} catch (Exception e) {
    System.debug('❌ Error during test: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
}
