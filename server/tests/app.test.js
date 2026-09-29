const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Mock database query method for isolated unit testing
jest.mock('../src/db', () => ({
  query: jest.fn(),
  initializeDatabase: jest.fn(),
  pool: {
    end: jest.fn(),
  },
}));

describe('PERN API Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status ok and database connected', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ solution: 2 }] });

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });

    it('should handle database error gracefully in health check', async () => {
      db.query.mockRejectedValueOnce(new Error('Connection failed'));

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toContain('error: Connection failed');
    });
  });

  describe('Tasks API (/api/tasks)', () => {
    it('GET /api/tasks should return list of tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task 1', completed: false },
        { id: 2, title: 'Test Task 2', completed: true },
      ];
      db.query.mockResolvedValueOnce({ rows: mockTasks });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('POST /api/tasks should validate input and return 400 on empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Missing title' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Title is required');
    });

    it('POST /api/tasks should create and return new task when valid', async () => {
      const newTask = { id: 3, title: 'New Task', description: 'Created', completed: false };
      db.query.mockResolvedValueOnce({ rows: [newTask] });

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task', description: 'Created' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
    });

    it('DELETE /api/tasks/:id should return 404 if task does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/api/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('DELETE /api/tasks/:id should delete task if found', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Task to delete' }] });

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');
    });
  });

  describe('404 Fallback', () => {
    it('should return 404 on unknown routes', async () => {
      const response = await request(app).get('/api/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
