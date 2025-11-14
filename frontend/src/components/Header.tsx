import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 2px solid #f0f0f0;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
`;

const NavLinks = styled.div`
  a, button {
    margin-left: 20px;
    text-decoration: none;
    color: #007bff;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 16px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <Nav>
      <Logo to="/">SlotSwapper</Logo>
      <NavLinks>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/requests">My Requests</Link>
            <button onClick={logout}>Logout ({user.name})</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};
export default Header;