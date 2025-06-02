import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({}); // Store replies for each post
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [user] = useAuthState(auth);

  useEffect(() => {
    // Subscribe to posts
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    // Subscribe to replies
    const repliesQuery = query(collection(db, 'replies'));
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const repliesData = {};
      snapshot.docs.forEach(doc => {
        const reply = { id: doc.id, ...doc.data() };
        const postId = reply.postId;
        if (!repliesData[postId]) {
          repliesData[postId] = [];
        }
        repliesData[postId].push(reply);
      });
      
      // Sort replies by creation time
      Object.keys(repliesData).forEach(postId => {
        repliesData[postId].sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());
      });
      
      setReplies(repliesData);
    });

    return () => {
      unsubscribePosts();
      unsubscribeReplies();
    };
  }, []);

  const handleLike = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: currentLikes + 1
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const toggleReplyForm = (postId) => {
    setShowReplyForm(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    // Clear reply text when closing
    if (showReplyForm[postId]) {
      setReplyText(prev => ({
        ...prev,
        [postId]: ''
      }));
    }
  };

  const handleReplySubmit = async (postId) => {
    const text = replyText[postId]?.trim();
    if (!text) return;

    setSubmittingReply(prev => ({ ...prev, [postId]: true }));
    
    try {
      await addDoc(collection(db, 'replies'), {
        postId: postId,
        text: text,
        user: user.email,
        createdAt: serverTimestamp()
      });
      
      // Clear form and close
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      setShowReplyForm(prev => ({ ...prev, [postId]: false }));
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error posting reply. Please try again.');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [postId]: false }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h3>Recent Posts</h3>
      
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No posts yet. Be the first to share something!
        </p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#333' }}>{post.user}</strong>
              <span style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>
                {formatDate(post.createdAt)}
              </span>
            </div>
            
            {/* Text content */}
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              {post.text}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <button
                onClick={() => handleLike(post.id, post.likes)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                ❤️ Like ({post.likes})
              </button>
              <button
                onClick={() => toggleReplyForm(post.id)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#1976d2'
                }}
              >
                💬 Reply ({replies[post.id]?.length || 0})
              </button>
            </div>

            {/* Reply Form */}
            {showReplyForm[post.id] && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <textarea
                  value={replyText[post.id] || ''}
                  onChange={(e) => setReplyText(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  placeholder="Write a reply..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleReplySubmit(post.id)}
                    disabled={submittingReply[post.id] || !replyText[post.id]?.trim()}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: submittingReply[post.id] || !replyText[post.id]?.trim() ? 'not-allowed' : 'pointer',
                      opacity: submittingReply[post.id] || !replyText[post.id]?.trim() ? 0.6 : 1
                    }}
                  >
                    {submittingReply[post.id] ? 'Posting...' : 'Reply'}
                  </button>
                  <button
                    onClick={() => toggleReplyForm(post.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Display Replies */}
            {replies[post.id] && replies[post.id].length > 0 && (
              <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>
                  Replies ({replies[post.id].length})
                </h4>
                {replies[post.id].map((reply) => (
                  <div
                    key={reply.id}
                    style={{
                      marginLeft: '20px',
                      marginBottom: '12px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '3px solid #007bff'
                    }}
                  >
                    <div style={{ marginBottom: '5px' }}>
                      <strong style={{ color: '#333', fontSize: '14px' }}>{reply.user}</strong>
                      <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
                      {reply.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Feed; 