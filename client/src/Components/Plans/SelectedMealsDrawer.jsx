import React from 'react';
import { RiDeleteBin5Line } from "react-icons/ri";
import './SelectedMealsDrawer.css';

function SelectedMealsDrawer({ isOpen, onClose, selectedMeals, onUpdateMeal, matchStatus, allOK }) {
  // Function to group meals by type
  const groupMealsByType = () => {
    return selectedMeals.reduce((groups, meal) => {
      meal.mealType.forEach(type => {
        if (!groups[type]) groups[type] = [];
        groups[type].push(meal);
      });
      return groups;
    }, {});
  };
  
  const groupedMeals = groupMealsByType();
  const mealTypes = Object.keys(groupedMeals);
  
  // Calculate total calories
  const totalCalories = selectedMeals.reduce((sum, meal) => {
    return sum + (meal.caloriesPer100g * (meal.quantity || 1));
  }, 0);
  
  // Handler for quantity updates
  const handleQuantityChange = (meal, change) => {
    const currentQuantity = meal.quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + change);
    
    const updatedMeal = { ...meal, quantity: newQuantity };
    onUpdateMeal(updatedMeal);
  };
  
  // Handler for removing a meal
  const handleRemoveMeal = (meal) => {
    const updatedMeal = { ...meal, quantity: 0 };
    onUpdateMeal(updatedMeal);
  };

  return (
    <>
      <div className={`selected-meals-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      
      <div className={`selected-meals-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Your Selected Meals</h3>
          <button className="close-drawer-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="drawer-content">
          <div className="macro-summary">
            <div className="calories-summary">
              <span>Total Calories</span>
              <span className="total-drawer-calories">{Math.round(totalCalories)} cal</span>
            </div>
            
            <div className="macro-status">
              <div className={`macro-pill ${matchStatus.proteinOK ? 'success' : 'warning'}`}>
                <i className={`bi ${matchStatus.proteinOK ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>Protein</span>
              </div>
              <div className={`macro-pill ${matchStatus.carbsOK ? 'success' : 'warning'}`}>
                <i className={`bi ${matchStatus.carbsOK ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>Carbs</span>
              </div>
              <div className={`macro-pill ${matchStatus.fatsOK ? 'success' : 'warning'}`}>
                <i className={`bi ${matchStatus.fatsOK ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>Fats</span>
              </div>
            </div>
            
            <div className="overall-status">
              {allOK ? (
                <div className="status success">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Perfect balance! Your meal plan is optimized.</span>
                </div>
              ) : (
                <div className="status warning">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>Adjust your meals to meet the recommended macros.</span>
                </div>
              )}
            </div>
          </div>
          
          {selectedMeals.length === 0 ? (
            <div className="no-meals-selected">
              <i className="bi bi-basket3"></i>
              <p>You haven't selected any meals yet</p>
              <button className="browse-meals-btn" onClick={onClose}>Browse Meals</button>
            </div>
          ) : (
            <div className="meal-type-groups">
              {mealTypes.map(type => (
                <div key={type} className="meal-type-group">
                  <h4>{type}</h4>
                  <div className="selected-meals-list">
                    {groupedMeals[type].map((meal) => (
                      <div key={meal._id} className="selected-meal-item">
                        <div className="meal-info">
                          <h5>{meal.name}</h5>
                          <div className="meal-macros">
                            <span>{meal.caloriesPer100g} cal</span>
                            <span>{meal.proteinPer100g}g protein</span>
                          </div>
                        </div>
                        
                        <div className="meal-actions">
                          <div className="quantity-controls">
                            <button onClick={() => handleQuantityChange(meal, -1)}>
                              <i className="bi bi-dash">-</i>
                            </button>
                            <span>{meal.quantity || 1}</span>
                            <button onClick={() => handleQuantityChange(meal, 1)}>
                              <i className="bi bi-plus">+</i>
                            </button>
                          </div>
                          
                          <button className="remove-btn" onClick={() => handleRemoveMeal(meal)}>
                            <i className="bi bi-trash"><RiDeleteBin5Line /></i>
                            {/* <i class="fa fa-trash-o" style="font-size:48px;color:red"></i> */}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SelectedMealsDrawer;