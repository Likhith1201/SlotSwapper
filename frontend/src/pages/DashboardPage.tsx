import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateEventForm from '../components/CreateEventForm';
import MyEventList from '../components/MyEventList';
import { IEvent } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  

  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventCreated = (newEvent: IEvent) => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div>
      <h1>Dashboard: Welcome, {user?.name}</h1>
      <p>Manage your calendar slots here. Create a new event, then mark it as "Swappable" to offer it in the Marketplace.</p>
      
      <CreateEventForm onEventCreated={handleEventCreated} />
      
      <hr style={{ margin: '30px 0', border: '1px solid #f0f0f0' }} />
      
      <MyEventList key={refreshKey} />
    </div>
  );
};

export default DashboardPage;