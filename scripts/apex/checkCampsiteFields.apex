// Simple script to check what fields exist on Campsite__c
System.debug('=== Checking Campsite__c Fields ===');

try {
    // Check if Campsite__c object exists
    Schema.SObjectType campsiteType = Schema.getGlobalDescribe().get('Campsite__c');
    if (campsiteType != null) {
        System.debug('✅ Campsite__c object exists');
        
        // Get all fields
        Map<String, Schema.SObjectField> fields = campsiteType.getDescribe().fields.getMap();
        System.debug('Total fields found: ' + fields.size());
        
        // List all fields
        for (String fieldName : fields.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fields.get(fieldName).getDescribe();
            System.debug('Field: ' + fieldName + ' (' + fieldDescribe.getLabel() + ') - Type: ' + fieldDescribe.getType());
        }
        
        // Specifically check for Trail__c field
        if (fields.containsKey('trail__c')) {
            System.debug('✅ Trail__c field exists (lowercase key)');
        } else if (fields.containsKey('Trail__c')) {
            System.debug('✅ Trail__c field exists (proper case key)');
        } else {
            System.debug('❌ Trail__c field NOT found');
        }
        
    } else {
        System.debug('❌ Campsite__c object does not exist');
    }
    
} catch (Exception e) {
    System.debug('❌ Error: ' + e.getMessage());
}
