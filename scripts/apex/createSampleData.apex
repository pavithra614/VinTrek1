// Create sample trails
List<Trail__c> trails = new List<Trail__c>();

try {
    trails.add(new Trail__c(
        Name = 'Knuckles Mountain Range',
        // Description__c field is optional
        Difficulty__c = 'Difficult',
        Distance_km__c = 15.5,
        Location__c = 'Central Province, Sri Lanka',
        Elevation_m__c = 1800
    ));

    trails.add(new Trail__c(
        Name = 'Horton Plains',
        // Description__c field is optional
        Difficulty__c = 'Moderate',
        Distance_km__c = 9.5,
        Location__c = 'Nuwara Eliya, Sri Lanka',
        Elevation_m__c = 2100
    ));

    trails.add(new Trail__c(
        Name = 'Sinharaja Forest Reserve',
        // Description__c field is optional
        Difficulty__c = 'Moderate',
        Distance_km__c = 8.0,
        Location__c = 'Sabaragamuwa Province, Sri Lanka',
        Elevation_m__c = 900
    ));

    trails.add(new Trail__c(
        Name = 'Adam\'s Peak',
        // Description__c field is optional
        Difficulty__c = 'Difficult',
        Distance_km__c = 7.0,
        Location__c = 'Central Highlands, Sri Lanka',
        Elevation_m__c = 2243
    ));

    trails.add(new Trail__c(
        Name = 'Ella Rock',
        // Description__c field is optional
        Difficulty__c = 'Moderate',
        Distance_km__c = 4.0,
        Location__c = 'Ella, Sri Lanka',
        Elevation_m__c = 1041
    ));
} catch (Exception e) {
    System.debug('Error creating trail records: ' + e.getMessage());
}

insert trails;

// Create sample campsites
List<Campsite__c> campsites = new List<Campsite__c>();

try {
    campsites.add(new Campsite__c(
        Name = 'Knuckles Base Camp',
        // Description__c field is optional
        Location__c = 'Knuckles Conservation Forest, Sri Lanka',
        Capacity__c = 20,
        Amenities__c = 'Water;Restrooms;Fire Pits'
    ));

    campsites.add(new Campsite__c(
        Name = 'Horton Plains Campground',
        // Description__c field is optional
        Location__c = 'Horton Plains, Sri Lanka',
        Capacity__c = 15,
        Amenities__c = 'Water;Restrooms;Picnic Tables'
    ));

    campsites.add(new Campsite__c(
        Name = 'Sinharaja Eco Camp',
        // Description__c field is optional
        Location__c = 'Sinharaja Forest Reserve, Sri Lanka',
        Capacity__c = 10,
        Amenities__c = 'Water;Restrooms;Showers'
    ));

    insert campsites;
    System.debug('Campsites created successfully!');
} catch (Exception e) {
    System.debug('Error creating campsite records: ' + e.getMessage());
}

// Create sample reviews
List<Review__c> reviews = new List<Review__c>();

try {
    if (!trails.isEmpty() && !campsites.isEmpty()) {
        reviews.add(new Review__c(
            Trail__c = trails[0].Id,
            Rating__c = '5',
            // Comments__c field is optional
            Comments__c = 'Absolutely stunning views! The hike was challenging but worth every step.'
        ));

        reviews.add(new Review__c(
            Trail__c = trails[1].Id,
            Rating__c = '4',
            // Comments__c field is optional
            Comments__c = 'Beautiful trail with amazing views at World\'s End. Start early to avoid the clouds.'
        ));

        reviews.add(new Review__c(
            Campsite__c = campsites[0].Id,
            Rating__c = '4',
            // Comments__c field is optional
            Comments__c = 'Great base camp for exploring Knuckles. Basic facilities but clean and well-maintained.'
        ));

        insert reviews;
        System.debug('Reviews created successfully!');
    } else {
        System.debug('Cannot create reviews because trails or campsites were not created successfully.');
    }
} catch (Exception e) {
    System.debug('Error creating review records: ' + e.getMessage());
}

System.debug('Sample data creation process completed!');
