import axios from 'axios';

export const testBackendConnection = async () => {
  try {
    // Test regular API endpoint directly with axios
    console.log('Testing API connection...');
    const response = await axios.get('http://localhost:8000/api/', {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('API connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('API connection failed:', {
      message: error.message,
      response: error.response ? error.response.data : 'No response'
    });
    return false;
  }
};

export const testRegisterEndpoint = async () => {
  try {
    // Test the specific registration endpoint directly
    console.log('Testing registration endpoint...');
    const response = await axios.options('http://localhost:8000/api/auth/register/', {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Registration endpoint available:', response.data);
    return true;
  } catch (error: any) {
    console.error('Registration endpoint check failed:', {
      message: error.message,
      response: error.response ? error.response.data : 'No response'
    });
    return false;
  }
};

// Add types to Window interface
declare global {
  interface Window {
    testAPI: {
      testConnection: () => Promise<boolean>;
      testRegister: () => Promise<boolean>;
    }
  }
}

// Call these functions from browser console to test
window.testAPI = {
  testConnection: testBackendConnection,
  testRegister: testRegisterEndpoint
}; 