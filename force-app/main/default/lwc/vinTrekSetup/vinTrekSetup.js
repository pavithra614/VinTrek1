import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createCustomObjects from '@salesforce/apex/VinTrekSetupController.createCustomObjects';
import createSampleData from '@salesforce/apex/VinTrekSetupController.createSampleData';
import setupProfiles from '@salesforce/apex/VinTrekSetupController.setupProfiles';
import testAuthentication from '@salesforce/apex/VinTrekSetupController.testAuthentication';

export default class VinTrekSetup extends LightningElement {
    @track isLoading = false;
    @track setupStatus = {
        objects: 'Not Started',
        sampleData: 'Not Started',
        profiles: 'Not Started',
        authentication: 'Not Started'
    };
    @track setupMessages = [];
    
    // Handle creating custom objects
    handleCreateObjects() {
        this.isLoading = true;
        this.setupStatus.objects = 'In Progress';
        this.addMessage('Starting custom object creation...');
        
        createCustomObjects()
            .then(result => {
                this.setupStatus.objects = 'Completed';
                this.addMessage('Custom objects setup completed.');
                this.addMessage(result);
                this.showToast('Success', 'Custom objects setup completed', 'success');
            })
            .catch(error => {
                this.setupStatus.objects = 'Failed';
                this.addMessage('Error creating custom objects: ' + this.getErrorMessage(error));
                this.showToast('Error', 'Failed to create custom objects', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Handle creating sample data
    handleCreateSampleData() {
        this.isLoading = true;
        this.setupStatus.sampleData = 'In Progress';
        this.addMessage('Starting sample data creation...');
        
        createSampleData()
            .then(result => {
                this.setupStatus.sampleData = 'Completed';
                this.addMessage('Sample data creation completed.');
                this.addMessage(result);
                this.showToast('Success', 'Sample data created successfully', 'success');
            })
            .catch(error => {
                this.setupStatus.sampleData = 'Failed';
                this.addMessage('Error creating sample data: ' + this.getErrorMessage(error));
                this.showToast('Error', 'Failed to create sample data', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Handle setting up profiles and permission sets
    handleSetupProfiles() {
        this.isLoading = true;
        this.setupStatus.profiles = 'In Progress';
        this.addMessage('Starting profiles and permission sets setup...');
        
        setupProfiles()
            .then(result => {
                this.setupStatus.profiles = 'Completed';
                this.addMessage('Profiles and permission sets setup completed.');
                this.addMessage(result);
                this.showToast('Success', 'Profiles and permission sets setup completed', 'success');
            })
            .catch(error => {
                this.setupStatus.profiles = 'Failed';
                this.addMessage('Error setting up profiles: ' + this.getErrorMessage(error));
                this.showToast('Error', 'Failed to set up profiles', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Handle testing authentication
    handleTestAuthentication() {
        this.isLoading = true;
        this.setupStatus.authentication = 'In Progress';
        this.addMessage('Starting authentication test...');
        
        testAuthentication()
            .then(result => {
                this.setupStatus.authentication = 'Completed';
                this.addMessage('Authentication test completed.');
                this.addMessage(result);
                this.showToast('Success', 'Authentication test completed', 'success');
            })
            .catch(error => {
                this.setupStatus.authentication = 'Failed';
                this.addMessage('Error testing authentication: ' + this.getErrorMessage(error));
                this.showToast('Error', 'Failed to test authentication', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    
    // Handle running all setup steps
    handleRunAll() {
        this.handleCreateObjects();
        // The other steps will be chained after each step completes
    }
    
    // Add a message to the setup log
    addMessage(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.setupMessages = [...this.setupMessages, `${timestamp}: ${message}`];
        
        // Auto-scroll to the bottom of the log
        setTimeout(() => {
            const logContainer = this.template.querySelector('.setup-log');
            if (logContainer) {
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }, 100);
    }
    
    // Show a toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    // Get error message from error object
    getErrorMessage(error) {
        return (error.body && error.body.message) ? error.body.message : error.message;
    }
    
    // Computed properties for status badges
    get objectsStatusClass() {
        return this.getStatusClass(this.setupStatus.objects);
    }
    
    get sampleDataStatusClass() {
        return this.getStatusClass(this.setupStatus.sampleData);
    }
    
    get profilesStatusClass() {
        return this.getStatusClass(this.setupStatus.profiles);
    }
    
    get authenticationStatusClass() {
        return this.getStatusClass(this.setupStatus.authentication);
    }
    
    // Helper method to get status badge class
    getStatusClass(status) {
        switch (status) {
            case 'Completed':
                return 'slds-badge slds-badge_success';
            case 'In Progress':
                return 'slds-badge slds-badge_warning';
            case 'Failed':
                return 'slds-badge slds-badge_error';
            default:
                return 'slds-badge';
        }
    }
}
