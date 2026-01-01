import { vi } from 'vitest';

// Mock logger to avoid console noise during tests
vi.mock('#config/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));
