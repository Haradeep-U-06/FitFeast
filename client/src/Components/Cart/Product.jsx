import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userContextObj } from '../../Contexts/UserContext';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import './Product.css';

function Product({ p }) {
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const navigate = useNavigate();
  
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (currentUser && currentUser.userProducts) {
      const cartItem = currentUser.userProducts.find(item => item._id === p._id);
      if (cartItem) {
        setIsInCart(true);
        setQuantity(cartItem.quantity || 0);
      } else {
        setIsInCart(false);
        setQuantity(0);
      }
    }
  }, [currentUser, p]);

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
    
    // If quantity is set to 0, remove from cart
    if (newQuantity === 0 && isInCart) {
      removeFromCart();
      return;
    }
    
    // If already in cart, update quantity
    if (isInCart) {
      updateCartItemQuantity(newQuantity);
    }
  };

  const updateCartItemQuantity = async (newQuantity) => {
    try {
      // Update the quantity of the existing item in cart
      const updatedProducts = currentUser.userProducts.map(item => 
        item._id === p._id ? { ...item, quantity: newQuantity } : item
      );
      
      // Calculate new total cost
      const newCost = updatedProducts.reduce(
        (total, item) => total + (item.price * (item.quantity || 1)), 0
      );
      
      // Update in database
      await axios.put(`${getBaseUrl()}/user-api/users/${currentUser._id}`, {
        ...currentUser,
        userProducts: updatedProducts,
        cost: newCost
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        userProducts: updatedProducts,
        cost: newCost
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async () => {
    try {
      // Filter out the current product
      const updatedProducts = currentUser.userProducts.filter(item => item._id !== p._id);
      
      // Calculate new cost
      const newCost = updatedProducts.reduce(
        (total, item) => total + (item.price * (item.quantity || 1)), 0
      );
      
      // Update in database
      await axios.put(`${getBaseUrl()}/user-api/users/${currentUser._id}`, {
        ...currentUser,
        userProducts: updatedProducts,
        cost: newCost
      });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        userProducts: updatedProducts,
        cost: newCost
      });
      
      setIsInCart(false);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const addToCart = async () => {
    if (!currentUser.email) {
      navigate('/signin');
      return;
    }
    
    setLoading(true);
    
    try {
      // If user doesn't have an _id, we need to make sure they're created first
      if (!currentUser._id) {
        // Try to fetch the user first to see if they exist
        const userCheckResponse = await axios.get(`${getBaseUrl()}/user-api/users/${currentUser.email}`);
        
        if (userCheckResponse.data.message === "User Not Found") {
          // Create the user if they don't exist
          const createUserResponse = await axios.post(`${getBaseUrl()}/user-api/users`, {
            ...currentUser,
            userProducts: [], // Initialize with empty array
            cost: 0
          });
          
          // Update current user with the newly created user (including _id)
          if (createUserResponse.data && createUserResponse.data.payload) {
            setCurrentUser(createUserResponse.data.payload);
          }
        } else if (userCheckResponse.data && userCheckResponse.data.payload) {
          // Update current user with the fetched user data
          setCurrentUser(userCheckResponse.data.payload);
        }
      }
      
      // Get latest user data after ensuring user exists
      const updatedUserResponse = await axios.get(`${getBaseUrl()}/user-api/users/${currentUser.email}`);
      
      if (!updatedUserResponse.data || !updatedUserResponse.data.payload) {
        throw new Error("Could not retrieve user data");
      }
      
      const userData = updatedUserResponse.data.payload;
      
      // Check if product already exists in cart
      const existingProductIndex = userData.userProducts.findIndex(
        item => item._id === p._id || item.id === p.id
      );
      
      let updatedProducts;
      let newCost;
      
      if (existingProductIndex !== -1) {
        // Update quantity if product already exists
        updatedProducts = [...userData.userProducts];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: (updatedProducts[existingProductIndex].quantity || 1) + 1
        };
        
        newCost = updatedProducts.reduce(
          (total, item) => total + (item.price * (item.quantity || 1)), 0
        );
      } else {
        // Add new product with quantity 1
        const productWithQuantity = { ...p, quantity: 1 };
        updatedProducts = [...userData.userProducts, productWithQuantity];
        
        // Calculate new total cost
        newCost = userData.cost + p.price;
      }
      
      // Update in database using the _id from the fetched user data
      await axios.put(`${getBaseUrl()}/user-api/users/${userData._id}`, {
        ...userData, 
        userProducts: updatedProducts,
        cost: newCost
      });
      
      // Update local state
      setCurrentUser({
        ...userData,
        userProducts: updatedProducts,
        cost: newCost
      });
      
      setIsInCart(true);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("There was a problem adding this item to your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={p.img} alt={p.title} />
        {p.discount && <span className="product-discount">{p.discount}% OFF</span>}
      </div>
      
      <div className="product-details">
        <h3 className="product-title">{p.title}</h3>
        <p className="product-description">{p.description}</p>
        
        <div className="product-meta">
          <div className="product-price">₹{p.price.toFixed(2)}</div>
        </div>
        
        <div className="product-actions">
          {isInCart ? (
            <div className="cart-controls">
              <div className="quantity-control">
                <button 
                  className="quantity-btn minus" 
                  onClick={() => handleQuantityChange(-1)}
                >
                  <i className="bi bi-dash">-</i>
                </button>
                
                <span className="quantity-value">{quantity}</span>
                
                <button 
                  className="quantity-btn plus" 
                  onClick={() => handleQuantityChange(1)}
                >
                  <i className="bi bi-plus">+</i>
                </button>
              </div>
              
              {quantity > 0 && (
                <Link to="/cart" className="view-cart-btn">
                  <i className="bi bi-cart-check"></i>
                  View in Cart
                </Link>
              )}
            </div>
          ) : (
            <button 
              className="add-to-cart-btn" 
              onClick={addToCart} 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-cart-plus"></i>
              )}
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Product;