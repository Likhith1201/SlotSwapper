// src/pages/MarketplacePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IEvent, IUser } from '../types/api';
import { Card, LoadingSpinner, PrimaryButton } from '../components/CommonStyles';
import styled from 'styled-components';
import RequestSwapModal from '../components/RequestSwapModal'; // NEW IMPORT

// --- Styled Components ---

const MarketplaceContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const SlotCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SlotDetails = styled.div`
  h4 {
    margin: 0 0 10px 0;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #555;
  }
  .owner {
    font-size: 12px;
    color: #007bff;
    font-weight: bold;
    margin-top: 10px;
  }
`;

// --- Helper ---
const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString();

const MarketplacePage: React.FC = () => {
  const [slots, setSlots] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<IEvent | null>(null);

  // 1. Fetch swappable slots from the API
  const fetchMarketplaceSlots = async () => {
    setIsLoading(true);
    try {
      // This is the GET /api/swaps/swappable-slots endpoint
      const { data } = await axios.get<IEvent[]>('/api/swaps/swappable-slots');
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchMarketplaceSlots();
  }, []);

  // 2. Modal open/close handlers
  const handleOpenModal = (slot: IEvent) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  // 3. Refresh list after a swap is requested
  const handleSwapRequested = () => {
    // Re-fetch all slots, as the requested slot will no longer be 'SWAPPABLE'
    fetchMarketplaceSlots();
  };

  // Helper to safely get owner name
  const getOwnerName = (owner: IEvent['owner']): string => {
    if (typeof owner === 'object' && owner !== null) {
      return owner.name; // Owner is populated IUser
    }
    return 'Unknown User'; // Fallback
  };

  return (
    <div>
      <h1>Marketplace</h1>
      <p>Here are all the slots available for swapping from other users.</p>
      
      {isLoading && <LoadingSpinner />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isLoading && slots.length === 0 && (
        <p>No slots are currently available for swapping.</p>
      )}

      <MarketplaceContainer>
        {slots.map(slot => (
          <SlotCard key={slot._id}>
            <SlotDetails>
              <h4>{slot.title}</h4>
              <p>{formatDateTime(slot.startTime)} &ndash; {formatDateTime(slot.endTime)}</p>
              <p className="owner">Owner: {getOwnerName(slot.owner)}</p>
            </SlotDetails>
            <PrimaryButton 
              onClick={() => handleOpenModal(slot)}
              style={{ marginTop: '20px' }}
            >
              Request Swap
            </PrimaryButton>
          </SlotCard>
        ))}
      </MarketplaceContainer>

      {/* --- The Modal --- */}
      {isModalOpen && selectedSlot && (
        <RequestSwapModal
          theirSlot={selectedSlot}
          onClose={handleCloseModal}
          onSwapRequested={handleSwapRequested}
        />
      )}
    </div>
  );
};

export default MarketplacePage;