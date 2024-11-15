import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validateForm = (values) => {
    let errors = {};

    if (!values.name.trim()) {
      errors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'Enter a valid email address';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(values.password)) {
      errors.password = 'Password must be at least 8 characters, contain at least one uppercase letter, one number, and one symbol';
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('https://vercel.com/diluksha-randimals-projects/secure-loging-host/signup', values, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Required for cross-origin cookies if needed
        });

        if (response.status === 200) {
          const { token } = response.data;
          localStorage.setItem('token', token);
          toast.success('Signup successful!');
          
          setValues({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          navigate('/signin');
        } else {
          setErrors({ general: 'Signup failed. Please try again.' });
        }
      } catch (error) {
        console.error('Error:', error);
        let message = 'An error occurred. Please try again later.';

        if (error.response) {
          if (error.response.status === 500) {
            message = 'Server error. Please check your data.';
          } else if (error.response.status === 409) {
            message = 'Email already exists.';
          }
          toast.error(message);
        }

        setErrors({ general: message });
      }
    }
  };

  return (
    <div className="container mt-4">
      <section className="background-radial-gradient overflow-hidden">
        <style>
          {`
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
            #radius-shape-1 {
              height: 220px;
              width: 220px;
              top: -60px;
              left: -130px;
              background: radial-gradient(#44006b, #ad1fff);
              overflow: hidden;
            }
            #radius-shape-2 {
              border-radius: 38% 62% 63% 37% / 70% 33% 67% 30%;
              bottom: -60px;
              right: -110px;
              width: 300px;
              height: 300px;
              background: radial-gradient(#44006b, #ad1fff);
              overflow: hidden;
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
          `}
        </style>

        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
          <div className="row gx-lg-5 align-items-center mb-5">
            <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
              <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                Join <br />
                <span style={{ color: 'hsl(218, 81%, 75%)' }}>InfoLock</span>
              </h1>
              <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                Register now to get access to exclusive content and tools to help you secure your applications and maintain system integrity.
              </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
              <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
              <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

              <div className="card bg-glass">
                <div className="card-body px-4 py-5 px-md-5">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <h1 className="mb-3 h3">Register</h1>
                    </div>

                    {errors.general && <p className="error-message text-danger" aria-live="assertive">{errors.general}</p>}

                    {/* Name input */}
                    <div className="form-outline mb-4">
                      <input 
                        type="text" 
                        id="form3Example1" 
                        className="form-control"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example1">Full Name</label>
                      {errors.name && <p className="text-danger">{errors.name}</p>}
                    </div>

                    {/* Email input */}
                    <div className="form-outline mb-4">
                      <input 
                        type="email" 
                        id="form3Example2" 
                        className="form-control"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example2">Email address</label>
                      {errors.email && <p className="text-danger">{errors.email}</p>}
                    </div>

                    {/* Password input */}
                    <div className="form-outline mb-4">
                      <input 
                        type="password" 
                        id="form3Example3" 
                        className="form-control"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example3">Password</label>
                      {errors.password && <p className="text-danger">{errors.password}</p>}
                    </div>

                    {/* Confirm Password input */}
                    <div className="form-outline mb-4">
                      <input 
                        type="password" 
                        id="form3Example4" 
                        className="form-control"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="form3Example4">Confirm Password</label>
                      {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit button */}
                    <button type="submit" className="btn btn-primary btn-block mb-4" style={{ width: '100%' }}>
                      Sign Up
                    </button>
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

export default SignUp;
