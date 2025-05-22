// Create sample trails
List<Trail__c> trails = new List<Trail__c>();

trails.add(new Trail__c(
    Name = 'Knuckles Mountain Range',
    Description__c = 'A beautiful mountain range with diverse flora and fauna. Perfect for experienced hikers.',
    Difficulty__c = 'Difficult',
    Distance_km__c = 15.5,
    Location__c = 'Central Province, Sri Lanka',
    Elevation_m__c = 1800
));

trails.add(new Trail__c(
    Name = 'Horton Plains',
    Description__c = 'Famous for World\'s End, a stunning escarpment with a 880m drop.',
    Difficulty__c = 'Moderate',
    Distance_km__c = 9.5,
    Location__c = 'Nuwara Eliya, Sri Lanka',
    Elevation_m__c = 2100
));

trails.add(new Trail__c(
    Name = 'Sinharaja Forest Reserve',
    Description__c = 'A UNESCO World Heritage Site and biodiversity hotspot.',
    Difficulty__c = 'Moderate',
    Distance_km__c = 8.0,
    Location__c = 'Sabaragamuwa Province, Sri Lanka',
    Elevation_m__c = 900
));

trails.add(new Trail__c(
    Name = 'Adam\'s Peak',
    Description__c = 'Sacred mountain with stunning sunrise views. Climb the 5,500 steps to the summit.',
    Difficulty__c = 'Difficult',
    Distance_km__c = 7.0,
    Location__c = 'Central Highlands, Sri Lanka',
    Elevation_m__c = 2243
));

trails.add(new Trail__c(
    Name = 'Ella Rock',
    Description__c = 'Panoramic views of Ella Gap and surrounding tea plantations.',
    Difficulty__c = 'Moderate',
    Distance_km__c = 4.0,
    Location__c = 'Ella, Sri Lanka',
    Elevation_m__c = 1041
));

insert trails;

// Create sample campsites
List<Campsite__c> campsites = new List<Campsite__c>();

campsites.add(new Campsite__c(
    Name = 'Knuckles Base Camp',
    Description__c = 'Rustic camping area at the base of Knuckles Mountain Range.',
    Location__c = 'Knuckles Conservation Forest, Sri Lanka',
    Capacity__c = 20,
    Amenities__c = 'Water;Restrooms;Fire Pits'
));

campsites.add(new Campsite__c(
    Name = 'Horton Plains Campground',
    Description__c = 'Scenic campsite near Horton Plains National Park.',
    Location__c = 'Horton Plains, Sri Lanka',
    Capacity__c = 15,
    Amenities__c = 'Water;Restrooms;Picnic Tables'
));

campsites.add(new Campsite__c(
    Name = 'Sinharaja Eco Camp',
    Description__c = 'Eco-friendly camping in the heart of the rainforest.',
    Location__c = 'Sinharaja Forest Reserve, Sri Lanka',
    Capacity__c = 10,
    Amenities__c = 'Water;Restrooms;Showers'
));

insert campsites;

// Create sample reviews
List<Review__c> reviews = new List<Review__c>();

reviews.add(new Review__c(
    Trail__c = trails[0].Id,
    Rating__c = '5',
    Comments__c = 'Absolutely stunning views! The hike was challenging but worth every step.'
));

reviews.add(new Review__c(
    Trail__c = trails[1].Id,
    Rating__c = '4',
    Comments__c = 'Beautiful trail with amazing views at World\'s End. Start early to avoid the clouds.'
));

reviews.add(new Review__c(
    Campsite__c = campsites[0].Id,
    Rating__c = '4',
    Comments__c = 'Great base camp for exploring Knuckles. Basic facilities but clean and well-maintained.'
));

insert reviews;

System.debug('Sample data created successfully!');
