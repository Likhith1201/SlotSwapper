import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IEvent } from '../types/api';
import styled from 'styled-components';
import { LoadingSpinner, PrimaryButton } from './CommonStyles';
import { useAuth } from '../context/AuthContext';

// --- Styled Components ---

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const SlotList = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const SlotItem = styled.label<{ $selected: boolean }>`
  display: block;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  /* --- FIX 2: Use props.$selected to access the prop --- */
  background: ${(props) => props.$selected ? '#e6f7ff' : 'transparent'};

  &:hover {
    background: #f9f9f9;
  }

  input[type="radio"] {
    margin-right: 15px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
`;

const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString();

interface RequestSwapModalProps {
  theirSlot: IEvent; 
  onClose: () => void;
  onSwapRequested: () => void; 
}

const RequestSwapModal: React.FC<RequestSwapModalProps> = ({ theirSlot, onClose, onSwapRequested }) => {
  const { user } = useAuth();
  const [mySwappableSlots, setMySwappableSlots] = useState<IEvent[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch the logged-in user's own swappable slots
  useEffect(() => {
    const fetchMySlots = async () => {
      try {
        const { data } = await axios.get<IEvent[]>('/api/events/my-events');
        // Filter for only swappable slots
        const availableSlots = data.filter(slot => slot.status === 'SWAPPABLE');
        setMySwappableSlots(availableSlots);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch your slots');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySlots();
  }, []);

  // 2. Handle the swap request submission
  const handleSubmitRequest = async () => {
    if (!selectedSlotId) {
      setError('Please select one of your slots to offer.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await axios.post('/api/swaps/request', {
        mySlotId: selectedSlotId,
        theirSlotId: theirSlot._id,
      });
      
      alert('Swap request sent successfully!');
      onSwapRequested(); // Tell the parent to refresh
      onClose(); // Close the modal
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send swap request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOwnerName = (owner: IEvent['owner']): string => {
    if (typeof owner === 'object' && owner !== null) {
      return owner.name;
    }
    return 'User'; 
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Request a Swap</h2>
        <p>You are requesting this slot:</p>
        
        <SlotItem $selected={false} style={{ border: '1px solid #007bff', cursor: 'default' }}>
          <strong>{theirSlot.title}</strong> ({getOwnerName(theirSlot.owner)})<br/>
          <small>{formatDateTime(theirSlot.startTime)} &ndash; {formatDateTime(theirSlot.endTime)}</small>
        </SlotItem>

        <hr />
        
        <h3>Offer one of your slots:</h3>
        {isLoading && <LoadingSpinner />}
        
        {!isLoading && mySwappableSlots.length === 0 && (
          <p>You have no "SWAPPABLE" slots available to offer. Go to your Dashboard to mark a slot as swappable.</p>
        )}

        {!isLoading && mySwappableSlots.length > 0 && (
          <SlotList>
            {mySwappableSlots.map(slot => (
              <SlotItem key={slot._id} $selected={selectedSlotId === slot._id}>
                <input
                  type="radio"
                  name="my-slot-selection"
                  id={slot._id}
                  value={slot._id}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                />
                <label htmlFor={slot._id}>
                  <strong>{slot.title}</strong><br/>
                  <small>{formatDateTime(slot.startTime)} &ndash; {formatDateTime(slot.endTime)}</small>
                </label>
              </SlotItem>
            ))}
          </SlotList>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <PrimaryButton 
            onClick={handleSubmitRequest} 
            disabled={isLoading || isSubmitting || !selectedSlotId || mySwappableSlots.length === 0}
          >
            {isSubmitting ? 'Sending Request...' : 'Send Swap Request'}
          </PrimaryButton>
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default RequestSwapModal;