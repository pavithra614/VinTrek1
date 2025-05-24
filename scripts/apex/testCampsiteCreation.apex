// Test script to verify campsite creation with Trail__c field
System.debug('=== Testing Campsite Creation with Trail__c Field ===');

try {
    // First, check if Trail__c object exists and has records
    List<Trail__c> trails = [SELECT Id, Name FROM Trail__c LIMIT 5];
    System.debug('Found ' + trails.size() + ' trails in the system');

    for (Trail__c trail : trails) {
        System.debug('Trail: ' + trail.Name + ' (ID: ' + trail.Id + ')');
    }

    // Check if Campsite__c object has the Trail__c field
    Schema.SObjectType campsiteType = Schema.getGlobalDescribe().get('Campsite__c');
    if (campsiteType != null) {
        Map<String, Schema.SObjectField> fields = campsiteType.getDescribe().fields.getMap();
        if (fields.containsKey('Trail__c')) {
            System.debug('✅ Trail__c field exists on Campsite__c object');

            // Get field details
            Schema.DescribeFieldResult fieldDescribe = fields.get('Trail__c').getDescribe();
            System.debug('Field Type: ' + fieldDescribe.getType());
            System.debug('Field Label: ' + fieldDescribe.getLabel());
            System.debug('Is Nillable: ' + fieldDescribe.isNillable());

        } else {
            System.debug('❌ Trail__c field does NOT exist on Campsite__c object');
        }
    } else {
        System.debug('❌ Campsite__c object does not exist');
    }

    // Try to create a test campsite with minimal fields
    if (!trails.isEmpty()) {
        Campsite__c testCampsite = new Campsite__c(
            Name = 'Test Campsite - ' + DateTime.now().format('yyyy-MM-dd HH:mm:ss'),
            Location__c = 'Test Location',
            Trail__c = trails[0].Id  // Associate with first trail
        );

        insert testCampsite;
        System.debug('✅ Successfully created test campsite with ID: ' + testCampsite.Id);

        // Query the created campsite to verify the Trail__c field
        Campsite__c createdCampsite = [
            SELECT Id, Name, Trail__c, Trail__r.Name
            FROM Campsite__c
            WHERE Id = :testCampsite.Id
        ];

        System.debug('Created Campsite: ' + createdCampsite.Name);
        System.debug('Associated Trail: ' + createdCampsite.Trail__r.Name);

        // Clean up - delete the test campsite
        delete createdCampsite;
        System.debug('✅ Test campsite deleted successfully');

    } else {
        System.debug('⚠️ No trails found - creating a test trail first');

        // Create a test trail
        Trail__c testTrail = new Trail__c(
            Name = 'Test Trail - ' + DateTime.now().format('yyyy-MM-dd HH:mm:ss')
        );

        insert testTrail;
        System.debug('✅ Created test trail: ' + testTrail.Name);

        // Now create the campsite
        Campsite__c testCampsite = new Campsite__c(
            Name = 'Test Campsite - ' + DateTime.now().format('yyyy-MM-dd HH:mm:ss'),
            Location__c = 'Test Location',
            Trail__c = testTrail.Id
        );

        insert testCampsite;
        System.debug('✅ Successfully created test campsite with trail association');

        // Clean up
        delete testCampsite;
        delete testTrail;
        System.debug('✅ Test records cleaned up');
    }

    System.debug('=== Test completed successfully ===');

} catch (Exception e) {
    System.debug('❌ Error during test: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
}
