# Firebase Social App

A minimal social media application built with React and Firebase, featuring authentication, post creation, global feed with like/reply functionality, and Google Drive image storage.

## Features

- ✅ Email/password authentication (signup & login)
- ✅ Create text-only posts or posts with images
- ✅ Image upload and storage via Google Drive API
- ✅ View global feed of posts (ordered by newest first)
- ✅ Like posts (like count tracking)
- ✅ Reply to posts (nested comment system)
- ✅ Full-screen image viewing modal
- ✅ Real-time updates for posts and replies
- ✅ Responsive design

## Tech Stack

- **Frontend**: React (Create React App)
- **Backend**: Firebase
  - Authentication: Firebase Auth
  - Database: Cloud Firestore
  - Hosting: Firebase Hosting
- **Image Storage**: Google Drive API
- **State Management**: react-firebase-hooks

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
5. Get your Firebase config:
   - Go to Project Settings > General
   - Add a web app
   - Copy the configuration object

### 2. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable Google Drive API:
   - APIs & Services > Library
   - Search "Google Drive API" > Enable
4. Create Credentials:
   - Credentials > Create Credentials > API Key (copy this)
   - Create Credentials > OAuth 2.0 Client IDs:
     - Application type: Web application
     - Authorized JavaScript origins: `http://localhost:3000`
     - Copy the Client ID
5. Update `src/services/googleDrive.js` with your credentials

### 2. Local Setup

1. **Clone and install dependencies:**
   ```bash
   cd social-app
   npm install
   ```

2. **Configure Firebase:**
   - Open `src/firebase.js`
   - Replace the placeholder config with your actual Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### 3. Firebase Hosting Deployment

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Choose `build` as your public directory
   - Configure as a single-page app: Yes
   - Don't overwrite `index.html`

4. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── CreatePost.js     # Post creation component
│   └── Feed.js           # Posts feed component
├── firebase.js           # Firebase configuration
├── App.js               # Main app component
├── App.css              # Global styles
└── index.js             # App entry point
```

## Firebase Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Allow authenticated users to read and create replies
    match /replies/{replyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Data Schema

### Posts Collection (`posts`)
```javascript
{
  text: string,        // Post content (optional if image present)
  user: string,        // User email
  likes: number,       // Like count
  imageUrl: string,    // Google Drive public URL (optional)
  createdAt: timestamp // Creation timestamp
}
```

### Replies Collection (`replies`)
```javascript
{
  text: string,      // Reply content
  user: string,      // User email who replied
  postId: string,    // Reference to the parent post
  createdAt: timestamp // Creation timestamp
}
```

## Features Breakdown

### Authentication
- Email/password signup and login
- Persistent authentication state
- Sign out functionality

### Post Creation
- Text input with optional image upload
- Image preview before posting
- File size validation (max 5MB)
- Image format validation
- Auto-save user email with post
- Real-time timestamp

### Feed
- Real-time updates using Firestore listeners
- Posts ordered by creation date (newest first)
- Image display with click-to-enlarge
- Full-screen image modal
- Like functionality without user tracking
- Reply functionality with nested display

### Image Features
- Upload images via Google Drive API
- Automatic folder organization ("Social App Images")
- Public sharing for display in feed
- Support for common image formats (JPG, PNG, GIF, etc.)
- File size validation (max 5MB)
- OAuth authentication for secure access

### Reply System
- Click "Reply" button to open reply form
- Real-time reply count display
- Nested reply display with visual indentation
- Real-time updates for new replies

### UI/UX
- Clean, modern design
- Responsive layout
- Loading states
- Error handling
- Intuitive reply interface
- Smooth image interactions

## Environment Variables (Optional)

For additional security, you can use environment variables:

1. Create `.env` file in the root:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   # ... other config values
   ```

2. Update `firebase.js` to use environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     // ... other config
   };
   ```

## Deployment URL

After deployment, your app will be available at:
`https://your-project-id.web.app`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
