public with sharing class BookingController {
    @AuraEnabled
    public static Id createBooking(Map<String, Object> bookingData) {
        // Extract data from the map
        Id trailId = (Id)bookingData.get('trailId');
        Id campsiteId = (Id)bookingData.get('campsiteId');
        Date startDate = Date.valueOf((String)bookingData.get('startDate'));
        Date endDate = Date.valueOf((String)bookingData.get('endDate'));
        Integer numberOfPeople = Integer.valueOf(bookingData.get('numberOfPeople'));
        
        // Create new booking record
        Booking__c booking = new Booking__c();
        booking.Trail__c = trailId;
        booking.Campsite__c = campsiteId;
        booking.Start_Date__c = startDate;
        booking.End_Date__c = endDate;
        booking.Status__c = 'Pending';
        
        // Insert booking
        try {
            insert booking;
            return booking.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating booking: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Booking__c> getUserBookings() {
        // In a real implementation, this would filter by the current user
        return [
            SELECT Id, Name, Trail__c, Trail__r.Name, Campsite__c, Campsite__r.Name,
                   Start_Date__c, End_Date__c, Status__c
            FROM Booking__c
            ORDER BY Start_Date__c DESC
            LIMIT 100
        ];
    }
    
    @AuraEnabled
    public static Boolean cancelBooking(Id bookingId) {
        try {
            Booking__c booking = [SELECT Id, Status__c FROM Booking__c WHERE Id = :bookingId LIMIT 1];
            booking.Status__c = 'Cancelled';
            update booking;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error cancelling booking: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Boolean checkAvailability(Id campsiteId, Date startDate, Date endDate) {
        // Check if there are any overlapping bookings
        Integer overlappingBookings = [
            SELECT COUNT()
            FROM Booking__c
            WHERE Campsite__c = :campsiteId
            AND Status__c != 'Cancelled'
            AND (
                (Start_Date__c <= :startDate AND End_Date__c >= :startDate) OR
                (Start_Date__c <= :endDate AND End_Date__c >= :endDate) OR
                (Start_Date__c >= :startDate AND End_Date__c <= :endDate)
            )
        ];
        
        return overlappingBookings == 0;
    }
}
