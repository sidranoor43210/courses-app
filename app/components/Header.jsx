'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const trackClick = (pageName) => {
    if (!user) return;
    
    let clickStats = JSON.parse(localStorage.getItem('clickStats') || '{}');
    
    if (!clickStats[user.uid]) {
      clickStats[user.uid] = {};
    }
    
    if (!clickStats[user.uid][pageName]) {
      clickStats[user.uid][pageName] = 0;
    }
    
    clickStats[user.uid][pageName]++;
    localStorage.setItem('clickStats', JSON.stringify(clickStats));
  };

  return (
    <header className='header'>
      <div className='container'>
        <div className='logo'>
          <Link href='/'>Traversy Media</Link>
        </div>
        <div className='links'>
          <Link href='/about' onClick={() => trackClick('About')}>About</Link>
          <Link href='/about/team' onClick={() => trackClick('Our Team')}>Our Team</Link>
          <Link href='/code/repos' onClick={() => trackClick('Code')}>Code</Link>
         
          {!loading && user && (
            <>
              <Link href='/dashboard' onClick={() => trackClick('Dashboard')}>Dashboard</Link>
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