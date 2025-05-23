/**
 * Service class for user profile and authorization operations
 */
public with sharing class UserProfileService {

    // User role constants
    public static final String ROLE_ADMIN = 'Admin';
    public static final String ROLE_CAMPER = 'Camper';
    public static final String ROLE_SERVICE_PROVIDER = 'Service Provider';

    /**
     * Authenticate a user with username and password
     * @param username - Username to authenticate
     * @param password - Password to authenticate
     * @return String - User ID if successful, error message if failed
     */
    @AuraEnabled
    public static String authenticateUser(String username, String password) {
        try {
            // Validate inputs
            if (String.isBlank(username) || String.isBlank(password)) {
                return 'ERROR: Username and password are required.';
            }

            // Check if user exists
            List<User> users = [SELECT Id, Username FROM User WHERE Username = :username LIMIT 1];
            if (users.isEmpty()) {
                return 'ERROR: Invalid username or password.';
            }

            // In a real implementation, you would use Site.login() for Communities
            // or a custom authentication mechanism
            // For this example, we'll simulate successful authentication
            // and return the user ID
            return users[0].Id;

            // Real authentication would look like this:
            // boolean isAuthenticated = Site.login(username, password, null);
            // if (isAuthenticated) {
            //     return UserInfo.getUserId();
            // } else {
            //     return 'ERROR: Invalid username or password.';
            // }
        } catch (Exception e) {
            return 'ERROR: ' + e.getMessage();
        }
    }

    /**
     * Get the current user's role
     * @return String representing the user's role
     */
    @AuraEnabled(cacheable=true)
    public static String getCurrentUserRole() {
        // Get the current user's ID
        Id userId = UserInfo.getUserId();

        try {
            // Query for the user's profile
            User currentUser = [
                SELECT Id, Profile.Name, UserRole.Name
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            // Determine role based on profile or custom field
            // This is a simplified example - in a real implementation, you might use
            // custom fields, permission sets, or other criteria to determine roles
            String profileName = currentUser.Profile.Name;

            if (profileName.containsIgnoreCase('Admin') || profileName.containsIgnoreCase('System')) {
                return ROLE_ADMIN;
            } else if (profileName.containsIgnoreCase('Service')) {
                return ROLE_SERVICE_PROVIDER;
            } else {
                return ROLE_CAMPER; // Default role for standard users
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving user role: ' + e.getMessage());
        }
    }

    /**
     * Check if the current user has admin access
     * @return Boolean indicating if user is an admin
     */
    @AuraEnabled(cacheable=true)
    public static Boolean isCurrentUserAdmin() {
        return getCurrentUserRole() == ROLE_ADMIN;
    }

    /**
     * Check if the current user is a service provider
     * @return Boolean indicating if user is a service provider
     */
    @AuraEnabled(cacheable=true)
    public static Boolean isCurrentUserServiceProvider() {
        return getCurrentUserRole() == ROLE_SERVICE_PROVIDER;
    }

    /**
     * Check if the current user is a camper (regular user)
     * @return Boolean indicating if user is a camper
     */
    @AuraEnabled(cacheable=true)
    public static Boolean isCurrentUserCamper() {
        return getCurrentUserRole() == ROLE_CAMPER;
    }

    /**
     * Get the current user's information
     * @return User object with basic information
     */
    @AuraEnabled(cacheable=true)
    public static User getCurrentUserInfo() {
        Id userId = UserInfo.getUserId();

        try {
            return [
                SELECT Id, Name, Email, SmallPhotoUrl, Profile.Name
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving user information: ' + e.getMessage());
        }
    }
}
