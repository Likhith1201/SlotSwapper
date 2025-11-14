
export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IEvent {
  _id: string;
  owner: string | IUser; 
  title: string;
  startTime: string; 
  endTime: string;   
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  createdAt: string;
}

export interface ISwapRequest {
  _id: string;
  requester: IUser; 
  recipient: IUser; 
  mySlot: IEvent;     
  theirSlot: IEvent;  
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

// The response type from GET /api/swaps/requests
export interface IMyRequestsResponse {
  incoming: ISwapRequest[];
  outgoing: ISwapRequest[];
}