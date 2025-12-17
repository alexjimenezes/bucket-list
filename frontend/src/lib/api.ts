import type {
  AuthMeResponse,
  BucketListsResponse,
  BucketListResponse,
  ItemResponse,
  InvitationsResponse,
  InvitationResponse,
  MessageResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const auth = {
  me: () => fetchApi<AuthMeResponse>('/auth/me'),
  logout: () => fetchApi<MessageResponse>('/auth/logout', { method: 'POST' }),
  getGoogleUrl: () => `${API_BASE}/auth/google`,
};

// Bucket Lists
export const bucketLists = {
  list: () => fetchApi<BucketListsResponse>('/bucket-lists'),

  get: (id: string) => fetchApi<BucketListResponse>(`/bucket-lists/${id}`),

  create: (data: { name: string; description?: string; type?: 'individual' | 'group' }) =>
    fetchApi<BucketListResponse>('/bucket-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string }) =>
    fetchApi<BucketListResponse>(`/bucket-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<MessageResponse>(`/bucket-lists/${id}`, { method: 'DELETE' }),

  invite: (id: string, email: string) =>
    fetchApi<InvitationResponse>(`/bucket-lists/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// Items
export const items = {
  create: (bucketListId: string, text: string) =>
    fetchApi<ItemResponse>(`/bucket-lists/${bucketListId}/items`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  update: (bucketListId: string, itemId: string, data: { text?: string; done?: boolean }) =>
    fetchApi<ItemResponse>(`/bucket-lists/${bucketListId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (bucketListId: string, itemId: string) =>
    fetchApi<MessageResponse>(`/bucket-lists/${bucketListId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  // Image upload (uses FormData, not JSON)
  uploadImage: async (bucketListId: string, itemId: string, file: File): Promise<ItemResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/bucket-lists/${bucketListId}/items/${itemId}/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // Don't set Content-Type header - browser will set it with boundary for FormData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new ApiError(response.status, error.error || 'Upload failed');
    }

    return response.json();
  },

  deleteImage: (bucketListId: string, itemId: string) =>
    fetchApi<ItemResponse>(`/bucket-lists/${bucketListId}/items/${itemId}/image`, {
      method: 'DELETE',
    }),
};

// Invitations
export const invitations = {
  pending: () => fetchApi<InvitationsResponse>('/invitations/pending'),

  accept: (id: string) =>
    fetchApi<MessageResponse>(`/invitations/${id}/accept`, { method: 'POST' }),

  decline: (id: string) =>
    fetchApi<MessageResponse>(`/invitations/${id}/decline`, { method: 'POST' }),
};

export { ApiError };
