import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';
import Search from './components/Search';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'search', or 'profile'

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 0',
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <h1 style={{ margin: 0 }}>Social App</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Welcome, {user.email}!</span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '8px 15px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <nav style={{
        maxWidth: '600px',
        margin: '0 auto 20px auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'feed' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'feed' ? 'bold' : 'normal',
              color: activeTab === 'feed' ? '#007bff' : '#666'
            }}
          >
            🏠 Feed
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'search' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'search' ? 'bold' : 'normal',
              color: activeTab === 'search' ? '#007bff' : '#666'
            }}
          >
            🔍 Search
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
              color: activeTab === 'profile' ? '#007bff' : '#666'
            }}
          >
            👤 Profile
          </button>
        </div>
      </nav>
      
      <main>
        {activeTab === 'feed' && (
          <>
            <CreatePost />
            <Feed />
          </>
        )}
        {activeTab === 'search' && <Search />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default App;
