import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [user] = useAuthState(auth);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB for base64)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setImageFile(file);
      setImageUrl(''); // Clear URL if file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageFile(null); // Clear file if URL is entered
    setPreviewUrl('');
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl.trim() && !imageFile) {
      alert('Please add some text or an image');
      return;
    }

    setLoading(true);
    setUploading(!!imageFile);
    
    try {
      let finalImageUrl = imageUrl;
      
      // Convert file to base64 if selected
      if (imageFile) {
        console.log('Converting file to base64...');
        finalImageUrl = await convertFileToBase64(imageFile);
        console.log('File converted successfully');
      }
      
      // Create post
      console.log('Creating Firestore post...');
      const postData = {
        text: text.trim(),
        imageUrl: finalImageUrl,
        user: user.email,
        likes: 0,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'posts'), postData);
      console.log('Post created successfully');
      
      // Reset form
      setText('');
      setImageUrl('');
      setImageFile(null);
      setPreviewUrl('');
      
      // Reset file input
      const fileInput = document.getElementById('imageFileInput');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Error creating post: ${error.message}`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const currentImageSrc = previewUrl || imageUrl;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h3>Create a Post</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows="4"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'vertical',
            marginBottom: '15px'
          }}
        />
        
        {/* Image Upload Options */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
            📷 Add an Image (Optional)
          </h4>
          
          {/* File Upload */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Upload from your device:
            </label>
            <input
              id="imageFileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Max file size: 2MB (optimized for quick sharing)
            </div>
          </div>
          
          {/* URL Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Or paste an image URL:
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        {/* Image Preview */}
        {currentImageSrc && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                Image Preview:
              </p>
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImageFile(null);
                  setPreviewUrl('');
                  const fileInput = document.getElementById('imageFileInput');
                  if (fileInput) fileInput.value = '';
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
            <img
              src={currentImageSrc}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              onLoad={(e) => {
                e.target.style.display = 'block';
              }}
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || (!text.trim() && !imageUrl.trim() && !imageFile)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading || (!text.trim() && !imageUrl.trim() && !imageFile) ? 'not-allowed' : 'pointer',
            opacity: loading || (!text.trim() && !imageUrl.trim() && !imageFile) ? 0.6 : 1
          }}
        >
          {uploading ? 'Processing Image...' : loading ? 'Posting...' : 'Post'}
        </button>
        
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          💡 <strong>Tip:</strong> You can post text, an image, or both! Upload files or paste image URLs.
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 