import React from 'react';
import { MdRestaurantMenu } from "react-icons/md";
import './FloatingActionButton.css';

function FloatingActionButton({ onClick, selectedMeals }) {
  const count = selectedMeals.length;
  
  return (
    <button 
      className="floating-action-button" 
      onClick={onClick}
      disabled={count === 0}
    >
      <i className="bi bi-basket-fill"><MdRestaurantMenu /></i>
      {count > 0 && <span className="item-count">{count}</span>}
    </button>
  );
}

export default FloatingActionButton;