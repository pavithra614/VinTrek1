public with sharing class WeatherController {
    
    public class WeatherAlertResult {
        @AuraEnabled public Boolean hasAlert { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public String severity { get; set; }
        @AuraEnabled public String location { get; set; }
        
        public WeatherAlertResult() {
            this.hasAlert = false;
            this.message = '';
            this.severity = 'Low';
            this.location = '';
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static WeatherAlertResult getWeatherAlert(String location) {
        WeatherAlertResult result = new WeatherAlertResult();
        result.location = location;
        
        try {
            // In a real implementation, this would call an actual weather API
            // For demo purposes, we'll simulate weather alerts based on location keywords
            
            String locationLower = location.toLowerCase();
            
            // Simulate weather conditions based on location keywords
            if (locationLower.contains('mountain') || locationLower.contains('peak') || locationLower.contains('summit')) {
                // Mountain areas - higher chance of weather alerts
                if (Math.random() > 0.4) { // 60% chance
                    result.hasAlert = true;
                    result.severity = 'High';
                    result.message = 'Severe weather warning: High winds and potential thunderstorms expected in mountain areas. Consider postponing your trip.';
                }
            } else if (locationLower.contains('forest') || locationLower.contains('jungle') || locationLower.contains('woods')) {
                // Forest areas - moderate chance of weather alerts
                if (Math.random() > 0.6) { // 40% chance
                    result.hasAlert = true;
                    result.severity = 'Medium';
                    result.message = 'Weather advisory: Heavy rainfall expected in forest areas. Trails may be muddy and slippery.';
                }
            } else if (locationLower.contains('beach') || locationLower.contains('coast') || locationLower.contains('shore')) {
                // Coastal areas - different weather patterns
                if (Math.random() > 0.7) { // 30% chance
                    result.hasAlert = true;
                    result.severity = 'Medium';
                    result.message = 'Coastal weather alert: Strong winds and rough seas expected. Beach camping may be affected.';
                }
            } else if (locationLower.contains('desert') || locationLower.contains('dry') || locationLower.contains('arid')) {
                // Desert areas - heat warnings
                if (Math.random() > 0.5) { // 50% chance
                    result.hasAlert = true;
                    result.severity = 'High';
                    result.message = 'Extreme heat warning: Temperatures may exceed safe levels. Ensure adequate water supply and avoid midday activities.';
                }
            } else {
                // General areas - lower chance of alerts
                if (Math.random() > 0.8) { // 20% chance
                    result.hasAlert = true;
                    result.severity = 'Low';
                    result.message = 'Weather notice: Partly cloudy conditions with possible light showers. Pack appropriate rain gear.';
                }
            }
            
            // Additional random severe weather events (rare)
            if (!result.hasAlert && Math.random() > 0.95) { // 5% chance of severe weather
                result.hasAlert = true;
                result.severity = 'High';
                result.message = 'Emergency weather alert: Severe thunderstorm warning issued for your area. Seek immediate shelter and avoid outdoor activities.';
            }
            
        } catch (Exception e) {
            System.debug('Error getting weather alert: ' + e.getMessage());
            // Return no alert on error
            result.hasAlert = false;
        }
        
        return result;
    }
    
    @AuraEnabled(cacheable=false)
    public static WeatherAlertResult getWeatherAlertForCoordinates(Decimal latitude, Decimal longitude) {
        WeatherAlertResult result = new WeatherAlertResult();
        result.location = 'Lat: ' + latitude + ', Lon: ' + longitude;
        
        try {
            // In a real implementation, this would call a weather API with coordinates
            // For demo purposes, we'll simulate based on coordinate ranges
            
            // Simulate different weather patterns based on coordinates
            // This is a very simplified simulation
            
            // High altitude areas (simplified check)
            if (Math.abs(latitude) > 60 || (Math.abs(latitude) > 30 && Math.abs(longitude) > 100)) {
                if (Math.random() > 0.3) { // 70% chance in extreme areas
                    result.hasAlert = true;
                    result.severity = 'High';
                    result.message = 'Extreme weather conditions expected in this remote area. Exercise extreme caution.';
                }
            } else {
                // Regular areas
                if (Math.random() > 0.7) { // 30% chance
                    result.hasAlert = true;
                    result.severity = 'Medium';
                    result.message = 'Weather advisory: Changing conditions expected. Monitor weather updates regularly.';
                }
            }
            
        } catch (Exception e) {
            System.debug('Error getting weather alert for coordinates: ' + e.getMessage());
            result.hasAlert = false;
        }
        
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getWeatherTips() {
        return new List<String>{
            'Always check weather conditions before starting your hike',
            'Pack layers of clothing for changing weather conditions',
            'Bring waterproof gear even on sunny days',
            'Stay hydrated and protect yourself from sun exposure',
            'Turn back if weather conditions become dangerous',
            'Inform someone of your hiking plans and expected return time',
            'Carry emergency supplies including first aid kit',
            'Check trail conditions and closures before departure'
        };
    }
}
