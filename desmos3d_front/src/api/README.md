# API Integration

This directory contains all the code related to connecting with the Django backend.

## Structure

- `config.ts` - Axios configuration and API base setup
- `types.ts` - TypeScript interfaces for API data
- `services/` - Service modules for different parts of the API
  - `authService.ts` - User authentication methods (register, login, logout)
  - `graphService.ts` - Methods for working with equations and graph configurations

## Usage

### Authentication

```typescript
import { authService } from '../api';

// Register a new user
const register = async () => {
  try {
    const userData = await authService.register({
      username: 'newuser',
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Registered user:', userData);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Login
const login = async () => {
  try {
    const userData = await authService.login({
      username: 'newuser',
      password: 'password123'
    });
    console.log('Logged in as:', userData);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout
const logout = () => {
  authService.logout();
  console.log('Logged out');
};

// Check if user is authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user
const currentUser = authService.getCurrentUser();
```

### Graph Services

```typescript
import { graphService } from '../api';

// Get default data
const loadDefaultData = async () => {
  try {
    const data = await graphService.getDefaultData();
    console.log('Default data:', data);
  } catch (error) {
    console.error('Failed to load default data:', error);
  }
};

// Working with equations
const manageEquations = async () => {
  try {
    // Get all equations
    const equations = await graphService.getEquations();
    
    // Create a new equation
    const newEquation = await graphService.createEquation({
      expression: 'tan(x)',
      color: '#9b59b6',
      visible: true
    });
    
    // Update an equation
    const updatedEquation = await graphService.updateEquation(newEquation.id, {
      color: '#1abc9c'
    });
    
    // Delete an equation
    await graphService.deleteEquation(newEquation.id);
    
  } catch (error) {
    console.error('Error managing equations:', error);
  }
};

// Working with graph configurations
const manageGraphConfigs = async () => {
  try {
    // Get all graph configurations
    const configs = await graphService.getGraphConfigs();
    
    // Create a new configuration
    const newConfig = await graphService.createGraphConfig({
      name: 'Zoomed In',
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xStep: 0.05,
      gridVisible: true
    });
    
    // Update a configuration
    const updatedConfig = await graphService.updateGraphConfig(newConfig.id, {
      gridVisible: false
    });
    
    // Delete a configuration
    await graphService.deleteGraphConfig(newConfig.id);
    
  } catch (error) {
    console.error('Error managing graph configurations:', error);
  }
};
``` 