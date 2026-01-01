# Tests

This directory contains unit tests for the LittleStack application.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized by the application layer they test:

- `controllers/` - Controller unit tests

## Current Test Coverage

### Auth Controller (`auth.controller.test.js`)

Tests for authentication endpoints:

1. **POST /signup**
   - ✓ Creates a new user successfully
   - ✓ Fails if email already exists (409)
   - ✓ Validates email format
   - ✓ Validates required fields

2. **POST /signin**
   - ✓ Authenticates user with correct credentials
   - ✓ Fails with invalid credentials (user not found)
   - ✓ Fails with invalid credentials (wrong password)
   - ✓ Validates email format

3. **POST /signout**
   - ✓ Clears the authentication cookie
   - ✓ Successfully signs out even without a token

## Test Configuration

- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Mocking**: Vitest's built-in mocking

The test setup (`setup.js`) automatically mocks the Winston logger to keep test output clean.
