import { useState, useCallback } from 'react';
import dbService from '../services/dbService';
import useAuth from './useAuth';

/**
 * useProfile
 *
 * Provides helpers for reading and updating the current user's Appwrite
 * profile document.  Components should prefer this hook over calling
 * dbService directly so the AuthContext state stays in sync.
 *
 * Returns:
 *   profile            – the profile object from AuthContext
 *   updateProfile      – async (data) => updatedProfile
 *   fetchAlumni        – async (limit, offset) => { documents, total }
 *   saving             – boolean loading flag for update operations
 *   error              – last error message (string | null)
 */
export const useProfile = () => {
  const { profile, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUserProfile(data);
      return updated;
    } catch (err) {
      const message = err.message || 'Failed to update profile.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [updateUserProfile]);

  const fetchAlumni = useCallback(async (limit = 20, offset = 0) => {
    try {
      return await dbService.listAlumni(limit, offset, 'alumni');
    } catch (err) {
      const message = err.message || 'Failed to fetch alumni.';
      setError(message);
      throw err;
    }
  }, []);

  return {
    profile,
    updateProfile,
    fetchAlumni,
    saving,
    error,
  };
};

export default useProfile;
