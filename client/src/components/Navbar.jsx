import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, LogOut, User, Sun, Moon } from 'lucide-react';
import { logout } from '../features/authSlice';
import { clearCartSuccess } from '../features/cartSlice';

const Navbar = ({ theme, toggleTheme }) => {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartSuccess());
    navigate('/login');
  };

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">E-Commerce</Link>
        <div className="nav-links">
          <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <Link to="/cart" style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {totalCartItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px', 
                background: 'red', color: 'white', borderRadius: '50%',
                padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
              }}>
                {totalCartItems}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18}/> {user.name}
              </span>
              {user.role === 'admin' && (
                 <Link to="/admin" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                    Admin
                 </Link>
              )}
              <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'red', border: 'none' }}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
