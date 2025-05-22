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
}
