import { ID, Query } from 'appwrite';
import { databases, appwriteConfig } from '../config/appwrite';
import client from '../config/appwrite';

const { databaseId, collections } = appwriteConfig;

const normalizeProfileData = (profileData = {}) => {
  const normalizedProfileData = { ...profileData };

  // Map legacy field names to the current collection schema.
  if (typeof normalizedProfileData.graduationYear !== 'undefined' && typeof normalizedProfileData.gradYear === 'undefined') {
    normalizedProfileData.gradYear = normalizedProfileData.graduationYear;
  }

  if (typeof normalizedProfileData.major !== 'undefined' && typeof normalizedProfileData.department === 'undefined') {
    normalizedProfileData.department = normalizedProfileData.major;
  }

  if (normalizedProfileData.gradYear ) {
    normalizedProfileData.gradYear = parseInt(normalizedProfileData.gradYear, 10);
  }

  // Remove unsupported fields so profile documents stay aligned with the declared schema.
  delete normalizedProfileData.graduationYear;
  delete normalizedProfileData.major; 

  return normalizedProfileData;
};

const denormalizeProfileData = (profileData) => {
  if (!profileData) return profileData;
  const denormalized = { ...profileData };
  if (typeof denormalized.department !== 'undefined' && typeof denormalized.major === 'undefined') {
    denormalized.major = denormalized.department;
  }
  return denormalized;
};

const normalizeOpportunityData = (oppData = {}) => {
  const normalized = { ...oppData };
  if (typeof normalized.type !== 'undefined' && typeof normalized.role === 'undefined') {
    normalized.role = normalized.type;
  }
  delete normalized.type;
  return normalized;
};

const denormalizeOpportunityData = (oppData) => {
  if (!oppData) return oppData;
  const denormalized = { ...oppData };
  if (typeof denormalized.role !== 'undefined' && typeof denormalized.type === 'undefined') {
    denormalized.type = denormalized.role;
  }
  return denormalized;
};

export const dbService = {
  // --- USER PROFILES ---
  async getProfile(userId) {
    try {
      if (!userId) return null;

      // Query Appwrite profiles by the document ID directly rather than using a non-existent user field.
      const doc = await databases.getDocument(databaseId, collections.profiles, userId);
      return denormalizeProfileData(doc);
    } catch (error) {
      if (error?.code === 404) {
        return null;
      }
      console.error('Fetch profile failed:', error);
      throw error;
    }
  },

  async createProfile(userId, profileData) {
    try {
      // Use userId as the document ID so getProfile can look up by $id.
      const doc = await databases.createDocument(
        databaseId,
        collections.profiles,
        userId,
        normalizeProfileData(profileData)
      );
      return denormalizeProfileData(doc);
    } catch (error) {
      console.error('Create profile failed:', error);
      throw error;
    }
  },

  async updateProfile(documentId, profileData) {
    try {
      const doc = await databases.updateDocument(
        databaseId,
        collections.profiles,
        documentId,
        normalizeProfileData(profileData)
      );
      return denormalizeProfileData(doc);
    } catch (error) {
      // 404 means the document doesn't exist yet (e.g. a fallback/mock profile).
      // Fall back to createDocument using the same ID so the document is created in place.
      if (error?.code === 404) {
        console.warn(`updateProfile: document "${documentId}" not found, creating it instead.`);
        const doc = await databases.createDocument(
          databaseId,
          collections.profiles,
          documentId,
          normalizeProfileData(profileData)
        );
        return denormalizeProfileData(doc);
      }
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  async listAlumni(limit = 10, offset = 0, role = 'alumni') {
    try {
      const response = await databases.listDocuments(
        databaseId,
        collections.profiles,
        [
          Query.equal('role', role),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      if (response && response.documents) {
        response.documents = response.documents.map(doc => denormalizeProfileData(doc));
      }
      return response;
    } catch (error) {
      console.error('List alumni failed:', error);
      throw error;
    }
  },

  // --- OPPORTUNITIES (Jobs/Mentorship/Internships) ---
  async listOpportunities(limit = 10, offset = 0, type = null) {
    try {
      const queries = [Query.limit(limit), Query.offset(offset)];
      if (type) {
        queries.push(Query.equal('role', type));
      }
      const response = await databases.listDocuments(databaseId, collections.opportunities, queries);
      if (response && response.documents) {
        response.documents = response.documents.map(doc => denormalizeOpportunityData(doc));
      }
      return response;
    } catch (error) {
      console.error('List opportunities failed:', error);
      throw error;
    }
  },

  async createOpportunity(opportunityData) {
    try {
      const doc = await databases.createDocument(
        databaseId,
        collections.opportunities,
        ID.unique(),
        normalizeOpportunityData(opportunityData)
      );
      return denormalizeOpportunityData(doc);
    } catch (error) {
      console.error('Create opportunity failed:', error);
      throw error;
    }
  },

  // --- NETWORKING CONNECTIONS ---
  // Schema uses 'alumniId' (sender) and 'studentId' (receiver) instead of senderId/receiverId
  async getConnectionRequests(userId, status = 'pending') {
    try {
      return await databases.listDocuments(
        databaseId,
        collections.connections,
        [
          Query.or([
            Query.equal('alumniId', userId),
            Query.equal('studentId', userId)
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
      // Schema fields: 'alumniId' (sender) and 'studentId' (receiver)
      return await databases.createDocument(
        databaseId,
        collections.connections,
        ID.unique(),
        {
          alumniId: senderId,
          studentId: receiverId,
          status: 'pending',
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
  },

  // --- DIRECT MESSAGES ---
  // conversationId is a deterministic, sorted composite of the two participant user IDs.
  // Sorting guarantees that both "A→B" and "B→A" resolve to the same channel key,
  // so a single Query.equal('conversationId', ...) always retrieves the full thread.

  /**
   * Derives a stable, order-independent conversation ID from two user IDs.
   * Sorting both IDs alphabetically ensures the same string is produced
   * regardless of which participant initiates the query.
   *
   * @param {string} userIdA
   * @param {string} userIdB
   * @returns {string}  e.g. "abc123_xyz789"
   */
  buildConversationId(userIdA, userIdB) {
    return [userIdA, userIdB].sort().join('_');
  },

  /**
   * Sends a new message from senderId to receiverId.
   * Stores all required schema fields: senderId, receiverId, text,
   * conversationId, timestamp (ISO string), and read (default false).
   *
   * @param {string} senderId   - Appwrite user.$id of the sender
   * @param {string} receiverId - Appwrite user.$id of the recipient
   * @param {string} text       - Plain-text message body
   * @returns {Promise<object>} The created Appwrite document
   */
  async sendMessage(senderId, receiverId, text) {
    try {
      const conversationId = this.buildConversationId(senderId, receiverId);

      return await databases.createDocument(
        databaseId,
        collections.messages,
        ID.unique(),
        {
          senderId,
          receiverId,
          text,
          conversationId,
          timestamp: new Date().toISOString(),
          read: false,
        }
      );
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  /**
   * Fetches all messages in a given conversation thread, ordered oldest-first.
   * Callers should derive conversationId using buildConversationId() before calling this.
   *
   * @param {string} conversationId - The sorted composite ID for the thread
   * @param {number} limit          - Maximum number of messages to retrieve (default 50)
   * @param {number} offset         - Pagination offset (default 0)
   * @returns {Promise<object>} Appwrite list response: { documents, total }
   */
  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(
        databaseId,
        collections.messages,
        [
          Query.equal('conversationId', conversationId),
          Query.orderAsc('timestamp'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
    } catch (error) {
      console.error('Fetch messages failed:', error);
      throw error;
    }
  },

  /**
   * Lists all distinct conversations a user has participated in.
   * Queries for every message where the user is either sender or receiver,
   * then de-duplicates by conversationId on the client side so the inbox
   * shows only one entry per thread.
   *
   * Returns an array of conversation summary objects:
   *   { conversationId, otherUserId, lastMessage }
   *
   * @param {string} userId - The logged-in user's Appwrite user.$id
   * @returns {Promise<Array>} Array of de-duplicated conversation summaries
   */
  async listConversations(userId) {
    try {
      // Fetch the most recent 100 messages involving this user (sent or received).
      // Ordering by timestamp descending ensures the first hit per thread is the latest.
      const response = await databases.listDocuments(
        databaseId,
        collections.messages,
        [
          Query.or([
            Query.equal('senderId', userId),
            Query.equal('receiverId', userId),
          ]),
          Query.orderDesc('timestamp'),
          Query.limit(100),
        ]
      );

      // De-duplicate: keep only the first (most recent) document per conversationId.
      const seen = new Set();
      const conversations = [];

      for (const doc of response.documents) {
        if (!seen.has(doc.conversationId)) {
          seen.add(doc.conversationId);
          // Determine which participant is the "other" user for display purposes.
          const otherUserId = doc.senderId === userId ? doc.receiverId : doc.senderId;
          conversations.push({
            conversationId: doc.conversationId,
            otherUserId,
            lastMessage: doc,
          });
        }
      }

      return conversations;
    } catch (error) {
      console.error('List conversations failed:', error);
      throw error;
    }
  },

  /**
   * Marks a single message document as read by updating its 'read' field to true.
   * Should be called when the recipient opens a conversation thread.
   *
   * @param {string} messageId - The Appwrite $id of the message document to mark
   * @returns {Promise<object>} The updated Appwrite document
   */
  async markMessageRead(messageId) {
    try {
      return await databases.updateDocument(
        databaseId,
        collections.messages,
        messageId,
        { read: true }
      );
    } catch (error) {
      console.error('Mark message read failed:', error);
      throw error;
    }
  },

  /**
   * Subscribes to real-time updates for a specific conversation thread using
   * Appwrite's Realtime API. Fires the provided callback whenever a message
   * is created, updated, or deleted within the thread.
   *
   * Usage in a React component:
   *   useEffect(() => {
   *     const unsubscribe = dbService.subscribeToMessages(conversationId, (event) => {
   *       // event.payload is the updated/created message document
   *       setMessages(prev => [...prev, event.payload]);
   *     });
   *     return () => unsubscribe(); // cleanup on unmount
   *   }, [conversationId]);
   *
   * @param {string}   conversationId - The conversation thread to listen on
   * @param {Function} callback       - Invoked with the Appwrite RealtimeResponseEvent
   * @returns {Function} Unsubscribe function — call it in the useEffect cleanup
   */
  subscribeToMessages(conversationId, callback) {
    // Build the Appwrite Realtime channel string for the messages collection.
    const channel = `databases.${databaseId}.collections.${collections.messages}.documents`;

    const unsubscribe = client.subscribe(channel, (event) => {
      // Filter server-sent events to only those belonging to this conversation.
      if (event.payload?.conversationId === conversationId) {
        callback(event);
      }
    });

    // Return the unsubscribe function so callers can tear down the listener.
    return unsubscribe;
  },

  /**
   * Subscribes to all real-time message creations, updates, or deletions that involve the user.
   * Filters events to those where the user is either the sender or the recipient.
   *
   * @param {string}   userId   - The logged-in user's Appwrite user.$id
   * @param {Function} callback - Invoked with the Appwrite RealtimeResponseEvent
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserMessages(userId, callback) {
    const channel = `databases.${databaseId}.collections.${collections.messages}.documents`;

    const unsubscribe = client.subscribe(channel, (event) => {
      const payload = event.payload;
      if (payload && (payload.senderId === userId || payload.receiverId === userId)) {
        callback(event);
      }
    });

    return unsubscribe;
  },
};

export default dbService;
