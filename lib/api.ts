/**
 * This file contains helper functions to interact with the Express API server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    // Get error message from the response body
    const errorData = await response.json();
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Student API endpoints
 */
export const studentAPI = {
  // Get all students
  getAll: () => fetchAPI<any[]>('/students'),
  
  // Get a student by ID
  getById: (id: string) => fetchAPI<any>(`/students/${id}`),
  
  // Create a new student
  create: (data: any) => fetchAPI<any>('/students', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Update a student
  update: (id: string, data: any) => fetchAPI<any>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete a student
  delete: (id: string) => fetchAPI<any>(`/students/${id}`, {
    method: 'DELETE'
  })
};

/**
 * Complaint API endpoints
 */
export const complaintAPI = {
  // Get all complaints, optionally filtered by studentId or status
  getAll: (filters?: { studentId?: string; status?: string }) => {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.status) params.append('status', filters.status);
      queryParams = `?${params.toString()}`;
    }
    
    return fetchAPI<any[]>(`/complaints${queryParams}`);
  },
  
  // Get a complaint by ID
  getById: (id: string) => fetchAPI<any>(`/complaints/${id}`),
  
  // Create a new complaint
  create: (data: any) => fetchAPI<any>('/complaints', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Update a complaint
  update: (id: string, data: any) => fetchAPI<any>(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete a complaint
  delete: (id: string) => fetchAPI<any>(`/complaints/${id}`, {
    method: 'DELETE'
  })
};

/**
 * Room API endpoints
 */
export const roomAPI = {
  // Get all rooms, optionally filtered by hostelBlock, status, or type
  getAll: (filters?: { hostelBlock?: string; status?: string; type?: string }) => {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.hostelBlock) params.append('hostelBlock', filters.hostelBlock);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      queryParams = `?${params.toString()}`;
    }
    
    return fetchAPI<any[]>(`/rooms${queryParams}`);
  },
  
  // Get a room by ID
  getById: (id: string) => fetchAPI<any>(`/rooms/${id}`),
  
  // Create a new room
  create: (data: any) => fetchAPI<any>('/rooms', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Update a room
  update: (id: string, data: any) => fetchAPI<any>(`/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete a room
  delete: (id: string) => fetchAPI<any>(`/rooms/${id}`, {
    method: 'DELETE'
  })
}; 