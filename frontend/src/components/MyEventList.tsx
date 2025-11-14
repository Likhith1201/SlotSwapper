import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IEvent } from '../types/api';
import { Card, LoadingSpinner, PrimaryButton, SecondaryButton, DangerButton } from './CommonStyles';
import styled from 'styled-components';

const EventListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const EventItem = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 0;
`;

const EventDetails = styled.div`
  h4 {
    margin: 0 0 5px 0;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #555;
  }
`;

const EventActions = styled.div`
  display: flex;
  gap: 10px;
`;

const StatusBadge = styled.span<{ status: IEvent['status'] }>`
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${(props) =>
    props.status === 'BUSY' ? '#6c757d' :
    props.status === 'SWAPPABLE' ? '#28a745' :
    props.status === 'SWAP_PENDING' ? '#ffc107' : '#333'};
  color: ${(props) => props.status === 'SWAP_PENDING' ? '#333' : 'white'};
`;

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString(); 
};

const MyEventList: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get<IEvent[]>('/api/events/my-events');
        setEvents(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);
  
  // --- API Call Handlers ---

  const handleUpdateStatus = async (eventId: string, newStatus: 'BUSY' | 'SWAPPABLE') => {
    try {
      const { data } = await axios.put<IEvent>(`/api/events/${eventId}`, { status: newStatus });
      
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? data : event
        )
      );
    } catch (err: any) {
      alert(`Error updating status: ${err.response?.data?.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/events/${eventId}`);
      
      setEvents(prevEvents =>
        prevEvents.filter(event => event._id !== eventId)
      );
    } catch (err: any) {
      alert(`Error deleting event: ${err.response?.data?.message}`);
    }
  };


  if (isLoading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <EventListContainer>
      <h3>My Events</h3>
      {events.length === 0 && <p>You have no events. Create one above!</p>}
      
      {events.map(event => (
        <EventItem key={event._id}>
          <EventDetails>
            <h4>{event.title} <StatusBadge status={event.status}>{event.status}</StatusBadge></h4>
            <p>{formatDateTime(event.startTime)} &ndash; {formatDateTime(event.endTime)}</p>
          </EventDetails>
          
          <EventActions>
            {event.status === 'BUSY' && (
              <PrimaryButton onClick={() => handleUpdateStatus(event._id, 'SWAPPABLE')}>
                Make Swappable
              </PrimaryButton>
            )}

            {event.status === 'SWAPPABLE' && (
              <SecondaryButton onClick={() => handleUpdateStatus(event._id, 'BUSY')}>
                Make Busy
              </SecondaryButton>
            )}

            {event.status !== 'SWAP_PENDING' && (
              <DangerButton onClick={() => handleDeleteEvent(event._id)}>
                Delete
              </DangerButton>
            )}
            
            {event.status === 'SWAP_PENDING' && (
              <SecondaryButton disabled>
                Pending Swap
              </SecondaryButton>
            )}
          </EventActions>
        </EventItem>
      ))}
    </EventListContainer>
  );
};

export default MyEventList;