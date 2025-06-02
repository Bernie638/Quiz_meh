# Nuclear Exam Quiz - Testing Guide

## 🚀 Quick Start Testing

### **Prerequisites**
- Node.js 18+ and npm 8+
- PostgreSQL database (for full functionality)
- Git

### **1. Install Dependencies**

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### **2. Start the Backend API**

```bash
cd backend

# Option A: With Database (Full Functionality)
# Set up your PostgreSQL database first, then:
npm run db:setup    # Run migrations and seed data
npm run dev         # Start development server on port 3001

# Option B: Mock Mode (Limited Testing)
# The current server.ts has mock endpoints for basic testing
npm run dev         # Starts with mock data
```

### **3. Start the Frontend**

```bash
cd frontend
npm run dev         # Starts on port 3000 (usually)
```

### **4. Access the Application**
- Open your browser to `http://localhost:3000`
- The backend API runs on `http://localhost:3001`

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Topic Selection**
1. Navigate to the homepage
2. Click "Start New Quiz"
3. **Test**: Select/deselect topics using checkboxes
4. **Test**: Use "Select All" and "Deselect All" buttons
5. **Test**: Verify topic count and question count updates
6. **Expected**: Should show topic statistics and total questions

### **Scenario 2: Quiz Configuration**
1. After selecting topics, click "Continue to Quiz Configuration"
2. **Test**: Try different question counts (10, 25, 50, 100, custom)
3. **Test**: Switch between quiz modes (Practice vs Immediate Feedback)
4. **Test**: Try different distribution strategies (Even vs Proportional)
5. **Test**: Watch the real-time preview update
6. **Expected**: Should show valid configuration and distribution preview

### **Scenario 3: Practice Test Mode**
1. Configure quiz with "Practice Test Mode"
2. Click "Start Quiz"
3. **Test**: Answer questions without seeing correct answers
4. **Test**: Navigate between questions (Previous/Next)
5. **Test**: Complete entire quiz
6. **Expected**: Shows results page with detailed analytics

### **Scenario 4: Immediate Feedback Mode**
1. Configure quiz with "Immediate Feedback Mode"
2. Click "Start Quiz"
3. **Test**: Answer a question and see instant feedback
4. **Test**: Correct vs incorrect answer feedback
5. **Test**: Can't change answer after submission
6. **Expected**: Shows green/red feedback with explanations

### **Scenario 5: Question Formatting**
1. Look for questions with technical content
2. **Test**: Check for superscript (CO₂, U²³⁵)
3. **Test**: Check for subscript (H₂O)
4. **Test**: Check for degree symbols (°)
5. **Test**: Check for images and tables
6. **Expected**: Proper scientific formatting displayed

---

## 🔧 **Testing with Mock Data**

If you don't have a database set up, the backend currently has mock endpoints:

### **Current Mock Data** (in `backend/src/server.ts`):
```javascript
// Mock topics endpoint returns:
{
  topics: [
    { id: 'valves', name: 'Valves', questionCount: 102 },
    { id: 'pumps', name: 'Pumps', questionCount: 174 },
    { id: 'sensors', name: 'Sensors and Detectors', questionCount: 172 }
  ]
}
```

### **Limitations with Mock Data**:
- ❌ Quiz generation won't work (returns empty questions)
- ❌ No real question content or formatting
- ✅ Topic selection UI works
- ✅ Configuration UI works
- ✅ Basic navigation works

---

## 🗄️ **Full Database Testing**

For complete functionality, you need to set up the database with real question data:

### **1. Database Setup**
```bash
cd backend

# Create .env file with your database connection
echo "DATABASE_URL=postgresql://username:password@localhost:5432/nuclear_quiz" > .env

# Run database setup
npm run db:setup
```

### **2. Question Data**
The application expects 1,319 nuclear engineering questions. You'll need to:
1. Use the PDF extraction tools to process `nuclear_exam_bank.pdf`
2. Run the seeding scripts to populate the database
3. Verify question formatting and images are properly stored

---

## 🐛 **Common Issues & Solutions**

### **Issue**: "CORS Error" 
**Solution**: Make sure backend is running on port 3001 and frontend on 3000

### **Issue**: "API request failed"
**Solution**: Check that backend server is running and accessible

### **Issue**: "No topics available"
**Solution**: Backend needs to return actual topic data (either mock or from database)

### **Issue**: "Quiz generation failed"
**Solution**: Ensure backend has question data and generation endpoints implemented

### **Issue**: Images not loading
**Solution**: Check that image URLs are correct and images are served properly

---

## 📊 **Feature Testing Checklist**

### **✅ Topic Selection**
- [ ] Page loads without errors
- [ ] Topics display with question counts
- [ ] Select/deselect functionality works
- [ ] Select All/Deselect All buttons work
- [ ] Continue button enables/disables correctly

### **✅ Quiz Configuration**
- [ ] Configuration options load correctly
- [ ] Question count selection works
- [ ] Quiz mode selection works
- [ ] Distribution strategy selection works
- [ ] Real-time preview updates
- [ ] Start Quiz button works

### **✅ Quiz Interface**
- [ ] Questions display with proper formatting
- [ ] Answer selection works
- [ ] Navigation controls work
- [ ] Progress tracking works
- [ ] Timer functionality works
- [ ] Both quiz modes work correctly

### **✅ Results & Analytics**
- [ ] Results page displays after completion
- [ ] Score calculation is correct
- [ ] Topic breakdown is accurate
- [ ] Time tracking is working
- [ ] Recommendations are relevant
- [ ] Action buttons work (Retake, New Quiz, Home)

### **✅ Formatting & Media**
- [ ] Superscript text displays correctly
- [ ] Subscript text displays correctly
- [ ] Degree symbols render properly
- [ ] Images load and display correctly
- [ ] Tables render with proper formatting
- [ ] Multi-line content preserves formatting

---

## 🔄 **Development Testing**

### **Hot Reload Testing**
1. Make changes to React components
2. Verify hot reload works in browser
3. Test TypeScript compilation
4. Check console for errors

### **API Testing**
```bash
# Test backend endpoints directly
curl http://localhost:3001/health
curl http://localhost:3001/api/topics
```

### **Build Testing**
```bash
# Test production builds
cd frontend && npm run build
cd ../backend && npm run build
```

---

## 📝 **Reporting Issues**

When testing, note:
1. **Browser and version**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Console errors (if any)**
5. **Network tab errors (if any)**

The application is designed to handle the complex formatting requirements of nuclear engineering exams, so pay special attention to scientific notation, technical diagrams, and mathematical expressions in questions.