// CargoLume API Tests
// Run with: node test-freightpro.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';
let authToken = '';
let testUserId = '';

// Test data
const testUser = {
    email: 'test@cargolume.com',
    password: 'TestPassword123!',
    company: 'Test Freight Company',
    phone: '+1-555-123-4567',
    accountType: 'carrier',
    usdotNumber: '1234567',
    mcNumber: 'MC-123456',
    ein: '89-4521364'
};

const testShipment = {
    title: 'Test Shipment',
    description: 'Test shipment for API testing',
    pickup: {
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US'
    },
    delivery: {
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US'
    }
};

const testLoad = {
    title: 'Test Load',
    description: 'Test load for API testing',
    origin: {
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US'
    },
    destination: {
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US'
    },
    pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    equipmentType: 'Dry Van',
    weight: 45000,
    rate: 2500,
    rateType: 'flat_rate'
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, data: { error: error.message } };
    }
}

// Test functions
async function testRegistration() {
    console.log('\n🧪 Testing User Registration...');
    
    // Test 1: Valid carrier registration with EIN
    const result1 = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });
    
    console.log('✅ Carrier registration:', result1.status === 201 ? 'PASS' : 'FAIL');
    if (result1.status !== 201) {
        console.log('   Error:', result1.data);
    } else {
        testUserId = result1.data.user.id;
    }

    // Test 2: Shipper registration (no EIN required)
    const shipperUser = { ...testUser, email: 'shipper@test.com', accountType: 'shipper' };
    delete shipperUser.ein;
    delete shipperUser.usdotNumber;
    delete shipperUser.mcNumber;
    
    const result2 = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(shipperUser)
    });
    
    console.log('✅ Shipper registration (no EIN):', result2.status === 201 ? 'PASS' : 'FAIL');
    if (result2.status !== 201) {
        console.log('   Error:', result2.data);
    }

    // Test 3: Broker registration without EIN (should fail)
    const brokerUser = { ...testUser, email: 'broker@test.com', accountType: 'broker' };
    delete brokerUser.ein;
    
    const result3 = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(brokerUser)
    });
    
    console.log('✅ Broker without EIN (should fail):', result3.status === 400 ? 'PASS' : 'FAIL');
    if (result3.status !== 400) {
        console.log('   Error:', result3.data);
    }

    // Test 4: Invalid EIN format
    const invalidEINUser = { ...testUser, email: 'invalid@test.com', ein: '123-456' };
    
    const result4 = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidEINUser)
    });
    
    console.log('✅ Invalid EIN format (should fail):', result4.status === 400 ? 'PASS' : 'FAIL');
    if (result4.status !== 400) {
        console.log('   Error:', result4.data);
    }
}

async function testLogin() {
    console.log('\n🧪 Testing User Login...');
    
    const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });
    
    console.log('✅ Login:', result.status === 200 ? 'PASS' : 'FAIL');
    if (result.status === 200) {
        authToken = result.data.token;
        console.log('   Token received:', authToken ? 'YES' : 'NO');
    } else {
        console.log('   Error:', result.data);
    }
}

async function testShipmentCreation() {
    console.log('\n🧪 Testing Shipment Creation...');
    
    // First, login as shipper
    const shipperLogin = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'shipper@test.com',
            password: testUser.password
        })
    });
    
    if (shipperLogin.status !== 200) {
        console.log('❌ Cannot test shipment creation - shipper login failed');
        return;
    }
    
    const shipperToken = shipperLogin.data.token;
    
    // Create shipment
    const result = await apiRequest('/shipments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${shipperToken}` },
        body: JSON.stringify(testShipment)
    });
    
    console.log('✅ Shipment creation:', result.status === 201 ? 'PASS' : 'FAIL');
    if (result.status === 201) {
        console.log('   Shipment ID:', result.data.shipment.shipmentId);
    } else {
        console.log('   Error:', result.data);
    }
}

async function testLoadPosting() {
    console.log('\n🧪 Testing Load Posting...');
    
    // First, login as broker
    const brokerUser = { ...testUser, email: 'broker@test.com', accountType: 'broker', ein: '89-4521364' };
    const brokerLogin = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(brokerUser)
    });
    
    if (brokerLogin.status !== 201) {
        console.log('❌ Cannot test load posting - broker registration failed');
        return;
    }
    
    const brokerAuth = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: brokerUser.email,
            password: brokerUser.password
        })
    });
    
    if (brokerAuth.status !== 200) {
        console.log('❌ Cannot test load posting - broker login failed');
        return;
    }
    
    const brokerToken = brokerAuth.data.token;
    
    // Post load
    const result = await apiRequest('/loads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${brokerToken}` },
        body: JSON.stringify(testLoad)
    });
    
    console.log('✅ Load posting:', result.status === 201 ? 'PASS' : 'FAIL');
    if (result.status === 201) {
        console.log('   Load ID:', result.data.load._id);
    } else {
        console.log('   Error:', result.data);
    }
}

async function testLoadBooking() {
    console.log('\n🧪 Testing Load Booking...');
    
    // Get available loads
    const loadsResult = await apiRequest('/loads?status=available');
    
    if (loadsResult.status !== 200 || !loadsResult.data.loads || loadsResult.data.loads.length === 0) {
        console.log('❌ Cannot test load booking - no available loads');
        return;
    }
    
    const loadId = loadsResult.data.loads[0]._id;
    
    // Book load
    const result = await apiRequest(`/loads/${loadId}/book`, {
        method: 'POST'
    });
    
    console.log('✅ Load booking:', result.status === 200 ? 'PASS' : 'FAIL');
    if (result.status !== 200) {
        console.log('   Error:', result.data);
    }
}

async function testDashboard() {
    console.log('\n🧪 Testing Dashboard...');
    
    const result = await apiRequest('/users/dashboard');
    
    console.log('✅ Dashboard access:', result.status === 200 ? 'PASS' : 'FAIL');
    if (result.status === 200) {
        console.log('   User type:', result.data.dashboard.user.accountType);
        console.log('   Stats available:', Object.keys(result.data.dashboard.stats).length > 0 ? 'YES' : 'NO');
    } else {
        console.log('   Error:', result.data);
    }
}

async function testSettings() {
    console.log('\n🧪 Testing Settings Update...');
    
    const updateData = {
        company: 'Updated Test Company',
        phone: '+1-555-999-8888',
        address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TX',
            zip: '75001',
            country: 'US'
        }
    };
    
    const result = await apiRequest('/users/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
    
    console.log('✅ Settings update:', result.status === 200 ? 'PASS' : 'FAIL');
    if (result.status !== 200) {
        console.log('   Error:', result.data);
    }
}

async function testValidation() {
    console.log('\n🧪 Testing Field Validation...');
    
    // Test invalid phone
    const invalidPhone = await apiRequest('/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ phone: 'invalid-phone' })
    });
    
    console.log('✅ Invalid phone validation:', invalidPhone.status === 400 ? 'PASS' : 'FAIL');
    
    // Test invalid state
    const invalidState = await apiRequest('/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
            address: { 
                state: 'XX', 
                country: 'US' 
            } 
        })
    });
    
    console.log('✅ Invalid state validation:', invalidState.status === 400 ? 'PASS' : 'FAIL');
    
    // Test invalid postal code
    const invalidZip = await apiRequest('/users/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
            address: { 
                zip: 'invalid', 
                country: 'US' 
            } 
        })
    });
    
    console.log('✅ Invalid postal code validation:', invalidZip.status === 400 ? 'PASS' : 'FAIL');
}

// Run all tests
async function runAllTests() {
    console.log('🚛 CargoLume API Test Suite');
    console.log('============================');
    
    try {
        await testRegistration();
        await testLogin();
        await testShipmentCreation();
        await testLoadPosting();
        await testLoadBooking();
        await testDashboard();
        await testSettings();
        await testValidation();
        
        console.log('\n✅ All tests completed!');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export { runAllTests, testRegistration, testLogin, testShipmentCreation, testLoadPosting, testLoadBooking, testDashboard, testSettings, testValidation };
