import React, { useContext, useEffect, useState } from 'react';
import { filtercontextObj } from '../../Contexts/FilterContext';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';

const MealPlanner = {
  allMeals: [],

  // Load all meals and cache them
  loadAllMeals: async () => {
    if (MealPlanner.allMeals.length === 0) {
      try {
        const response = await axios.get(`${getBaseUrl()}/food-api/meal`);
        MealPlanner.allMeals = response.data.payload || [];
      } catch (error) {
        console.error("Error loading meals:", error);
        return [];
      }
    }
    return MealPlanner.allMeals;
  },

  // Get filtered meals based on meal type and filters
  getFilteredMeals: (mealType, calorieTarget) => {
    const { filters } = useContext(filtercontextObj);
    
    // Get all meals from your data source
    let meals = MealPlanner.allMeals; // Assuming this function exists
    
    // Filter by meal type (Breakfast, Lunch, etc)
    meals = meals.filter(meal => {
      return meal.mealType.some(type => 
        type.toLowerCase().includes(mealType.toLowerCase())
      );
    });
    
    // Apply search filter if there is a search term
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchTermLower = filters.searchTerm.toLowerCase();
      meals = meals.filter(meal => {
        return meal.name.toLowerCase().includes(searchTermLower) || 
               meal.ingredients?.some(ingredient => 
                 ingredient.toLowerCase().includes(searchTermLower)
               );
      });
    }
    
    // Apply type filter (Vegetarian, Non-vegetarian, etc)
    if (filters.type) {
      meals = meals.filter(meal => {
        return meal.type.includes(filters.type);
      });
    }
    
    // Apply the meal type filter (if specific meal type is selected)
    if (filters.mealType) {
      meals = meals.filter(meal => {
        return meal.mealType.includes(filters.mealType);
      });
    }
    
    return meals;
  },

  // Calculate macronutrients for selected meals
  calculateMacros: (selectedMeals, calorieTarget) => {
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.5) / 4);
    const fatsTarget = Math.round((calorieTarget * 0.2) / 9);
    
    let totalProtein = 0, totalCarbs = 0, totalFats = 0;
    
    selectedMeals.forEach(meal => {
      const quantity = meal.quantity || 1;
      totalProtein += (meal.proteinPer100g || 0) * quantity;
      totalCarbs += (meal.carbsPer100g || 0) * quantity;
      totalFats += (meal.fatsPer100g || 0) * quantity;
    });
    
    return {
      protein: { total: Math.round(totalProtein), target: proteinTarget },
      carbs: { total: Math.round(totalCarbs), target: carbsTarget },
      fats: { total: Math.round(totalFats), target: fatsTarget },
      proteinOK: totalProtein >= 0.9 * proteinTarget && totalProtein <= 1.1 * proteinTarget,
      carbsOK: totalCarbs >= 0.85 * carbsTarget && totalCarbs <= 1.1 * carbsTarget,
      fatsOK: totalFats >= 0.8 * fatsTarget && totalFats <= 1.05 * fatsTarget
    };
  }
};

// Initialize meals when the app starts
MealPlanner.loadAllMeals();

// Component for filter context support
function MealPlannerComponent({ selectedMeals, onSelectMeals, caloriesTarget }) {
  const { filters } = useContext(filtercontextObj);
  
  // Store filters in a global variable for access by the static methods
  useEffect(() => {
    window.currentFilters = filters;
  }, [filters]);
  
  // This component doesn't render anything itself - it's just for context access
  return null;
}

export default MealPlanner;