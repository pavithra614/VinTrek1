/**
 * Script to deploy the UserProfileService class
 * This script will create the UserProfileService class in your org
 */

// Define the class content
String classContent = 
'/**\n' +
' * Service class for user profile and authorization operations\n' +
' */\n' +
'public with sharing class UserProfileService {\n' +
'    \n' +
'    // User role constants\n' +
'    public static final String ROLE_ADMIN = \'Admin\';\n' +
'    public static final String ROLE_CAMPER = \'Camper\';\n' +
'    public static final String ROLE_SERVICE_PROVIDER = \'Service Provider\';\n' +
'    \n' +
'    /**\n' +
'     * Get the current user\'s role\n' +
'     * @return String representing the user\'s role\n' +
'     */\n' +
'    @AuraEnabled(cacheable=true)\n' +
'    public static String getCurrentUserRole() {\n' +
'        // Get the current user\'s ID\n' +
'        Id userId = UserInfo.getUserId();\n' +
'        \n' +
'        try {\n' +
'            // Query for the user\'s profile\n' +
'            User currentUser = [\n' +
'                SELECT Id, Profile.Name, UserRole.Name\n' +
'                FROM User\n' +
'                WHERE Id = :userId\n' +
'                LIMIT 1\n' +
'            ];\n' +
'            \n' +
'            // Determine role based on profile or custom field\n' +
'            // This is a simplified example - in a real implementation, you might use\n' +
'            // custom fields, permission sets, or other criteria to determine roles\n' +
'            String profileName = currentUser.Profile.Name;\n' +
'            \n' +
'            if (profileName.containsIgnoreCase(\'Admin\') || profileName.containsIgnoreCase(\'System\')) {\n' +
'                return ROLE_ADMIN;\n' +
'            } else if (profileName.containsIgnoreCase(\'Service\')) {\n' +
'                return ROLE_SERVICE_PROVIDER;\n' +
'            } else {\n' +
'                return ROLE_CAMPER; // Default role for standard users\n' +
'            }\n' +
'        } catch (Exception e) {\n' +
'            throw new AuraHandledException(\'Error retrieving user role: \' + e.getMessage());\n' +
'        }\n' +
'    }\n' +
'    \n' +
'    /**\n' +
'     * Check if the current user has admin access\n' +
'     * @return Boolean indicating if user is an admin\n' +
'     */\n' +
'    @AuraEnabled(cacheable=true)\n' +
'    public static Boolean isCurrentUserAdmin() {\n' +
'        return getCurrentUserRole() == ROLE_ADMIN;\n' +
'    }\n' +
'    \n' +
'    /**\n' +
'     * Check if the current user is a service provider\n' +
'     * @return Boolean indicating if user is a service provider\n' +
'     */\n' +
'    @AuraEnabled(cacheable=true)\n' +
'    public static Boolean isCurrentUserServiceProvider() {\n' +
'        return getCurrentUserRole() == ROLE_SERVICE_PROVIDER;\n' +
'    }\n' +
'    \n' +
'    /**\n' +
'     * Check if the current user is a camper (regular user)\n' +
'     * @return Boolean indicating if user is a camper\n' +
'     */\n' +
'    @AuraEnabled(cacheable=true)\n' +
'    public static Boolean isCurrentUserCamper() {\n' +
'        return getCurrentUserRole() == ROLE_CAMPER;\n' +
'    }\n' +
'    \n' +
'    /**\n' +
'     * Get the current user\'s information\n' +
'     * @return User object with basic information\n' +
'     */\n' +
'    @AuraEnabled(cacheable=true)\n' +
'    public static User getCurrentUserInfo() {\n' +
'        Id userId = UserInfo.getUserId();\n' +
'        \n' +
'        try {\n' +
'            return [\n' +
'                SELECT Id, Name, Email, SmallPhotoUrl, Profile.Name\n' +
'                FROM User\n' +
'                WHERE Id = :userId\n' +
'                LIMIT 1\n' +
'            ];\n' +
'        } catch (Exception e) {\n' +
'            throw new AuraHandledException(\'Error retrieving user information: \' + e.getMessage());\n' +
'        }\n' +
'    }\n' +
'}\n';

// Create the class in the org
System.debug('Attempting to create UserProfileService class...');

try {
    // Check if the class already exists
    List<ApexClass> existingClasses = [SELECT Id, Name FROM ApexClass WHERE Name = 'UserProfileService' LIMIT 1];
    
    if (!existingClasses.isEmpty()) {
        System.debug('UserProfileService class already exists with ID: ' + existingClasses[0].Id);
    } else {
        // Create the class
        ApexClass newClass = new ApexClass();
        newClass.Name = 'UserProfileService';
        newClass.Body = classContent;
        insert newClass;
        
        System.debug('UserProfileService class created successfully with ID: ' + newClass.Id);
    }
} catch (Exception e) {
    System.debug('Error creating UserProfileService class: ' + e.getMessage());
    System.debug(e.getStackTraceString());
}
