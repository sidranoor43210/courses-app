'use client';
import { useState, useEffect } from 'react';
import _ from 'lodash';

const CourseSearch = ({ getSearchResults }) => {
  const [query, setQuery] = useState('');
  
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
    // Call debounced search whenever query changes
    debouncedSearch(query);
    
    // Cleanup function to cancel debounced calls when component unmounts
    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can keep this if you want to also support form submission
    // or remove it since we're already searching as the user types
    debouncedSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className='search-form'>
      <input
        type='text'
        className='search-input'
        placeholder='Search Courses...'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className='search-button' type='submit'>
        Search
      </button>
    </form>
  );
};

export default CourseSearch;