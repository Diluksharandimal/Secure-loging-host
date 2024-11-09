import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// Inline styles as JavaScript objects
const styles = {
    body: {
        height: '100%',
        margin: '0'
    },
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
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bgGlass: {
        backgroundColor: 'hsla(0, 0%, 100%, 0.9)',
        backdropFilter: 'saturate(200%) blur(25px)',
        borderRadius: '20px',
        zIndex: 2,
        padding: '2rem'
    },
    btn: {
        borderRadius: '10px',
        marginBottom: '1rem',
        padding: '1rem',
        margin: '2rem'
    }
};

const Home = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    return (
        <div style={styles.backgroundRadialGradient}>
            <div className="container mt-4">
                {/* Section: Design Block */}
                <section className="overflow-hidden">
                    <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                        <div className="row gx-lg-5 align-items-center mb-5">
                            <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                                <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                                    Welcome to <br />
                                    <span style={{ color: 'hsl(218, 81%, 75%)' }}>InfoLock</span>
                                </h1>
                                <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                                    InfoLock is dedicated to providing top-notch solutions for software security.
                                    We aim to help you protect your applications from vulnerabilities and ensure data integrity.
                                </p>
                            </div>

                            <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                                <div className="card" style={styles.bgGlass}>
                                    <div className="card-body px-4 py-5 px-md-5 text-center">
                                        <h1 className="mb-3 h3">Get Started</h1>

                                        {/* Admin button */}
                                        <a href="/AsignIn" className="btn btn-primary btn-block" style={styles.btn}>
                                            Admin
                                        </a>

                                        {/* Client button with dropdown */}
                                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                                            <DropdownToggle className="btn btn-success btn-block" caret style={styles.btn}>
                                                Client
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem href="/SignIn">Sign In</DropdownItem>
                                                <DropdownItem href="/SignUp">Sign Up</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
