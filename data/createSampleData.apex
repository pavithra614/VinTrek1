// Try different values for Difficulty__c
List<String> difficultyValues = new List<String>{'Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced', 'Low', 'High'};

for(String diffValue : difficultyValues) {
    try {
        Trail__c trail = new Trail__c(
            Name = 'Test Trail - ' + diffValue,
            Difficulty__c = diffValue,
            Distance_km__c = 10,
            Location__c = '37.7749,-122.4194'
        );
        insert trail;
        System.debug('SUCCESS: Trail created with Difficulty__c = ' + diffValue);
        System.debug('Trail ID: ' + trail.Id);

        // If we get here, we found a valid value
        break;
    } catch(Exception e) {
        System.debug('FAILED: Difficulty__c = ' + diffValue + ' - ' + e.getMessage());
    }
}

// Create a single Campsite record
Campsite__c campsite = new Campsite__c(
    Name = 'Eagle\'s Nest',
    Capacity__c = 4,
    Location__c = '37.7749,-122.4194'
);
insert campsite;
System.debug('Campsite created: ' + campsite.Id);

// Create a single Booking record
Booking__c booking = new Booking__c(
    Start_Date__c = Date.today().addDays(7),
    End_Date__c = Date.today().addDays(10),
    Status__c = 'Confirmed'
);
insert booking;
System.debug('Booking created: ' + booking.Id);

// Create a single Review record
Review__c review = new Review__c(
    Rating__c = 5
);
insert review;
System.debug('Review created: ' + review.Id);

System.debug('Sample data created successfully!');
