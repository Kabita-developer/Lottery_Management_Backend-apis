const axios = require('axios');

async function testWhoAmI() {
    try {
        console.log('=== Testing Who Am I API ===\n');
        
        // Test User Who Am I
        console.log('1. Testing User Who Am I...');
        try {
            // First create a user
            const userSignup = await axios.post('http://localhost:3000/api/user/signup', {
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@example.com',
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'TS',
                    country: 'Test Country',
                    zipCode: '12345'
                },
                phone: '+1234567890',
                password: 'password123'
            });
            console.log('✅ User created:', userSignup.data.message);
            
            // Login to get token
            const userLogin = await axios.post('http://localhost:3000/api/user/login', {
                email: 'testuser@example.com',
                password: 'password123'
            });
            console.log('✅ User login successful');
            
            // Test whoami
            const userWhoAmI = await axios.get('http://localhost:3000/api/user/whoami', {
                headers: {
                    'Authorization': `Bearer ${userLogin.data.token}`
                }
            });
            console.log('✅ User Who Am I successful:', userWhoAmI.data.message);
            console.log('   User data:', JSON.stringify(userWhoAmI.data.data, null, 2));
            
        } catch (userError) {
            console.log('❌ User test failed:', userError.response?.data || userError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Admin Who Am I
        console.log('2. Testing Admin Who Am I...');
        try {
            // First create an admin
            const adminSignup = await axios.post('http://localhost:3000/api/admin/signup', {
                fullName: 'Test Admin',
                email: 'testadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Admin created:', adminSignup.data.message);
            
            // Login to get token
            const adminLogin = await axios.post('http://localhost:3000/api/admin/login', {
                email: 'testadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Admin login successful');
            
            // Test whoami
            const adminWhoAmI = await axios.get('http://localhost:3000/api/admin/whoami', {
                headers: {
                    'Authorization': `Bearer ${adminLogin.data.token}`
                }
            });
            console.log('✅ Admin Who Am I successful:', adminWhoAmI.data.message);
            console.log('   Admin data:', JSON.stringify(adminWhoAmI.data.data, null, 2));
            
        } catch (adminError) {
            console.log('❌ Admin test failed:', adminError.response?.data || adminError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Super Admin Who Am I
        console.log('3. Testing Super Admin Who Am I...');
        try {
            // First create a super admin
            const superAdminSignup = await axios.post('http://localhost:3000/api/super-admin/signup', {
                fullName: 'Test Super Admin',
                email: 'testsuperadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Super Admin created:', superAdminSignup.data.message);
            
            // Login to get token
            const superAdminLogin = await axios.post('http://localhost:3000/api/super-admin/login', {
                email: 'testsuperadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Super Admin login successful');
            
            // Test whoami
            const superAdminWhoAmI = await axios.get('http://localhost:3000/api/super-admin/whoami', {
                headers: {
                    'Authorization': `Bearer ${superAdminLogin.data.token}`
                }
            });
            console.log('✅ Super Admin Who Am I successful:', superAdminWhoAmI.data.message);
            console.log('   Super Admin data:', JSON.stringify(superAdminWhoAmI.data.data, null, 2));
            
        } catch (superAdminError) {
            console.log('❌ Super Admin test failed:', superAdminError.response?.data || superAdminError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Cross-Role Access (should fail)
        console.log('4. Testing Cross-Role Access (should fail)...');
        try {
            // Try to use admin token for user whoami
            const adminLogin = await axios.post('http://localhost:3000/api/admin/login', {
                email: 'testadmin@example.com',
                password: 'password123'
            });
            
            const crossRoleTest = await axios.get('http://localhost:3000/api/user/whoami', {
                headers: {
                    'Authorization': `Bearer ${adminLogin.data.token}`
                }
            });
            console.log('❌ Cross-role access should have failed but succeeded');
            
        } catch (crossRoleError) {
            if (crossRoleError.response?.status === 403) {
                console.log('✅ Cross-role access correctly blocked:', crossRoleError.response.data.message);
            } else {
                console.log('❌ Unexpected error:', crossRoleError.response?.data || crossRoleError.message);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Invalid Token
        console.log('5. Testing Invalid Token...');
        try {
            const invalidTokenTest = await axios.get('http://localhost:3000/api/user/whoami', {
                headers: {
                    'Authorization': 'Bearer invalid_token_here'
                }
            });
            console.log('❌ Invalid token should have failed but succeeded');
            
        } catch (invalidTokenError) {
            if (invalidTokenError.response?.status === 401) {
                console.log('✅ Invalid token correctly rejected:', invalidTokenError.response.data.message);
            } else {
                console.log('❌ Unexpected error:', invalidTokenError.response?.data || invalidTokenError.message);
            }
        }
        
        console.log('\n=== Who Am I API Testing Complete ===');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Run the test
testWhoAmI();
