import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const ownerPaymentApi = {
    createOrUpdateAccount(formData) {
        const token = localStorage.getItem('token'); // ឬ auth_token ទៅតាមអ្វីដែលបងរក្សាទុក

        return axios.post(`${BASE_URL}/owner/payment-accounts`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` // បញ្ជូន Token ទៅកាន់ Backend ដើម្បឆ្លងកាត់ Auth Middleware
            }
        });
    },
    
    getAccountDetails() {
        const token = localStorage.getItem('token');
        return axios.get(`${BASE_URL}/owner/payment-accounts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
};