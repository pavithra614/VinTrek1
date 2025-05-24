/**
 * Controller for User related operations
 */
public with sharing class UserController {

    /**
     * Get all users (for admin view)
     * @return List of User records
     */
    @AuraEnabled(cacheable=true)
    public static List<User> getUsers() {
        try {
            return [
                SELECT Id, Name, Email, Username, Profile.Name, IsActive,
                       CreatedDate, LastLoginDate
                FROM User
                WHERE IsActive = true
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving users: ' + e.getMessage());
        }
    }

    /**
     * Get user profiles
     * @return List of Profile records
     */
    @AuraEnabled(cacheable=true)
    public static List<Profile> getUserProfiles() {
        try {
            return [
                SELECT Id, Name
                FROM Profile
                WHERE Name IN ('System Administrator', 'Standard User', 'Camper', 'Service Provider')
                ORDER BY Name ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving profiles: ' + e.getMessage());
        }
    }

    /**
     * Create a new user
     * @param userData - Map containing user data
     * @return Id of the created user
     */
    @AuraEnabled
    public static Id createUser(Map<String, Object> userData) {
        try {
            User newUser = new User();
            newUser.FirstName = (String) userData.get('FirstName');
            newUser.LastName = (String) userData.get('LastName');
            newUser.Email = (String) userData.get('Email');
            newUser.Username = (String) userData.get('Username');
            newUser.Alias = ((String) userData.get('FirstName')).substring(0, 1) + 
                           ((String) userData.get('LastName')).substring(0, Math.min(7, ((String) userData.get('LastName')).length()));
            newUser.ProfileId = (String) userData.get('ProfileId');
            newUser.TimeZoneSidKey = 'America/New_York';
            newUser.LocaleSidKey = 'en_US';
            newUser.EmailEncodingKey = 'UTF-8';
            newUser.LanguageLocaleKey = 'en_US';
            
            insert newUser;
            return newUser.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating user: ' + e.getMessage());
        }
    }

    /**
     * Update user status (activate/deactivate)
     * @param userId - Id of the user to update
     * @param isActive - Boolean indicating if user should be active
     * @return Boolean indicating success
     */
    @AuraEnabled
    public static Boolean updateUserStatus(Id userId, Boolean isActive) {
        try {
            User userToUpdate = [SELECT Id, IsActive FROM User WHERE Id = :userId];
            userToUpdate.IsActive = isActive;
            update userToUpdate;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating user status: ' + e.getMessage());
        }
    }
}
