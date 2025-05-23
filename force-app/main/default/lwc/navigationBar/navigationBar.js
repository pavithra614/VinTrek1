import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCurrentUserRole from '@salesforce/apex/UserProfileService.getCurrentUserRole';
import getCurrentUserInfo from '@salesforce/apex/UserProfileService.getCurrentUserInfo';

export default class NavigationBar extends NavigationMixin(LightningElement) {
    @track userRole;
    @track userInfo;
    @track isLoading = true;
    @track error;
    @track showUserMenu = false;
    
    // Wire the Apex method to get user role
    @wire(getCurrentUserRole)
    wiredUserRole({ error, data }) {
        if (data) {
            this.userRole = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.userRole = undefined;
            console.error('Error retrieving user role:', error);
        }
        this.isLoading = false;
    }
    
    // Wire the Apex method to get user info
    @wire(getCurrentUserInfo)
    wiredUserInfo({ error, data }) {
        if (data) {
            this.userInfo = data;
        } else if (error) {
            console.error('Error retrieving user info:', error);
        }
    }
    
    // Computed property to check if user is admin
    get isAdmin() {
        return this.userRole === 'Admin';
    }
    
    // Computed property to check if user is service provider
    get isServiceProvider() {
        return this.userRole === 'Service Provider';
    }
    
    // Computed property to check if user is camper (regular user)
    get isCamper() {
        return this.userRole === 'Camper';
    }
    
    // Toggle user menu
    toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu;
    }
    
    // Handle navigation to home
    navigateToHome() {
        if (this.isAdmin) {
            this.navigateToAdminHome();
        } else if (this.isServiceProvider) {
            this.navigateToServiceProviderHome();
        } else {
            this.navigateToUserHome();
        }
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
    
    // Navigate to trails page
    navigateToTrails() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Trails'
            }
        });
    }
    
    // Navigate to bookings page
    navigateToBookings() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'My_Bookings'
            }
        });
    }
    
    // Handle logout
    handleLogout() {
        // In a real implementation, you would call an Apex method to log out
        // For this example, we'll just navigate to the login page
        
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Login'
            }
        });
        
        this.showToast('Success', 'You have been logged out successfully.', 'success');
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
