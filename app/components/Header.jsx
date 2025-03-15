'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Adjust this path based on where your firebase.js file is located
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className='header'>
      <div className='container'>
        <div className='logo'>
          <Link href='/'>Traversy Media</Link>
        </div>
        <div className='links'>
          <Link href='/about'>About</Link>
          <Link href='/about/team'>Our Team</Link>
          <Link href='/code/repos'>Code</Link>
          
          {!loading && user && (
            <>
              <span className="user-email">{user.email}</span>
              <button 
                className="logout-button-small" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;