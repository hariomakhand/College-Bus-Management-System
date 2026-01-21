# Multer & Cloudinary Setup Instructions

## 1. Install Dependencies

```bash
cd backend
npm install multer cloudinary
```

## 2. Cloudinary Account Setup

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key  
   - API Secret

## 3. Environment Variables

Update your `.env` file with Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 4. API Endpoints

### Upload Single File
```
POST /api/upload/single
Content-Type: multipart/form-data
Body: file (form field)
```

### Upload Multiple Files
```
POST /api/upload/multiple  
Content-Type: multipart/form-data
Body: files[] (form field)
```

### Upload Profile Image
```
POST /api/upload/profile
Content-Type: multipart/form-data
Body: file, userId, userType
```

### Delete File
```
DELETE /api/upload/:publicId
```

## 5. Frontend Usage

### Basic File Upload
```jsx
import FileUpload from './components/FileUpload';

<FileUpload 
  onUpload={(data) => console.log('Uploaded:', data)}
  multiple={true}
  folder="documents"
/>
```

### Profile Image Upload
```jsx
import ProfileImageUpload from './components/ProfileImageUpload';

<ProfileImageUpload
  currentImage={user.profileImage}
  onUpload={(data) => setUser({...user, profileImage: data.url})}
  userId={user.id}
  userType="student"
  size="large"
/>
```

## 6. Features

✅ Single & Multiple file uploads
✅ Profile image uploads with optimization
✅ Drag & drop support
✅ File type validation
✅ File size limits
✅ Image optimization
✅ Cloudinary integration
✅ Delete functionality
✅ Progress indicators
✅ Error handling

## 7. File Types Supported

- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Max size: 5MB per file

## 8. Folder Structure

Files are organized in Cloudinary:
```
bus-management/
├── profiles/
│   ├── student/
│   ├── driver/
│   └── admin/
├── documents/
└── general/
```