// Create a single trail to test
Trail__c trail = new Trail__c();
trail.Name = 'Test Trail';
// Uncomment fields one by one to test
// trail.Description__c = 'Test description';
// trail.Difficulty__c = 'Moderate';
// trail.Distance_km__c = 5.0;
// trail.Location__c = 'Test Location';
// trail.Elevation_m__c = 1000;

try {
    insert trail;
    System.debug('Trail created successfully with ID: ' + trail.Id);
} catch (Exception e) {
    System.debug('Error creating trail: ' + e.getMessage());
}

// Try to query the Trail object to see its structure
try {
    List<Trail__c> trails = [SELECT Id, Name FROM Trail__c LIMIT 10];
    System.debug('Queried ' + trails.size() + ' trails');
    for (Trail__c t : trails) {
        System.debug('Trail: ' + t);
    }
} catch (Exception e) {
    System.debug('Error querying trails: ' + e.getMessage());
}

// Describe the Trail__c object to see its fields
try {
    Schema.DescribeSObjectResult describeResult = Trail__c.SObjectType.getDescribe();
    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
    System.debug('Fields on Trail__c:');
    for (String fieldName : fieldMap.keySet()) {
        System.debug('  ' + fieldName);
    }
} catch (Exception e) {
    System.debug('Error describing Trail__c: ' + e.getMessage());
}
