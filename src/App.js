import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';
import './App.css';

function App() {
  const [user, loading, error] = useAuthState(auth);

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
      
      <main>
        <CreatePost />
        <Feed />
      </main>
    </div>
  );
}

export default App;
