// src/types/api.ts

// Represents the User object
export interface IUser {
  _id: string;
  name: string;
  email: string;
}

// Represents the Event object
export interface IEvent {
  _id: string;
  // The owner field can be a simple ID (string) or a populated User object
  owner: string | IUser; 
  title: string;
  startTime: string; // ISO 8601 date string
  endTime: string;   // ISO 8601 date string
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  createdAt: string;
}

// Represents a Swap Request
export interface ISwapRequest {
  _id: string;
  requester: IUser; // Populated user
  recipient: IUser; // Populated user
  mySlot: IEvent;     // Populated event
  theirSlot: IEvent;  // Populated event
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

// The response type from GET /api/swaps/requests
export interface IMyRequestsResponse {
  incoming: ISwapRequest[];
  outgoing: ISwapRequest[];
}