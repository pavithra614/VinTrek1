/**
 * Controller for Trail Recommendations using Einstein AI
 * Provides personalized trail suggestions based on user preferences and history
 */
public with sharing class TrailRecommendationController {
    
    /**
     * Get recommended trails for a specific user
     * @param userId - The Id of the user to get recommendations for
     * @return List<Trail__c> - List of recommended trails
     */
    @AuraEnabled(cacheable=true)
    public static List<Trail__c> getRecommendedTrails(Id userId) {
        try {
            // Get the user's camper profile
            Camper_Profile__c camperProfile = [
                SELECT Id, Fitness_Level__c, Preferred_Trail_Types__c, 
                       Preferred_Difficulty__c, Last_Trail_Id__c
                FROM Camper_Profile__c 
                WHERE User__c = :userId 
                LIMIT 1
            ];
            
            // If no camper profile exists, return popular trails
            if (camperProfile == null) {
                return getPopularTrails();
            }
            
            // Get trails based on user preferences
            List<Trail__c> recommendedTrails = new List<Trail__c>();
            
            // First, add trails similar to the last trail visited (if any)
            if (camperProfile.Last_Trail_Id__c != null) {
                Trail__c lastTrail = [
                    SELECT Id, Difficulty__c, Trail_Type__c, Length_km__c 
                    FROM Trail__c 
                    WHERE Id = :camperProfile.Last_Trail_Id__c
                    LIMIT 1
                ];
                
                // Find similar trails
                recommendedTrails.addAll([
                    SELECT Id, Name, Description__c, Difficulty__c, Trail_Type__c, 
                           Length_km__c, Elevation_Gain__c, Image_URL__c, 
                           Start_Location__c, End_Location__c, Latitude__c, Longitude__c
                    FROM Trail__c
                    WHERE Id != :lastTrail.Id
                    AND Difficulty__c = :lastTrail.Difficulty__c
                    AND Trail_Type__c = :lastTrail.Trail_Type__c
                    ORDER BY CreatedDate DESC
                    LIMIT 3
                ]);
            }
            
            // Add trails based on user's fitness level and preferences
            String fitnessLevel = camperProfile.Fitness_Level__c;
            String preferredDifficulty = camperProfile.Preferred_Difficulty__c;
            String preferredTrailTypes = camperProfile.Preferred_Trail_Types__c;
            
            // Convert multi-select picklist to list
            List<String> trailTypes = new List<String>();
            if (String.isNotBlank(preferredTrailTypes)) {
                trailTypes = preferredTrailTypes.split(';');
            }
            
            // Build dynamic query
            String query = 'SELECT Id, Name, Description__c, Difficulty__c, Trail_Type__c, ' +
                          'Length_km__c, Elevation_Gain__c, Image_URL__c, ' +
                          'Start_Location__c, End_Location__c, Latitude__c, Longitude__c ' +
                          'FROM Trail__c WHERE ';
            
            List<String> conditions = new List<String>();
            List<Object> bindVars = new List<Object>();
            
            // Add difficulty condition if specified
            if (String.isNotBlank(preferredDifficulty)) {
                conditions.add('Difficulty__c = :preferredDifficulty');
            }
            
            // Add trail type condition if specified
            if (!trailTypes.isEmpty()) {
                String trailTypeCondition = '(';
                for (Integer i = 0; i < trailTypes.size(); i++) {
                    if (i > 0) {
                        trailTypeCondition += ' OR ';
                    }
                    trailTypeCondition += 'Trail_Type__c LIKE \'%' + String.escapeSingleQuotes(trailTypes[i]) + '%\'';
                }
                trailTypeCondition += ')';
                conditions.add(trailTypeCondition);
            }
            
            // Add fitness level condition
            if (String.isNotBlank(fitnessLevel)) {
                if (fitnessLevel == 'Beginner') {
                    conditions.add('Length_km__c <= 5');
                    conditions.add('Elevation_Gain__c <= 200');
                } else if (fitnessLevel == 'Intermediate') {
                    conditions.add('Length_km__c > 5 AND Length_km__c <= 15');
                    conditions.add('Elevation_Gain__c > 200 AND Elevation_Gain__c <= 500');
                } else if (fitnessLevel == 'Advanced') {
                    conditions.add('Length_km__c > 15');
                    conditions.add('Elevation_Gain__c > 500');
                }
            }
            
            // Combine conditions
            if (!conditions.isEmpty()) {
                query += String.join(conditions, ' AND ');
            } else {
                query = query.substring(0, query.length() - 7); // Remove " WHERE "
            }
            
            // Add order and limit
            query += ' ORDER BY CreatedDate DESC LIMIT 10';
            
            // Execute query
            List<Trail__c> preferenceBasedTrails = Database.query(query);
            
            // Add preference-based trails to recommendations
            for (Trail__c trail : preferenceBasedTrails) {
                // Avoid duplicates
                Boolean isDuplicate = false;
                for (Trail__c existingTrail : recommendedTrails) {
                    if (existingTrail.Id == trail.Id) {
                        isDuplicate = true;
                        break;
                    }
                }
                
                if (!isDuplicate) {
                    recommendedTrails.add(trail);
                }
            }
            
            // If we still don't have enough recommendations, add popular trails
            if (recommendedTrails.size() < 5) {
                List<Trail__c> popularTrails = getPopularTrails();
                for (Trail__c trail : popularTrails) {
                    // Avoid duplicates
                    Boolean isDuplicate = false;
                    for (Trail__c existingTrail : recommendedTrails) {
                        if (existingTrail.Id == trail.Id) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    
                    if (!isDuplicate) {
                        recommendedTrails.add(trail);
                    }
                    
                    // Stop once we have enough recommendations
                    if (recommendedTrails.size() >= 10) {
                        break;
                    }
                }
            }
            
            return recommendedTrails;
        } catch (Exception e) {
            System.debug('Error getting trail recommendations: ' + e.getMessage());
            throw new AuraHandledException('Error getting trail recommendations: ' + e.getMessage());
        }
    }
    
    /**
     * Get popular trails based on booking history
     * @return List<Trail__c> - List of popular trails
     */
    private static List<Trail__c> getPopularTrails() {
        // In a real implementation, this would use Einstein Analytics or aggregate queries
        // For now, we'll just return recent trails
        return [
            SELECT Id, Name, Description__c, Difficulty__c, Trail_Type__c, 
                   Length_km__c, Elevation_Gain__c, Image_URL__c, 
                   Start_Location__c, End_Location__c, Latitude__c, Longitude__c
            FROM Trail__c
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];
    }
}
