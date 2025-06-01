#!/bin/bash

# Nuclear Exam Quiz - Azure Deployment Script
# Run this script to deploy your application to Azure

set -e

echo "🚀 Nuclear Exam Quiz - Azure Deployment"
echo "========================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure first:"
    az login
fi

# Configuration
RESOURCE_GROUP="nuclear-quiz-rg"
LOCATION="East US"
DB_SERVER_NAME="nuclear-quiz-db-server"
DB_NAME="nuclear_quiz"
DB_ADMIN_USER="nuclearadmin"
STORAGE_ACCOUNT="nuclearquizstorage$(date +%s)"  # Add timestamp for uniqueness
APP_SERVICE_PLAN="nuclear-quiz-plan"
API_APP_NAME="nuclear-quiz-api-$(date +%s)"  # Add timestamp for uniqueness
STATIC_APP_NAME="nuclear-quiz-frontend"

echo "📝 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  API App Name: $API_APP_NAME"
echo ""

# Prompt for database password
read -sp "🔑 Enter a secure password for the database admin user: " DB_PASSWORD
echo ""

if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters long"
    exit 1
fi

echo "🏗️  Step 1: Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

echo "🗄️  Step 2: Creating PostgreSQL Database..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location "$LOCATION" \
  --admin-user $DB_ADMIN_USER \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME

az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

echo "💾 Step 3: Creating Storage Account..."
az storage account create \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --location "$LOCATION" \
  --sku Standard_LRS

az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name question-images \
  --public-access blob

echo "🖥️  Step 4: Creating App Service..."
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_PLAN \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $API_APP_NAME \
  --runtime "NODE|18-lts"

echo "⚙️  Step 5: Configuring Environment Variables..."

# Get connection strings
DB_CONNECTION_STRING=$(az postgres flexible-server show-connection-string \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME \
  --admin-user $DB_ADMIN_USER \
  --admin-password "$DB_PASSWORD" \
  --query connectionStrings.nodejs \
  --output tsv)

STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --query connectionString \
  --output tsv)

# Set app settings
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="$DB_CONNECTION_STRING" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    AZURE_STORAGE_CONTAINER_NAME=question-images \
    CORS_ORIGIN="https://$STATIC_APP_NAME.azurestaticapps.net" \
    JWT_SECRET="nuclear-quiz-jwt-secret-$(openssl rand -hex 32)"

echo "🔨 Step 6: Building Application..."
cd backend
npm install
npm run build
cd ..

cd frontend
npm install
npm run build
cd ..

echo "🚀 Step 7: Deploying Backend..."
cd backend
zip -r ../backend-deploy.zip dist/ node_modules/ package.json web.config
cd ..

az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --src backend-deploy.zip

echo "🌐 Step 8: Creating Static Web App..."
echo "Note: You'll need to manually create the Static Web App in Azure Portal"
echo "and connect it to your GitHub repository for the frontend deployment."

echo "🎉 Deployment Complete!"
echo "========================"
echo ""
echo "📊 Your Application URLs:"
echo "  API: https://$API_APP_NAME.azurewebsites.net"
echo "  Frontend: https://$STATIC_APP_NAME.azurestaticapps.net (after manual setup)"
echo ""
echo "🔧 Next Steps:"
echo "  1. Create Azure Static Web App in Azure Portal"
echo "  2. Connect it to your GitHub repository"
echo "  3. Run database migrations: npm run db:migrate"
echo "  4. Upload question images to blob storage"
echo "  5. Share the frontend URL with your coworkers!"
echo ""
echo "💰 Estimated Monthly Cost: $25-35"
echo ""

# Save configuration for later use
cat > deployment-info.txt << EOF
Nuclear Exam Quiz - Deployment Information
==========================================

Resource Group: $RESOURCE_GROUP
Database Server: $DB_SERVER_NAME
Database: $DB_NAME
Storage Account: $STORAGE_ACCOUNT
API App Service: $API_APP_NAME
API URL: https://$API_APP_NAME.azurewebsites.net

Database Admin User: $DB_ADMIN_USER
Database Password: [REDACTED - check your password manager]

Deployment Date: $(date)
EOF

echo "📝 Deployment information saved to deployment-info.txt"