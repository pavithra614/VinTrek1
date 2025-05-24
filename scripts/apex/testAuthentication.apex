/**
 * Script to test the authentication and authorization flow
 * Run this script in your Salesforce org to verify the setup
 */

// Test user profile service
try {
    // Get the current user's ID
    Id userId = UserInfo.getUserId();

    // Get the current user's profile
    User currentUser = [
        SELECT Id, Name, Email, Profile.Name
        FROM User
        WHERE Id = :userId
        LIMIT 1
    ];

    // Determine role based on profile
    String profileName = currentUser.Profile.Name;
    String currentUserRole;

    if (profileName.containsIgnoreCase('Admin') || profileName.containsIgnoreCase('System')) {
        currentUserRole = 'Admin';
    } else if (profileName.containsIgnoreCase('Service')) {
        currentUserRole = 'Service Provider';
    } else {
        currentUserRole = 'Camper';
    }

    System.debug('Current user role: ' + currentUserRole);

    // Check if current user is admin
    Boolean isAdmin = (currentUserRole == 'Admin');
    System.debug('Is current user admin? ' + isAdmin);

    // Check if current user is service provider
    Boolean isServiceProvider = (currentUserRole == 'Service Provider');
    System.debug('Is current user service provider? ' + isServiceProvider);

    // Check if current user is camper
    Boolean isCamper = (currentUserRole == 'Camper');
    System.debug('Is current user camper? ' + isCamper);

    System.debug('Current user: ' + currentUser.Name + ' (' + currentUser.Email + ')');

    System.debug('User profile service tests completed successfully.');
} catch (Exception e) {
    System.debug('Error testing user profile service: ' + e.getMessage());
    System.debug(e.getStackTraceString());
}

// Test navigation access
try {
    // Get the current user's ID
    Id userId = UserInfo.getUserId();

    // Get the current user's profile
    User user = [SELECT Id, Name, Profile.Name FROM User WHERE Id = :userId LIMIT 1];
    System.debug('Current user profile: ' + user.Profile.Name);

    // Determine which pages the user should have access to
    Boolean shouldAccessAdminHome = user.Profile.Name.containsIgnoreCase('Admin') || user.Profile.Name.containsIgnoreCase('System');
    Boolean shouldAccessServiceProviderHome = user.Profile.Name.containsIgnoreCase('Service');
    Boolean shouldAccessCamperHome = !shouldAccessAdminHome && !shouldAccessServiceProviderHome;

    System.debug('Should access Admin Home? ' + shouldAccessAdminHome);
    System.debug('Should access Service Provider Home? ' + shouldAccessServiceProviderHome);
    System.debug('Should access Camper Home? ' + shouldAccessCamperHome);

    System.debug('Navigation access tests completed successfully.');
} catch (Exception e) {
    System.debug('Error testing navigation access: ' + e.getMessage());
    System.debug(e.getStackTraceString());
}

// Test permission sets
try {
    // Get the current user's ID
    Id userId = UserInfo.getUserId();

    // Check which permission sets are assigned to the current user
    List<PermissionSetAssignment> permSetAssignments = [
        SELECT PermissionSet.Name, PermissionSet.Label
        FROM PermissionSetAssignment
        WHERE AssigneeId = :userId
    ];

    System.debug('Permission sets assigned to current user:');
    for (PermissionSetAssignment psa : permSetAssignments) {
        System.debug('- ' + psa.PermissionSet.Label + ' (' + psa.PermissionSet.Name + ')');
    }

    // Check if the user has the appropriate VinTrek permission set
    Boolean hasVinTrekAdminPermSet = false;
    Boolean hasVinTrekServiceProviderPermSet = false;
    Boolean hasVinTrekCamperPermSet = false;

    for (PermissionSetAssignment psa : permSetAssignments) {
        if (psa.PermissionSet.Name == 'VinTrek_Admin_Permissions') {
            hasVinTrekAdminPermSet = true;
        } else if (psa.PermissionSet.Name == 'VinTrek_ServiceProvider_Permissions') {
            hasVinTrekServiceProviderPermSet = true;
        } else if (psa.PermissionSet.Name == 'VinTrek_Camper_Permissions') {
            hasVinTrekCamperPermSet = true;
        }
    }

    System.debug('Has VinTrek Admin permission set? ' + hasVinTrekAdminPermSet);
    System.debug('Has VinTrek Service Provider permission set? ' + hasVinTrekServiceProviderPermSet);
    System.debug('Has VinTrek Camper permission set? ' + hasVinTrekCamperPermSet);

    System.debug('Permission set tests completed successfully.');
} catch (Exception e) {
    System.debug('Error testing permission sets: ' + e.getMessage());
    System.debug(e.getStackTraceString());
}

System.debug('Authentication and authorization tests completed.');
