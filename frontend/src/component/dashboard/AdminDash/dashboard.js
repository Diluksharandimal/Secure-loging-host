import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [adminName, setAdminName] = useState('');
    const [activityLogs, setActivityLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch admin name
            const admin = JSON.parse(atob(token.split('.')[1]));
            setAdminName(admin.name);

            // Fetch activity logs
            axios.get('https://secure-loging-system-server.vercel.app/admin/activity_logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => setActivityLogs(response.data))
            .catch(error => toast.error("Failed to fetch activity logs"));

            // Fetch users
            axios.get('https://secure-loging-system-server.vercel.app/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => setUsers(response.data))
            .catch(error => toast.error("Failed to fetch users"));
        } else {
            navigate('/login'); // Redirect if not logged in
        }
    }, [navigate]);

    const handleRemoveUser = (userId) => {
        const token = localStorage.getItem('token');
        axios.delete(`https://secure-loging-system-server.vercel.app/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            toast.success("User removed successfully");
            setUsers(users.filter(user => user.id !== userId));
        })
        .catch(error => toast.error("Failed to remove user"));
    };

    return (
        <div style={styles.backgroundRadialGradient}>
            <div style={styles.bgGlass} className="container mt-4">
                <div className="d-flex justify-content-between">
                    <h1>Admin Dashboard</h1>
                    <h3>Welcome, {adminName}</h3>
                </div>
                <div className="mt-4">
                    <h2>User Activity Logs</h2>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Action</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.user_id}</td>
                                    <td>{log.action}</td>
                                    <td>{log.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <div className="mt-4">
                    <h2>Users</h2>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={() => handleRemoveUser(user.id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    backgroundRadialGradient: {
        minHeight: '100vh',  // Ensure it covers the full height of the viewport
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
        position: 'relative',
        display: 'flex',  // Ensure content centers properly
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgGlass: {
        backgroundColor: 'hsla(0, 0%, 100%, 0.9)',
        backdropFilter: 'saturate(200%) blur(25px)',
        borderRadius: '20px',
        zIndex: 2,
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }
};

export default Dashboard;
