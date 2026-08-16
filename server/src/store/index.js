import { config } from '../config.js';
import { createMemoryStore } from './memory.js';
import { createMongoStore } from './mongo.js';

/**
 * Store factory — prefers MongoDB (Atlas) when MONGODB_URI is set and
 * gracefully falls back to the JSON-persisted in-memory store otherwise.
 */
export async function createStore() {
  if (config.mongoUri) {
    try {
      const store = await createMongoStore(config.mongoUri);
      console.log('[stormlink] Connected to MongoDB');
      return store;
    } catch (err) {
      console.error(
        '[stormlink] MongoDB connection failed — falling back to in-memory store:',
        err.message
      );
    }
  } else {
    console.log('[stormlink] MONGODB_URI not set — using in-memory store');
  }
  return createMemoryStore({ dataFile: config.dataFile });
}
