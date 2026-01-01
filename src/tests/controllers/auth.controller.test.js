import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { signup, signin, signout } from '#controllers/auth.controller.js';
import * as authService from '#services/auth.service.js';
import { jwtToken } from '#utils/jwt.js';

// Create a test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  
  app.post('/signup', signup);
  app.post('/signin', signin);
  app.post('/signout', signout);
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
};

describe('Auth Controller', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      const mockToken = 'mock-jwt-token';

      vi.spyOn(authService, 'createUser').mockResolvedValue(mockUser);
      vi.spyOn(jwtToken, 'sign').mockReturnValue(mockToken);

      const response = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
      
      expect(authService.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      
      expect(jwtToken.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should fail if email already exists', async () => {
      const error = new Error('User already exists');
      vi.spyOn(authService, 'createUser').mockRejectedValue(error);

      const response = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'User already exists'
      });
    });

    it('should fail validation with invalid email', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should fail validation with missing required fields', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /signin', () => {
    it('should authenticate user with correct credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      const mockToken = 'mock-jwt-token';

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
      vi.spyOn(jwtToken, 'sign').mockReturnValue(mockToken);

      const response = await request(app)
        .post('/signin')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User signed in successfully',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
      
      expect(authService.authenticateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(jwtToken.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should fail with invalid credentials - user not found', async () => {
      const error = new Error('User not found');
      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(error);

      const response = await request(app)
        .post('/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid credentials'
      });
    });

    it('should fail with invalid credentials - wrong password', async () => {
      const error = new Error('Invalid password');
      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(error);

      const response = await request(app)
        .post('/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid credentials'
      });
    });

    it('should fail validation with invalid email', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('POST /signout', () => {
    it('should clear the authentication cookie', async () => {
      const response = await request(app)
        .post('/signout')
        .set('Cookie', ['token=some-jwt-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User signed out successfully'
      });
      
      // Check that the cookie is cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
      expect(response.headers['set-cookie'][0]).toContain('Expires=');
    });

    it('should successfully signout even without a token', async () => {
      const response = await request(app).post('/signout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User signed out successfully'
      });
    });
  });
});
