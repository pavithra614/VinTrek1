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

    /**
     * Search for trails and campsites by name
     * @param searchTerm - The search term to use
     * @return Map containing lists of trails and campsites
     */
    @AuraEnabled
    public static Map<String, Object> searchTrailsAndCampsites(String searchTerm) {
        Map<String, Object> result = new Map<String, Object>();

        try {
            // Search for trails
            List<Trail__c> trails = [
                SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                       Elevation_m__c, Location__c
                FROM Trail__c
                WHERE Name LIKE :('%' + searchTerm + '%')
                ORDER BY Name ASC
                LIMIT 50
            ];

            result.put('trails', trails);

        } catch (Exception e) {
            throw new AuraHandledException('Error searching: ' + e.getMessage());
        }

        return result;
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

    /**
     * Get a trail with its associated campsites
     * @param trailId - The ID of the trail
     * @return Trail__c with mock Campsites
     */
    @AuraEnabled
    public static Map<String, Object> getTrailWithCampsites(String trailId) {
        try {
            // Get the trail
            Trail__c trail = [
                SELECT Id, Name, Description__c, Difficulty__c, Distance_km__c,
                       Elevation_m__c, Location__c
                FROM Trail__c
                WHERE Id = :trailId
                LIMIT 1
            ];

            // Create a map to hold the trail data and campsites
            Map<String, Object> result = new Map<String, Object>();
            result.put('Id', trail.Id);
            result.put('Name', trail.Name);
            result.put('Description__c', trail.Description__c);
            result.put('Difficulty__c', trail.Difficulty__c);
            result.put('Distance_km__c', trail.Distance_km__c);
            result.put('Elevation_m__c', trail.Elevation_m__c);
            result.put('Location__c', trail.Location__c);

            // Create mock campsites
            List<Map<String, Object>> campsites = new List<Map<String, Object>>();

            // Campsite 1
            Map<String, Object> campsite1 = new Map<String, Object>{
                'Id' => '02t000000000001AAA',
                'Name' => trail.Name + ' Base Camp',
                'Description__c' => 'Main campsite at the base of the trail with full facilities',
                'Capacity__c' => 20,
                'Daily_Fee__c' => 30.00,
                'Facilities__c' => 'Premium'
            };
            campsites.add(campsite1);

            // Campsite 2
            Map<String, Object> campsite2 = new Map<String, Object>{
                'Id' => '02t000000000002AAA',
                'Name' => trail.Name + ' Midway Camp',
                'Description__c' => 'Midway campsite with basic facilities',
                'Capacity__c' => 10,
                'Daily_Fee__c' => 20.00,
                'Facilities__c' => 'Standard'
            };
            campsites.add(campsite2);

            // Campsite 3
            Map<String, Object> campsite3 = new Map<String, Object>{
                'Id' => '02t000000000003AAA',
                'Name' => trail.Name + ' Summit Camp',
                'Description__c' => 'Summit campsite with minimal facilities',
                'Capacity__c' => 5,
                'Daily_Fee__c' => 15.00,
                'Facilities__c' => 'Basic'
            };
            campsites.add(campsite3);

            result.put('Campsites', campsites);

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving trail: ' + e.getMessage());
        }
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

    /**
     * Get all available rental items
     * @return List of mock Camping_Item__c records
     */
    @AuraEnabled
    public static List<Map<String, Object>> getRentalItems() {
        try {
            // For demo purposes, we'll create mock rental items
            List<Map<String, Object>> mockItems = new List<Map<String, Object>>();

            // Tent
            Map<String, Object> tent = new Map<String, Object>{
                'Id' => '01t000000000001AAA',
                'Name' => 'Premium Camping Tent',
                'Description__c' => '4-person waterproof tent with easy setup',
                'Category__c' => 'Tent',
                'Daily_Rate__c' => 25.00,
                'Status__c' => 'Available'
            };
            mockItems.add(tent);

            // Sleeping Bag
            Map<String, Object> sleepingBag = new Map<String, Object>{
                'Id' => '01t000000000002AAA',
                'Name' => 'Warm Sleeping Bag',
                'Description__c' => 'Comfortable sleeping bag for cold weather',
                'Category__c' => 'Sleeping Gear',
                'Daily_Rate__c' => 10.00,
                'Status__c' => 'Available'
            };
            mockItems.add(sleepingBag);

            // Gas Stove
            Map<String, Object> gasStove = new Map<String, Object>{
                'Id' => '01t000000000003AAA',
                'Name' => 'Portable Gas Stove',
                'Description__c' => 'Compact gas stove for outdoor cooking',
                'Category__c' => 'Cooking',
                'Daily_Rate__c' => 15.00,
                'Status__c' => 'Available'
            };
            mockItems.add(gasStove);

            // BBQ Grill
            Map<String, Object> bbqGrill = new Map<String, Object>{
                'Id' => '01t000000000004AAA',
                'Name' => 'Portable BBQ Grill',
                'Description__c' => 'Foldable BBQ grill for outdoor cooking',
                'Category__c' => 'Cooking',
                'Daily_Rate__c' => 20.00,
                'Status__c' => 'Available'
            };
            mockItems.add(bbqGrill);

            // Camping Chair
            Map<String, Object> campingChair = new Map<String, Object>{
                'Id' => '01t000000000005AAA',
                'Name' => 'Comfortable Camping Chair',
                'Description__c' => 'Foldable camping chair with cup holder',
                'Category__c' => 'Furniture',
                'Daily_Rate__c' => 5.00,
                'Status__c' => 'Available'
            };
            mockItems.add(campingChair);

            return mockItems;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving rental items: ' + e.getMessage());
        }
    }
}
