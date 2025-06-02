# 🚀 Azure Deployment Guide - Nuclear Exam Quiz

Deploy your nuclear exam quiz application to Azure so your coworkers can access it online.

## 📋 **Overview**

We'll deploy:
- **Frontend**: Azure Static Web Apps (React app)
- **Backend**: Azure App Service (Node.js API)
- **Database**: Azure Database for PostgreSQL
- **Storage**: Azure Blob Storage (for question images)

**Estimated Cost**: $10-30/month for small team usage

---

## 🎯 **Step 1: Azure Resources Setup**

### **1.1 Create Resource Group**
```bash
# Install Azure CLI if not already installed
# Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login to Azure
az login

# Create resource group
az group create --name nuclear-quiz-rg --location "East US"
```

### **1.2 Create PostgreSQL Database**
```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-db-server \
  --location "East US" \
  --admin-user nuclearadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

# Create database
az postgres flexible-server db create \
  --resource-group nuclear-quiz-rg \
  --server-name nuclear-quiz-db-server \
  --database-name nuclear_quiz

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group nuclear-quiz-rg \
  --server-name nuclear-quiz-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### **1.3 Create Storage Account**
```bash
# Create storage account for question images
az storage account create \
  --resource-group nuclear-quiz-rg \
  --name nuclearquizstorage \
  --location "East US" \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --account-name nuclearquizstorage \
  --name question-images \
  --public-access blob
```

---

## 🖥️ **Step 2: Backend Deployment (API)**

### **2.1 Create App Service Plan**
```bash
az appservice plan create \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-plan \
  --location "East US" \
  --sku B1 \
  --is-linux
```

### **2.2 Create Web App**
```bash
az webapp create \
  --resource-group nuclear-quiz-rg \
  --plan nuclear-quiz-plan \
  --name nuclear-quiz-api \
  --runtime "NODE|18-lts"
```

### **2.3 Configure Environment Variables**
```bash
# Get database connection string
DB_CONNECTION_STRING=$(az postgres flexible-server show-connection-string \
  --server-name nuclear-quiz-db-server \
  --database-name nuclear_quiz \
  --admin-user nuclearadmin \
  --admin-password "YourSecurePassword123!" \
  --query connectionStrings.nodejs \
  --output tsv)

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group nuclear-quiz-rg \
  --name nuclearquizstorage \
  --query connectionString \
  --output tsv)

# Set app settings
az webapp config appsettings set \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-api \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="$DB_CONNECTION_STRING" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    AZURE_STORAGE_CONTAINER_NAME=question-images \
    CORS_ORIGIN="https://nuclear-quiz-frontend.azurestaticapps.net" \
    JWT_SECRET="your-production-jwt-secret-here"
```

### **2.4 Deploy Backend Code**
```bash
cd backend

# Create deployment package
npm run build

# Deploy using Azure CLI
az webapp deployment source config-zip \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-api \
  --src dist.zip
```

---

## 🌐 **Step 3: Frontend Deployment (Static Web App)**

### **3.1 Create Static Web App**
```bash
az staticwebapp create \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-frontend \
  --location "East US2" \
  --source https://github.com/yourusername/quiz_nuclear_exam \
  --branch main \
  --app-location "/frontend" \
  --api-location "/backend" \
  --output-location "/dist"
```

### **3.2 Configure Frontend Environment**

Create `/frontend/.env.production`:
```env
VITE_API_URL=https://nuclear-quiz-api.azurewebsites.net/api
VITE_APP_TITLE=Nuclear Engineering Exam Quiz
VITE_APP_VERSION=1.0.0
```

---

## 🔧 **Step 4: Database Setup & Data Migration**

### **4.1 Run Database Migrations**
```bash
# Connect to your deployed backend
# SSH into App Service or use local connection with production DB

# Set production database URL
export DATABASE_URL="your_azure_postgresql_connection_string"

# Run migrations
npm run db:migrate

# Seed with question data
npm run db:seed
```

### **4.2 Upload Question Images**
```bash
# Upload images to Azure Blob Storage
az storage blob upload-batch \
  --account-name nuclearquizstorage \
  --destination question-images \
  --source ./archive/question_images/ \
  --pattern "*.png"
```

---

## 🎛️ **Step 5: Configure Custom Domain (Optional)**

### **5.1 Add Custom Domain**
```bash
# If you have a domain (e.g., nuclear-quiz.yourcompany.com)
az staticwebapp hostname set \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-frontend \
  --hostname nuclear-quiz.yourcompany.com
```

---

## 🔒 **Step 6: Security & Access Control**

### **6.1 Configure Authentication (Optional)**
For restricting access to your coworkers only:

Create `/frontend/staticwebapp.config.json`:
```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "userDetailsClaim": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/your-tenant-id/v2.0",
          "clientIdSettingName": "AAD_CLIENT_ID",
          "clientSecretSettingName": "AAD_CLIENT_SECRET"
        }
      }
    }
  },
  "routes": [
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ]
}
```

### **6.2 Network Security**
```bash
# Restrict database access to App Service only
az postgres flexible-server firewall-rule create \
  --resource-group nuclear-quiz-rg \
  --server-name nuclear-quiz-db-server \
  --rule-name AllowAppService \
  --start-ip-address <app-service-ip> \
  --end-ip-address <app-service-ip>
```

---

## 📊 **Step 7: Monitoring & Scaling**

### **7.1 Enable Application Insights**
```bash
az monitor app-insights component create \
  --resource-group nuclear-quiz-rg \
  --app nuclear-quiz-insights \
  --location "East US" \
  --application-type web

# Link to App Service
az webapp config appsettings set \
  --resource-group nuclear-quiz-rg \
  --name nuclear-quiz-api \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-insights-key"
```

### **7.2 Configure Auto-scaling**
```bash
# Scale based on CPU usage
az monitor autoscale create \
  --resource-group nuclear-quiz-rg \
  --resource nuclear-quiz-api \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-nuclear-quiz \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

---

## 🚀 **Final Deployment URLs**

After successful deployment:

- **Application**: `https://nuclear-quiz-frontend.azurestaticapps.net`
- **API**: `https://nuclear-quiz-api.azurewebsites.net`
- **Admin Portal**: Azure Portal for monitoring

---

## 💰 **Cost Optimization**

### **Free Tier Resources**:
- Static Web Apps: Free tier (100GB bandwidth/month)
- App Service: B1 plan (~$13/month)
- PostgreSQL: Burstable B1ms (~$12/month)
- Storage: Standard LRS (~$2/month)

### **Cost Saving Tips**:
1. Use B1 tier for App Service (sufficient for small teams)
2. Enable auto-shutdown for non-production hours
3. Use Azure Reserved Instances for 1-year commit savings
4. Monitor usage with Azure Cost Management

---

## 🔧 **Maintenance & Updates**

### **Update Application**:
```bash
# Backend updates
cd backend
npm run build
az webapp deployment source config-zip --src dist.zip

# Frontend updates - automatic via GitHub Actions
git push origin main
```

### **Database Backups**:
```bash
# Enable automated backups (enabled by default)
az postgres flexible-server parameter set \
  --resource-group nuclear-quiz-rg \
  --server-name nuclear-quiz-db-server \
  --name backup_retention_days \
  --value 7
```

---

## 📞 **Share with Coworkers**

Once deployed, share these details:

**Application URL**: `https://nuclear-quiz-frontend.azurestaticapps.net`

**Instructions for coworkers**:
1. Visit the URL
2. Select nuclear engineering topics
3. Configure quiz settings
4. Take practice exams or study with immediate feedback
5. Track progress and review topic-specific performance

**Admin Access**: Azure Portal for monitoring usage and performance

---

## 🆘 **Troubleshooting**

### **Common Issues**:

**CORS Errors**: Update CORS_ORIGIN in backend app settings
**Database Connection**: Check firewall rules and connection string
**Images Not Loading**: Verify blob storage permissions and URLs
**502 Errors**: Check App Service logs in Azure Portal

### **Useful Commands**:
```bash
# View logs
az webapp log tail --resource-group nuclear-quiz-rg --name nuclear-quiz-api

# Restart services
az webapp restart --resource-group nuclear-quiz-rg --name nuclear-quiz-api

# Scale manually
az appservice plan update --resource-group nuclear-quiz-rg --name nuclear-quiz-plan --sku S1
```

Your nuclear exam quiz is now ready for your team to use! 🎉