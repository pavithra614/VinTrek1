#!/bin/bash
# Script to set up the VinTrek Experience Cloud site

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}VinTrek Experience Cloud Site Setup${NC}"
echo "This script will guide you through setting up the VinTrek Experience Cloud site."
echo

# Check if SFDX CLI is installed
echo -e "${YELLOW}Checking if Salesforce CLI is installed...${NC}"
if ! command -v sfdx &> /dev/null; then
    echo -e "${RED}Salesforce CLI is not installed. Please install it first.${NC}"
    echo "Visit https://developer.salesforce.com/tools/sfdxcli to download and install."
    exit 1
fi
echo -e "${GREEN}Salesforce CLI is installed.${NC}"
echo

# Check if user is authenticated
echo -e "${YELLOW}Checking if you are authenticated to a Salesforce org...${NC}"
if ! sfdx force:org:list | grep -q "(A)"; then
    echo -e "${RED}You are not authenticated to any Salesforce org.${NC}"
    echo "Please run the following command to authenticate:"
    echo "sfdx force:auth:web:login -r https://login.salesforce.com"
    exit 1
fi
echo -e "${GREEN}You are authenticated to a Salesforce org.${NC}"
echo

# Deploy components to the org
echo -e "${YELLOW}Deploying VinTrek components to your org...${NC}"
echo "This may take a few minutes..."
sfdx force:source:deploy -p force-app/main/default

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to deploy components. Please check the error message above.${NC}"
    exit 1
fi
echo -e "${GREEN}Components deployed successfully.${NC}"
echo

# Create Experience Cloud site
echo -e "${YELLOW}Now you need to create the Experience Cloud site manually.${NC}"
echo "Please follow these steps:"
echo
echo "1. Log in to your Salesforce org"
echo "2. Go to Setup > Feature Settings > Digital Experiences > All Sites"
echo "3. Click 'New' to create a new site"
echo "4. Choose 'Customer Account Portal' template"
echo "5. Configure basic settings:"
echo "   - Name: VinTrek"
echo "   - URL: vintrek"
echo "6. Complete the wizard to create the site"
echo
read -p "Press Enter when you have created the site..."
echo

# Configure user profiles
echo -e "${YELLOW}Now you need to configure user profiles and access.${NC}"
echo "Please follow these steps:"
echo
echo "1. In Setup > Feature Settings > Digital Experiences > All Sites, click 'Workspaces' next to your VinTrek site"
echo "2. Go to Administration > Members"
echo "3. Add the following profiles:"
echo "   - Customer Community User (for Campers)"
echo "   - Customer Community Plus User (for Service Providers)"
echo "   - System Administrator (for Admins)"
echo "4. Go to Administration > Preferences and enable:"
echo "   - Allow internal users to log in directly to the community"
echo "   - Enable self-registration for Customer Community User profile"
echo "5. Go to Administration > Login & Registration and configure:"
echo "   - Login options (username/password, social login, etc.)"
echo "   - Self-registration settings"
echo
read -p "Press Enter when you have configured user profiles and access..."
echo

# Configure navigation and branding
echo -e "${YELLOW}Now you need to configure navigation and branding.${NC}"
echo "Please follow these steps:"
echo
echo "1. In Experience Builder, click 'Builder' to open Experience Builder"
echo "2. Configure Theme:"
echo "   - Upload VinTrek logo"
echo "   - Set brand colors (primary: #1589ee, secondary: #04844b)"
echo "   - Configure header and footer"
echo "3. Configure Navigation:"
echo "   - Create navigation menu items:"
echo "     - Home (points to Home page)"
echo "     - Trails (points to Trails page)"
echo "     - Campsites (points to Campsites page)"
echo "     - My Bookings (points to My Bookings page)"
echo "     - Service Provider (visible only to Service Provider profile)"
echo
read -p "Press Enter when you have configured navigation and branding..."
echo

# Create pages and add components
echo -e "${YELLOW}Now you need to create pages and add components.${NC}"
echo "Please follow these steps:"
echo
echo "1. Create Home Page:"
echo "   - Add trailRecommendations component"
echo "   - Add notificationCenter component"
echo "   - Add welcome content and featured trails"
echo
echo "2. Create Trails Page:"
echo "   - Add enhancedTrailMap component"
echo "   - Add trailExplorer component"
echo "   - Configure components to work together"
echo
echo "3. Create Campsites Page:"
echo "   - Add campingItemList component"
echo "   - Add map showing campsite locations"
echo
echo "4. Create My Bookings Page:"
echo "   - Add enhancedBookingForm component"
echo "   - Add list of user's bookings"
echo
echo "5. Create Service Provider Page:"
echo "   - Add serviceProviderHomePage component"
echo "   - Configure access to be limited to Service Provider profile"
echo
read -p "Press Enter when you have created pages and added components..."
echo

# Configure object access and sharing
echo -e "${YELLOW}Now you need to configure object access and sharing.${NC}"
echo "Please follow these steps:"
echo
echo "1. Go to Workspaces > Administration > Security"
echo "2. Configure object access for Customer Community User profile:"
echo "   - Trail__c (Read)"
echo "   - Campsite__c (Read)"
echo "   - Camping_Item__c (Read)"
echo "   - Review__c (Read, Create)"
echo "   - Rental__c (Read, Create)"
echo "   - Notification__c (Read)"
echo "   - Camper_Profile__c (Read, Create, Edit)"
echo
echo "3. Configure object access for Customer Community Plus User profile:"
echo "   - Trail__c (Read)"
echo "   - Campsite__c (Read, Create, Edit)"
echo "   - Camping_Item__c (Read, Create, Edit, Delete)"
echo "   - Review__c (Read)"
echo "   - Rental__c (Read)"
echo "   - Shop__c (Read, Create, Edit)"
echo
read -p "Press Enter when you have configured object access and sharing..."
echo

# Publish the site
echo -e "${YELLOW}Now you need to publish the site.${NC}"
echo "Please follow these steps:"
echo
echo "1. In Experience Builder, click 'Publish'"
echo "2. Confirm the publication"
echo "3. Your site will be available at https://your-domain.force.com/vintrek"
echo
read -p "Press Enter when you have published the site..."
echo

# Set up a custom domain (optional)
echo -e "${YELLOW}Optionally, you can set up a custom domain.${NC}"
echo "Please follow these steps:"
echo
echo "1. Go to Setup > Digital Experiences > Settings"
echo "2. Set up a custom domain (e.g., www.vintrek.com)"
echo "3. Purchase the domain or use an existing one"
echo "4. Configure DNS settings as per Salesforce instructions"
echo "5. Activate the domain"
echo
read -p "Press Enter when you have set up a custom domain (or skip this step)..."
echo

# Testing the site
echo -e "${YELLOW}Now you should test the site with different user profiles.${NC}"
echo "Please follow these steps:"
echo
echo "1. Test with different user profiles:"
echo "   - Log in as a Camper"
echo "   - Log in as a Service Provider"
echo "   - Log in as an Admin"
echo "2. Verify that each user can access appropriate pages and functionality"
echo "3. Test the complete user journey from trail search to booking"
echo
read -p "Press Enter when you have tested the site..."
echo

echo -e "${GREEN}VinTrek Experience Cloud Site Setup Complete!${NC}"
echo "Your VinTrek site is now set up and ready to use."
echo "If you encounter any issues, please refer to the Salesforce documentation or contact support."
echo
