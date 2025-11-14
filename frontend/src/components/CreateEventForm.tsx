import React, { useState } from 'react';
import axios from 'axios';
import { Card, Input, PrimaryButton } from './CommonStyles';
import styled from 'styled-components';
import { IEvent } from '../types/api';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;

  > div {
    flex: 1;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
`;

interface CreateEventFormProps {
  onEventCreated: (newEvent: IEvent) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // API call to the backend
      const { data } = await axios.post<IEvent>('/api/events', {
        title,
        startTime,
        endTime,
      });
      onEventCreated(data); 
      
      setTitle('');
      setStartTime('');
      setEndTime('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3>Create New Event</h3>
      <Form onSubmit={handleSubmit}>
        <label htmlFor="title">Event Title</label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., Team Meeting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <FormRow>
          <div>
            <label htmlFor="startTime">Start Time</label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endTime">End Time</label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </FormRow>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Add Event'}
        </PrimaryButton>
      </Form>
    </Card>
  );
};

export default CreateEventForm;