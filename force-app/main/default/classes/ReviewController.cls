/**
 * Controller for the Review component
 */
public with sharing class ReviewController {
    /**
     * Create a new review with basic information
     * @param trailId - Id of the trail (optional)
     * @param campsiteId - Id of the campsite (optional)
     * @param rating - Rating value (1-5)
     * @param comments - Review comments
     * @return Id - Id of the created review
     */
    @AuraEnabled
    public static Id createReview(Id trailId, Id campsiteId, Decimal rating, String comments) {
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
<<<<<<< Updated upstream
        review.User__c = UserInfo.getUserId();
=======
>>>>>>> Stashed changes

        // Insert review
        try {
            insert review;
            return review.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating review: ' + e.getMessage());
        }
    }

<<<<<<< Updated upstream
    /**
     * Create a new review with full details including photo
     * @param review - Review__c object to create
     * @return Id - Id of the created review
     */
    @AuraEnabled
    public static Id createReviewWithPhoto(Review__c review) {
        try {
            // Set the current user
            review.User__c = UserInfo.getUserId();

            insert review;
            return review.Id;
        } catch (Exception e) {
            System.debug('Error creating review: ' + e.getMessage());
            throw new AuraHandledException('Error creating review: ' + e.getMessage());
        }
    }

    /**
     * Get reviews for a trail
     * @param trailId - Id of the trail to get reviews for
     * @return List<Review__c> - List of reviews
     */
=======
>>>>>>> Stashed changes
    @AuraEnabled(cacheable=true)
    public static List<Review__c> getTrailReviews(Id trailId) {
        try {
            return [
                SELECT Id, Rating__c, Comments__c, CreatedDate, User__r.Name, Photo_URL__c, CreatedBy.Name
                FROM Review__c
                WHERE Trail__c = :trailId
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug('Error getting trail reviews: ' + e.getMessage());
            throw new AuraHandledException('Error getting trail reviews: ' + e.getMessage());
        }
    }

<<<<<<< Updated upstream
    /**
     * Get reviews for a campsite
     * @param campsiteId - Id of the campsite to get reviews for
     * @return List<Review__c> - List of reviews
     */
=======
>>>>>>> Stashed changes
    @AuraEnabled(cacheable=true)
    public static List<Review__c> getCampsiteReviews(Id campsiteId) {
        try {
            return [
                SELECT Id, Rating__c, Comments__c, CreatedDate, User__r.Name, Photo_URL__c, CreatedBy.Name
                FROM Review__c
                WHERE Campsite__c = :campsiteId
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug('Error getting campsite reviews: ' + e.getMessage());
            throw new AuraHandledException('Error getting campsite reviews: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAverageRating(Id recordId) {
        // Determine if it's a trail or campsite
        String objectType = recordId.getSObjectType().getDescribe().getName();

<<<<<<< Updated upstream
        // Query for average rating
        AggregateResult result;

        if (objectType == 'Trail__c') {
            result = [
                SELECT AVG(Rating__c) avgRating, COUNT(Id) reviewCount
=======
        // Get reviews for the record
        List<Review__c> reviews;

        if (objectType == 'Trail__c') {
            reviews = [
                SELECT Rating__c
>>>>>>> Stashed changes
                FROM Review__c
                WHERE Trail__c = :recordId
            ];
        } else {
<<<<<<< Updated upstream
            result = [
                SELECT AVG(Rating__c) avgRating, COUNT(Id) reviewCount
=======
            reviews = [
                SELECT Rating__c
>>>>>>> Stashed changes
                FROM Review__c
                WHERE Campsite__c = :recordId
            ];
        }

<<<<<<< Updated upstream
        // Return the results
        Map<String, Object> ratingInfo = new Map<String, Object>();
        ratingInfo.put('averageRating', result.get('avgRating'));
        ratingInfo.put('reviewCount', result.get('reviewCount'));
=======
        // Calculate average rating manually
        Decimal totalRating = 0;
        Integer reviewCount = reviews.size();

        for (Review__c review : reviews) {
            // Convert string rating to decimal
            totalRating += Decimal.valueOf(review.Rating__c);
        }

        Decimal averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        // Return the results
        Map<String, Object> ratingInfo = new Map<String, Object>();
        ratingInfo.put('averageRating', averageRating);
        ratingInfo.put('reviewCount', reviewCount);
>>>>>>> Stashed changes

        return ratingInfo;
    }

    /**
     * Delete a review
     * @param reviewId - Id of the review to delete
     * @return Boolean - True if successful, false otherwise
     */
    @AuraEnabled
    public static Boolean deleteReview(Id reviewId) {
        try {
            // Check if the current user is the owner of the review
            Review__c review = [
                SELECT Id, User__c
                FROM Review__c
                WHERE Id = :reviewId
                LIMIT 1
            ];

            if (review.User__c != UserInfo.getUserId()) {
                throw new AuraHandledException('You can only delete your own reviews.');
            }

            delete review;
            return true;
        } catch (Exception e) {
            System.debug('Error deleting review: ' + e.getMessage());
            throw new AuraHandledException('Error deleting review: ' + e.getMessage());
        }
    }
}
