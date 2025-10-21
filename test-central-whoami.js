const axios = require('axios');

async function testCentralWhoAmI() {
    try {
        console.log('=== Testing Central Who Am I API ===\n');
        
        // Test with User token
        console.log('1. Testing Central API with User token...');
        try {
            // Create and login as user
            const userSignup = await axios.post('http://localhost:3000/api/user/signup', {
                firstName: 'Test',
                lastName: 'User',
                email: 'centraltestuser@example.com',
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
            console.log('✅ User created');
            
            const userLogin = await axios.post('http://localhost:3000/api/user/login', {
                email: 'centraltestuser@example.com',
                password: 'password123'
            });
            console.log('✅ User login successful');
            
            // Test central whoami with user token
            const centralUserTest = await axios.get('http://localhost:3000/api/auth/whoami', {
                headers: {
                    'Authorization': `Bearer ${userLogin.data.token}`
                }
            });
            console.log('✅ Central API with User token successful:', centralUserTest.data.message);
            console.log('   User data:', JSON.stringify(centralUserTest.data.data, null, 2));
            
        } catch (userError) {
            console.log('❌ User test failed:', userError.response?.data || userError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test with Admin token
        console.log('2. Testing Central API with Admin token...');
        try {
            // Create and login as admin
            const adminSignup = await axios.post('http://localhost:3000/api/admin/signup', {
                fullName: 'Central Test Admin',
                email: 'centraltestadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Admin created');
            
            const adminLogin = await axios.post('http://localhost:3000/api/admin/login', {
                email: 'centraltestadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Admin login successful');
            
            // Test central whoami with admin token
            const centralAdminTest = await axios.get('http://localhost:3000/api/auth/whoami', {
                headers: {
                    'Authorization': `Bearer ${adminLogin.data.token}`
                }
            });
            console.log('✅ Central API with Admin token successful:', centralAdminTest.data.message);
            console.log('   Admin data:', JSON.stringify(centralAdminTest.data.data, null, 2));
            
            // Display token information
            if (centralAdminTest.data.data.token) {
                const token = centralAdminTest.data.data.token;
                console.log('   🔑 Token Information:');
                console.log(`   - Status: ${token.status}`);
                console.log(`   - Expires At: ${token.expires_at}`);
                console.log(`   - Expires In: ${token.expires_in_hours} hours`);
                console.log(`   - Is Expiring Soon: ${token.is_expiring_soon ? 'Yes' : 'No'}`);
            }
            
        } catch (adminError) {
            console.log('❌ Admin test failed:', adminError.response?.data || adminError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test with Super Admin token
        console.log('3. Testing Central API with Super Admin token...');
        try {
            // Create and login as super admin
            const superAdminSignup = await axios.post('http://localhost:3000/api/super-admin/signup', {
                fullName: 'Central Test Super Admin',
                email: 'centraltestsuperadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Super Admin created');
            
            const superAdminLogin = await axios.post('http://localhost:3000/api/super-admin/login', {
                email: 'centraltestsuperadmin@example.com',
                password: 'password123'
            });
            console.log('✅ Super Admin login successful');
            
            // Test central whoami with super admin token
            const centralSuperAdminTest = await axios.get('http://localhost:3000/api/auth/whoami', {
                headers: {
                    'Authorization': `Bearer ${superAdminLogin.data.token}`
                }
            });
            console.log('✅ Central API with Super Admin token successful:', centralSuperAdminTest.data.message);
            console.log('   Super Admin data:', JSON.stringify(centralSuperAdminTest.data.data, null, 2));
            
        } catch (superAdminError) {
            console.log('❌ Super Admin test failed:', superAdminError.response?.data || superAdminError.message);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Invalid Token
        console.log('4. Testing Central API with Invalid Token...');
        try {
            const invalidTokenTest = await axios.get('http://localhost:3000/api/auth/whoami', {
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
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test Missing Token
        console.log('5. Testing Central API with Missing Token...');
        try {
            const missingTokenTest = await axios.get('http://localhost:3000/api/auth/whoami');
            console.log('❌ Missing token should have failed but succeeded');
            
        } catch (missingTokenError) {
            if (missingTokenError.response?.status === 401) {
                console.log('✅ Missing token correctly rejected:', missingTokenError.response.data.message);
            } else {
                console.log('❌ Unexpected error:', missingTokenError.response?.data || missingTokenError.message);
            }
        }
        
        console.log('\n=== Central Who Am I API Testing Complete ===');
        console.log('\n🎉 Key Benefits of Central API:');
        console.log('   ✅ Single endpoint for all user types');
        console.log('   ✅ No need to know user role beforehand');
        console.log('   ✅ Simplified frontend implementation');
        console.log('   ✅ Universal token compatibility');
        console.log('   ✅ Token expiration tracking');
        console.log('   ✅ Automatic token status detection');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Run the test
testCentralWhoAmI();
