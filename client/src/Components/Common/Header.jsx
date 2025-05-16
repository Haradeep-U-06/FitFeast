import {useContext, useState, useEffect} from 'react'
import { Link , useNavigate, useLocation } from 'react-router-dom'
import { useClerk , useUser } from '@clerk/clerk-react'
import { userContextObj } from '../../Contexts/UserContext'
import  logo from "../../assets/logo.png"
import './Header.css'

const Header = () => {

  const {signOut} = useClerk()
  const {currentUser , setCurrentUser}=useContext(userContextObj)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate=useNavigate()
  const location=useLocation()

  const {isSignedIn ,user , isLoaded }= useUser() ; 

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async ()=>{
    console.log("signout called")
    try{
      await signOut();
      setCurrentUser(null)
      navigate('/')
    }
    catch(err){
      console.log("Error Signed Out" , err)
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  // Calculate total items in cart (accounting for quantity)
  const cartItemCount = currentUser?.userProducts?.reduce(
    (total, item) => total + (item.quantity > 0 ? item.quantity : 0), 0
  ) || 0;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className='site-header'>
      <div className='header-container'>
        <div className='logo-container'>
          <Link to="/" className="logo-link" onClick={closeMobileMenu}>
            <div className="logo">
              <img src={logo} alt="FitFeast Logo" className='smmm'/>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className='main-navigation'>
          <ul className='nav-links'>
            <li>
              <Link to='/' className={`nav-link ${isActive('/')}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to='/products' className={`nav-link ${isActive('/products')}`}>
                Products
              </Link>
            </li>
            {isSignedIn && (
              <li>
                <Link to='/plans' className={`nav-link ${isActive('/plans')}`}>
                  Plans
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* Desktop Auth Container */}
        <div className='auth-container'>
          {!isSignedIn?(
            <div className='auth-buttons'>
              <Link to='/signup' className='auth-button signup'>
                SignUp
              </Link>
              <Link to='/signin' className='auth-button signin'>
                SignIn
              </Link>
            </div>
          ):(
            <div className="user-menu">
              <Link to='/saved-plans' className='saved-plans-link'>
                View Saved Plans
              </Link>
              <Link to="/cart" className="cart-icon-container">
                <i className="bi bi-cart3">🛒</i>
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </Link>
              <div className="user-profile-dropdown">
                <div className="user-avatar">
                  {currentUser?.profileImageUrl ? (
                    <img src={currentUser.profileImageUrl} alt={currentUser.firstName} />
                  ) : (
                    <div className="avatar-placeholder">{currentUser?.firstName?.charAt(0) || 'U'}</div>
                  )}
                  <span className="user-name">{currentUser?.firstName}</span>
                </div>
                <div className="dropdown-content">
                  <Link to={`/user-profile/${currentUser?.email}`} className="dropdown-item">
                    My Profile
                  </Link>
                  <button onClick={handleSignOut} className="dropdown-item signout-button">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Backdrop Overlay for Mobile Menu */}
        <div 
          className={`mobile-menu-backdrop ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={closeMobileMenu}
        ></div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <nav className="mobile-navigation">
            <ul className="mobile-nav-links">
              <li>
                <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className={`mobile-nav-link ${isActive('/products')}`} onClick={closeMobileMenu}>
                  Products
                </Link>
              </li>
              {isSignedIn && (
                <li>
                  <Link to="/plans" className={`mobile-nav-link ${isActive('/plans')}`} onClick={closeMobileMenu}>
                    Plans
                  </Link>
                </li>
              )}
              {isSignedIn && (
                <li>
                  <Link to="/saved-plans" className={`mobile-nav-link ${isActive('/saved-plans')}`} onClick={closeMobileMenu}>
                    Saved Plans
                  </Link>
                </li>
              )}
              {isSignedIn && (
                <li>
                  <Link to="/cart" className={`mobile-nav-link ${isActive('/cart')}`} onClick={closeMobileMenu}>
                    <span className="mobile-cart-text">Shopping Cart</span>
                    {cartItemCount > 0 && (
                      <span className="mobile-cart-count">{cartItemCount}</span>
                    )}
                  </Link>
                </li>
              )}
              {isSignedIn && (
                <li>
                  <Link 
                    to={`/user-profile/${currentUser?.email}`} 
                    className={`mobile-nav-link ${isActive(`/user-profile/${currentUser?.email}`)}`} 
                    onClick={closeMobileMenu}
                  >
                    My Profile
                  </Link>
                </li>
              )}
              {isSignedIn ? (
                <li>
                  <button onClick={() => {handleSignOut(); closeMobileMenu();}} className="mobile-nav-link signout-mobile">
                    Sign Out
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/signin" className={`mobile-nav-link ${isActive('/signin')}`} onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className={`mobile-nav-link signup-mobile ${isActive('/signup')}`} onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header