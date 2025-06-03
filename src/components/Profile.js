import React, { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({ postsCount: 0, totalLikes: 0 });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load user profile from existing posts (bio in latest post metadata)
    const loadProfile = async () => {
      try {
        // Try to find user profile in posts metadata
        const profileQuery = query(
          collection(db, 'posts'),
          where('user', '==', user.email),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(profileQuery);
        let foundBio = '';
        let foundDisplayName = '';
        
        // Look for profile data in recent posts
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.userBio && !foundBio) {
            foundBio = data.userBio;
          }
          if (data.userDisplayName && !foundDisplayName) {
            foundDisplayName = data.userDisplayName;
          }
        });
        
        setBio(foundBio);
        setDisplayName(foundDisplayName || user.email);
        setProfileLoaded(true);
      } catch (error) {
        console.error('Error loading profile:', error);
        setDisplayName(user.email);
        setProfileLoaded(true);
      }
    };

    // Subscribe to user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('user', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserPosts(posts);
      
      // Calculate stats
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      setUserStats({
        postsCount: posts.length,
        totalLikes: totalLikes
      });
    });

    loadProfile();
    return () => unsubscribe();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Create a profile post that stores the bio and display name
      const profileData = {
        text: `📝 Profile Updated: ${bio || 'Bio updated'}`,
        user: user.email,
        likes: 0,
        createdAt: serverTimestamp(),
        isProfileUpdate: true,
        userBio: bio.trim(),
        userDisplayName: displayName.trim() || user.email
      };
      
      await addDoc(collection(db, 'posts'), profileData);
      
      // Also update existing posts with the new display name if possible
      const existingPosts = [...userPosts];
      const updatePromises = existingPosts.slice(0, 3).map(async (post) => {
        try {
          await updateDoc(doc(db, 'posts', post.id), {
            userDisplayName: displayName.trim() || user.email,
            userBio: bio.trim()
          });
        } catch (err) {
          // Ignore individual update errors
          console.log('Could not update post:', post.id);
        }
      });
      
      await Promise.allSettled(updatePromises);
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message}. This might be due to Firebase permissions. Your profile data will be saved with your next post.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user || !profileLoaded) {
    return (
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            marginRight: '20px'
          }}>
            {(displayName || user.email).charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>
              {displayName || user.email}
            </h2>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '8px 16px',
              backgroundColor: isEditing ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Bio Section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Bio</h4>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              color: bio ? '#333' : '#999',
              fontStyle: bio ? 'normal' : 'italic',
              lineHeight: '1.5',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {bio || 'No bio added yet. Click "Edit Profile" to add one!'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '30px',
          paddingTop: '15px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {userStats.postsCount}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Posts
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {userStats.totalLikes}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Total Likes
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          My Posts ({userStats.postsCount})
        </h3>
        
        {userPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ color: '#666', margin: 0 }}>
              You haven't posted anything yet. Go to the Feed to create your first post!
            </p>
          </div>
        ) : (
          userPosts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: post.isProfileUpdate ? '#f0f8ff' : '#fff',
                borderLeft: post.isProfileUpdate ? '4px solid #007bff' : '1px solid #ddd'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {formatDate(post.createdAt)}
                  {post.isProfileUpdate && (
                    <span style={{ 
                      marginLeft: '10px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '3px', 
                      fontSize: '12px' 
                    }}>
                      Profile Update
                    </span>
                  )}
                </span>
              </div>
              
              <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                {post.text}
              </p>
              
              {/* Image content */}
              {post.imageUrl && (
                <div style={{ marginBottom: '15px' }}>
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                fontSize: '14px',
                color: '#666'
              }}>
                <span>❤️ {post.likes || 0} likes</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile; 