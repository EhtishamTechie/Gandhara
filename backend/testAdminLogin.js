// Quick admin login test using axios
const axios = require('axios');

async function testAdminLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gandharaofficial.org',
      password: 'Admin@2025!'
    });

    const result = response.data;
    
    console.log('✅ Admin login successful!');
    console.log('Token:', result.token);
    console.log('Admin:', result.admin);
    console.log('\n🔑 Copy this token to localStorage in your browser:');
    console.log(`localStorage.setItem('adminToken', '${result.token}');`);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed:', error.response.data.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAdminLogin();