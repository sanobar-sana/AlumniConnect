import { ID } from 'appwrite';
import { account } from '../config/appwrite';

export const authService = {
  /**
   * Register a new user
   * @param {string} email 
   * @param {string} password 
   * @param {string} name 
   */
  async register(email, password, name) {
    try {
      const response = await account.create(ID.unique(), email, password, name);
      // Auto login after registration to establish a session
      await this.login(email, password);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Log in an existing user
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      // Fallback for older versions of the SDK
      if (error.message && error.message.includes('createEmailPasswordSession is not a function')) {
        return await account.createEmailSession(email, password);
      }
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Get the current logged-in user
   */
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      // User is not authenticated
      return null;
    }
  },

  /**
   * Log out the current user session
   */
  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  /**
   * Send an email verification link
   * @param {string} redirectUrl - URL user is sent to after confirming (appends userId and secret)
   */
  async sendEmailVerification(redirectUrl) {
    try {
      return await account.createVerification(redirectUrl);
    } catch (error) {
      console.error('Send verification email failed:', error);
      throw error;
    }
  },

  /**
   * Confirm the email verification token
   * @param {string} userId 
   * @param {string} secret 
   */
  async confirmEmailVerification(userId, secret) {
    try {
      return await account.updateVerification(userId, secret);
    } catch (error) {
      console.error('Confirm verification failed:', error);
      throw error;
    }
  }
};

export default authService;
