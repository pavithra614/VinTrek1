import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getCampsites from '@salesforce/apex/CampsiteController.getCampsites';
import getTrails from '@salesforce/apex/TrailController.getTrails';
import getShops from '@salesforce/apex/ShopController.getShops';
import getCampingItems from '@salesforce/apex/CampingItemController.getCampingItems';
import getUsers from '@salesforce/apex/UserController.getUsers';

export default class VinTrekAdmin extends LightningElement {
    @track isLoading = true;
    @track hasAccess = true; // Set to true for now, can be updated with permission check
    @track activeTab = 'shops'; // Start with shops tab to show data immediately

    // Campsite Management
    @track campsites = [];
    @track showNewCampsiteForm = false;
    @track campsiteLatitude = 0;
    @track campsiteLongitude = 0;
    @track campsiteColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Trail', fieldName: 'TrailName', type: 'text' },
        { label: 'Daily Fee', fieldName: 'Daily_Fee__c', type: 'currency' },
        { label: 'Capacity', fieldName: 'Capacity__c', type: 'number' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Trail Management
    @track trails = [];
    @track trailColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Distance (km)', fieldName: 'Distance_km__c', type: 'number' },
        { label: 'Elevation (m)', fieldName: 'Elevation_m__c', type: 'number' },
        { label: 'Difficulty', fieldName: 'Difficulty__c', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Shop Management
    @track shops = [];
    @track shopColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Location', fieldName: 'Location__c', type: 'text' },
        { label: 'Address', fieldName: 'Address__c', type: 'text' },
        { label: 'Contact Email', fieldName: 'Contact_Email__c', type: 'email' },
        { label: 'Contact Phone', fieldName: 'Contact_Phone__c', type: 'phone' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Camping Items Management
    @track campingItems = [];
    @track campingItemColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Category', fieldName: 'Category__c', type: 'text' },
        { label: 'Daily Rate', fieldName: 'Daily_Rate__c', type: 'currency' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        { label: 'Shop', fieldName: 'shopName', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // User Management
    @track users = [];
    @track userColumns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Username', fieldName: 'Username', type: 'text' },
        { label: 'Profile', fieldName: 'profileName', type: 'text' },
        { label: 'Active', fieldName: 'IsActive', type: 'boolean' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Deactivate', name: 'deactivate' }
                ]
            }
        }
    ];

    // Wired methods to fetch data
    wiredCampsitesResult;
    @wire(getCampsites)
    wiredCampsites(result) {
        this.wiredCampsitesResult = result;
        if (result.data) {
            this.campsites = result.data.map(campsite => {
                return {
                    ...campsite,
                    TrailName: campsite.Trail__r ? campsite.Trail__r.Name : ''
                };
            });
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading campsites: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }

    wiredTrailsResult;
    @wire(getTrails)
    wiredTrails(result) {
        this.wiredTrailsResult = result;
        if (result.data) {
            this.trails = result.data;
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading trails: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }

    wiredShopsResult;
    @wire(getShops)
    wiredShops(result) {
        this.wiredShopsResult = result;
        console.log('Shops wire result:', result);
        if (result.data) {
            console.log('Shops data:', result.data);
            this.shops = result.data;
            this.isLoading = false;
        } else if (result.error) {
            console.error('Shops error:', result.error);
            this.showToast('Error', 'Error loading shops: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }

    wiredCampingItemsResult;
    @wire(getCampingItems)
    wiredCampingItems(result) {
        this.wiredCampingItemsResult = result;
        if (result.data) {
            this.campingItems = result.data.map(item => {
                return {
                    ...item,
                    shopName: item.Shop__r ? item.Shop__r.Name : ''
                };
            });
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading camping items: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }

    wiredUsersResult;
    @wire(getUsers)
    wiredUsers(result) {
        this.wiredUsersResult = result;
        if (result.data) {
            this.users = result.data.map(user => {
                return {
                    ...user,
                    profileName: user.Profile ? user.Profile.Name : ''
                };
            });
            this.isLoading = false;
        } else if (result.error) {
            this.showToast('Error', 'Error loading users: ' + result.error.body.message, 'error');
            this.isLoading = false;
        }
    }

    // Event handlers
    handleTabChange(event) {
        this.activeTab = event.target.value;
    }

    refreshData() {
        this.isLoading = true;
        Promise.all([
            refreshApex(this.wiredCampsitesResult),
            refreshApex(this.wiredTrailsResult),
            refreshApex(this.wiredShopsResult),
            refreshApex(this.wiredCampingItemsResult),
            refreshApex(this.wiredUsersResult)
        ]).then(() => {
            this.isLoading = false;
            this.showToast('Success', 'Data refreshed successfully', 'success');
        }).catch(error => {
            this.isLoading = false;
            this.showToast('Error', 'Error refreshing data: ' + error.body.message, 'error');
        });
    }

    // Campsite methods
    handleAddNewCampsite() {
        this.showNewCampsiteForm = true;
    }

    handleCancelCampsiteForm() {
        this.showNewCampsiteForm = false;
    }

    handleCampsiteFormSuccess() {
        this.showNewCampsiteForm = false;
        this.showToast('Success', 'Campsite created successfully', 'success');
        return refreshApex(this.wiredCampsitesResult);
    }

    handleLocationChange(event) {
        this.campsiteLatitude = event.detail.latitude;
        this.campsiteLongitude = event.detail.longitude;
    }

    handleCampsiteRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                // Handle edit action
                this.showToast('Info', 'Edit functionality will be implemented', 'info');
                break;
            case 'delete':
                // Handle delete action
                this.showToast('Info', 'Delete functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }

    // Trail methods
    handleAddNewTrail() {
        this.showToast('Info', 'Add new trail functionality will be implemented', 'info');
    }

    handleTrailRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                // Handle edit action
                this.showToast('Info', 'Edit functionality will be implemented', 'info');
                break;
            case 'delete':
                // Handle delete action
                this.showToast('Info', 'Delete functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }

    // Shop methods
    handleAddNewShop() {
        this.showToast('Info', 'Shop creation form will be implemented', 'info');
    }

    handleShopRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.showToast('Info', 'Edit shop functionality will be implemented', 'info');
                break;
            case 'delete':
                this.showToast('Info', 'Delete shop functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }

    // Camping Item methods
    handleAddNewItem() {
        this.showToast('Info', 'Camping item creation form will be implemented', 'info');
    }

    handleCampingItemRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.showToast('Info', 'Edit camping item functionality will be implemented', 'info');
                break;
            case 'delete':
                this.showToast('Info', 'Delete camping item functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }

    // User methods
    handleAddNewUser() {
        this.showToast('Info', 'User creation form will be implemented', 'info');
    }

    handleUserRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'edit':
                this.showToast('Info', 'Edit user functionality will be implemented', 'info');
                break;
            case 'deactivate':
                this.showToast('Info', 'User deactivation functionality will be implemented', 'info');
                break;
            default:
                break;
        }
    }

    // Utility methods
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
