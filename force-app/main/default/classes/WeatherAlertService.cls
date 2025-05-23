/**
 * Service class for checking weather conditions and creating alerts
 */
public class WeatherAlertService {
    
    /**
     * Invocable method to check weather alerts for upcoming bookings
     * Can be called from Flow or Process Builder
     * @param bookingIds - List of Rental__c Ids to check
     * @return List<String> - Results of the operation
     */
    @InvocableMethod(label='Check Weather Alerts' description='Checks weather conditions for upcoming bookings')
    public static List<String> checkWeatherAlerts(List<Id> bookingIds) {
        List<String> results = new List<String>();
        
        // Get bookings with trail information
        List<Rental__c> bookings = [
            SELECT Id, Trail__r.Name, Trail__r.Latitude__c, Trail__r.Longitude__c, 
                   Camper_Profile__r.User__c, Start_Date__c 
            FROM Rental__c 
            WHERE Id IN :bookingIds
        ];
        
        for(Rental__c booking : bookings) {
            // Call weather API
            String weatherInfo = callWeatherAPI(booking.Trail__r.Latitude__c, booking.Trail__r.Longitude__c);
            
            // Parse weather data and check for alerts
            if(hasWeatherAlert(weatherInfo)) {
                // Create notification
                Notification__c notification = new Notification__c(
                    User__c = booking.Camper_Profile__r.User__c,
                    Title__c = 'Weather Alert for ' + booking.Trail__r.Name,
                    Message__c = 'There is a weather alert for your upcoming trip to ' + booking.Trail__r.Name + 
                                '. Please check the forecast before heading out.',
                    Type__c = 'Weather Alert',
                    Related_Record_Id__c = booking.Id,
                    Is_Read__c = false
                );
                
                try {
                    insert notification;
                    results.add('Created alert for booking: ' + booking.Id);
                } catch(Exception e) {
                    results.add('Error creating alert for booking ' + booking.Id + ': ' + e.getMessage());
                }
            } else {
                results.add('No weather alerts for booking: ' + booking.Id);
            }
        }
        
        return results;
    }
    
    /**
     * Call weather API to get forecast
     * @param latitude - Latitude of the location
     * @param longitude - Longitude of the location
     * @return String - JSON response from the weather API
     */
    private static String callWeatherAPI(Decimal latitude, Decimal longitude) {
        // In a real implementation, this would call an actual weather API
        // For demo purposes, we'll return a mock response
        
        // Example using OpenWeatherMap API (commented out)
        /*
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String apiKey = 'your_api_key';
        request.setEndpoint('https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + 
                           '&lon=' + longitude + '&exclude=minutely,hourly&appid=' + apiKey);
        request.setMethod('GET');
        
        HttpResponse response = http.send(request);
        return response.getBody();
        */
        
        // Mock response for demo
        Boolean hasAlert = Math.random() > 0.7; // 30% chance of alert
        
        if(hasAlert) {
            return '{"lat":' + latitude + ',"lon":' + longitude + 
                   ',"current":{"temp":22.5,"weather":[{"id":201,"main":"Thunderstorm","description":"thunderstorm with rain"}]},' +
                   '"alerts":[{"sender_name":"NWS","event":"Thunderstorm Warning","description":"Thunderstorms expected"}]}';
        } else {
            return '{"lat":' + latitude + ',"lon":' + longitude + 
                   ',"current":{"temp":25.2,"weather":[{"id":800,"main":"Clear","description":"clear sky"}]}}';
        }
    }
    
    /**
     * Check if the weather data contains any alerts
     * @param weatherData - JSON response from the weather API
     * @return Boolean - True if there are alerts, false otherwise
     */
    private static Boolean hasWeatherAlert(String weatherData) {
        // Parse JSON and check for alerts
        Map<String, Object> weatherMap = (Map<String, Object>)JSON.deserializeUntyped(weatherData);
        
        // Check if alerts exist
        if(weatherMap.containsKey('alerts')) {
            return true;
        }
        
        // Check for extreme weather conditions
        Map<String, Object> current = (Map<String, Object>)weatherMap.get('current');
        List<Object> weather = (List<Object>)current.get('weather');
        Map<String, Object> weatherCondition = (Map<String, Object>)weather[0];
        
        Integer id = Integer.valueOf(weatherCondition.get('id'));
        // Weather condition codes: https://openweathermap.org/weather-conditions
        // Check for severe weather (thunderstorms, heavy rain, etc.)
        if(id < 300) { // Thunderstorm
            return true;
        } else if(id >= 300 && id < 400) { // Drizzle
            return false;
        } else if(id >= 500 && id < 600) { // Rain
            if(id >= 502) { // Heavy rain or worse
                return true;
            }
        } else if(id >= 600 && id < 700) { // Snow
            if(id >= 602) { // Heavy snow or worse
                return true;
            }
        } else if(id >= 700 && id < 800) { // Atmosphere (fog, dust, etc.)
            if(id == 762 || id == 781) { // Volcanic ash or tornado
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Scheduled method to check weather for upcoming bookings
     * To be scheduled daily
     */
    public static void scheduleWeatherChecks() {
        // Get bookings for the next 3 days
        Date today = Date.today();
        Date threeDaysFromNow = today.addDays(3);
        
        List<Rental__c> upcomingBookings = [
            SELECT Id 
            FROM Rental__c 
            WHERE Start_Date__c >= :today 
            AND Start_Date__c <= :threeDaysFromNow
        ];
        
        if(!upcomingBookings.isEmpty()) {
            List<Id> bookingIds = new List<Id>();
            for(Rental__c booking : upcomingBookings) {
                bookingIds.add(booking.Id);
            }
            
            checkWeatherAlerts(bookingIds);
        }
    }
}
