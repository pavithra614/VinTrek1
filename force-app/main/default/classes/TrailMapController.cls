/**
 * Controller for the Enhanced Trail Map component
 */
public with sharing class TrailMapController {
    
    /**
     * Get trail details including path coordinates
     * @param trailId - Id of the trail to get details for
     * @return Trail__c - Trail details
     */
    @AuraEnabled(cacheable=true)
    public static Trail__c getTrailDetails(Id trailId) {
        try {
            return [
                SELECT Id, Name, Description__c, Difficulty__c, Trail_Type__c, 
                       Length_km__c, Elevation_Gain__c, Start_Location__c, End_Location__c,
                       Latitude__c, Longitude__c, Path_Coordinates__c, Image_URL__c
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
     * Get campsites near a trail
     * @param trailId - Id of the trail to find nearby campsites for
     * @return List<Campsite__c> - List of nearby campsites
     */
    @AuraEnabled(cacheable=true)
    public static List<Campsite__c> getNearbyCampsites(Id trailId) {
        try {
            // Get the trail
            Trail__c trail = [
                SELECT Id, Latitude__c, Longitude__c
                FROM Trail__c
                WHERE Id = :trailId
                LIMIT 1
            ];
            
            // If trail has no coordinates, return campsites directly associated with the trail
            if (trail.Latitude__c == null || trail.Longitude__c == null) {
                return [
                    SELECT Id, Name, Description__c, Daily_Fee__c, Capacity__c, 
                           Facilities__c, Latitude__c, Longitude__c, Trail__c
                    FROM Campsite__c
                    WHERE Trail__c = :trailId
                    ORDER BY Name
                ];
            }
            
            // Otherwise, find campsites within a certain distance of the trail
            // Note: This is a simplified approach. In a real implementation, you would use
            // a more sophisticated distance calculation or a geolocation query
            Decimal latitude = trail.Latitude__c;
            Decimal longitude = trail.Longitude__c;
            
            // Define search radius (approximately 10km)
            Decimal latDelta = 0.1; // Roughly 10km in latitude
            Decimal longDelta = 0.1; // Roughly 10km in longitude at the equator
            
            return [
                SELECT Id, Name, Description__c, Daily_Fee__c, Capacity__c, 
                       Facilities__c, Latitude__c, Longitude__c, Trail__c
                FROM Campsite__c
                WHERE (Latitude__c >= :latitude - :latDelta AND Latitude__c <= :latitude + :latDelta)
                AND (Longitude__c >= :longitude - :longDelta AND Longitude__c <= :longitude + :longDelta)
                ORDER BY Name
                LIMIT 50
            ];
        } catch (Exception e) {
            System.debug('Error getting nearby campsites: ' + e.getMessage());
            throw new AuraHandledException('Error getting nearby campsites: ' + e.getMessage());
        }
    }
    
    /**
     * Get all trails for the map
     * @return List<Trail__c> - List of all trails with coordinates
     */
    @AuraEnabled(cacheable=true)
    public static List<Trail__c> getAllTrails() {
        try {
            return [
                SELECT Id, Name, Difficulty__c, Length_km__c, 
                       Latitude__c, Longitude__c
                FROM Trail__c
                WHERE Latitude__c != null AND Longitude__c != null
                ORDER BY Name
            ];
        } catch (Exception e) {
            System.debug('Error getting all trails: ' + e.getMessage());
            throw new AuraHandledException('Error getting all trails: ' + e.getMessage());
        }
    }
}
