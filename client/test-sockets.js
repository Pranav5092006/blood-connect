import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function runTest() {
    try {
        console.log('Registering Recipient...');
        const recipientRes = await axios.post(`${API_URL}/auth/register`, {
            name: `RecipientTest_${Date.now()}`,
            email: `recipient_${Date.now()}@test.com`,
            password: 'password123',
            role: 'recipient',
            bloodGroup: 'O+',
            city: 'TestCity',
            contactNumber: '1111111111'
        });
        const recipientToken = recipientRes.data.token;
        const recipientUser = recipientRes.data.user;

        console.log('Registering Donor...');
        const donorRes = await axios.post(`${API_URL}/auth/register`, {
            name: `DonorTest_${Date.now()}`,
            email: `donor_${Date.now()}@test.com`,
            password: 'password123',
            role: 'donor',
            bloodGroup: 'O+',
            city: 'TestCity',
            contactNumber: '9999999999'
        });
        const donorToken = donorRes.data.token;
        const donorUser = donorRes.data.user;

        console.log('Connecting Recipient Socket...');
        const recipientSocket = io(SOCKET_URL);

        // Wait for connect
        await new Promise(r => recipientSocket.once('connect', r));
        recipientSocket.emit('join', { userId: recipientUser._id, role: recipientUser.role });
        console.log('Recipient Socket Connected & Joined Room.');

        recipientSocket.on('requestAccepted', (data) => {
            console.log('\n--- SUCCESS! received requestAccepted event ---');
            console.log(JSON.stringify(data, null, 2));
            if (data.donorContact === donorUser.contactNumber) {
                console.log("\n✅ TEST PASSED: donorContact matches the donor's actual contact number!");
            } else {
                console.log('\n❌ TEST FAILED: donorContact is missing or incorrect.');
            }
            process.exit(0);
        });

        console.log('Creating Blood Request...');
        const createReq = await axios.post(`${API_URL}/requests`, {
            bloodGroup: 'O+',
            hospital: 'Test Hospital',
            city: 'TestCity',
            units: 1,
            emergency: false,
            requiredDate: new Date().toISOString()
        }, { headers: { Authorization: `Bearer ${recipientToken}` } });
        const reqId = createReq.data.request._id;

        console.log('Accepting Blood Request as Donor...');
        await axios.patch(`${API_URL}/requests/${reqId}/respond`, {
            action: 'accept'
        }, { headers: { Authorization: `Bearer ${donorToken}` } });

        console.log('Waiting for socket event...');
        setTimeout(() => {
            console.log('\n❌ TEST FAILED: Did not receive requestAccepted event in time.');
            process.exit(1);
        }, 5000);

    } catch (err) {
        console.error('Error during test:', err.response?.data || err.message);
        process.exit(1);
    }
}

runTest();
