# Setting Up VinTrek Experience Cloud Site

This guide provides step-by-step instructions for setting up the VinTrek Experience Cloud site to make your application publicly accessible.

## Prerequisites

1. Ensure you have Salesforce CLI installed and authenticated to your org
2. Ensure all VinTrek components are deployed to your org
3. Ensure you have System Administrator access or appropriate permissions

## Step 1: Create the Experience Cloud Site

1. Log in to your Salesforce org
2. Go to Setup > Feature Settings > Digital Experiences > All Sites
3. Click "New" to create a new site
4. Choose "Customer Account Portal" template (best for user management)
5. Configure basic settings:
   - Name: VinTrek
   - URL: vintrek
   - This will create a site with URL: https://your-domain.force.com/vintrek
6. Complete the wizard to create the site

## Step 2: Configure User Profiles and Access

1. In Setup > Feature Settings > Digital Experiences > All Sites, click "Workspaces" next to your VinTrek site
2. Go to Administration > Members
3. Add the following profiles:
   - Customer Community User (for Campers)
   - Customer Community Plus User (for Service Providers)
   - System Administrator (for Admins)
4. Go to Administration > Preferences and enable:
   - Allow internal users to log in directly to the community
   - Enable self-registration for Customer Community User profile
5. Go to Administration > Login & Registration and configure:
   - Login options (username/password, social login, etc.)
   - Self-registration settings

## Step 3: Configure Navigation and Branding

1. In Experience Builder, click "Builder" to open Experience Builder
2. Configure Theme:
   - Upload VinTrek logo
   - Set brand colors (primary: #1589ee, secondary: #04844b)
   - Configure header and footer
3. Configure Navigation:
   - Create navigation menu items:
     - Home (points to Home page)
     - Trails (points to Trails page)
     - Campsites (points to Campsites page)
     - My Bookings (points to My Bookings page)
     - Service Provider (visible only to Service Provider profile)

## Step 4: Create Pages and Add Components

1. Create Home Page:
   - Add trailRecommendations component
   - Add notificationCenter component
   - Add welcome content and featured trails

2. Create Trails Page:
   - Add enhancedTrailMap component
   - Add trailExplorer component
   - Configure components to work together

3. Create Campsites Page:
   - Add campingItemList component
   - Add map showing campsite locations

4. Create My Bookings Page:
   - Add bookingForm component
   - Add list of user's bookings

5. Create Service Provider Page:
   - Add serviceProviderHomePage component
   - Configure access to be limited to Service Provider profile

## Step 5: Configure Object Access and Sharing

1. Go to Workspaces > Administration > Security
2. Configure object access for Customer Community User profile:
   - Trail__c (Read)
   - Campsite__c (Read)
   - Camping_Item__c (Read)
   - Review__c (Read, Create)
   - Rental__c (Read, Create)
   - Notification__c (Read)
   - Camper_Profile__c (Read, Create, Edit)

3. Configure object access for Customer Community Plus User profile:
   - Trail__c (Read)
   - Campsite__c (Read, Create, Edit)
   - Camping_Item__c (Read, Create, Edit, Delete)
   - Review__c (Read)
   - Rental__c (Read)
   - Shop__c (Read, Create, Edit)

## Step 6: Publish the Site

1. In Experience Builder, click "Publish"
2. Confirm the publication
3. Your site will be available at https://your-domain.force.com/vintrek

## Step 7: Set Up a Custom Domain (Optional)

1. Go to Setup > Digital Experiences > Settings
2. Set up a custom domain (e.g., www.vintrek.com)
3. Purchase the domain or use an existing one
4. Configure DNS settings as per Salesforce instructions
5. Activate the domain

## Testing the Site

1. Test with different user profiles:
   - Log in as a Camper
   - Log in as a Service Provider
   - Log in as an Admin
2. Verify that each user can access appropriate pages and functionality
3. Test the complete user journey from trail search to booking

## Troubleshooting

If you encounter issues:
1. Check user permissions and profile settings
2. Verify component configurations
3. Check browser console for JavaScript errors
4. Review Salesforce debug logs for server-side errors
