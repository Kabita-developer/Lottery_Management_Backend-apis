const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('Testing Admin Login...');
        
        // First, let's try to create an admin if it doesn't exist
        console.log('\n1. Creating admin user...');
        try {
            const signupResponse = await axios.post('http://localhost:3000/api/admin/signup', {
                fullName: 'Test Admin',
                email: 'admin@gmail.com',
                password: 'admin@123'
            });
            console.log('✅ Admin created successfully:', signupResponse.data);
        } catch (signupError) {
            if (signupError.response?.status === 409) {
                console.log('ℹ️  Admin already exists, proceeding with login...');
            } else {
                console.log('❌ Error creating admin:', signupError.response?.data || signupError.message);
            }
        }

        // Now test the login
        console.log('\n2. Testing admin login...');
        const loginResponse = await axios.post('http://localhost:3000/api/admin/login', {
            email: 'admin@gmail.com',
            password: 'admin@123'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
        
        // Test using the token for a protected route
        console.log('\n3. Testing protected route with token...');
        const token = loginResponse.data.token;
        
        // Test stockist creation (should work with admin token)
        try {
            const stockistResponse = await axios.post('http://localhost:3000/api/stockists', {
                code: 'TEST001',
                name: 'Test Stockist',
                aadharId: '123456789012',
                aadharName: 'Test User',
                address1: 'Test Address',
                pinCode: '123456',
                phone: '+919876543210',
                email: 'test@stockist.com',
                panNo: 'ABCDE1234F',
                type: 'Credit Party'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Stockist created successfully:', stockistResponse.data);
        } catch (stockistError) {
            console.log('❌ Error creating stockist:', stockistError.response?.data || stockistError.message);
        }
        
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
    }
}

// Run the test
testAdminLogin();
