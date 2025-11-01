// IndexedDB wrapper for offline storage
const DB_NAME = 'CargoLumeDB';
const DB_VERSION = 1;
const STORES = {
  loads: 'loads',
  messages: 'messages',
  shipments: 'shipments',
  pendingRequests: 'pendingRequests'
};

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.loads)) {
          db.createObjectStore(STORES.loads, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.messages)) {
          db.createObjectStore(STORES.messages, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.shipments)) {
          db.createObjectStore(STORES.shipments, { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains(STORES.pendingRequests)) {
          db.createObjectStore(STORES.pendingRequests, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue failed requests for retry when online
  async queueRequest(request: { url: string; method: string; body?: any; headers?: any }): Promise<void> {
    await this.set(STORES.pendingRequests, {
      ...request,
      timestamp: Date.now()
    });
  }

  async getPendingRequests(): Promise<any[]> {
    return this.getAll(STORES.pendingRequests);
  }

  async clearPendingRequest(id: number): Promise<void> {
    await this.delete(STORES.pendingRequests, id.toString());
  }
}

export const offlineStorage = new OfflineStorage();

// Initialize on load
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(console.error);
}

