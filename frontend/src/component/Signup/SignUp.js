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

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(values.password)) {
      errors.password = 'Password must be at least 8 characters, contain at least one uppercase letter, one number, and one symbol';
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm(values);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      const response = await axios.post('https://secure-loging-host-server.vercel.app/SignUp', {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.status === 201) {
        toast.success('Registration successful!');
        navigate('/SignIn'); // Redirect to SignIn after successful registration
      }
    } catch (error) {
      toast.error('An error occurred during registration. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <section className="background-radial-gradient overflow-hidden">
        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
          <div className="row gx-lg-5 align-items-center mb-5">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                Join InfoLock
              </h1>
              <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                Secure your application and data with InfoLock. Sign up to protect your information.
              </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="card bg-glass">
                <div className="card-body px-4 py-5 px-md-5">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <h1 className="mb-3 h3">Sign Up</h1>
                    </div>

                    {errors.name && <p className="text-danger">{errors.name}</p>}
                    <div className="form-outline mb-4">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={values.name}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label">Name</label>
                    </div>

                    {errors.email && <p className="text-danger">{errors.email}</p>}
                    <div className="form-outline mb-4">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={values.email}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label">Email address</label>
                    </div>

                    {errors.password && <p className="text-danger">{errors.password}</p>}
                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={values.password}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label">Password</label>
                    </div>

                    {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label">Confirm Password</label>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mb-4">
                      Sign Up
                    </button>

                    <div className="text-center">
                      <p>Already have an account? <a href="/SignIn">Sign In</a></p>
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

export default SignUp;
