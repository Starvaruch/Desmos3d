import api from '../config';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  /**
   * Register a new user
   * @param data User registration data
   * @returns Promise with auth token and user data
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Try the main register endpoint, if it fails try the direct endpoint
    try {
      const response = await api.post<AuthResponse>('/auth/register/', data);
      
      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        username: response.data.username,
        email: response.data.email
      }));
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Trying direct registration endpoint as fallback...');
        
        // Try the direct endpoint
        try {
          const directResponse = await api.post<AuthResponse>('/auth/register-direct/', data);
          
          // Save token and user data to localStorage
          localStorage.setItem('token', directResponse.data.token);
          localStorage.setItem('user', JSON.stringify({
            id: directResponse.data.user_id,
            username: directResponse.data.username,
            email: directResponse.data.email
          }));
          
          return directResponse.data;
        } catch (directError) {
          console.error('Direct registration also failed:', directError);
          throw directError;
        }
      }
      throw error;
    }
  },
  
  /**
   * Login user
   * @param data User login credentials
   * @returns Promise with auth token and user data
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    
    // Save token and user data to localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.user_id,
      username: response.data.username,
      email: response.data.email
    }));
    
    return response.data;
  },
  
  /**
   * Logout user (remove token and user data from localStorage)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is logged in
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get current user data from localStorage
   * @returns User data or null if not logged in
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}; 