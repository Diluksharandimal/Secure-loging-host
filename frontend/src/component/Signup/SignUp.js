import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Handle sign-up form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state

        try {
            const response = await axios.post('https://secure-loging-host-server.vercel.app/SignUp', {
                name,
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // Save token to local storage
                toast.success('Sign-up successful!');
                navigate('/profile'); // Redirect to the profile page
            } else {
                toast.error('Sign-up failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign-up:', error);
            // Enhanced error handling
            if (error.response) {
                // Backend error response
                toast.error(`Error: ${error.response.data.message || 'Something went wrong on the server.'}`);
            } else if (error.request) {
                // Request was made, but no response received
                toast.error('No response from the server. Please try again later.');
            } else {
                // Other errors (e.g., network issues)
                toast.error('An error occurred. Please check your connection.');
            }
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.submitButton} disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <p style={styles.signInRedirect}>
                    Already have an account? <a href="/signin">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #7b6bfc, #6a56c1)',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
        width: '400px',
        textAlign: 'center',
    },
    title: {
        marginBottom: '1rem',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '1rem',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '0.5rem',
    },
    submitButton: {
        width: '100%',
        padding: '0.8rem',
        backgroundColor: '#6a56c1',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '1rem',
    },
    signInRedirect: {
        marginTop: '1rem',
        color: '#333',
    },
};
