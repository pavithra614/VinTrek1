import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import authenticateUser from '@salesforce/apex/UserProfileService.authenticateUser';
import getCurrentUserRole from '@salesforce/apex/UserProfileService.getCurrentUserRole';

export default class LoginPage extends NavigationMixin(LightningElement) {
    @track username = '';
    @track password = '';
    @track rememberMe = false;
    @track isLoading = false;
    @track errorMessage = '';

    connectedCallback() {
        // Check if we have stored credentials
        const storedUsername = localStorage.getItem('vintrek_username');
        if (storedUsername) {
            this.username = storedUsername;
            this.rememberMe = true;
        }
    }

    // Handle username input change
    handleUsernameChange(event) {
        this.username = event.target.value;
        this.errorMessage = '';
    }

    // Handle password input change
    handlePasswordChange(event) {
        this.password = event.target.value;
        this.errorMessage = '';
    }

    // Handle remember me checkbox change
    handleRememberMeChange(event) {
        this.rememberMe = event.target.checked;
    }

    // Handle login button click
    handleLogin() {
        // Validate inputs
        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        // Call the Apex method to authenticate the user
        authenticateUser({ username: this.username, password: this.password })
            .then(result => {
                if (result.startsWith('ERROR:')) {
                    // Authentication failed
                    this.isLoading = false;
                    this.errorMessage = result.substring(7); // Remove 'ERROR: ' prefix
                } else {
                    // Save username if remember me is checked
                    if (this.rememberMe) {
                        localStorage.setItem('vintrek_username', this.username);
                    } else {
                        localStorage.removeItem('vintrek_username');
                    }

                    // Authentication successful, check user role and redirect
                    this.checkUserRoleAndRedirect();
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.errorMessage = 'Error during authentication: ' +
                    (error.body && error.body.message ? error.body.message : error.message);
                console.error('Error during authentication:', error);
            });
    }

    // Check user role and redirect to appropriate page
    checkUserRoleAndRedirect() {
        getCurrentUserRole()
            .then(role => {
                this.isLoading = false;

                // Navigate based on user role
                switch(role) {
                    case 'Admin':
                        this.navigateToAdminHome();
                        break;
                    case 'Service Provider':
                        this.navigateToServiceProviderHome();
                        break;
                    case 'Camper':
                        this.navigateToUserHome();
                        break;
                    default:
                        this.navigateToUserHome();
                }

                // Show success toast
                this.showToast('Success', 'Login successful!', 'success');
            })
            .catch(error => {
                this.isLoading = false;
                this.errorMessage = 'Error checking user role: ' +
                    (error.body && error.body.message ? error.body.message : error.message);
                console.error('Error checking user role:', error);
            });
    }

    // Navigate to admin home page
    navigateToAdminHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Admin_Home'
            }
        });
    }

    // Navigate to service provider home page
    navigateToServiceProviderHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Service_Provider_Home'
            }
        });
    }

    // Navigate to user (camper) home page
    navigateToUserHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'VinTrek_Home'
            }
        });
    }

    // Navigate to registration page
    navigateToRegistration() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'VinTrek_Registration'
            }
        });
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