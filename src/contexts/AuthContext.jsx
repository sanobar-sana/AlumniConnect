import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import dbService from '../services/dbService';

export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUserProfile: async () => {},
  sendVerificationEmail: async () => {},
  verifyEmail: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getOrCreateProfile = async (currentUser) => {
    try {
      let userProfile = await dbService.getProfile(currentUser.$id);
      if (!userProfile) {
        // Auto create if not found
        userProfile = await dbService.createProfile(currentUser.$id, {
          name: currentUser.name || 'User',
          email: currentUser.email || '',
          role: 'student', // Default fallback role
          gradYear: (new Date().getFullYear() + 4).toString(),
          bio: '',
          skills: [],
          company: '',
          jobTitle: '',
          major: '',
        });
      }
      return userProfile;
    } catch (err) {
      console.warn('Could not fetch/create profile from database, using fallback profile state:', err);
      return {
        $id: currentUser.$id,  // fallback $id matches the real user so lookups work
        name: currentUser.name || 'Community Member',
        email: currentUser.email || '',
        role: 'student',
        gradYear: (new Date().getFullYear() + 4).toString(),
        bio: 'Welcome to the community!',
        skills: [],
        company: '',
        jobTitle: '',
        major: '',
      };
    }
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const userProfile = await getOrCreateProfile(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      const userProfile = await getOrCreateProfile(currentUser);
      setProfile(userProfile);
      return currentUser;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, gradYear) => {
    setLoading(true);
    try {
      // Create user inside Appwrite Auth
      await authService.register(email, password, name);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Dynamic Role Calculation
      // If graduation year > current year -> Student, else Alumni
      const currentYear = new Date().getFullYear();
      const parsedGradYear = parseInt(gradYear, 10);
      const role = parsedGradYear > currentYear ? 'student' : 'alumni';

      // Auto create the profile document in Appwrite database
      const newProfile = await dbService.createProfile(currentUser.$id, {
        name,
        email,
        role,
        gradYear: gradYear.toString(),
        bio: '',
        skills: [],
        company: '',
        jobTitle: '',
        major: '',
      });
      setProfile(newProfile);
      return currentUser;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!profile) return;
    try {
      const updated = await dbService.updateProfile(profile.$id, profileData);
      setProfile(updated);
      return updated;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (redirectUrl) => {
    try {
      return await authService.sendEmailVerification(redirectUrl);
    } catch (error) {
      console.error('Send verification email context error:', error);
      throw error;
    }
  };

  const verifyEmail = async (userId, secret) => {
    try {
      const result = await authService.confirmEmailVerification(userId, secret);
      // Refresh session state to show updated verification flag
      await fetchSession();
      return result;
    } catch (error) {
      console.error('Verify email context error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchSession,
    updateUserProfile,
    sendVerificationEmail,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
