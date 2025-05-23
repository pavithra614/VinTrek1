/**
 * Scheduled class to run weather checks daily
 */
global class ScheduledWeatherAlerts implements Schedulable {
    
    /**
     * Execute method called by the scheduler
     * @param sc - SchedulableContext
     */
    global void execute(SchedulableContext sc) {
        WeatherAlertService.scheduleWeatherChecks();
    }
    
    /**
     * Method to schedule the job
     */
    public static void scheduleJob() {
        // Schedule the job to run daily at 5 AM
        String cronExp = '0 0 5 * * ?';
        System.schedule('Daily Weather Alerts', cronExp, new ScheduledWeatherAlerts());
    }
}
