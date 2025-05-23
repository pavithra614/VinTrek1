/**
 * Controller for user registration operations
 */
public with sharing class UserRegistrationController {

    /**
     * Register a new user
     * @param firstName - First name of the user
     * @param lastName - Last name of the user
     * @param email - Email of the user
     * @param username - Username for the user
     * @param communityNickname - Community nickname for the user
     * @param password - Password for the user
     * @param userType - Type of user (Camper, Service Provider)
     * @return String representing the user ID if successful, or an error message
     */
    @AuraEnabled
    public static String registerUser(String firstName, String lastName, String email,
                                     String username, String communityNickname,
                                     String password, String userType,
                                     String shopName, String shopLocation, String shopDescription) {
        try {
            // Validate inputs
            if (String.isBlank(firstName) || String.isBlank(lastName) ||
                String.isBlank(email) || String.isBlank(username) ||
                String.isBlank(communityNickname) || String.isBlank(password)) {
                return 'ERROR: All fields are required.';
            }

            // Check if username already exists
            List<User> existingUsers = [SELECT Id FROM User WHERE Username = :username LIMIT 1];
            if (!existingUsers.isEmpty()) {
                return 'ERROR: Username already exists.';
            }

            // Determine profile based on user type
            String profileName = 'VinTrek Camper'; // Default
            if (userType == 'Service Provider') {
                profileName = 'VinTrek Service Provider';
            }

            // Get profile ID
            List<Profile> profiles = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
            if (profiles.isEmpty()) {
                return 'ERROR: Profile not found. Please contact your administrator.';
            }
            Id profileId = profiles[0].Id;

            // Create the user
            User newUser = new User(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Username = username,
                CommunityNickname = communityNickname,
                ProfileId = profileId,
                LocaleSidKey = 'en_US',
                LanguageLocaleKey = 'en_US',
                EmailEncodingKey = 'UTF-8',
                TimeZoneSidKey = 'America/Los_Angeles'
            );

            // Create the user with a password
            String userId = Site.createExternalUser(newUser, null, password);

            // If user creation was successful, assign permission set
            if (String.isNotBlank(userId)) {
                assignPermissionSet(userId, userType);

                // Create related records based on user type
                if (userType == 'Camper') {
                    createCamperProfile(userId, firstName + ' ' + lastName);
                } else if (userType == 'Service Provider') {
                    createServiceProviderShop(userId, firstName + ' ' + lastName,
                                             shopName, shopLocation, shopDescription);
                }

                return userId;
            } else {
                return 'ERROR: Failed to create user.';
            }

        } catch (Exception e) {
            return 'ERROR: ' + e.getMessage();
        }
    }

    /**
     * Assign appropriate permission set to the user
     * @param userId - ID of the user
     * @param userType - Type of user (Camper, Service Provider)
     */
    private static void assignPermissionSet(String userId, String userType) {
        try {
            String permissionSetName = 'VinTrek_Camper_Permissions'; // Default
            if (userType == 'Service Provider') {
                permissionSetName = 'VinTrek_ServiceProvider_Permissions';
            }

            // Get permission set ID
            List<PermissionSet> permSets = [SELECT Id FROM PermissionSet WHERE Name = :permissionSetName LIMIT 1];
            if (!permSets.isEmpty()) {
                // Assign permission set to user
                PermissionSetAssignment psa = new PermissionSetAssignment(
                    AssigneeId = userId,
                    PermissionSetId = permSets[0].Id
                );
                insert psa;
            }
        } catch (Exception e) {
            System.debug('Error assigning permission set: ' + e.getMessage());
        }
    }

    /**
     * Create a Camper Profile record for a new camper user
     * @param userId - ID of the user
     * @param name - Name of the camper
     */
    private static void createCamperProfile(String userId, String name) {
        try {
            // Check if Camper_Profile__c object exists
            if (Schema.getGlobalDescribe().containsKey('Camper_Profile__c')) {
                // Create a dynamic SObject since we can't reference the object directly in code
                SObject camperProfile = Schema.getGlobalDescribe().get('Camper_Profile__c').newSObject();
                camperProfile.put('Name', name);
                camperProfile.put('User__c', userId);
                insert camperProfile;
            }
        } catch (Exception e) {
            System.debug('Error creating camper profile: ' + e.getMessage());
        }
    }

    /**
     * Create a Shop record for a new service provider user
     * @param userId - ID of the user
     * @param name - Name of the service provider
     */
    private static void createServiceProviderShop(String userId, String name,
                                          String shopName, String shopLocation, String shopDescription) {
        try {
            // Check if Shop__c object exists
            if (Schema.getGlobalDescribe().containsKey('Shop__c')) {
                // Create a dynamic SObject since we can't reference the object directly in code
                SObject shop = Schema.getGlobalDescribe().get('Shop__c').newSObject();

                // Use provided shop name or default to user's name + 's Shop
                shop.put('Name', String.isNotBlank(shopName) ? shopName : name + '\'s Shop');
                shop.put('Owner__c', userId);

                // Add additional shop information if provided
                if (String.isNotBlank(shopLocation)) {
                    shop.put('Location__c', shopLocation);
                }

                if (String.isNotBlank(shopDescription)) {
                    shop.put('Description__c', shopDescription);
                }

                insert shop;
            }
        } catch (Exception e) {
            System.debug('Error creating service provider shop: ' + e.getMessage());
        }
    }
}
