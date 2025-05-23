import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import registerUser from '@salesforce/apex/UserRegistrationController.registerUser';

export default class RegistrationPage extends NavigationMixin(LightningElement) {
    // Basic user information
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track username = '';
    @track communityNickname = '';
    @track password = '';
    @track confirmPassword = '';
    @track userType = 'Camper'; // Default value

    // Service provider specific fields
    @track shopName = '';
    @track shopLocation = '';
    @track shopDescription = '';

    // UI state
    @track isLoading = false;
    @track errorMessage = '';

    // User type options
    get userTypeOptions() {
        return [
            { label: 'Camper', value: 'Camper' },
            { label: 'Service Provider', value: 'Service Provider' }
        ];
    }

    // Check if user type is Camper
    get isCamper() {
        return this.userType === 'Camper';
    }

    // Check if user type is Service Provider
    get isServiceProvider() {
        return this.userType === 'Service Provider';
    }

    // Handle input changes
    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
        this.errorMessage = ''; // Clear error message when user makes changes
    }

    // Handle user type change
    handleUserTypeChange(event) {
        this.userType = event.detail.value;
    }

    // Handle registration form submission
    handleRegister() {
        // Validate inputs
        if (!this.validateInputs()) {
            return;
        }

        this.isLoading = true;

        // Prepare registration data
        let registrationData = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            username: this.username,
            communityNickname: this.communityNickname,
            password: this.password,
            userType: this.userType
        };

        // Add service provider specific data if applicable
        if (this.isServiceProvider) {
            registrationData.shopName = this.shopName;
            registrationData.shopLocation = this.shopLocation;
            registrationData.shopDescription = this.shopDescription;
        }

        // Call Apex method to register user
        registerUser(registrationData)
        .then(result => {
            this.isLoading = false;

            if (result.startsWith('ERROR:')) {
                // Show error message
                this.errorMessage = result.substring(7); // Remove 'ERROR: ' prefix
            } else {
                // Registration successful
                this.showToast('Success', 'Registration successful! You can now log in.', 'success');

                // Navigate to login page
                this.navigateToLogin();
            }
        })
        .catch(error => {
            this.isLoading = false;
            this.errorMessage = 'An error occurred during registration: ' +
                (error.body && error.body.message ? error.body.message : error.message);
            console.error('Error during registration:', error);
        });
    }

    // Validate form inputs
    validateInputs() {
        // Check if all required fields are filled
        if (!this.firstName || !this.lastName || !this.email ||
            !this.username || !this.communityNickname ||
            !this.password || !this.confirmPassword) {
            this.errorMessage = 'All fields are required.';
            return false;
        }

        // Check service provider specific fields
        if (this.isServiceProvider) {
            if (!this.shopName || !this.shopLocation || !this.shopDescription) {
                this.errorMessage = 'All shop information fields are required for service providers.';
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = 'Please enter a valid email address.';
            return false;
        }

        // Validate username format (no spaces, special characters limited)
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(this.username)) {
            this.errorMessage = 'Username can only contain letters, numbers, dots, underscores, and hyphens.';
            return false;
        }

        // Validate password length
        if (this.password.length < 8) {
            this.errorMessage = 'Password must be at least 8 characters long.';
            return false;
        }

        // Validate password complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(this.password)) {
            this.errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
            return false;
        }

        // Check if passwords match
        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match.';
            return false;
        }

        return true;
    }

    // Navigate to login page
    navigateToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Login'
            }
        });
    }

    // Handle cancel button click
    handleCancel() {
        this.navigateToLogin();
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
