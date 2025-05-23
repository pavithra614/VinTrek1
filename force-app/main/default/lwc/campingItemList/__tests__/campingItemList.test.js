import { createElement } from 'lwc';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import CampingItemList from 'c/campingItemList';
import getCampingItems from '@salesforce/apex/CampingItemController.getCampingItems';

// Mock Apex wire adapter
const getCampingItemsAdapter = registerApexTestWireAdapter(getCampingItems);

// Sample data
const mockCampingItems = [
    {
        Id: '001',
        Name: 'Test Tent',
        Description__c: 'A test tent for camping',
        Daily_Rate__c: 25.00,
        Image_URL__c: 'https://example.com/tent.jpg',
        Status__c: 'Available',
        Category__c: 'Tent',
        Shop__c: 'shop1',
        Shop__r: { Name: 'Test Shop' }
    },
    {
        Id: '002',
        Name: 'Test Stove',
        Description__c: 'A test stove for cooking',
        Daily_Rate__c: 15.00,
        Image_URL__c: 'https://example.com/stove.jpg',
        Status__c: 'Available',
        Category__c: 'Cooking',
        Shop__c: 'shop1',
        Shop__r: { Name: 'Test Shop' }
    }
];

describe('c-camping-item-list', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty
    function flushPromises() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    it('displays camping items when data is returned', async () => {
        // Create component
        const element = createElement('c-camping-item-list', {
            is: CampingItemList
        });
        document.body.appendChild(element);

        // Emit data from the wire adapter
        getCampingItemsAdapter.emit(mockCampingItems);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Verify the component displays the camping items
        const itemElements = element.shadowRoot.querySelectorAll('.camping-item-card');
        expect(itemElements.length).toBe(2);

        // Verify the first item's details
        const firstItem = itemElements[0];
        expect(firstItem.querySelector('h3').textContent).toBe('Test Tent');
        expect(firstItem.querySelector('p').textContent).toBe('A test tent for camping');
    });

    it('displays error message when error occurs', async () => {
        // Create component
        const element = createElement('c-camping-item-list', {
            is: CampingItemList
        });
        document.body.appendChild(element);

        // Emit error from the wire adapter
        getCampingItemsAdapter.error();

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Verify error message is displayed
        const errorElement = element.shadowRoot.querySelector('.slds-notify_alert');
        expect(errorElement).not.toBeNull();
    });

    it('filters items based on search term', async () => {
        // Create component
        const element = createElement('c-camping-item-list', {
            is: CampingItemList
        });
        document.body.appendChild(element);

        // Emit data from the wire adapter
        getCampingItemsAdapter.emit(mockCampingItems);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Get the search input and set a value
        const searchInput = element.shadowRoot.querySelector('lightning-input');
        searchInput.value = 'stove';
        searchInput.dispatchEvent(new CustomEvent('change'));

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Verify only the stove item is displayed
        const itemElements = element.shadowRoot.querySelectorAll('.camping-item-card');
        expect(itemElements.length).toBe(1);
        expect(itemElements[0].querySelector('h3').textContent).toBe('Test Stove');
    });
});
