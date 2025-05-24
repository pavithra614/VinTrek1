public with sharing class WeatherService {
    
    /**
     * Get weather forecast for a specific location and date range
     * @param latitude - Latitude of the location
     * @param longitude - Longitude of the location  
     * @param startDate - Start date for forecast
     * @param endDate - End date for forecast
     * @return WeatherForecast - Weather data with alerts if any
     */
    @AuraEnabled(cacheable=false)
    public static WeatherForecast getWeatherForecast(Decimal latitude, Decimal longitude, Date startDate, Date endDate) {
        try {
            // In a real implementation, this would call an external weather API
            // For demo purposes, we'll return mock data with some logic
            
            WeatherForecast forecast = new WeatherForecast();
            forecast.location = getLocationName(latitude, longitude);
            forecast.startDate = startDate;
            forecast.endDate = endDate;
            forecast.alerts = new List<WeatherAlert>();
            
            // Mock weather logic - create alerts based on certain conditions
            if (isRainySeasonInSriLanka(startDate)) {
                WeatherAlert rainAlert = new WeatherAlert();
                rainAlert.type = 'Rain';
                rainAlert.severity = 'Moderate';
                rainAlert.title = 'Heavy Rain Expected';
                rainAlert.description = 'Heavy rainfall is expected during your camping dates. Please bring waterproof gear and consider rescheduling if conditions worsen.';
                rainAlert.startDate = startDate;
                rainAlert.endDate = endDate;
                forecast.alerts.add(rainAlert);
            }
            
            if (isWindyConditions(latitude, longitude)) {
                WeatherAlert windAlert = new WeatherAlert();
                windAlert.type = 'Wind';
                windAlert.severity = 'Low';
                windAlert.title = 'Windy Conditions';
                windAlert.description = 'Moderate to strong winds expected. Secure your camping equipment properly.';
                windAlert.startDate = startDate;
                windAlert.endDate = endDate;
                forecast.alerts.add(windAlert);
            }
            
            // Add general forecast data
            forecast.temperature = generateMockTemperature();
            forecast.humidity = generateMockHumidity();
            forecast.windSpeed = generateMockWindSpeed();
            forecast.conditions = forecast.alerts.isEmpty() ? 'Clear' : 'Variable';
            
            return forecast;
            
        } catch (Exception e) {
            System.debug('Error getting weather forecast: ' + e.getMessage());
            throw new AuraHandledException('Unable to retrieve weather forecast: ' + e.getMessage());
        }
    }
    
    /**
     * Check if the date falls within Sri Lanka's rainy season
     */
    private static Boolean isRainySeasonInSriLanka(Date checkDate) {
        Integer month = checkDate.month();
        // Sri Lanka has two monsoon seasons: May-September and December-February
        return (month >= 5 && month <= 9) || (month >= 12 || month <= 2);
    }
    
    /**
     * Check for windy conditions based on location
     */
    private static Boolean isWindyConditions(Decimal latitude, Decimal longitude) {
        // Mock logic - coastal areas tend to be windier
        // Sri Lanka coastal coordinates roughly: lat 6-10, long 79.5-81.5
        return (latitude >= 6 && latitude <= 10 && 
                (longitude <= 80 || longitude >= 81));
    }
    
    /**
     * Get location name from coordinates (mock implementation)
     */
    private static String getLocationName(Decimal latitude, Decimal longitude) {
        // In a real implementation, this would use reverse geocoding
        if (latitude >= 6.9 && latitude <= 7.0 && longitude >= 79.8 && longitude <= 80.0) {
            return 'Colombo Region';
        } else if (latitude >= 7.2 && latitude <= 7.3 && longitude >= 80.6 && longitude <= 80.7) {
            return 'Kandy Region';
        } else if (latitude >= 6.0 && latitude <= 6.1 && longitude >= 80.2 && longitude <= 80.3) {
            return 'Galle Region';
        } else {
            return 'Central Highlands';
        }
    }
    
    /**
     * Generate mock temperature data
     */
    private static Decimal generateMockTemperature() {
        // Sri Lanka typical temperature range: 24-32°C
        return 24 + (Math.random() * 8);
    }
    
    /**
     * Generate mock humidity data
     */
    private static Decimal generateMockHumidity() {
        // Sri Lanka typical humidity: 70-90%
        return 70 + (Math.random() * 20);
    }
    
    /**
     * Generate mock wind speed data
     */
    private static Decimal generateMockWindSpeed() {
        // Wind speed in km/h: 5-25 km/h typical
        return 5 + (Math.random() * 20);
    }
    
    /**
     * Weather Forecast wrapper class
     */
    public class WeatherForecast {
        @AuraEnabled public String location { get; set; }
        @AuraEnabled public Date startDate { get; set; }
        @AuraEnabled public Date endDate { get; set; }
        @AuraEnabled public List<WeatherAlert> alerts { get; set; }
        @AuraEnabled public Decimal temperature { get; set; }
        @AuraEnabled public Decimal humidity { get; set; }
        @AuraEnabled public Decimal windSpeed { get; set; }
        @AuraEnabled public String conditions { get; set; }
    }
    
    /**
     * Weather Alert class
     */
    public class WeatherAlert {
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String severity { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Date startDate { get; set; }
        @AuraEnabled public Date endDate { get; set; }
    }
}
