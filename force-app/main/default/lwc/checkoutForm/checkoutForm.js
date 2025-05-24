import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CheckoutForm extends LightningElement {
    @api campsite;
    @api trail;
    @api campingItems = [];
    @api cartItems = [];
    @api booking;
    @api numberOfDays = 0;
    @api totalPrice = 0;

    @track paymentData = {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Sri Lanka'
        }
    };

    @track isProcessing = false;
    @track paymentMethod = 'card'; // card, paypal, bank
    @track showBillingAddress = false;

    get formattedTotalPrice() {
        return this.totalPrice ? `$${this.totalPrice.toFixed(2)}` : '$0.00';
    }

    get paymentMethodOptions() {
        return [
            { label: 'Credit/Debit Card', value: 'card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank' }
        ];
    }

    get isCardPayment() {
        return this.paymentMethod === 'card';
    }

    get isPayPalPayment() {
        return this.paymentMethod === 'paypal';
    }

    get isBankPayment() {
        return this.paymentMethod === 'bank';
    }

    get processingButtonLabel() {
        return this.isProcessing ? 'Processing Payment...' : `Pay ${this.formattedTotalPrice}`;
    }

    handlePaymentMethodChange(event) {
        this.paymentMethod = event.detail.value;
    }

    handleCardNumberChange(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add spaces every 4 digits
        this.paymentData.cardNumber = value;
        event.target.value = value;
    }

    handleExpiryDateChange(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.paymentData.expiryDate = value;
        event.target.value = value;
    }

    handleCvvChange(event) {
        this.paymentData.cvv = event.target.value;
    }

    handleCardholderNameChange(event) {
        this.paymentData.cardholderName = event.target.value;
    }

    handleBillingAddressChange(event) {
        const field = event.target.dataset.field;
        this.paymentData.billingAddress[field] = event.target.value;
    }

    toggleBillingAddress() {
        this.showBillingAddress = !this.showBillingAddress;
    }

    validatePaymentForm() {
        if (this.isCardPayment) {
            const cardNumber = this.paymentData.cardNumber.replace(/\s/g, '');
            if (!cardNumber || cardNumber.length < 13) {
                this.showToast('Error', 'Please enter a valid card number', 'error');
                return false;
            }

            if (!this.paymentData.expiryDate || this.paymentData.expiryDate.length < 5) {
                this.showToast('Error', 'Please enter a valid expiry date', 'error');
                return false;
            }

            if (!this.paymentData.cvv || this.paymentData.cvv.length < 3) {
                this.showToast('Error', 'Please enter a valid CVV', 'error');
                return false;
            }

            if (!this.paymentData.cardholderName) {
                this.showToast('Error', 'Please enter the cardholder name', 'error');
                return false;
            }
        }

        return true;
    }

    handlePayment() {
        if (!this.validatePaymentForm()) {
            return;
        }

        this.isProcessing = true;

        // Simulate payment processing
        setTimeout(() => {
            this.isProcessing = false;
            this.showToast('Success', 'Payment processed successfully!', 'success');

            // Dispatch payment complete event
            this.dispatchEvent(new CustomEvent('paymentcomplete', {
                detail: {
                    paymentMethod: this.paymentMethod,
                    paymentData: this.paymentData,
                    totalAmount: this.totalPrice
                }
            }));
        }, 3000);
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Mock payment processing methods
    processCardPayment() {
        // In a real implementation, this would integrate with a payment gateway
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'TXN_' + Date.now(),
                    message: 'Payment processed successfully'
                });
            }, 2000);
        });
    }

    processPayPalPayment() {
        // Mock PayPal integration
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'PP_' + Date.now(),
                    message: 'PayPal payment completed'
                });
            }, 1500);
        });
    }

    processBankTransfer() {
        // Mock bank transfer
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'BT_' + Date.now(),
                    message: 'Bank transfer initiated'
                });
            }, 1000);
        });
    }
}
