// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateEventForm from '../components/CreateEventForm';
import MyEventList from '../components/MyEventList';
import { IEvent } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // This state is used to connect the form to the list
  // We need to re-render the list when a new event is created
  // A simple way is to pass a "refresh key" to MyEventList
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventCreated = (newEvent: IEvent) => {
    // When a new event is created, increment the key
    // This forces MyEventList to re-run its useEffect
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div>
      <h1>Dashboard: Welcome, {user?.name}</h1>
      <p>Manage your calendar slots here. Create a new event, then mark it as "Swappable" to offer it in the Marketplace.</p>
      
      {/* --- Create Event Form --- */}
      <CreateEventForm onEventCreated={handleEventCreated} />
      
      <hr style={{ margin: '30px 0', border: '1px solid #f0f0f0' }} />
      
      {/* * --- My Event List --- 
        * We pass 'key={refreshKey}' to force a re-render when an event is created.
        * This is simpler than manually adding the new event to the list's state.
      */}
      <MyEventList key={refreshKey} />
    </div>
  );
};

export default DashboardPage;