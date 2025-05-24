import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrailReviews from '@salesforce/apex/ReviewController.getTrailReviews';
import getCampsiteReviews from '@salesforce/apex/ReviewController.getCampsiteReviews';
import getAverageRating from '@salesforce/apex/ReviewController.getAverageRating';
import createReviewWithPhoto from '@salesforce/apex/ReviewController.createReviewWithPhoto';
import deleteReview from '@salesforce/apex/ReviewController.deleteReview';
import userId from '@salesforce/user/Id';

export default class EnhancedReviewComponent extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api showAddReview = true;
    @api showPhotoUpload = true;
    @api maxReviews = 10;

    @track reviews = [];
    @track averageRating = 0;
    @track reviewCount = 0;
    @track isLoading = true;
    @track error;
    @track showAddReviewForm = false;
    @track newReview = {
        rating: 5,
        comments: '',
        photoUrl: ''
    };

    wiredReviewsResult;
    wiredRatingResult;

    // Wire the Apex methods
    @wire(getAverageRating, { recordId: '$recordId' })
    wiredRating(result) {
        this.wiredRatingResult = result;
        this.isLoading = true;
        if (result.data) {
            this.averageRating = result.data.averageRating || 0;
            this.reviewCount = result.data.reviewCount || 0;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.averageRating = 0;
            this.reviewCount = 0;
            console.error('Error loading rating', result.error);
        }
        this.isLoading = false;
    }

    // Load reviews based on object type
    @wire(function(recordId, objectApiName) {
        if (!recordId || !objectApiName) return;

        if (objectApiName === 'Trail__c') {
            return getTrailReviews({ trailId: recordId });
        } else if (objectApiName === 'Campsite__c') {
            return getCampsiteReviews({ campsiteId: recordId });
        }

        return undefined;
    }, { recordId: '$recordId', objectApiName: '$objectApiName' })
    wiredReviews(result) {
        this.wiredReviewsResult = result;
        this.isLoading = true;
        if (result.data) {
            this.reviews = result.data.map(review => {
                return {
                    ...review,
                    formattedDate: this.formatDate(review.CreatedDate),
                    isCurrentUserReview: review.User__c === userId,
                    userName: review.User__r ? review.User__r.Name : review.CreatedBy.Name,
                    starRating: this.getStarRating(review.Rating__c)
                };
            });
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.reviews = [];
            console.error('Error loading reviews', result.error);
        }
        this.isLoading = false;
    }

    // Format date to readable string
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Get star rating array for display
    getStarRating(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push({
                key: i,
                filled: i <= rating
            });
        }
        return stars;
    }

    // Toggle add review form
    handleAddReview() {
        this.showAddReviewForm = true;
    }

    // Cancel adding review
    handleCancel() {
        this.showAddReviewForm = false;
        this.resetForm();
    }

    // Handle rating change
    handleRatingChange(event) {
        this.newReview.rating = event.target.value;
    }

    // Handle comments change
    handleCommentsChange(event) {
        this.newReview.comments = event.target.value;
    }

    // Handle photo URL change
    handlePhotoUrlChange(event) {
        this.newReview.photoUrl = event.target.value;
    }

    // Submit review
    handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;

        // Create review object
        const review = {
            Rating__c: this.newReview.rating,
            Comments__c: this.newReview.comments,
            Photo_URL__c: this.newReview.photoUrl
        };

        // Set trail or campsite ID
        if (this.objectApiName === 'Trail__c') {
            review.Trail__c = this.recordId;
        } else if (this.objectApiName === 'Campsite__c') {
            review.Campsite__c = this.recordId;
        }

        // Submit review
        createReviewWithPhoto({ review: review })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Review submitted successfully',
                        variant: 'success'
                    })
                );
                this.showAddReviewForm = false;
                this.resetForm();
                return this.refreshData();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Delete review
    handleDeleteReview(event) {
        const reviewId = event.currentTarget.dataset.id;

        if (confirm('Are you sure you want to delete this review?')) {
            this.isLoading = true;

            deleteReview({ reviewId: reviewId })
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Review deleted successfully',
                            variant: 'success'
                        })
                    );
                    return this.refreshData();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    }

    // Validate form
    validateForm() {
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-textarea');
        let isValid = true;

        inputFields.forEach(field => {
            if (field.reportValidity() === false) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Reset form
    resetForm() {
        this.newReview = {
            rating: 5,
            comments: '',
            photoUrl: ''
        };
    }

    // Refresh data
    refreshData() {
        return Promise.all([
            refreshApex(this.wiredReviewsResult),
            refreshApex(this.wiredRatingResult)
        ]);
    }

    // Get limited reviews for display
    get displayedReviews() {
        return this.reviews.slice(0, this.maxReviews);
    }

    // Check if there are more reviews than displayed
    get hasMoreReviews() {
        return this.reviews.length > this.maxReviews;
    }

    // Get number of hidden reviews
    get hiddenReviewCount() {
        return this.reviews.length - this.maxReviews;
    }

    // Get star rating for average rating
    get averageStars() {
        const stars = [];
        const avgRating = this.averageRating || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push({
                key: i,
                class: i <= avgRating ? 'star filled' : 'star'
            });
        }

        return stars;
    }

    // Get star rating for new review
    get newReviewStars() {
        const stars = [];
        const rating = this.newReview.rating || 5;

        for (let i = 1; i <= 5; i++) {
            stars.push({
                key: i,
                class: i <= rating ? 'star filled' : 'star'
            });
        }

        return stars;
    }

    // Handle view all reviews
    handleViewAllReviews() {
        // In a real implementation, this would navigate to a page with all reviews
        // For now, just show all reviews by setting maxReviews to a large number
        this.maxReviews = 1000;
    }
}
