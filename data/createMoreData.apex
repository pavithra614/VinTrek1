// Create more Trail records
List<Trail__c> trails = new List<Trail__c>();
trails.add(new Trail__c(
    Name = 'Mountain Ridge Trail',
    Difficulty__c = 'Easy',
    Distance_km__c = 15.5,
    Location__c = '37.7749,-122.4194'
));
trails.add(new Trail__c(
    Name = 'Lakeside Loop',
    Difficulty__c = 'Easy',
    Distance_km__c = 5.2,
    Location__c = '37.8044,-122.2711'
));
trails.add(new Trail__c(
    Name = 'Forest Adventure',
    Difficulty__c = 'Easy',
    Distance_km__c = 8.7,
    Location__c = '37.8715,-122.2730'
));
trails.add(new Trail__c(
    Name = 'Coastal Bluffs',
    Difficulty__c = 'Easy',
    Distance_km__c = 10.3,
    Location__c = '37.7336,-122.5021'
));
insert trails;

// Create more Campsite records
List<Campsite__c> campsites = new List<Campsite__c>();
campsites.add(new Campsite__c(
    Name = 'Lakeside Haven',
    Capacity__c = 6,
    Location__c = '37.8044,-122.2711'
));
campsites.add(new Campsite__c(
    Name = 'Forest Retreat',
    Capacity__c = 8,
    Location__c = '37.8715,-122.2730'
));
campsites.add(new Campsite__c(
    Name = 'Sunset Point',
    Capacity__c = 4,
    Location__c = '37.7336,-122.5021'
));
insert campsites;

// Create more Booking records
List<Booking__c> bookings = new List<Booking__c>();
bookings.add(new Booking__c(
    Start_Date__c = Date.today().addDays(14),
    End_Date__c = Date.today().addDays(16),
    Status__c = 'Confirmed'
));
bookings.add(new Booking__c(
    Start_Date__c = Date.today().addDays(21),
    End_Date__c = Date.today().addDays(24),
    Status__c = 'Pending'
));
insert bookings;

// Create more Review records
List<Review__c> reviews = new List<Review__c>();
reviews.add(new Review__c(
    Rating__c = 4
));
reviews.add(new Review__c(
    Rating__c = 3
));
reviews.add(new Review__c(
    Rating__c = 5
));
insert reviews;

System.debug('Additional sample data created successfully!');
