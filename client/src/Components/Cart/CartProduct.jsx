import React, { useState, useContext } from 'react';
import { userContextObj } from '../../Contexts/UserContext';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import './CartProduct.css';

function CartProduct({ p }) {
    const { currentUser, setCurrentUser } = useContext(userContextObj);
    const [quantity, setQuantity] = useState(p.quantity || 1);
    const [isRemoving, setIsRemoving] = useState(false);

    const updateQuantity = async (newQuantity) => {
        if (newQuantity < 1) return;
        
        setQuantity(newQuantity);
        
        // Update the product quantity in the cart
        const updatedProducts = currentUser.userProducts.map(item => 
            (item._id === p._id || item.id === p.id) 
                ? { ...item, quantity: newQuantity } 
                : item
        );
        
        // Calculate new total cost
        const newCost = updatedProducts.reduce(
            (total, item) => total + (item.price * (item.quantity || 1)), 0
        );
        
        try {
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

    const deleteItem = async () => {
        setIsRemoving(true);
        
        try {
            // Filter out the current product
            const updatedProducts = currentUser.userProducts.filter(item => 
                item._id !== p._id && item.id !== p.id
            );
            
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
        } catch (error) {
            console.error("Error removing item:", error);
            setIsRemoving(false);
        }
    };

    const itemTotal = (p.price * quantity).toFixed(2);

    return (
        <div className="cart-product">
            <div className="cart-product-image">
                <img src={p.img} alt={p.title} />
            </div>
            
            <div className="cart-product-details">
                <h3 className="cart-product-title">{p.title}</h3>
                <p className="cart-product-description">{p.description}</p>
                
                <div className="cart-product-meta">
                    <div className="cart-product-price">${p.price.toFixed(2)}</div>
                    
                    <div className="cart-quantity-control">
                        <button 
                            className="cart-quantity-btn decrease" 
                            onClick={() => updateQuantity(quantity - 1)}
                            disabled={quantity <= 1}
                        >
                            <i className="bi bi-dash">-</i>
                        </button>
                        
                        <span className="cart-quantity-value">{quantity}</span>
                        
                        <button 
                            className="cart-quantity-btn increase" 
                            onClick={() => updateQuantity(quantity + 1)}
                        >
                            <i className="bi bi-plus">+</i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="cart-product-actions">
                <div className="cart-product-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">${itemTotal}</span>
                </div>
                
                <button 
                    className="cart-remove-btn" 
                    onClick={deleteItem}
                    disabled={isRemoving}
                >
                    {isRemoving ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        <i className="bi bi-trash"></i>
                    )}
                    Remove
                </button>
            </div>
        </div>
    );
}

export default CartProduct;