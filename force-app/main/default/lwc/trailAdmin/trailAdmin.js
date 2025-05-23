import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getAllTrailsForAdmin from '@salesforce/apex/TrailController.getAllTrailsForAdmin';
import saveTrail from '@salesforce/apex/TrailController.saveTrail';
import deleteTrail from '@salesforce/apex/TrailController.deleteTrail';

const DIFFICULTY_OPTIONS = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Difficult', value: 'Difficult' },
    { label: 'Very Difficult', value: 'Very Difficult' }
];

export default class TrailAdmin extends LightningElement {
    @track trails = [];
    @track isLoading = true;
    @track error;
    @track showModal = false;
    @track currentTrail = {};
    @track isNewTrail = true;
    @track wiredTrailsResult;

    difficultyOptions = DIFFICULTY_OPTIONS;

    // Wire the Apex method to get all trails
    @wire(getAllTrailsForAdmin)
    wiredTrails(result) {
        this.wiredTrailsResult = result;
        this.isLoading = true;
        if (result.data) {
            this.trails = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.trails = [];
            this.showToast('Error', 'Error loading trails: ' + result.error.body.message, 'error');
        }
        this.isLoading = false;
    }

    // Handle new trail button click
    handleNewTrail() {
        this.currentTrail = {
            Name: '',
            Description__c: '',
            Difficulty__c: 'Easy',
            Distance_km__c: 0,
            Location__c: '',
            Start_Location__c: '',
            End_Location__c: '',
            Elevation_m__c: 0
        };
        this.isNewTrail = true;
        this.showModal = true;
    }

    // Handle edit trail button click
    handleEditTrail(event) {
        const trailId = event.currentTarget.dataset.id;
        this.currentTrail = {...this.trails.find(trail => trail.Id === trailId)};
        this.isNewTrail = false;
        this.showModal = true;
    }

    // Handle delete trail button click
    handleDeleteTrail(event) {
        const trailId = event.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this trail?')) {
            this.isLoading = true;
            deleteTrail({ trailId: trailId })
                .then(result => {
                    this.showToast('Success', 'Trail deleted successfully', 'success');
                    return refreshApex(this.wiredTrailsResult);
                })
                .catch(error => {
                    this.showToast('Error', 'Error deleting trail: ' + error.body.message, 'error');
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    }

    // Handle form field changes
    handleFieldChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.currentTrail = {...this.currentTrail, [field]: value};
    }

    // Handle map location change
    handleLocationChange(event) {
        const { fieldName, value } = event.detail;
        this.currentTrail = {...this.currentTrail, [fieldName]: value};
    }

    // Handle form submission
    handleSubmit() {
        this.isLoading = true;
        saveTrail({ trail: this.currentTrail })
            .then(result => {
                this.showToast('Success', `Trail ${this.isNewTrail ? 'created' : 'updated'} successfully`, 'success');
                this.showModal = false;
                return refreshApex(this.wiredTrailsResult);
            })
            .catch(error => {
                this.showToast('Error', `Error ${this.isNewTrail ? 'creating' : 'updating'} trail: ` + error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle modal close
    handleModalClose() {
        this.showModal = false;
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}