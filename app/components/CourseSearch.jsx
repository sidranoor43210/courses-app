'use client';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged
} from 'firebase/auth';

const CourseSearch = ({ getSearchResults }) => {
  const [query, setQuery] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [userDetails, setUserDetails] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Create a debounced search function
  const debouncedSearch = _.debounce(async (searchQuery) => {
    if (searchQuery.trim() === '') {
      // If search query is empty, fetch all courses
      const res = await fetch('/api/courses');
      const courses = await res.json();
      getSearchResults(courses);
      return;
    }

    const res = await fetch(`/api/courses/search?query=${searchQuery}`);
    const courses = await res.json();
    getSearchResults(courses);
  }, 500); // 500ms delay

  // Check authentication state when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setLoggedIn(true);
        setUser(user);
      } else {
        // User is signed out
        setLoggedIn(false);
        setUser(null);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Call debounced search only if user is logged in
    if (loggedIn) {
      debouncedSearch(query);
    }
    
    // Cleanup function to cancel debounced calls when component unmounts
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, loggedIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loggedIn) {
      debouncedSearch(query);
    } else {
      setShowLoginPopup(true);
    }
  };

  const handleSearchInputClick = () => {
    if (!loggedIn) {
      setShowLoginPopup(true);
    }
  };

  // Reset form fields after successful authentication
  const resetForm = () => {
    setUserDetails({ email: '', password: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Sign in with email and password using Firebase
      await signInWithEmailAndPassword(auth, userDetails.email, userDetails.password);
      setShowLoginPopup(false);
      resetForm(); // Reset the form fields
      // Auth state change will automatically update loggedIn state
    } catch (error) {
      // Handle different error codes
      if (error.code === 'auth/user-not-found') {
        setError('You are a new user. Please sign up first.');
        setIsSignup(true); // Automatically switch to signup form
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Create a new user with email and password using Firebase
      await createUserWithEmailAndPassword(auth, userDetails.email, userDetails.password);
      setShowLoginPopup(false);
      resetForm(); // Reset the form fields
      // Auth state change will automatically update loggedIn state
    } catch (error) {
      // Handle different error codes
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please log in instead.');
        setIsSignup(false); // Switch to login form
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Signup failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='search-form'>
        <input
          type='text'
          className='search-input'
          placeholder='Search Courses...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={handleSearchInputClick}
        />
        <button className='search-button' type='submit'>
          Search
        </button>
      </form>

      {/* Login/Signup Popup */}
      {showLoginPopup && !loggedIn && (
        <div className="login-popup-overlay">
          <div className="login-popup">
            <div className="login-popup-content">
              <div className="login-popup-header">
                <h3>{isSignup ? 'Sign Up' : 'Log In'}</h3>
                <button className="close-button" onClick={handleClosePopup}>&times;</button>
              </div>
              
              {/* Error message display */}
              {error && <div className="error-message">{error}</div>}
              
              {/* Conditional form rendering based on isSignup state */}
              <form onSubmit={isSignup ? handleSignup : handleLogin} className="login-form">
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userDetails.email}
                    onChange={handleChange}
                    required
                    className="login-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={userDetails.password}
                    onChange={handleChange}
                    required
                    className="login-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
                  </button>
                </div>
              </form>

              <div className="switch-form">
                {/* Toggle between Login and Signup */}
                <button 
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }} 
                  className="switch-button"
                  disabled={loading}
                >
                  {isSignup ? 'Already have an account? Log In' : 'New user? Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;