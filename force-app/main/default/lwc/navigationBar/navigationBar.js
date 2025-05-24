import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import getCurrentUserRole from '@salesforce/apex/UserProfileService.getCurrentUserRole';
import getCurrentUserInfo from '@salesforce/apex/UserProfileService.getCurrentUserInfo';

export default class NavigationBar extends NavigationMixin(LightningElement) {
    @track userRole;
    @track userInfo;
    @track isLoading = true;
    @track error;
    @track showUserMenu = false;
    @track showMobileMenu = false;
    @track currentPageName = '';

    // Get current page reference
    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        if (pageRef) {
            // Extract the current page name from the page reference
            this.currentPageName = pageRef.attributes?.apiName || '';
        }
    }

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

    // Toggle mobile menu
    toggleMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }

    // CSS classes for navigation menu
    get navigationMenuClass() {
        return this.showMobileMenu
            ? 'slds-context-bar__secondary mobile-menu-open'
            : 'slds-context-bar__secondary';
    }

    // CSS classes for menu items to highlight active page
    get homeItemClass() {
        return this.isActivePage('Home') || this.isActivePage('VinTrek_Home')
            ? 'slds-context-bar__item active-item'
            : 'slds-context-bar__item';
    }

    get trailsItemClass() {
        return this.isActivePage('Trails')
            ? 'slds-context-bar__item active-item'
            : 'slds-context-bar__item';
    }

    get bookingsItemClass() {
        return this.isActivePage('My_Bookings')
            ? 'slds-context-bar__item active-item'
            : 'slds-context-bar__item';
    }

    get adminItemClass() {
        return this.isActivePage('Admin_Home')
            ? 'slds-context-bar__item active-item'
            : 'slds-context-bar__item';
    }

    get serviceItemClass() {
        return this.isActivePage('Service_Provider_Home')
            ? 'slds-context-bar__item active-item'
            : 'slds-context-bar__item';
    }

    // Helper method to check if a page is active
    isActivePage(pageName) {
        return this.currentPageName === pageName;
    }

    // Get user menu class
    get userMenuClass() {
        return this.showUserMenu
            ? 'slds-dropdown slds-dropdown_right user-menu slds-nubbin_top-right'
            : 'slds-dropdown slds-dropdown_right user-menu slds-nubbin_top-right slds-hide';
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
        this.showMobileMenu = false;
    }

    // Navigate to admin home page
    navigateToAdminHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Admin_Home'
            }
        });
        this.showMobileMenu = false;
    }

    // Navigate to service provider home page
    navigateToServiceProviderHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Service_Provider_Home'
            }
        });
        this.showMobileMenu = false;
    }

    // Navigate to user (camper) home page
    navigateToUserHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'VinTrek_Home'
            }
        });
        this.showMobileMenu = false;
    }

    // Navigate to trails page
    navigateToTrails() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Trails'
            }
        });
        this.showMobileMenu = false;
        this.showToast('Trails', 'Exploring available trails', 'info');
    }

    // Navigate to bookings page
    navigateToBookings() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'My_Bookings'
            }
        });
        this.showMobileMenu = false;
        this.showToast('Bookings', 'Viewing your bookings', 'info');
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

        this.showUserMenu = false;
        this.showMobileMenu = false;
        this.showToast('Success', 'You have been logged out successfully.', 'success');
    }

    // Close menus when clicking outside
    connectedCallback() {
        window.addEventListener('click', this.handleWindowClick.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('click', this.handleWindowClick.bind(this));
    }

    handleWindowClick(event) {
        const userMenuContainer = this.template.querySelector('.slds-dropdown-trigger');
        const mobileMenuButton = this.template.querySelector('.mobile-menu-button');

        if (userMenuContainer && !userMenuContainer.contains(event.target) && this.showUserMenu) {
            this.showUserMenu = false;
        }

        if (mobileMenuButton && !mobileMenuButton.contains(event.target) &&
            !this.template.querySelector('.slds-context-bar__secondary').contains(event.target) &&
            this.showMobileMenu) {
            this.showMobileMenu = false;
        }
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