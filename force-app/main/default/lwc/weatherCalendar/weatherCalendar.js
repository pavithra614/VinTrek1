import { LightningElement, track } from 'lwc';

export default class WeatherCalendar extends LightningElement {
    @track currentDate = new Date();
    @track calendarDays = [];
    @track selectedDay = null;
    
    dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Mock weather data patterns
    weatherPatterns = [
        { icon: 'utility:sunny', iconClass: 'weather-sunny', description: 'Sunny', baseTemp: 28 },
        { icon: 'utility:cloudy', iconClass: 'weather-cloudy', description: 'Partly Cloudy', baseTemp: 24 },
        { icon: 'utility:rain', iconClass: 'weather-rainy', description: 'Light Rain', baseTemp: 20 },
        { icon: 'utility:thunderstorm', iconClass: 'weather-stormy', description: 'Thunderstorms', baseTemp: 18 },
        { icon: 'utility:snow', iconClass: 'weather-snowy', description: 'Snow', baseTemp: 5 },
        { icon: 'utility:fog', iconClass: 'weather-foggy', description: 'Foggy', baseTemp: 16 }
    ];

    connectedCallback() {
        this.generateCalendar();
    }

    get currentMonthYear() {
        const options = { year: 'numeric', month: 'long' };
        return this.currentDate.toLocaleDateString('en-US', options);
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get previous month's last days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        const days = [];
        let dayId = 0;

        // Previous month's trailing days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayNumber = daysInPrevMonth - i;
            days.push({
                id: dayId++,
                dayNumber: dayNumber,
                date: new Date(year, month - 1, dayNumber).toISOString().split('T')[0],
                dayClass: 'calendar-day-content calendar-day-other-month',
                hasWeather: false
            });
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            const isToday = this.isToday(currentDay);
            const weather = this.generateMockWeather(currentDay);
            
            days.push({
                id: dayId++,
                dayNumber: day,
                date: currentDay.toISOString().split('T')[0],
                dayClass: `calendar-day-content ${isToday ? 'calendar-day-today' : 'calendar-day-current-month'}`,
                hasWeather: true,
                ...weather
            });
        }

        // Next month's leading days
        const totalCells = Math.ceil(days.length / 7) * 7;
        let nextMonthDay = 1;
        for (let i = days.length; i < totalCells; i++) {
            days.push({
                id: dayId++,
                dayNumber: nextMonthDay++,
                date: new Date(year, month + 1, nextMonthDay - 1).toISOString().split('T')[0],
                dayClass: 'calendar-day-content calendar-day-other-month',
                hasWeather: false
            });
        }

        this.calendarDays = days;
    }

    generateMockWeather(date) {
        // Create deterministic but varied weather based on date
        const seed = date.getDate() + date.getMonth() * 31;
        const patternIndex = seed % this.weatherPatterns.length;
        const pattern = this.weatherPatterns[patternIndex];
        
        // Add some randomness to temperature
        const tempVariation = (seed % 10) - 5; // -5 to +4 degrees variation
        const highTemp = pattern.baseTemp + tempVariation;
        const lowTemp = highTemp - (3 + (seed % 8)); // 3-10 degrees lower
        
        // Generate additional weather details
        const humidity = 40 + (seed % 40); // 40-80% humidity
        const windSpeed = 5 + (seed % 20); // 5-25 km/h wind
        
        return {
            weatherIcon: pattern.icon,
            weatherIconClass: pattern.iconClass,
            description: pattern.description,
            highTemp: highTemp,
            lowTemp: lowTemp,
            humidity: humidity,
            windSpeed: windSpeed,
            formattedDate: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    handlePreviousMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.generateCalendar();
        this.selectedDay = null;
    }

    handleNextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.generateCalendar();
        this.selectedDay = null;
    }

    handleDayClick(event) {
        const clickedDate = event.currentTarget.dataset.date;
        const day = this.calendarDays.find(d => d.date === clickedDate);
        
        if (day && day.hasWeather) {
            this.selectedDay = day;
            
            // Dispatch custom event with selected day data
            const selectEvent = new CustomEvent('dayselect', {
                detail: {
                    date: clickedDate,
                    weather: {
                        description: day.description,
                        highTemp: day.highTemp,
                        lowTemp: day.lowTemp,
                        humidity: day.humidity,
                        windSpeed: day.windSpeed
                    }
                }
            });
            this.dispatchEvent(selectEvent);
        }
    }
}
