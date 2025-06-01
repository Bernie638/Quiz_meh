# 🔍 Azure Setup Review Checklist

Based on your Azure portal link, I can see you have:
- **Resource Group**: `SFR_GFE_quiz`
- **Static Web App**: `nuclear-quiz-frontendbb2025`
- **Location**: West US 2 (good choice for Wyoming!)

Let's review your setup step by step:

## 📋 **Current Setup Review**

### **1. Static Web App (Frontend)**
✅ **Name**: `nuclear-quiz-frontendbb2025`
✅ **Location**: West US 2 (optimal for Wyoming)

**Please check in Azure Portal:**
- [ ] **Configuration** → Application settings
- [ ] **Functions** → API integration status
- [ ] **Custom domains** (if any)
- [ ] **Environment** → Production deployment status

### **2. Backend API Service**
**Please tell me:**
- Do you have an App Service for the backend API?
- What's the name of your backend service?
- Is it in the same resource group (`SFR_GFE_quiz`)?

### **3. Database**
**Please check if you have:**
- [ ] Azure Database for PostgreSQL server
- [ ] Database name and connection status
- [ ] Firewall rules configured

### **4. Storage Account**
**For question images:**
- [ ] Storage account for blob storage
- [ ] Container named `question-images` or similar
- [ ] Public access configured for images

## 🔧 **Configuration Check**

### **Frontend Environment Variables**
In your Static Web App, check **Configuration** → **Application settings**:

**Should have:**
```
VITE_API_URL=https://your-backend-app.azurewebsites.net/api
VITE_APP_TITLE=Nuclear Engineering Exam Quiz
VITE_ENVIRONMENT=production
```

### **Backend Environment Variables**
In your App Service, check **Configuration** → **Application settings**:

**Should have:**
```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://...
AZURE_STORAGE_CONNECTION_STRING=...
CORS_ORIGIN=https://nuclear-quiz-frontendbb2025.azurestaticapps.net
```

## 🌐 **URL Testing**

### **Test These URLs:**

1. **Frontend**: `https://nuclear-quiz-frontendbb2025.azurestaticapps.net`
   - [ ] Loads the React app
   - [ ] Shows topic selection page
   - [ ] No console errors

2. **Backend API**: `https://your-backend-name.azurewebsites.net`
   - [ ] `/health` endpoint responds
   - [ ] `/api/topics` returns topic data
   - [ ] CORS headers allow frontend access

3. **Database Connection**:
   - [ ] Backend can connect to PostgreSQL
   - [ ] Tables exist and have data
   - [ ] Question images load properly

## 🚨 **Common Issues to Check**

### **CORS Problems**
If frontend can't connect to backend:
- Check `CORS_ORIGIN` in backend settings
- Should match your Static Web App URL exactly

### **Database Connection**
If API returns database errors:
- Verify PostgreSQL server is running
- Check firewall rules allow App Service
- Test connection string format

### **Missing Question Data**
If no questions appear:
- Database needs to be seeded with question data
- Check if migration scripts ran successfully
- Verify question images are in blob storage

## 📊 **Performance Optimization**

### **For Wyoming Users:**
✅ **West US 2** is good choice (closest Azure region)

**Additional optimizations:**
- [ ] Enable CDN for faster image loading
- [ ] Configure caching headers
- [ ] Set up Application Insights for monitoring

## 🔄 **Deployment Process**

### **How are you currently deploying updates?**

**Option A: Manual Upload**
- Uploading built files directly in portal

**Option B: GitHub Integration**
- Connected to your repository
- Automatic deployments on code changes

**Option C: Azure CLI**
- Using command line tools

## 🆘 **Troubleshooting Steps**

### **If frontend doesn't load:**
1. Check Static Web App deployment status
2. Look at build logs in Azure portal
3. Verify `staticwebapp.config.json` is correct

### **If API calls fail:**
1. Test backend health endpoint directly
2. Check browser network tab for CORS errors
3. Verify environment variables are set

### **If no questions appear:**
1. Check backend logs for database errors
2. Verify database has question data
3. Test API endpoints directly with Postman/curl

## 📝 **Next Steps**

**Please provide:**
1. **Your backend App Service name** (if you have one)
2. **Current error messages** (if any)
3. **What's working vs. not working**
4. **Screenshots of any error pages**

**I can help you:**
- Fix any configuration issues
- Set up missing components
- Optimize for your Wyoming team
- Debug specific problems

## 🎯 **Wyoming-Specific Considerations**

✅ **West US 2** - Good choice for latency
- Consider **West US 3** if available (even closer)
- **Central US** might also work well

**For your coworkers:**
- Expect ~30-50ms latency (excellent)
- Should work great on all devices
- Consider offline capabilities for remote areas

---

## 🤝 **Let's Review Together**

Can you share:
1. List of resources in your `SFR_GFE_quiz` resource group
2. Any error messages you're seeing
3. What's working and what isn't
4. Your backend service details

I'll help you optimize everything for your Wyoming team! 🚀