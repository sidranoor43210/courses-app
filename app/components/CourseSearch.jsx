'use client';
import { useState, useEffect } from 'react';
import _ from 'lodash';

// Assuming you have some way to check if the user is logged in
const isUserLoggedIn = () => {
  // Check localStorage, cookies, or your global state to see if the user is logged in
  return localStorage.getItem('isLoggedIn') === 'true'; // This is just an example
};

const CourseSearch = ({ getSearchResults }) => {
  const [query, setQuery] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);  // State to control the login/signup popup visibility
  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn()); // Track if the user is logged in
  const [isSignup, setIsSignup] = useState(false);  // State to toggle between Login and Signup forms
  const [userDetails, setUserDetails] = useState({ email: '', password: '' }); // For storing user input

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

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login (this is just an example, replace with real login logic)
    localStorage.setItem('isLoggedIn', 'true');
    setLoggedIn(true);
    setShowLoginPopup(false);  // Close the login/signup popup after successful login
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Simulate signup (this is just an example, replace with real signup logic)
    localStorage.setItem('isLoggedIn', 'true');
    setLoggedIn(true);
    setShowLoginPopup(false);  // Close the login/signup popup after successful signup
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
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
                  />
                </div>
                <div className="form-group">
                  <button type="submit" className="login-button">
                    {isSignup ? 'Sign Up' : 'Log In'}
                  </button>
                </div>
              </form>

              <div className="switch-form">
                {/* Toggle between Login and Signup */}
                <button onClick={() => setIsSignup(!isSignup)} className="switch-button">
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