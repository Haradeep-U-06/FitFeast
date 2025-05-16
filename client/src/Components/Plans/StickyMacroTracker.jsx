import React from 'react';
import './StickyMacroTracker.css';

function StickyMacroTracker({ fl, selectedMeals, matchStatus }) {
  const { protein, carbs, fats } = matchStatus;
  
  return (
    <div className="sticky-macro-tracker">
      <div className="macro-tracker-header">
        <h4>Macronutrient Progress</h4>
        <span className="total-calories">{fl} calories/day</span>
      </div>
      
      <div className="macro-nutrients">
        <div className="macro-nutrient">
          <div className="macro-label">
            <span>Protein</span>
            <span className="macro-value">
              {protein.total}g / {protein.target}g
              {matchStatus.proteinOK ? 
                <i className="bi bi-check-circle-fill text-success ms-2"></i> : 
                <i className="bi bi-exclamation-circle-fill text-warning ms-2"></i>}
            </span>
          </div>
          <div className="macro-progress">
            <div 
              className={`macro-progress-bar ${matchStatus.proteinOK ? 'progress-good' : 'progress-warning'}`}
              style={{ width: `${Math.min(100, (protein.total / protein.target) * 100)}%` }}
            ></div>
            <div className="target-range">
              <div className="min-target">90%</div>
              <div className="max-target">110%</div>
            </div>
          </div>
        </div>
        <br/>
        
        <div className="macro-nutrient">
          <div className="macro-label">
            <span>Carbs</span>
            <span className="macro-value">
              {carbs.total}g / {carbs.target}g
              {matchStatus.carbsOK ? 
                <i className="bi bi-check-circle-fill text-success ms-2"></i> : 
                <i className="bi bi-exclamation-circle-fill text-warning ms-2"></i>}
            </span>
          </div>
          <div className="macro-progress">
            <div 
              className={`macro-progress-bar ${matchStatus.carbsOK ? 'progress-good' : 'progress-warning'}`} 
              style={{ width: `${Math.min(100, (carbs.total / carbs.target) * 100)}%` }}
              ></div>
            <div className="target-range">
              <div className="min-target">85%</div>
              <div className="max-target">110%</div>
            </div>
          </div>
        </div>
        <br/>
        
        <div className="macro-nutrient">
          <div className="macro-label">
            <span>Fats</span>
            <span className="macro-value">
              {fats.total}g / {fats.target}g
              {matchStatus.fatsOK ? 
                <i className="bi bi-check-circle-fill text-success ms-2"></i> : 
                <i className="bi bi-exclamation-circle-fill text-warning ms-2"></i>}
            </span>
          </div>
          <div className="macro-progress">
            <div 
              className={`macro-progress-bar ${matchStatus.fatsOK ? 'progress-good' : 'progress-warning'}`}
              style={{ width: `${Math.min(100, (fats.total / fats.target) * 100)}%` }}
            ></div>
            <div className="target-range">
              <div className="min-target">80%</div>
              <div className="max-target">105%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="tracker-hint">
        <i className="bi bi-lightning-fill"></i>
        <small>Target: Stay within range markers for a balanced plan</small>
      </div>
    </div>
  );
}

export default StickyMacroTracker;