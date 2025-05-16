import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContextObj } from '../../Contexts/UserContext';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import './Checkout.css';

function Checkout() {
    const { currentUser, setCurrentUser } = useContext(userContextObj);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderTotal, setOrderTotal] = useState(0);
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : '',
        email: currentUser?.email || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        paymentMethod: 'credit'
    });
    
    // Errors state
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        // Calculate order total
        if (currentUser?.userProducts) {
            const total = currentUser.userProducts.reduce(
                (sum, item) => sum + (item.price * (item.quantity || 1)), 0
            );
            setOrderTotal(total);
        }
        
        // Redirect if cart is empty
        if (!currentUser?.userProducts || currentUser.userProducts.length === 0) {
            navigate('/cart');
        }
    }, [currentUser, navigate]);

    // new 3rd
    useEffect(() => {
        if (orderPlaced) {
            console.log("Order placed state changed to true, should show success screen");
        }
    }, [orderPlaced]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
        
        return newErrors;
    };

    const debugFormData = () => {
        console.log("Form data before submission:", formData);
        console.log("Current user ID:", currentUser?._id);
        console.log("Cart items:", currentUser?.userProducts?.length);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        debugFormData(); // Add this line
        
        // Validate form
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setLoading(true);
        
        try {
            // Generate random order number
            const randomOrderNumber = 'FF-' + Math.floor(Math.random() * 10000000);
            setOrderNumber(randomOrderNumber);
            
            // Clear cart after successful order
            const updatedUser = {
                ...currentUser,
                userProducts: [],
                cost: 0
            };
            
            // Update user in database
            await axios.put(`${getBaseUrl()}/user-api/users/${currentUser._id}`, updatedUser);
            
            // Update local state
            setCurrentUser(updatedUser);
            
            // Show order success - make sure this gets called
            setOrderPlaced(true);
            console.log("Order placed successfully, orderPlaced set to true");
        } catch (error) {
            console.error('Error placing order:', error);
            // Add error handling here so users know something went wrong
            alert("There was a problem processing your order. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const goToProducts = () => {
        navigate('/products');
    };
    
    // Add this right before your conditional render
    console.log("Order placed status:", orderPlaced);

    if (orderPlaced) {
        return (
            <div className="order-success-page">
                <div className="order-success-container">
                    <div className="success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p className="order-number">Order #{orderNumber}</p>
                    <p className="thank-you-message">
                        Thank you for your order. We've received your payment and will process your order soon.
                    </p>
                    <p className="email-message">
                        A confirmation email has been sent to <strong>{formData.email}</strong>
                    </p>
                    <button className="continue-shopping-btn" onClick={goToProducts}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">Checkout</h1>
                <div className="checkout-content">
                    <div className="checkout-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h2>Contact Information</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <div className="error-message">{errors.email}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-section">
                                <h2>Shipping Address</h2>
                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={errors.address ? 'error' : ''}
                                    />
                                    {errors.address && <div className="error-message">{errors.address}</div>}
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className={errors.city ? 'error' : ''}
                                        />
                                        {errors.city && <div className="error-message">{errors.city}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={errors.state ? 'error' : ''}
                                        />
                                        {errors.state && <div className="error-message">{errors.state}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="zip">ZIP Code</label>
                                        <input
                                            type="text"
                                            id="zip"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            className={errors.zip ? 'error' : ''}
                                        />
                                        {errors.zip && <div className="error-message">{errors.zip}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-section">
                                <h2>Payment Method</h2>
                                <div className="payment-methods">
                                    <div className="payment-method">
                                        <input
                                            type="radio"
                                            id="credit"
                                            name="paymentMethod"
                                            value="credit"
                                            checked={formData.paymentMethod === 'credit'}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="credit">
                                            <i className="bi bi-credit-card payment-icon"></i>
                                            Credit Card
                                        </label>
                                    </div>
                                    
                                    <div className="payment-method">
                                        <input
                                            type="radio"
                                            id="paypal"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={formData.paymentMethod === 'paypal'}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="paypal">
                                            <i className="bi bi-paypal payment-icon"></i>
                                            PhonePay
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="checkout-buttons">
                                <button 
                                    type="button" 
                                    className="back-to-cart-btn"
                                    onClick={() => navigate('/cart')}
                                >
                                    Back to Cart
                                </button>
                                <button 
                                    type="submit" 
                                    className="place-order-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="checkout-summary">
                        <div className="summary-card">
                            <h2>Order Summary</h2>
                            <div className="summary-items">
                                {currentUser?.userProducts?.map((item) => (
                                    <div className="summary-item" key={item._id || item.id}>
                                        <div className="item-info">
                                            <span className="item-name">{item.title}</span>
                                            <span className="item-quantity">x{item.quantity || 1}</span>
                                        </div>
                                        <span className="item-price">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-divider"></div>
                            
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${orderTotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${orderTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;