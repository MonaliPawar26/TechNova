import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import * as Models from '../models/schemas';

const DB_FILE_PATH = path.join(__dirname, '../../data/db_fallback.json');

// Detect if filesystem is read-only (e.g. Vercel serverless)
let _isReadOnly: boolean | null = null;
const isReadOnlyFS = (): boolean => {
  if (_isReadOnly !== null) return _isReadOnly;
  try {
    const testPath = path.join(__dirname, '../../data/_test_write.tmp');
    const dir = path.dirname(testPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(testPath, 'test', 'utf-8');
    fs.unlinkSync(testPath);
    _isReadOnly = false;
  } catch (e) {
    _isReadOnly = true;
  }
  return _isReadOnly;
};

// Ensure data folder exists
const ensureDataFolder = () => {
  if (isReadOnlyFS()) return;
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Check if mongo is connected
export let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ No MONGODB_URI found in env. Falling back to local file database.');
    isMongoConnected = false;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    isMongoConnected = true;
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Connected Successfully.');
  } catch (error: any) {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ MongoDB connection failed: ${error.message}. Falling back to local file database.`);
    isMongoConnected = false;
  }
};

// ==========================================
// LOCAL JSON DATABASE ENGINE (FALLBACK)
// ==========================================
interface LocalDBStore {
  users: any[];
  projects: any[];
  tasks: any[];
  teams: any[];
  workspaces: any[];
  messages: any[];
  notifications: any[];
  meetings: any[];
  approvals: any[];
  reports: any[];
  auditLogs: any[];
}

const emptyStore = (): LocalDBStore => ({
  users: [],
  projects: [],
  tasks: [],
  teams: [],
  workspaces: [],
  messages: [],
  notifications: [],
  meetings: [],
  approvals: [],
  reports: [],
  auditLogs: []
});

// In-memory store for serverless / read-only environments
let _memoryStore: LocalDBStore | null = null;

const getMemoryStore = (): LocalDBStore => {
  if (!_memoryStore) _memoryStore = emptyStore();
  return _memoryStore;
};

const loadLocalDB = (): LocalDBStore => {
  if (isReadOnlyFS()) return getMemoryStore();
  ensureDataFolder();
  if (!fs.existsSync(DB_FILE_PATH)) {
    const fresh = emptyStore();
    try { fs.writeFileSync(DB_FILE_PATH, JSON.stringify(fresh, null, 2), 'utf-8'); } catch (_) {}
    return fresh;
  }
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return emptyStore();
  }
};

const saveLocalDB = (data: LocalDBStore) => {
  if (isReadOnlyFS()) {
    _memoryStore = data;
    return;
  }
  ensureDataFolder();
  try { fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8'); } catch (_) {}
};

// Generate MongoDB-like Hex ID
const generateId = (): string => {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generic Repository to simulate Mongoose API
class Repository<T extends { id?: string; _id?: any }> {
  constructor(private collectionKey: keyof LocalDBStore, private mongooseModel: any) {}

  async find(query: any = {}): Promise<T[]> {
    if (isMongoConnected) {
      return this.mongooseModel.find(query).lean();
    }
    const store = loadLocalDB();
    let items = store[this.collectionKey] as T[];

    // Simple query filter
    return items.filter((item: any) => {
      for (const key in query) {
        if (query[key] !== undefined) {
          // Handle object ID string conversions
          const itemVal = item[key] ? item[key].toString() : '';
          const queryVal = query[key] ? query[key].toString() : '';
          if (itemVal !== queryVal) return false;
        }
      }
      return true;
    });
  }

  async findOne(query: any = {}): Promise<T | null> {
    if (isMongoConnected) {
      return this.mongooseModel.findOne(query).lean();
    }
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  async findById(id: string): Promise<T | null> {
    if (isMongoConnected) {
      return this.mongooseModel.findById(id).lean();
    }
    const store = loadLocalDB();
    const items = store[this.collectionKey] as T[];
    const item = items.find((x: any) => (x._id || x.id) === id);
    return item || null;
  }

  async create(data: any): Promise<T> {
    if (isMongoConnected) {
      const doc = new this.mongooseModel(data);
      await doc.save();
      return doc.toObject();
    }
    const store = loadLocalDB();
    const newItem = {
      _id: generateId(),
      createdAt: new Date(),
      ...data
    };
    store[this.collectionKey].push(newItem);
    saveLocalDB(store);
    return newItem as T;
  }

  async findByIdAndUpdate(id: string, update: any, options: any = { new: true }): Promise<T | null> {
    if (isMongoConnected) {
      return this.mongooseModel.findByIdAndUpdate(id, update, options).lean();
    }
    const store = loadLocalDB();
    const items = store[this.collectionKey] as T[];
    const index = items.findIndex((x: any) => (x._id || x.id) === id);
    if (index === -1) return null;

    // Apply update (handle $set or normal update object)
    const current = items[index];
    const updatePayload = update.$set ? update.$set : update;
    const updated = {
      ...current,
      ...updatePayload
    };

    items[index] = updated;
    store[this.collectionKey] = items;
    saveLocalDB(store);
    return updated as T;
  }

  async findOneAndUpdate(query: any, update: any, options: any = { new: true }): Promise<T | null> {
    if (isMongoConnected) {
      return this.mongooseModel.findOneAndUpdate(query, update, options).lean();
    }
    const item = await this.findOne(query);
    if (!item) return null;
    const id = item._id || item.id;
    return this.findByIdAndUpdate(id, update, options);
  }

  async deleteOne(query: any): Promise<{ deletedCount: number }> {
    if (isMongoConnected) {
      return this.mongooseModel.deleteOne(query);
    }
    const store = loadLocalDB();
    const items = store[this.collectionKey] as T[];
    const initialLength = items.length;

    const filteredItems = items.filter((item: any) => {
      for (const key in query) {
        if (item[key] !== query[key]) return true;
      }
      return false;
    });

    store[this.collectionKey] = filteredItems;
    saveLocalDB(store);

    return { deletedCount: initialLength - filteredItems.length };
  }

  async deleteMany(query: any = {}): Promise<{ deletedCount: number }> {
    if (isMongoConnected) {
      return this.mongooseModel.deleteMany(query);
    }
    const store = loadLocalDB();
    const initialLength = store[this.collectionKey].length;
    
    if (Object.keys(query).length === 0) {
      store[this.collectionKey] = [];
    } else {
      store[this.collectionKey] = (store[this.collectionKey] as any[]).filter((item: any) => {
        for (const key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
    }
    
    saveLocalDB(store);
    return { deletedCount: initialLength - store[this.collectionKey].length };
  }
}

// Export DB wrappers
export const DB = {
  User: new Repository<any>('users', Models.User),
  Project: new Repository<any>('projects', Models.Project),
  Task: new Repository<any>('tasks', Models.Task),
  Team: new Repository<any>('teams', Models.Team),
  Workspace: new Repository<any>('workspaces', Models.Workspace),
  Message: new Repository<any>('messages', Models.Message),
  Notification: new Repository<any>('notifications', Models.Notification),
  Meeting: new Repository<any>('meetings', Models.Meeting),
  Approval: new Repository<any>('approvals', Models.Approval),
  Report: new Repository<any>('reports', Models.Report),
  AuditLog: new Repository<any>('auditLogs', Models.AuditLog)
};
