import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SignInPage } from '../components/ui/sign-in-flow-1';

const Login = ({ setUser }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLoginSubmit = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      // Save token and credentials
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      // Navigate to dashboard automatically after 2.5 seconds (gives time for the success animation to show)
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);

      return true; // Indicate success to the sign-in-flow component
    } catch (err) {
      console.error('Login submit error:', err);
      setError(err.response?.data?.error || 'Invalid credentials. Please verify and try again.');
      return false; // Indicate failure to the sign-in-flow component
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInPage 
      onSubmit={handleLoginSubmit} 
      error={error} 
      loading={loading} 
    />
  );
};

export default Login;
