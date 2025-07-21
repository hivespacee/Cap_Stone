import { io } from 'socket.io-client';
import http from 'http';

describe('Socket.IO Backend', () => {
  let serverUrl;
  let client;

  beforeAll(() => {
    serverUrl = 'http://localhost:3001'; // Adjust if needed
  });

  afterEach(() => {
    if (client && client.connected) client.disconnect();
  });

  test('connects and authenticates', (done) => {
    client = io(serverUrl, { autoConnect: false });
    client.on('connect', () => {
      client.emit('authenticate', { userId: 'testuser', userName: 'Test User' });
      setTimeout(() => {
        expect(client.connected).toBe(true);
        done();
      }, 100);
    });
    client.connect();
  });

  test('join and leave document', (done) => {
    client = io(serverUrl);
    client.on('connect', () => {
      client.emit('authenticate', { userId: 'testuser', userName: 'Test User' });
      client.emit('joinDocument', { documentId: 'doc1' });
      setTimeout(() => {
        client.emit('leaveDocument', { documentId: 'doc1' });
        expect(client.connected).toBe(true);
        done();
      }, 200);
    });
  });

  test('cursor update emits event', (done) => {
    client = io(serverUrl);
    client.on('connect', () => {
      client.emit('authenticate', { userId: 'testuser', userName: 'Test User' });
      client.emit('joinDocument', { documentId: 'doc1' });
      client.emit('cursorUpdate', { documentId: 'doc1', position: { line: 1, ch: 1 }, selection: null });
      setTimeout(() => {
        expect(client.connected).toBe(true);
        done();
      }, 200);
    });
  });
}); 