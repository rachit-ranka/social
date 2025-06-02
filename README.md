# Social App

A minimal social media app built with React and Firebase.

## Features

- ✅ **User Authentication** (Email/Password)
- ✅ **Text Posts** with real-time updates
- ✅ **Like System** with instant feedback
- ✅ **Reply System** for nested comments
- ✅ **Responsive Design** for mobile and desktop

## Live Demo

🌐 **Live App:** https://social-app-cloud.web.app

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rachit-ranka/social.git
   cd social
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Firebase configuration:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General
   - Copy the config values to your `.env` file

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add your domain to authorized domains (for production)

## Environment Variables

The app requires these Firebase configuration variables in `.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Deployment

The app is configured for Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Tech Stack

- **Frontend:** React, JavaScript
- **Authentication:** Firebase Auth
- **Database:** Cloud Firestore
- **Hosting:** Firebase Hosting
- **State Management:** React Hooks

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── CreatePost.js     # Post creation form
│   └── Feed.js           # Main feed with posts and replies
├── firebase.js           # Firebase configuration
└── App.js               # Main app component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
