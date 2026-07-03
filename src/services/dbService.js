import { ID, Query } from 'appwrite';
import { databases, appwriteConfig } from '../config/appwrite';

const { databaseId, collections } = appwriteConfig;

export const dbService = {
  // --- USER PROFILES ---
  async getProfile(userId) {
    try {
      const response = await databases.listDocuments(
        databaseId,
        collections.profiles,
        [Query.equal('userId', userId)]
      );
      return response.documents[0] || null;
    } catch (error) {
      console.error('Fetch profile failed:', error);
      throw error;
    }
  },

  async createProfile(userId, profileData) {
    try {
      return await databases.createDocument(
        databaseId,
        collections.profiles,
        ID.unique(),
        {
          userId,
          createdAt: new Date().toISOString(),
          ...profileData,
        }
      );
    } catch (error) {
      console.error('Create profile failed:', error);
      throw error;
    }
  },

  async updateProfile(documentId, profileData) {
    try {
      return await databases.updateDocument(
        databaseId,
        collections.profiles,
        documentId,
        profileData
      );
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  async listAlumni(limit = 10, offset = 0, role = 'alumni') {
    try {
      return await databases.listDocuments(
        databaseId,
        collections.profiles,
        [
          Query.equal('role', role),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
    } catch (error) {
      console.error('List alumni failed:', error);
      throw error;
    }
  },

  // --- OPPORTUNITIES (Jobs/Mentorship/Internships) ---
  async listOpportunities(limit = 10, offset = 0, type = null) {
    try {
      const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')];
      if (type) {
        queries.push(Query.equal('type', type));
      }
      return await databases.listDocuments(databaseId, collections.opportunities, queries);
    } catch (error) {
      console.error('List opportunities failed:', error);
      throw error;
    }
  },

  async createOpportunity(opportunityData) {
    try {
      return await databases.createDocument(
        databaseId,
        collections.opportunities,
        ID.unique(),
        {
          createdAt: new Date().toISOString(),
          ...opportunityData,
        }
      );
    } catch (error) {
      console.error('Create opportunity failed:', error);
      throw error;
    }
  },

  // --- NETWORKING CONNECTIONS ---
  async getConnectionRequests(userId, status = 'pending') {
    try {
      return await databases.listDocuments(
        databaseId,
        collections.connections,
        [
          Query.or([
            Query.equal('senderId', userId),
            Query.equal('receiverId', userId)
          ]),
          Query.equal('status', status)
        ]
      );
    } catch (error) {
      console.error('Fetch connections failed:', error);
      throw error;
    }
  },

  async sendConnectionRequest(senderId, receiverId) {
    try {
      return await databases.createDocument(
        databaseId,
        collections.connections,
        ID.unique(),
        {
          senderId,
          receiverId,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Send connection request failed:', error);
      throw error;
    }
  },

  async respondToConnectionRequest(connectionId, status) {
    try {
      return await databases.updateDocument(
        databaseId,
        collections.connections,
        connectionId,
        { status }
      );
    } catch (error) {
      console.error('Update connection status failed:', error);
      throw error;
    }
  }
};

export default dbService;
