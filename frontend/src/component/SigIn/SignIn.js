import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    // Basic email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      isValid = false;
    }

    // Check password length
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      isValid = false;
    }

    // Check if email and password are empty
    if (!email || !password) {
      setError('Please fill in both fields.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return; // Prevent login if validation fails

    setLoading(true); // Start loading
    try {
      const response = await axios.post('https://secure-loging-host-server.vercel.app/signin', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, name } = response.data; // Assuming name is returned in the response
        localStorage.setItem('token', token); // Store JWT token
        localStorage.setItem('userName', name); // Store user name for later use
        setError(''); // Clear error message
        toast.success('Login successful!');
        navigate('/home'); // Redirect to home page
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
        toast.error('An error occurred. Please try again.');
      }
    }
    setLoading(false); // Stop loading
  };

  return (
    <div className="container mt-4">
      <section className="background-radial-gradient overflow-hidden">
        <style>{`
            .background-radial-gradient {
              background-color: hsl(218, 41%, 15%);
              background-image: radial-gradient(650px circle at 0% 0%,
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
                  transparent 100%);
            }
            .bg-glass {
              background-color: hsla(0, 0%, 100%, 0.9) !important;
              backdrop-filter: saturate(200%) blur(25px);
              border-radius: 20px;
            }
            .form-control {
              border-radius: 10px;
            }
            .btn {
              border-radius: 10px;
            }
          `}</style>

        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
          <div className="row gx-lg-5 align-items-center mb-5">
            <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
              <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                Welcome <br />
                <span style={{ color: 'hsl(218, 81%, 75%)' }}>InfoLock</span>
              </h1>
              <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                Software security involves practices and measures to protect applications from vulnerabilities and threats 
                throughout their lifecycle. It includes secure coding, vulnerability assessments, and security testing to 
                safeguard sensitive data and maintain system integrity.
              </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
              <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
              <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

              <div className="card bg-glass">
                <div className="card-body px-4 py-5 px-md-5">
                  <form>
                    <div className="row">
                      <h1 className="mb-3 h3">Login</h1>
                    </div>

                    {error && <p className="text-danger">{error}</p>}

                    {/* Email input */}
                    <div className="form-outline mb-4">
                      <input
                        type="email"
                        id="form3Example3"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example3">Email address</label>
                    </div>

                    {/* Password input */}
                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        id="form3Example4"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example4">Password</label>
                    </div>

                    {/* Submit button */}
                    <button 
                      type="button" 
                      className="btn btn-primary btn-block mb-4" 
                      onClick={handleLogin}
                      disabled={loading} // Disable button while loading
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {/* Register buttons */}
                    <div className="text-center">
                      <p>Don't have an account yet? <a href="/SignUp">Register</a></p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
};

export default SignIn;
