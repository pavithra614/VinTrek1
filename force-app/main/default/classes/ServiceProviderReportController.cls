/**
 * Controller for Service Provider Reports and Analytics
 * Provides mock sales data, profit calculations, and booking analytics
 */
public with sharing class ServiceProviderReportController {
    
    /**
     * Get comprehensive report data for service provider dashboard
     * @return Map<String, Object> containing all report metrics and data
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getReportData() {
        try {
            Map<String, Object> reportData = new Map<String, Object>();
            
            // Generate mock sales and profit data
            reportData.put('totalRevenue', '15,750.00');
            reportData.put('totalProfit', '8,925.00');
            reportData.put('totalBookings', 47);
            reportData.put('averageOrderValue', '335.11');
            
            // Growth percentages
            reportData.put('revenueGrowth', '23.5');
            reportData.put('profitGrowth', '18.7');
            reportData.put('bookingsGrowth', '12');
            reportData.put('aovGrowth', '8.2');
            
            // Booking status distribution
            reportData.put('bookingStatusData', getBookingStatusData());
            
            // Recent bookings with mock data
            reportData.put('recentBookings', getRecentBookingsData());
            
            // Top performing items
            reportData.put('topItems', getTopPerformingItems());
            
            // Monthly sales data for chart
            reportData.put('monthlySalesData', getMonthlySalesData());
            
            return reportData;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving report data: ' + e.getMessage());
        }
    }
    
    /**
     * Get booking status distribution data
     * @return List<Map<String, Object>> booking status breakdown
     */
    private static List<Map<String, Object>> getBookingStatusData() {
        List<Map<String, Object>> statusData = new List<Map<String, Object>>();
        
        // Mock booking status data
        statusData.add(createStatusItem('Confirmed', 28, 59.6, 'slds-badge slds-badge_success'));
        statusData.add(createStatusItem('Pending', 12, 25.5, 'slds-badge slds-badge_warning'));
        statusData.add(createStatusItem('Cancelled', 4, 8.5, 'slds-badge slds-badge_error'));
        statusData.add(createStatusItem('Completed', 3, 6.4, 'slds-badge slds-badge_inverse'));
        
        return statusData;
    }
    
    /**
     * Helper method to create status item
     */
    private static Map<String, Object> createStatusItem(String label, Integer count, Decimal percentage, String badgeClass) {
        Map<String, Object> item = new Map<String, Object>();
        item.put('label', label);
        item.put('count', count);
        item.put('percentage', percentage.setScale(1));
        item.put('badgeClass', badgeClass);
        item.put('progressStyle', 'width: ' + percentage.setScale(1) + '%');
        return item;
    }
    
    /**
     * Get recent bookings data with mock information
     * @return List<Map<String, Object>> recent bookings
     */
    private static List<Map<String, Object>> getRecentBookingsData() {
        List<Map<String, Object>> bookings = new List<Map<String, Object>>();
        
        // Mock recent bookings data
        bookings.add(createBookingItem('BK-001', 'Mountain Adventure Package', 'John Smith', Date.today().addDays(-2), Date.today().addDays(1), 'Confirmed', '$450.00'));
        bookings.add(createBookingItem('BK-002', 'Lake Camping Experience', 'Sarah Johnson', Date.today().addDays(-1), Date.today().addDays(2), 'Confirmed', '$320.00'));
        bookings.add(createBookingItem('BK-003', 'Forest Retreat', 'Mike Wilson', Date.today(), Date.today().addDays(3), 'Pending', '$275.00'));
        bookings.add(createBookingItem('BK-004', 'Desert Expedition', 'Emily Davis', Date.today().addDays(1), Date.today().addDays(4), 'Confirmed', '$520.00'));
        bookings.add(createBookingItem('BK-005', 'Coastal Camping', 'David Brown', Date.today().addDays(2), Date.today().addDays(5), 'Pending', '$380.00'));
        
        return bookings;
    }
    
    /**
     * Helper method to create booking item
     */
    private static Map<String, Object> createBookingItem(String bookingNumber, String packageName, String customerName, Date startDate, Date endDate, String status, String amount) {
        Map<String, Object> booking = new Map<String, Object>();
        booking.put('Id', bookingNumber);
        booking.put('bookingNumber', bookingNumber);
        booking.put('packageName', packageName);
        booking.put('customerName', customerName);
        booking.put('startDate', startDate);
        booking.put('endDate', endDate);
        booking.put('status', status);
        booking.put('amount', amount);
        booking.put('duration', startDate.daysBetween(endDate) + ' days');
        return booking;
    }
    
    /**
     * Get top performing items data
     * @return List<Map<String, Object>> top performing items
     */
    private static List<Map<String, Object>> getTopPerformingItems() {
        List<Map<String, Object>> items = new List<Map<String, Object>>();
        
        // Mock top performing items
        items.add(createTopItem('Premium Tent Package', 'Camping Equipment', 15, '$2,250.00', '$150.00', '28.5%'));
        items.add(createTopItem('Hiking Gear Set', 'Equipment Rental', 12, '$1,800.00', '$150.00', '22.8%'));
        items.add(createTopItem('Cooking Equipment Bundle', 'Kitchen Gear', 10, '$1,200.00', '$120.00', '19.0%'));
        items.add(createTopItem('Sleeping Gear Package', 'Comfort Items', 8, '$960.00', '$120.00', '15.2%'));
        items.add(createTopItem('Adventure Photography Kit', 'Electronics', 6, '$900.00', '$150.00', '11.4%'));
        items.add(createTopItem('First Aid & Safety Kit', 'Safety Equipment', 4, '$320.00', '$80.00', '7.6%'));
        
        return items;
    }
    
    /**
     * Helper method to create top item
     */
    private static Map<String, Object> createTopItem(String name, String category, Integer bookings, String revenue, String avgPrice, String marketShare) {
        Map<String, Object> item = new Map<String, Object>();
        item.put('Id', name.replace(' ', '_').toLowerCase());
        item.put('name', name);
        item.put('category', category);
        item.put('bookings', bookings);
        item.put('revenue', revenue);
        item.put('avgPrice', avgPrice);
        item.put('marketShare', marketShare);
        return item;
    }
    
    /**
     * Get monthly sales data for chart
     * @return List<Map<String, Object>> monthly sales data
     */
    private static List<Map<String, Object>> getMonthlySalesData() {
        List<Map<String, Object>> salesData = new List<Map<String, Object>>();
        
        // Mock monthly sales data for the last 6 months
        salesData.add(createSalesDataPoint('Jan 2024', 8500, 4800));
        salesData.add(createSalesDataPoint('Feb 2024', 9200, 5200));
        salesData.add(createSalesDataPoint('Mar 2024', 11800, 6700));
        salesData.add(createSalesDataPoint('Apr 2024', 13200, 7500));
        salesData.add(createSalesDataPoint('May 2024', 14600, 8300));
        salesData.add(createSalesDataPoint('Jun 2024', 15750, 8925));
        
        return salesData;
    }
    
    /**
     * Helper method to create sales data point
     */
    private static Map<String, Object> createSalesDataPoint(String month, Integer revenue, Integer profit) {
        Map<String, Object> dataPoint = new Map<String, Object>();
        dataPoint.put('month', month);
        dataPoint.put('revenue', revenue);
        dataPoint.put('profit', profit);
        return dataPoint;
    }
    
    /**
     * Get detailed booking analytics
     * @return Map<String, Object> detailed booking analytics
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getBookingAnalytics() {
        try {
            Map<String, Object> analytics = new Map<String, Object>();
            
            // Mock booking analytics
            analytics.put('totalBookingsThisMonth', 47);
            analytics.put('totalBookingsLastMonth', 42);
            analytics.put('bookingGrowthRate', 11.9);
            analytics.put('averageBookingValue', 335.11);
            analytics.put('totalCustomers', 78);
            analytics.put('repeatCustomers', 23);
            analytics.put('customerRetentionRate', 29.5);
            
            return analytics;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving booking analytics: ' + e.getMessage());
        }
    }
    
    /**
     * Export report data (mock implementation)
     * @return String export status message
     */
    @AuraEnabled
    public static String exportReportData() {
        try {
            // In a real implementation, this would generate and return a file or send an email
            // For now, we'll just return a success message
            return 'Report exported successfully! Check your email for the detailed report.';
            
        } catch (Exception e) {
            throw new AuraHandledException('Error exporting report: ' + e.getMessage());
        }
    }
}
