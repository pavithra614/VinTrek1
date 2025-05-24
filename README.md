# VinTrek - Salesforce-Powered Outdoor Adventure Platform

VinTrek is a Salesforce-powered web application designed for nature lovers to discover, plan, and book hiking trails and camping adventures. The platform simplifies outdoor trip planning with features like an interactive trail map, smart booking system, personalized trail suggestions using AI, and real-time notifications.

## Features

- **Interactive Trail Map**: Visualize trails with elevation profiles and points of interest
- **Smart Booking System**: Book campsites and camping equipment with availability calendar
- **AI Trail Recommendations**: Get personalized trail suggestions based on preferences
- **Real-time Notifications**: Receive weather alerts and booking reminders
- **Reviews & Ratings**: Share experiences and read reviews from other campers
- **Service Provider Portal**: Manage campsites and rental equipment

## Prerequisites

- Salesforce Developer or Enterprise Edition org
- Salesforce CLI installed
- Experience Cloud (Communities) enabled in your org
- Basic knowledge of Salesforce administration

## Installation

### Option 1: Deploy using Salesforce CLI

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/vintrek.git
   cd vintrek
   ```

2. Authenticate to your Salesforce org:
   ```
   sfdx force:auth:web:login -r https://login.salesforce.com
   ```

3. Deploy the application:
   ```
   sfdx force:source:deploy -p force-app/main/default
   ```

### Option 2: Deploy using package.xml

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/vintrek.git
   cd vintrek
   ```

2. Authenticate to your Salesforce org:
   ```
   sfdx force:auth:web:login -r https://login.salesforce.com
   ```

3. Deploy using the package.xml manifest:
   ```
   sfdx force:source:deploy -x manifest/package.xml
   ```

## Setting Up Experience Cloud Site

After deploying the components, you need to set up the Experience Cloud site to make the application publicly accessible:

1. Run the setup script:
   ```
   bash scripts/setup/setupExperienceSite.sh
   ```

2. Follow the instructions in the script to:
   - Create the Experience Cloud site
   - Configure user profiles and access
   - Set up navigation and branding
   - Create pages and add components
   - Configure object access and sharing
   - Publish the site

Alternatively, you can follow the manual instructions in `scripts/setup/setupExperienceSite.md`.

## Static Resources

The application requires the following static resources:

1. **leaflet**: Leaflet.js library for maps
   - Download from: https://leafletjs.com/download.html
   - Upload as a static resource named "leaflet"

2. **leafletElevation**: Leaflet Elevation plugin
   - Download from: https://github.com/Raruto/leaflet-elevation/releases
   - Upload as a static resource named "leafletElevation"

3. **fullCalendar**: FullCalendar library for availability calendar
   - Download from: https://fullcalendar.io/docs/getting-started
   - Upload as a static resource named "fullCalendar"

## User Roles and Profiles

The application supports three main user roles:

1. **Campers/Hikers**: End users who browse trails, book campsites, and rent equipment
   - Use Customer Community User profile

2. **Service Providers**: Businesses that manage campsites and rental equipment
   - Use Customer Community Plus User profile

3. **Administrators**: System administrators who manage the platform
   - Use System Administrator profile

## Testing the Application

After setting up the Experience Cloud site, test the application with different user profiles:

1. Log in as a Camper:
   - Browse trails and view trail details
   - Book a campsite or rental equipment
   - Write reviews and view notifications

2. Log in as a Service Provider:
   - Manage campsite availability
   - Add and update camping equipment
   - View bookings and manage inventory

3. Log in as an Admin:
   - Add and manage trails
   - Monitor user activity
   - Configure system settings

## Customization

You can customize the application by:

1. Modifying the Lightning Web Components in `force-app/main/default/lwc`
2. Updating the Apex controllers in `force-app/main/default/classes`
3. Customizing the Experience Cloud site using Experience Builder

## Troubleshooting

If you encounter issues:

1. Check the Salesforce debug logs for errors
2. Verify that all required permissions are set for user profiles
3. Ensure all static resources are properly uploaded
4. Check browser console for JavaScript errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by outdoor adventure platforms like Wikiloc
- Built with Salesforce Lightning Web Components
- Developed by Team RPPS
