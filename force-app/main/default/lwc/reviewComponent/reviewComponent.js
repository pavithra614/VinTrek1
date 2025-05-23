import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrailReviews from '@salesforce/apex/ReviewController.getTrailReviews';
import getCampsiteReviews from '@salesforce/apex/ReviewController.getCampsiteReviews';
import createReview from '@salesforce/apex/ReviewController.createReview';
import getAverageRating from '@salesforce/apex/ReviewController.getAverageRating';

export default class ReviewComponent extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track reviews = [];
    @track newReview = {
        rating: 5,
        comments: ''
    };
    @track averageRating = 0;
    @track reviewCount = 0;
    @track isLoading = true;
    @track error;

    ratingOptions = [
        { label: '5 - Excellent', value: 5 },
        { label: '4 - Very Good', value: 4 },
        { label: '3 - Good', value: 3 },
        { label: '2 - Fair', value: 2 },
        { label: '1 - Poor', value: 1 }
    ];

    connectedCallback() {
        this.loadReviews();
        this.loadAverageRating();
    }

    loadReviews() {
        this.isLoading = true;

        if (this.objectApiName === 'Trail__c') {
            getTrailReviews({ trailId: this.recordId })
                .then(result => {
                    this.reviews = result;
                    this.error = undefined;
                    this.isLoading = false;
                })
                .catch(error => {
                    this.error = error;
                    this.reviews = [];
                    this.isLoading = false;
                });
        } else if (this.objectApiName === 'Campsite__c') {
            getCampsiteReviews({ campsiteId: this.recordId })
                .then(result => {
                    this.reviews = result;
                    this.error = undefined;
                    this.isLoading = false;
                })
                .catch(error => {
                    this.error = error;
                    this.reviews = [];
                    this.isLoading = false;
                });
        }
    }

    loadAverageRating() {
        getAverageRating({ recordId: this.recordId })
            .then(result => {
                this.averageRating = result.averageRating || 0;
                this.reviewCount = result.reviewCount || 0;
            })
            .catch(error => {
                console.error('Error loading average rating', error);
            });
    }

    handleRatingChange(event) {
        this.newReview.rating = event.detail.value;
    }

    handleCommentsChange(event) {
        this.newReview.comments = event.target.value;
    }

    handleSubmit() {
        if (!this.newReview.comments) {
            this.showToast('Error', 'Please enter comments for your review', 'error');
            return;
        }

        this.isLoading = true;

        const trailId = this.objectApiName === 'Trail__c' ? this.recordId : null;
        const campsiteId = this.objectApiName === 'Campsite__c' ? this.recordId : null;

        createReview({
            trailId: trailId,
            campsiteId: campsiteId,
            rating: this.newReview.rating,
            comments: this.newReview.comments
        })
            .then(() => {
                this.showToast('Success', 'Review submitted successfully', 'success');
                this.newReview = {
                    rating: 5,
                    comments: ''
                };
                this.loadReviews();
                this.loadAverageRating();
            })
            .catch(error => {
                this.showToast('Error', 'Error submitting review: ' + error.body.message, 'error');
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    get formattedAverageRating() {
        return this.averageRating.toFixed(1);
    }

    get reviewCountText() {
        return this.reviewCount === 1 ? '1 review' : this.reviewCount + ' reviews';
    }
}
