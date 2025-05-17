import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">About Us</h3>
            <p className="footer-text">
              We provide high-quality products and exceptional services to meet all your needs.
              Our mission is to deliver value and satisfaction to our customers.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f">f</i>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter">t</i>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram">i</i>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in">l</i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Home</Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">Products</Link>
              </li>
              <li>
                <Link to="/plans" className="footer-link">Plans</Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link">Cart</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Help</h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq" className="footer-link">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping" className="footer-link">Shipping</Link>
              </li>
              <li>
                <Link to="/returns" className="footer-link">Returns</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} Fit Feast. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link to="#" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="#" className="footer-bottom-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer