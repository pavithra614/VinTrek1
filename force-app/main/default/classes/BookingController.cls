/**
 * Controller for the Booking Form component
 */
public with sharing class BookingController {

    /**
     * Get trail details
     * @param trailId - Id of the trail to get details for
     * @return Trail__c - Trail details
     */
    @AuraEnabled
    public static Trail__c getTrailDetails(Id trailId) {
        try {
            return [
                SELECT Id, Name, Description__c, Difficulty__c, Trail_Type__c,
                       Length_km__c, Elevation_Gain__c, Image_URL__c
                FROM Trail__c
                WHERE Id = :trailId
                LIMIT 1
            ];
        } catch (Exception e) {
            System.debug('Error getting trail details: ' + e.getMessage());
            throw new AuraHandledException('Error getting trail details: ' + e.getMessage());
        }
    }

    /**
     * Get campsite details
     * @param campsiteId - Id of the campsite to get details for
     * @return Campsite__c - Campsite details
     */
    @AuraEnabled
    public static Campsite__c getCampsiteDetails(Id campsiteId) {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Fee__c, Capacity__c,
                       Facilities__c, Image_URL__c, Trail__c
                FROM Campsite__c
                WHERE Id = :campsiteId
                LIMIT 1
            ];
        } catch (Exception e) {
            System.debug('Error getting campsite details: ' + e.getMessage());
            throw new AuraHandledException('Error getting campsite details: ' + e.getMessage());
        }
    }

    /**
     * Get camping item details
     * @param campingItemIds - List of camping item Ids to get details for
     * @return List<Camping_Item__c> - List of camping item details
     */
    @AuraEnabled
    public static List<Camping_Item__c> getCampingItemDetails(List<Id> campingItemIds) {
        try {
            return [
                SELECT Id, Name, Description__c, Daily_Fee__c, Condition__c,
                       Category__c, Image_URL__c
                FROM Camping_Item__c
                WHERE Id IN :campingItemIds
            ];
        } catch (Exception e) {
            System.debug('Error getting camping item details: ' + e.getMessage());
            throw new AuraHandledException('Error getting camping item details: ' + e.getMessage());
        }
    }

    /**
     * Get user profile
     * @param userId - Id of the user to get profile for
     * @return Camper_Profile__c - User's camper profile
     */
    @AuraEnabled
    public static Camper_Profile__c getUserProfile(Id userId) {
        try {
            List<Camper_Profile__c> profiles = [
                SELECT Id, Name, Fitness_Level__c, Preferred_Trail_Types__c,
                       Preferred_Difficulty__c, User__c
                FROM Camper_Profile__c
                WHERE User__c = :userId
                LIMIT 1
            ];

            if (profiles.isEmpty()) {
                // Create a new profile if one doesn't exist
                Camper_Profile__c newProfile = new Camper_Profile__c(
                    Name = UserInfo.getName() + ' Profile',
                    User__c = userId
                );

                insert newProfile;
                return newProfile;
            }

            return profiles[0];
        } catch (Exception e) {
            System.debug('Error getting user profile: ' + e.getMessage());
            throw new AuraHandledException('Error getting user profile: ' + e.getMessage());
        }
    }
    /**
     * Create a booking
     * @param bookingData - Map containing booking details
     * @return Id - Id of the created booking
     */
    @AuraEnabled
    public static Id createBooking(Map<String, Object> bookingData) {
        try {
            // Get current user's camper profile
            List<Camper_Profile__c> profiles = [
                SELECT Id
                FROM Camper_Profile__c
                WHERE User__c = :UserInfo.getUserId()
                LIMIT 1
            ];

            if (profiles.isEmpty()) {
                throw new AuraHandledException('No camper profile found for current user');
            }

            // Extract data from the map
            Id trailId = bookingData.get('trailId') != null ? (Id)bookingData.get('trailId') : null;
            Id campsiteId = bookingData.get('campsiteId') != null ? (Id)bookingData.get('campsiteId') : null;
            Date startDate = Date.valueOf((String)bookingData.get('startDate'));
            Date endDate = Date.valueOf((String)bookingData.get('endDate'));
            Integer numberOfPeople = Integer.valueOf(bookingData.get('numberOfPeople'));
            String specialRequests = bookingData.get('specialRequests') != null ? (String)bookingData.get('specialRequests') : '';

            // Create new rental record
            Rental__c rental = new Rental__c();
            rental.Camper_Profile__c = profiles[0].Id;
            rental.Trail__c = trailId;
            rental.Campsite__c = campsiteId;
            rental.Start_Date__c = startDate;
            rental.End_Date__c = endDate;
            rental.Number_of_People__c = numberOfPeople;
            rental.Special_Requests__c = specialRequests;

            // Insert rental
            insert rental;

            // Add camping items if provided
            if (bookingData.containsKey('campingItemIds') && bookingData.get('campingItemIds') != null) {
                List<Object> itemIdsObj = (List<Object>)bookingData.get('campingItemIds');
                List<Id> itemIds = new List<Id>();

                for (Object itemId : itemIdsObj) {
                    itemIds.add((Id)itemId);
                }

                if (!itemIds.isEmpty()) {
                    List<Rental_Item__c> rentalItems = new List<Rental_Item__c>();

                    for (Id itemId : itemIds) {
                        Rental_Item__c rentalItem = new Rental_Item__c();
                        rentalItem.Rental__c = rental.Id;
                        rentalItem.Camping_Item__c = itemId;
                        rentalItems.add(rentalItem);
                    }

                    if (!rentalItems.isEmpty()) {
                        insert rentalItems;
                    }
                }
            }

            return rental.Id;
        } catch (Exception e) {
            System.debug('Error creating booking: ' + e.getMessage());
            throw new AuraHandledException('Error creating booking: ' + e.getMessage());
        }
    }

    /**
     * Get user's bookings
     * @return List<Rental__c> - List of user's bookings
     */
    @AuraEnabled(cacheable=true)
    public static List<Rental__c> getUserBookings() {
        try {
            // Get current user's camper profile
            List<Camper_Profile__c> profiles = [
                SELECT Id
                FROM Camper_Profile__c
                WHERE User__c = :UserInfo.getUserId()
                LIMIT 1
            ];

            if (profiles.isEmpty()) {
                return new List<Rental__c>();
            }

            // Get bookings
            return [
                SELECT Id, Name, Start_Date__c, End_Date__c, Number_of_People__c,
                       Special_Requests__c, Trail__r.Name, Campsite__r.Name,
                       CreatedDate
                FROM Rental__c
                WHERE Camper_Profile__c = :profiles[0].Id
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug('Error getting user bookings: ' + e.getMessage());
            throw new AuraHandledException('Error getting user bookings: ' + e.getMessage());
        }
    }

    /**
     * Cancel a booking
     * @param bookingId - Id of the booking to cancel
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean cancelBooking(Id bookingId) {
        try {
            // Get booking
            Rental__c booking = [
                SELECT Id, Camper_Profile__r.User__c
                FROM Rental__c
                WHERE Id = :bookingId
                LIMIT 1
            ];

            // Check if current user owns the booking
            if (booking.Camper_Profile__r.User__c != UserInfo.getUserId()) {
                throw new AuraHandledException('You can only cancel your own bookings');
            }

            // Delete booking
            delete booking;

            return true;
        } catch (Exception e) {
            System.debug('Error canceling booking: ' + e.getMessage());
            throw new AuraHandledException('Error canceling booking: ' + e.getMessage());
        }
    }

    /**
     * Check availability for a campsite
     * @param campsiteId - Id of the campsite to check
     * @param startDate - Start date of the range to check
     * @param endDate - End date of the range to check
     * @return Boolean - True if available, false otherwise
     */
    @AuraEnabled(cacheable=true)
    public static Boolean checkAvailability(Id campsiteId, Date startDate, Date endDate) {
        try {
            // Check if there are any overlapping bookings
            Integer overlappingBookings = [
                SELECT COUNT()
                FROM Rental__c
                WHERE Campsite__c = :campsiteId
                AND (
                    (Start_Date__c <= :startDate AND End_Date__c >= :startDate) OR
                    (Start_Date__c <= :endDate AND End_Date__c >= :endDate) OR
                    (Start_Date__c >= :startDate AND End_Date__c <= :endDate)
                )
            ];

            // Check if there are any unavailability records
            Integer unavailabilityRecords = [
                SELECT COUNT()
                FROM Availability__c
                WHERE Campsite__c = :campsiteId
                AND Status__c != 'Available'
                AND (
                    (Start_Date__c <= :startDate AND End_Date__c >= :startDate) OR
                    (Start_Date__c <= :endDate AND End_Date__c >= :endDate) OR
                    (Start_Date__c >= :startDate AND End_Date__c <= :endDate)
                )
            ];

            return (overlappingBookings == 0 && unavailabilityRecords == 0);
        } catch (Exception e) {
            System.debug('Error checking availability: ' + e.getMessage());
            throw new AuraHandledException('Error checking availability: ' + e.getMessage());
        }
    }
}
