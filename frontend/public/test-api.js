// Simple test to verify API connectivity
console.log('Testing API connectivity...');

const baseURL = 'http://localhost:5000';

// Test basic server connection
fetch(`${baseURL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@gandharaofficial.org',
    password: 'Admin@2025!'
  })
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  return response.json();
})
.then(result => {
  console.log('Login result:', result);
  if (result.token) {
    console.log('✅ Login successful, token received');
    
    // Test product creation endpoint
    const formData = new FormData();
    formData.append('title', 'Test Product');
    formData.append('keywords', 'test, product');
    formData.append('description', 'Test description');
    formData.append('price', '100');
    formData.append('categories', JSON.stringify(['test']));
    
    return fetch(`${baseURL}/api/admin/products/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${result.token}`
      },
      body: formData
    });
  }
})
.then(response => {
  if (response) {
    console.log('Product creation response status:', response.status);
    return response.text();
  }
})
.then(text => {
  if (text) {
    console.log('Product creation response:', text);
  }
})
.catch(error => {
  console.error('Error:', error);
});