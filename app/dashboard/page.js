'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import LoadingPage from '../loading';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickStats, setClickStats] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load click statistics from localStorage
        const allStats = JSON.parse(localStorage.getItem('clickStats') || '{}');
        const userStats = allStats[currentUser.uid] || {};
        setClickStats(userStats);
      } else {
        // Redirect to home if not logged in
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null; // This shouldn't render as we're redirecting in useEffect
  }

  // Get total clicks
  const totalClicks = Object.values(clickStats).reduce((sum, count) => sum + count, 0);
  
  // Get most visited page
  const getMostVisitedPage = () => {
    if (Object.keys(clickStats).length === 0) return "None";
    return Object.entries(clickStats).reduce((max, [page, count]) => 
      count > (clickStats[max] || 0) ? page : max
    , Object.keys(clickStats)[0]);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">User Dashboard</h1>
      
      <div className="dashboard-welcome">
        <h2>Welcome, {user.email}</h2>
        <p>Track your site navigation statistics and page visits.</p>
      </div>
      
      <div className="dashboard-metrics">
        <div className="metric-card">
          <h4>Total Visits</h4>
          <div className="metric-value">{totalClicks}</div>
          <div className="metric-label">page views</div>
        </div>
        
        <div className="metric-card">
          <h4>Pages Visited</h4>
          <div className="metric-value">{Object.keys(clickStats).length}</div>
          <div className="metric-label">unique pages</div>
        </div>
        
        <div className="metric-card">
          <h4>Most Visited</h4>
          <div className="metric-value">{getMostVisitedPage()}</div>
          <div className="metric-label">frequent page</div>
        </div>
      </div>

      <div className="stats-container">
        <h3>Page Visit Statistics</h3>
        {Object.keys(clickStats).length > 0 ? (
          <div className="stats-table">
            <div className="stats-header">
              <div className="stats-cell">Page</div>
              <div className="stats-cell">Visits</div>
              <div className="stats-cell">Percentage</div>
            </div>
            {Object.entries(clickStats).map(([page, count], index) => (
              <div key={page} className="stats-row" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stats-cell">{page}</div>
                <div className="stats-cell">{count}</div>
                <div className="stats-cell">
                  {totalClicks > 0 ? ((count / totalClicks) * 100).toFixed(1) + '%' : '0%'}
                </div>
              </div>
            ))}
            <div className="stats-row total">
              <div className="stats-cell">Total</div>
              <div className="stats-cell">{totalClicks}</div>
              <div className="stats-cell">100%</div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No navigation data available yet. Start browsing the site!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;