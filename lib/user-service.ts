// User service for frontend API calls to Java Spring Boot backend

export interface UserData {
  name: string;
  email: string;
  number?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
}

export class UserService {
  private baseUrl = 'http://localhost:8080/user';

  // Get user profile picture by email
  async getUserProfileImage(email: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/image/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the API returns an error, return a placeholder image
        console.warn(`Failed to fetch profile image for ${email}:`, response.status);
        return '/placeholder-user.jpg';
      }

      // Convert the response to blob and create object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Error fetching profile image:', error);
      return '/placeholder-user.jpg';
    }
  }

  // Update user profile
  async updateUserProfile(email: string, userData: Partial<UserData>): Promise<UserData> {
    const response = await fetch(`${this.baseUrl}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, ...userData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user profile');
    }

    return response.json();
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserData> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }

    return response.json();
  }
}

// Export a singleton instance
export const userService = new UserService(); 