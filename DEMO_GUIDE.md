# 🚀 Launch Token Feature - Demo & Setup Guide

## 🎮 Quick Demo Script (5 minutes)

### **Step 1: Connect Wallet** (30 seconds)
```bash
# Start the development server
npm run dev

# Open http://localhost:8080
# Scroll to "Solana Integration Demo" section
# Click "Connect" button and select Phantom wallet
# Ensure wallet is set to Devnet
```

### **Step 2: Launch Token Flow** (4 minutes)
1. **Open Modal**: Click the purple "Launch Token" button
2. **Select Template**: Click "AI Sultan V3" from the template grid
3. **Customize** (optional): 
   - Modify token name/symbol
   - Upload a logo image (PNG/JPEG, max 5MB)
   - Adjust liquidity settings
4. **Launch**: Click "Launch Token" button
5. **Wait**: Loading animation for 10-20 seconds while backend processes
6. **Success**: Congratulations screen with mint address and explorer links

### **Step 3: Verify on Explorer** (30 seconds)
- Copy the mint address from success screen
- Click "View Token" to open Solana Explorer
- Verify token exists on devnet with correct details

---

## ⚙️ Environment Configuration

### **Required Environment Variables**
```env
# Backend API endpoint (already configured)
VITE_BACKEND_URL=http://144.124.225.79:3001

# Solana configuration (existing)
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet
```

### **Development Setup**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing Checklist

### **Happy Path Testing**
- [ ] Wallet connects successfully to devnet
- [ ] Launch Token button appears in Solana section
- [ ] Modal opens with 4 AI templates displayed
- [ ] Template selection auto-fills form fields
- [ ] Form validation prevents invalid submissions
- [ ] Image upload works with supported formats (PNG, JPEG, WEBP, GIF)
- [ ] Launch button triggers loading animation
- [ ] Backend API call succeeds within 20 seconds
- [ ] Success screen shows mint address and transaction ID
- [ ] Explorer links open with correct devnet URLs
- [ ] Copy buttons work for mint address and transaction ID

### **Error Path Testing**
- [ ] Invalid image format shows error message
- [ ] Oversized image (>5MB) shows error message
- [ ] Required field validation prevents submission
- [ ] Network error shows retry option
- [ ] Backend timeout shows helpful error message
- [ ] Server error (500) shows clear error message

### **Persistence Testing**
- [ ] Wallet selection persists after page reload
- [ ] Auto-connect works if wallet was previously connected
- [ ] Form data clears after successful launch
- [ ] Modal can be opened multiple times without issues

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

**Issue**: Launch button doesn't appear
- **Solution**: Ensure wallet is connected to devnet

**Issue**: Backend timeout error
- **Solution**: Check `VITE_BACKEND_URL` is correct and backend is running

**Issue**: Image upload fails
- **Solution**: Verify file format (PNG/JPEG/WEBP/GIF) and size (<5MB)

**Issue**: Explorer links don't work
- **Solution**: Verify links include `?cluster=devnet` parameter

**Issue**: Wallet doesn't auto-connect
- **Solution**: Check browser localStorage for `pepelab_preferred_wallet` entry

### **Development Debugging**
```bash
# Check environment variables
echo $VITE_BACKEND_URL

# Verify backend is accessible
curl http://144.124.225.79:3001/health

# Check browser console for errors
# Look for wallet connection issues
# Verify API request/response logs
```

---

## 📋 Backend API Contract

### **Endpoint**: `POST /api/token/create-with-pool`

### **Request Format (JSON)**:
```json
{
  "name": "AI Sultan V3",
  "symbol": "AIS3",
  "description": "The ultimate AI-powered meme token",
  "decimals": 9,
  "initialSupply": 1000000,
  "initialLiquidity": 0.1,
  "percentage": 50,
  "socialLinks": "https://twitter.com/aisultan"
}
```

### **Request Format (Multipart with Image)**:
```javascript
const formData = new FormData();
formData.append("name", "AI Sultan V3");
formData.append("symbol", "AIS3");
formData.append("initialSupply", "1000000");
formData.append("image", imageFile);
// ... other fields
```

### **Expected Response**:
```json
{
  "mint": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "name": "AI Sultan V3",
  "symbol": "AIS3",
  "decimals": 9,
  "initialSupply": 1000000,
  "tokenAccount": "...",
  "txId": "5KJ...",
  "pool": {
    "address": "...",
    "lpMint": "...",
    "txId": "..."
  },
  "initialPrice": 0.0001,
  "isPlaceholder": false
}
```

---

## 🚀 Deployment Notes

### **Production Checklist**
- [ ] Update `VITE_BACKEND_URL` to production backend
- [ ] Verify backend supports CORS for your domain
- [ ] Test with production backend before deployment
- [ ] Ensure backend has proper rate limiting
- [ ] Verify image upload limits match frontend validation

### **Security Considerations**
- ✅ No private keys in frontend code
- ✅ All transactions on devnet only
- ✅ Backend handles all signing operations
- ✅ Input validation on both client and server
- ✅ File upload size and type restrictions

---

**🎯 The feature is ready for immediate testing and demonstration!**