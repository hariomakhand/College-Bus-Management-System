# Cloudinary Setup Instructions

## 1. Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email

## 2. Get Your Credentials
1. Login to Cloudinary Dashboard
2. Go to Dashboard → Settings → Account
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

## 3. Update .env File
Replace the placeholder values in your `.env` file:

```env
# Replace these with your actual Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Install Dependencies
```bash
cd backend
npm install
```

## 5. Test Upload
1. Start your backend server: `npm start`
2. Go to Admin Panel → Drivers → Add Driver
3. Try uploading a license document or profile image

## File Organization in Cloudinary
```
bus-management/
├── drivers/
│   ├── licenses/     # License documents
│   └── profiles/     # Profile images
├── students/
│   └── profiles/     # Student profile images
└── documents/        # General documents
```

## Supported File Types
- **Images**: JPG, PNG, GIF (max 5MB)
- **Documents**: PDF, DOC, DOCX (max 5MB)

## Features Added
✅ License document upload for drivers
✅ Profile image upload for drivers  
✅ Drag & drop interface
✅ File validation (type & size)
✅ Progress indicators
✅ Error handling
✅ Cloudinary integration