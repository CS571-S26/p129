import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function NavbarComponent({ user, handleLogout }) {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="navbar-custom" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-custom">
          <img
            src={logo}
            alt="Mad City Miles"
            height="40"
            className="d-inline-block align-top me-2"
          />
          <span className="brand-text">Mad City Miles</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">Home</Nav.Link>
            <Nav.Link as={Link} to="/profile" className="nav-link-custom">Profile</Nav.Link>
            <Button variant="outline-danger" onClick={onLogout} className="logout-nav-btn">
              Sign Out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;