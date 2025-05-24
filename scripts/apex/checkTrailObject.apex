// Check if Trail__c object exists
System.debug('=== Checking Trail__c Object ===');

try {
    // Check if Trail__c object exists
    Schema.SObjectType trailType = Schema.getGlobalDescribe().get('Trail__c');
    if (trailType != null) {
        System.debug('✅ Trail__c object exists');
        
        // Try to query trails
        List<Trail__c> trails = [SELECT Id, Name FROM Trail__c LIMIT 5];
        System.debug('Found ' + trails.size() + ' trails');
        
        for (Trail__c trail : trails) {
            System.debug('Trail: ' + trail.Name + ' (ID: ' + trail.Id + ')');
        }
        
    } else {
        System.debug('❌ Trail__c object does not exist');
    }
    
} catch (Exception e) {
    System.debug('❌ Error: ' + e.getMessage());
}
