import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('Login as DonorDemo...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'ddemo@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Token acquired!');

        console.log('\n--- Testing Toggle Availability ---');
        try {
            const availRes = await axios.patch(`${API_URL}/users/availability`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Toggle Availability Success:', availRes.data);
        } catch (e) {
            console.error('Toggle Availability Error:', e.response?.data || e.message);
        }

        console.log('\n--- Testing Update Profile ---');
        try {
            const updateRes = await axios.put(`${API_URL}/users/profile`, {
                name: 'DonorDemo Updated',
                bloodGroup: ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Update Profile Success:', updateRes.data);
        } catch (e) {
            console.error('Update Profile Error:', e.response?.data || e.message);
        }
    } catch (err) {
        console.error('Test script failed:', err.response?.data || err.message);
    }
}

runTest();
