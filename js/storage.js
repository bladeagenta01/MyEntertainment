(function () {
  'use strict';

  const DB_NAME = 'ere-personal-library';
  const DB_VERSION = 1;
  const STORE = 'research';
  let databasePromise;

  function makeId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `ere-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('savedAt', 'savedAt', { unique: false });
          store.createIndex('kind', 'kind', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open the personal library.'));
      request.onblocked = () => reject(new Error('The personal library is busy in another tab. Close the other tab and try again.'));
    });
    return databasePromise;
  }

  async function transaction(mode, callback) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      try { result = callback(store, tx); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || new Error('The library operation failed.'));
      tx.onabort = () => reject(tx.error || new Error('The library operation was cancelled.'));
    });
  }

  const Storage = {
    makeId,
    async ready() { await openDatabase(); return true; },
    async all() {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).getAll();
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || ''))));
        request.onerror = () => reject(request.error || new Error('Could not read saved research.'));
      });
    },
    async put(record) {
      const clean = { ...record, id: record.id || makeId(), savedAt: record.savedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      await transaction('readwrite', store => store.put(clean));
      return clean;
    },
    async remove(id) {
      await transaction('readwrite', store => store.delete(id));
      return true;
    },
    async count() {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).count();
        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () => reject(request.error || new Error('Could not count saved research.'));
      });
    },
    async exportBackup() {
      const records = await this.all();
      return {
        app: 'Entertainment Relationship Explorer',
        formatVersion: 1,
        appBuild: '0.1-draft-2',
        exportedAt: new Date().toISOString(),
        records
      };
    },
    async importBackup(payload) {
      if (!payload || !Array.isArray(payload.records) || payload.formatVersion !== 1) throw new Error('This file is not a supported Entertainment Explorer backup.');
      const current = await this.all();
      const fingerprints = new Set(current.map(record => `${record.kind}|${record.source || ''}|${record.title || ''}|${record.url || ''}|${record.query || ''}`));
      let imported = 0;
      let skipped = 0;
      for (const incoming of payload.records) {
        if (!incoming || typeof incoming !== 'object' || !['entity', 'search'].includes(incoming.kind)) { skipped++; continue; }
        const fingerprint = `${incoming.kind}|${incoming.source || ''}|${incoming.title || ''}|${incoming.url || ''}|${incoming.query || ''}`;
        if (fingerprints.has(fingerprint)) { skipped++; continue; }
        const record = { ...incoming, id: makeId(), importedFrom: payload.exportedAt || 'unknown', savedAt: incoming.savedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
        await this.put(record);
        fingerprints.add(fingerprint);
        imported++;
      }
      return { imported, skipped };
    }
  };

  window.EREStorage = Storage;
})();
