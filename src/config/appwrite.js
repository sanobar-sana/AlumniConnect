import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (endpoint && projectId) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
} else {
  console.warn('Appwrite VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID is missing in environment variables.');
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteConfig = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  collections: {
    profiles: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
    opportunities: import.meta.env.VITE_APPWRITE_OPPORTUNITIES_COLLECTION_ID,
    connections: import.meta.env.VITE_APPWRITE_CONNECTIONS_COLLECTION_ID,
    messages: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
  }
};

export default client;
