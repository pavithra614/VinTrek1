public with sharing class TrailController {
    @AuraEnabled(cacheable=true)
    public static List<Trail__c> getTrails() {
        return [
            SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                   Location__c, Elevation_m__c
            FROM Trail__c
            ORDER BY Name ASC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Trail__c> getFilteredTrails(String difficulty, Decimal minDistance, Decimal maxDistance) {
        String query = 'SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c, ' +
                      'Location__c, Elevation_m__c ' +
                      'FROM Trail__c WHERE ';

        List<String> conditions = new List<String>();
        List<Object> params = new List<Object>();

        if (difficulty != 'All') {
            conditions.add('Difficulty__c = :difficulty');
            params.add(difficulty);
        }

        if (minDistance != null) {
            conditions.add('Distance_km__c >= :minDistance');
            params.add(minDistance);
        }

        if (maxDistance != null) {
            conditions.add('Distance_km__c <= :maxDistance');
            params.add(maxDistance);
        }

        if (conditions.isEmpty()) {
            query = query.substring(0, query.lastIndexOf('WHERE'));
        } else {
            query += String.join(conditions, ' AND ');
        }

        query += ' ORDER BY Name ASC';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static Trail__c getTrailById(Id trailId) {
        return [
            SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                   Location__c, Elevation_m__c
            FROM Trail__c
            WHERE Id = :trailId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static Id saveTrail(Trail__c trail) {
        try {
            upsert trail;
            return trail.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving trail: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean deleteTrail(Id trailId) {
        try {
            Trail__c trail = [SELECT Id FROM Trail__c WHERE Id = :trailId LIMIT 1];
            delete trail;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting trail: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Trail__c> getAllTrailsForAdmin() {
        return [
            SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                   Location__c, Elevation_m__c, CreatedDate, LastModifiedDate
            FROM Trail__c
            ORDER BY Name ASC
        ];
    }
}
