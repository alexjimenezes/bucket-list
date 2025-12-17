export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface BucketListMember {
  id: string;
  userId: string;
  bucketListId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface BucketListItem {
  id: string;
  bucketListId: string;
  text: string;
  done: boolean;
  completedAt: string | null;
  completedById: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  imageUploadedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BucketList {
  id: string;
  name: string;
  description: string | null;
  type: 'individual' | 'group';
  createdAt: string;
  updatedAt: string;
  members: BucketListMember[];
  items?: BucketListItem[];
  itemCount?: number;
  completedCount?: number;
}

export interface Invitation {
  id: string;
  bucketListId: string;
  invitedById: string;
  email: string;
  invitedUserId: string | null;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  bucketList: {
    id: string;
    name: string;
    description: string | null;
  };
  invitedBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface AuthMeResponse {
  user: User;
}

export interface BucketListsResponse {
  bucketLists: BucketList[];
}

export interface BucketListResponse {
  bucketList: BucketList;
}

export interface ItemResponse {
  item: BucketListItem;
}

export interface InvitationsResponse {
  invitations: Invitation[];
}

export interface InvitationResponse {
  invitation: Invitation;
}

export interface MessageResponse {
  message: string;
}
