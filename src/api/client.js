// Client-side API functions for the frontend
import { normalizeValidationMessage } from '../utils/validation';

// New code:
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000/api/v1';

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
        let errorData = null;
        if (isJson) {
          errorData = await response.json();
          errorMessage = normalizeValidationMessage(
            errorData.message || errorData.error || errorMessage
          );
        } else {
          const errorText = await response.text();
          const looksLikeHtml = /<html|<!doctype html/i.test(errorText || "");
          errorMessage = looksLikeHtml
            ? `Request failed with status ${response.status}.`
            : normalizeValidationMessage(errorText || errorMessage);
        }
        const error = new Error(errorMessage);
        if (errorData?.errors) {
          error.errors = errorData.errors.map((item) =>
            normalizeValidationMessage(item)
          );
        }
        if (errorData?.message) {
          error.message = normalizeValidationMessage(errorData.message);
        }
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to backend server. Please make sure the server is running and reachable at ${API_BASE_URL}. ` +
          `Error: ${error.message}`
        );
      }
      
      throw error;
    }
  }

  // User Authentication endpoints
  async signup(
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role = 'user',
    organizationName = null,
    extraFields = {}
  ) {
    const body = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
      ...extraFields
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

  /** Registration: send OTP after form validation (stores pending signup server-side) */
  async sendSignupOtp(payload) {
    return this.request('/auth/send-signup-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resendSignupOtp(email, role = 'user') {
    return this.request('/auth/resend-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async verifySignupOtp(email, otp, role = 'user') {
    return this.request('/auth/verify-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, role }),
    });
  }

  async requestPasswordReset(email) {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetOtp(email, otp) {
    return this.request('/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(email, newPassword) {
    return this.request('/forgot-password/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
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

  async fetchDirectory() {
    return this.request('/user/directory', {
      method: 'GET',
    });
  }

  async updateDirectoryUserStatus(userId, payload) {
    return this.request(`/user/directory/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteDirectoryUser(userId, payload) {
    return this.request(`/user/directory/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  }

  async fetchLiveMessages() {
    return this.request('/realtime/messages', {
      method: 'GET',
    });
  }

  async postLiveMessage(payload) {
    return this.request('/realtime/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  /** Live scraped listings (Devpost, Unstop, Devfolio); server caches 30 minutes */
  async getLiveScrapedHackathons(options = {}) {
    const q =
      options.refresh === true || options.refresh === '1' ? '?refresh=1' : '';
    return this.request(`/hackathons/live${q}`);
  }

  async getOrganizerHackathons(organizerId) {
    return this.request(`/hackathons/organizer/${organizerId}`, {
      method: 'GET',
    });
  }

  async getAdminHackathons(status = '') {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/hackathons/admin/all${query}`, {
      method: 'GET',
    });
  }

  async createHackathon(payload) {
    return this.request('/hackathons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateHackathon(hackathonId, payload) {
    return this.request(`/hackathons/${hackathonId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteHackathon(hackathonId, organizerId) {
    return this.request(`/hackathons/${hackathonId}`, {
      method: 'DELETE',
      body: JSON.stringify({ organizerId }),
    });
  }

  async updateHackathonApproval(hackathonId, payload) {
    return this.request(`/hackathons/${hackathonId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getUserRegistrations(userId) {
    return this.request(`/hackathons/registrations/user/${userId}`, {
      method: 'GET',
    });
  }

  async registerForHackathon(hackathonId, payload) {
    return this.request(`/hackathons/${hackathonId}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async unregisterFromHackathon(registrationId) {
    return this.request(`/hackathons/registrations/${registrationId}`, {
      method: 'DELETE',
    });
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

  // ==================== ADMIN ENDPOINTS ====================

  async getPlatformStats(adminId) {
    return this.request('/admin/stats', {
      method: 'POST',
      body: JSON.stringify({ adminId }),
    });
  }

  async getAdminProfile(adminId) {
    return this.request(`/admin/profile/${adminId}`, {
      method: 'GET',
    });
  }

  async updateAdminProfile(adminId, payload) {
    return this.request(`/admin/profile/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, adminId }),
    });
  }

  async getAllUsers(adminId, params = {}) {
    const queryString = new URLSearchParams({
      adminId,
      ...params
    }).toString();
    return this.request(`/admin/users?${queryString}`, {
      method: 'GET',
    });
  }

  async deleteUser(userId, adminId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminId }),
    });
  }

  async blockUser(userId, isActive, adminId) {
    return this.request(`/admin/users/${userId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, adminId }),
    });
  }

  async getAllOrganizers(adminId, params = {}) {
    const queryString = new URLSearchParams({
      adminId,
      ...params
    }).toString();
    return this.request(`/admin/organizers?${queryString}`, {
      method: 'GET',
    });
  }

  async deleteOrganizer(organizerId, adminId) {
    return this.request(`/admin/organizers/${organizerId}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminId }),
    });
  }

  async verifyOrganizer(organizerId, isVerified, adminId) {
    return this.request(`/admin/organizers/${organizerId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified, adminId }),
    });
  }

  async getActivityLogs(adminId, params = {}) {
    const queryString = new URLSearchParams({
      adminId,
      ...params
    }).toString();
    return this.request(`/admin/activity-logs?${queryString}`, {
      method: 'GET',
    });
  }
}

export const apiClient = new APIClient();
