/**
 * Script to set up profiles and permission sets for VinTrek application
 * Run this script in your Salesforce org to create the necessary profiles and permission sets
 */

// Create custom profiles if they don't exist
// Note: In a real implementation, you would typically clone standard profiles
// through the UI and then assign permissions. This is a simplified example.

try {
    // Check if VinTrek Admin profile exists
    List<Profile> adminProfiles = [SELECT Id, Name FROM Profile WHERE Name = 'VinTrek Admin' LIMIT 1];

    if (adminProfiles.isEmpty()) {
        System.debug('VinTrek Admin profile does not exist. Please create it through the Salesforce UI.');
        System.debug('Instructions: Setup > Users > Profiles > New Profile > Clone from "System Administrator"');
    } else {
        System.debug('VinTrek Admin profile exists with Id: ' + adminProfiles[0].Id);
    }

    // Check if VinTrek Service Provider profile exists
    List<Profile> serviceProfiles = [SELECT Id, Name FROM Profile WHERE Name = 'VinTrek Service Provider' LIMIT 1];

    if (serviceProfiles.isEmpty()) {
        System.debug('VinTrek Service Provider profile does not exist. Please create it through the Salesforce UI.');
        System.debug('Instructions: Setup > Users > Profiles > New Profile > Clone from "Standard User"');
    } else {
        System.debug('VinTrek Service Provider profile exists with Id: ' + serviceProfiles[0].Id);
    }

    // Check if VinTrek Camper profile exists
    List<Profile> camperProfiles = [SELECT Id, Name FROM Profile WHERE Name = 'VinTrek Camper' LIMIT 1];

    if (camperProfiles.isEmpty()) {
        System.debug('VinTrek Camper profile does not exist. Please create it through the Salesforce UI.');
        System.debug('Instructions: Setup > Users > Profiles > New Profile > Clone from "Standard User"');
    } else {
        System.debug('VinTrek Camper profile exists with Id: ' + camperProfiles[0].Id);
    }

    // Create permission sets
    createPermissionSetIfNotExists('VinTrek_Admin_Permissions', 'Grants administrative access to VinTrek application');
    createPermissionSetIfNotExists('VinTrek_ServiceProvider_Permissions', 'Grants service provider access to VinTrek application');
    createPermissionSetIfNotExists('VinTrek_Camper_Permissions', 'Grants camper access to VinTrek application');

    System.debug('Profile and permission set setup completed.');

} catch (Exception e) {
    System.debug('Error setting up profiles and permission sets: ' + e.getMessage());
    System.debug(e.getStackTraceString());
}

/**
 * Helper method to create a permission set if it doesn't exist
 */
void createPermissionSetIfNotExists(String permSetName, String description) {
    List<PermissionSet> existingPermSets = [SELECT Id, Name FROM PermissionSet WHERE Name = :permSetName LIMIT 1];

    if (existingPermSets.isEmpty()) {
        try {
            PermissionSet newPermSet = new PermissionSet(
                Name = permSetName,
                Label = permSetName.replace('_', ' '),
                Description = description
            );
            insert newPermSet;
            System.debug('Created permission set: ' + permSetName + ' with Id: ' + newPermSet.Id);

            // Assign object permissions based on the permission set type
            assignObjectPermissions(newPermSet.Id, permSetName);

        } catch (Exception e) {
            System.debug('Error creating permission set ' + permSetName + ': ' + e.getMessage());
        }
    } else {
        System.debug('Permission set ' + permSetName + ' already exists with Id: ' + existingPermSets[0].Id);
    }
}

/**
 * Helper method to assign object permissions to a permission set
 */
void assignObjectPermissions(Id permSetId, String permSetName) {
    try {
        List<ObjectPermissions> objectPermissions = new List<ObjectPermissions>();

        // Get the names of custom objects
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        String trailObjectName = globalDescribe.containsKey('Trail__c') ? 'Trail__c' : null;
        String camperProfileObjectName = globalDescribe.containsKey('Camper_Profile__c') ? 'Camper_Profile__c' : null;
        String campingItemObjectName = globalDescribe.containsKey('Camping_Item__c') ? 'Camping_Item__c' : null;
        String shopObjectName = globalDescribe.containsKey('Shop__c') ? 'Shop__c' : null;
        String rentalObjectName = globalDescribe.containsKey('Rental__c') ? 'Rental__c' : null;

        // Assign permissions based on permission set type
        if (permSetName == 'VinTrek_Admin_Permissions') {
            // Admin has full access to all objects
            if (trailObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, trailObjectName, true, true, true, true));
            }
            if (camperProfileObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, camperProfileObjectName, true, true, true, true));
            }
            if (campingItemObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, campingItemObjectName, true, true, true, true));
            }
            if (shopObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, shopObjectName, true, true, true, true));
            }
            if (rentalObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, rentalObjectName, true, true, true, true));
            }
        } else if (permSetName == 'VinTrek_ServiceProvider_Permissions') {
            // Service Provider has access to their shop and items
            if (shopObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, shopObjectName, true, true, false, false));
            }
            if (campingItemObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, campingItemObjectName, true, true, true, true));
            }
            if (rentalObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, rentalObjectName, true, true, false, false));
            }
            if (trailObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, trailObjectName, true, false, false, false));
            }
        } else if (permSetName == 'VinTrek_Camper_Permissions') {
            // Camper has read access to most objects, and can create/edit their own profile and rentals
            if (trailObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, trailObjectName, true, false, false, false));
            }
            if (camperProfileObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, camperProfileObjectName, true, true, true, false));
            }
            if (campingItemObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, campingItemObjectName, true, false, false, false));
            }
            if (shopObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, shopObjectName, true, false, false, false));
            }
            if (rentalObjectName != null) {
                objectPermissions.add(createObjectPermission(permSetId, rentalObjectName, true, true, true, false));
            }
        }

        if (!objectPermissions.isEmpty()) {
            insert objectPermissions;
            System.debug('Assigned object permissions for ' + permSetName);
        }

    } catch (Exception e) {
        System.debug('Error assigning object permissions for ' + permSetName + ': ' + e.getMessage());
    }
}

/**
 * Helper method to create an ObjectPermission record
 */
ObjectPermissions createObjectPermission(Id permSetId, String sobjectName, Boolean read, Boolean create, Boolean edit, Boolean del) {
    return new ObjectPermissions(
        ParentId = permSetId,
        SobjectType = sobjectName,
        PermissionsRead = read,
        PermissionsCreate = create,
        PermissionsEdit = edit,
        PermissionsDelete = del,
        PermissionsViewAllRecords = read,
        PermissionsModifyAllRecords = edit
    );
}
