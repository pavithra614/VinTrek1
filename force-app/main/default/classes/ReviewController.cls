public with sharing class ReviewController {
    @AuraEnabled
    public static Id createReview(Id trailId, Id campsiteId, String rating, String comments) {
        // Validate input
        if (trailId == null && campsiteId == null) {
            throw new AuraHandledException('Either Trail or Campsite must be specified');
        }
        
        // Create new review record
        Review__c review = new Review__c();
        review.Trail__c = trailId;
        review.Campsite__c = campsiteId;
        review.Rating__c = rating;
        review.Comments__c = comments;
        
        // Insert review
        try {
            insert review;
            return review.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating review: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Review__c> getTrailReviews(Id trailId) {
        return [
            SELECT Id, Rating__c, Comments__c, CreatedDate, CreatedBy.Name
            FROM Review__c
            WHERE Trail__c = :trailId
            ORDER BY CreatedDate DESC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Review__c> getCampsiteReviews(Id campsiteId) {
        return [
            SELECT Id, Rating__c, Comments__c, CreatedDate, CreatedBy.Name
            FROM Review__c
            WHERE Campsite__c = :campsiteId
            ORDER BY CreatedDate DESC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAverageRating(Id recordId) {
        // Determine if it's a trail or campsite
        String objectType = recordId.getSObjectType().getDescribe().getName();
        String field = objectType == 'Trail__c' ? 'Trail__c' : 'Campsite__c';
        
        // Query for average rating
        AggregateResult result = [
            SELECT AVG(Rating__c) avgRating, COUNT(Id) reviewCount
            FROM Review__c
            WHERE (field) = :recordId
        ];
        
        // Return the results
        Map<String, Object> ratingInfo = new Map<String, Object>();
        ratingInfo.put('averageRating', result.get('avgRating'));
        ratingInfo.put('reviewCount', result.get('reviewCount'));
        
        return ratingInfo;
    }
}
