import { useState, useEffect } from 'react';

// Mock data for open incidents count
export function useIncidentCount() {
  const [count, setCount] = useState(2); // Mock count of open incidents

  useEffect(() => {
    // In a real app, this would fetch from your data source
    // For now, we'll simulate some open incidents
    const timer = setTimeout(() => {
      setCount(2); // Simulating 2 open incidents
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return count;
}