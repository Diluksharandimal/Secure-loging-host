import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Token not found. Please login.");
                navigate("/login");
                return;
            }
            try {
                const response = await axios.get('https://secure-loging-host-server.vercel.app/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setUpdatedName(response.data.name);
                setUpdatedEmail(response.data.email);
            } catch (error) {
                console.error("Error fetching user data:", error.response || error.message);
                toast.error("Unable to load profile data. Please make sure you are logged in.");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Token not found. Please login.");
            navigate("/login");
            return;
        }
        try {
            const response = await axios.put(
                'https://secure-loging-host-server.vercel.app/users/profile',
                { name: updatedName, email: updatedEmail },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            toast.success("Profile updated successfully!");
            setUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error.response || error.message);
            toast.error("Failed to update profile.");
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Token not found. Please login.");
            navigate("/login");
            return;
        }
        try {
            await axios.delete('https://secure-loging-host-server.vercel.app/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Account deleted successfully.");
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error("Error deleting account:", error.response || error.message);
            toast.error("Failed to delete account.");
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div style={styles.backgroundRadialGradient}>
            <div style={styles.bgGlass}>
                <h2 style={{ textAlign: 'center' }}>User Profile</h2>
                <div style={{ padding: '1rem' }}>
                    {isEditing ? (
                        <>
                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={updatedName}
                                    onChange={(e) => setUpdatedName(e.target.value)}
                                    style={styles.inputField}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={updatedEmail}
                                    onChange={(e) => setUpdatedEmail(e.target.value)}
                                    style={styles.inputField}
                                />
                            </label>
                            <button style={styles.btn} onClick={handleUpdate}>Save</button>
                            <button style={styles.btn} onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <p><strong>Name:</strong> {user.name || "N/A"}</p>
                            <p><strong>Email:</strong> {user.email || "N/A"}</p>
                            <button style={styles.btn} onClick={() => setIsEditing(true)}>Edit</button>
                        </>
                    )}
                    <button
                        style={{ ...styles.btn, backgroundColor: 'red', color: 'white' }}
                        onClick={handleDelete}
                    >
                        Delete Account
                    </button>
                    <button style={styles.backBtn} onClick={handleBack}>Back to Home</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

// CSS Styles
const styles = {
    backgroundRadialGradient: {
        minHeight: '100vh',
        backgroundColor: 'hsl(218, 41%, 15%)',
        backgroundImage: `radial-gradient(650px circle at 0% 0%, 
            hsl(218, 41%, 35%) 15%, 
            hsl(218, 41%, 30%) 35%, 
            hsl(218, 41%, 20%) 75%, 
            hsl(218, 41%, 19%) 80%, 
            transparent 100%),
            radial-gradient(1250px circle at 100% 100%, 
            hsl(218, 41%, 45%) 15%, 
            hsl(218, 41%, 30%) 35%, 
            hsl(218, 41%, 20%) 75%, 
            hsl(218, 41%, 19%) 80%, 
            transparent 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgGlass: {
        backgroundColor: 'hsla(0, 0%, 100%, 0.9)',
        backdropFilter: 'saturate(200%) blur(25px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '350px',
        textAlign: 'center',
    },
    btn: {
        borderRadius: '10px',
        padding: '0.75rem 1.5rem',
        margin: '1rem 0.5rem',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    inputField: {
        display: 'block',
        width: '100%',
        margin: '1rem 0',
        padding: '0.5rem',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    backBtn: {
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    }
};
