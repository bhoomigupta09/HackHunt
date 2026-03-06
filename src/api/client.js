// Client-side API functions for the frontend

const API_BASE_URL = 'http://localhost:5000/api/v1';

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url, 'with options:', options);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      // Try to parse response as JSON first
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to backend server. Please make sure the server is running on ${API_BASE_URL}. ` +
          `Error: ${error.message}`
        );
      }
      
      throw error;
    }
  }

  // User Authentication endpoints
  async signup(email, password, firstName, lastName, phoneNumber, role = 'user', organizationName = null) {
    const body = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role
    };

    // Add organization name if organizer
    if (role === 'organizer' && organizationName) {
      body.organizationName = organizationName;
    }

    return this.request('/user/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async signin(email, password, role = 'user') {
    return this.request('/user/signin', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role
      }),
    });
  }

  // Profile endpoints
  async fetchProfile(userId, role) {
    return this.request(`/user/profile/${userId}/${role}`, {
      method: 'GET',
    });
  }

  async updateProfile(userId, role, profileData) {
    return this.request(`/user/profile/${userId}/${role}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Hackathon endpoints
  async getHackathons(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/hackathons${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getHackathon(id) {
    return this.request(`/hackathons/${id}`);
  }

  async getHackathonStats() {
    return this.request('/hackathons/stats');
  }

  // Source endpoints (admin)
  async getSources() {
    return this.request('/sources');
  }

  async createSource(source) {
    return this.request('/sources', {
      method: 'POST',
      body: JSON.stringify(source),
    });
  }

  async updateSource(provider, updates) {
    return this.request(`/sources/${provider}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSource(provider) {
    return this.request(`/sources/${provider}`, {
      method: 'DELETE',
    });
  }

  async fetchFromSource(provider) {
    return this.request(`/sources/${provider}/fetch`, {
      method: 'POST',
    });
  }
}

export const apiClient = new APIClient();
