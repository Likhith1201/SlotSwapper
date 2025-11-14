import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IMyRequestsResponse, ISwapRequest } from '../types/api';
import { Card, LoadingSpinner, PrimaryButton, SecondaryButton, DangerButton } from '../components/CommonStyles';
import styled from 'styled-components';

// --- Styled Components ---

const RequestsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const RequestColumn = styled.div`
  h2 {
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
`;

const RequestCard = styled(Card)`
  padding: 15px;
  background: #fdfdfd;
`;

const SlotDetails = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  background: #fafafa;

  p {
    margin: 0;
  }
  
  strong {
    color: #007bff;
  }
`;

const RequestActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const StatusBadge = styled.span<{ status: ISwapRequest['status'] }>`
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${(props) =>
    props.status === 'PENDING' ? '#ffc107' :
    props.status === 'ACCEPTED' ? '#28a745' :
    props.status === 'REJECTED' ? '#dc3545' : '#6c757d'};
  color: ${(props) => props.status === 'PENDING' ? '#333' : 'white'};
`;

// --- Helper ---
const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString();

const RequestsPage: React.FC = () => {
  const [incoming, setIncoming] = useState<ISwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ISwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch all requests
  const fetchRequests = async () => {
    try {
      const { data } = await axios.get<IMyRequestsResponse>('/api/swaps/requests');
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Handle responding to a request (Accept/Reject)
  const handleResponse = async (requestId: string, accepted: boolean) => {
    try {
      // Call the API
      const { data } = await axios.post<ISwapRequest>(`/api/swaps/response/${requestId}`, {
        accepted,
      });

      // Update the state locally
      setIncoming(prev => 
        prev.map(req => 
          req._id === requestId ? { ...req, status: data.status } : req
        )
      );

    } catch (err: any) {
      alert(`Error responding to request: ${err.response?.data?.message}`);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>My Swap Requests</h1>
      <RequestsContainer>
        
        {/* --- INCOMING REQUESTS COLUMN --- */}
        <RequestColumn>
          <h2>Incoming Requests</h2>
          {incoming.length === 0 && <p>You have no incoming swap requests.</p>}
          
          {incoming.map(req => (
            <RequestCard key={req._id}>
              <p>
                <strong>{req.requester.name}</strong> wants to swap with you.
                <StatusBadge status={req.status} style={{ float: 'right' }}>{req.status}</StatusBadge>
              </p>
              
              <SlotDetails>
                <p><strong>They Offer (Their slot):</strong></p>
                <p>{req.mySlot.title}</p>
                <small>{formatDateTime(req.mySlot.startTime)}</small>
              </SlotDetails>
              
              <SlotDetails>
                <p><strong>They Want (Your slot):</strong></p>
                <p>{req.theirSlot.title}</p>
                <small>{formatDateTime(req.theirSlot.startTime)}</small>
              </SlotDetails>

              {/* Show Accept/Reject buttons ONLY if pending */}
              {req.status === 'PENDING' && (
                <RequestActions>
                  <PrimaryButton onClick={() => handleResponse(req._id, true)}>
                    Accept
                  </PrimaryButton>
                  <DangerButton onClick={() => handleResponse(req._id, false)}>
                    Reject
                  </DangerButton>
                </RequestActions>
              )}
            </RequestCard>
          ))}
        </RequestColumn>

        {/* --- OUTGOING REQUESTS COLUMN --- */}
        <RequestColumn>
          <h2>Outgoing Requests</h2>
          {outgoing.length === 0 && <p>You have not sent any swap requests.</p>}
          
          {outgoing.map(req => (
            <RequestCard key={req._id}>
              <p>
                Request to <strong>{req.recipient.name}</strong>
                <StatusBadge status={req.status} style={{ float: 'right' }}>{req.status}</StatusBadge>
              </p>

              <SlotDetails>
                <p><strong>You Offered (Your slot):</strong></p>
                <p>{req.mySlot.title}</p>
                <small>{formatDateTime(req.mySlot.startTime)}</small>
              </SlotDetails>

              <SlotDetails>
                <p><strong>You Want (Their slot):</strong></p>
                <p>{req.theirSlot.title}</p>
                <small>{formatDateTime(req.theirSlot.startTime)}</small>
              </SlotDetails>
            </RequestCard>
          ))}
        </RequestColumn>

      </RequestsContainer>
    </div>
  );
};

export default RequestsPage;