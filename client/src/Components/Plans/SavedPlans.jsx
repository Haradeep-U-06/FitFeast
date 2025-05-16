import React, {useEffect, useState, useContext} from 'react';
import { userContextObj } from '../../Contexts/UserContext';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import './SavedPlans.css'; // Will create this CSS file

function SavedPlan() {
    const { currentUser } = useContext(userContextObj);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/plan-api/plan`)
                setPlans(res.data.payload.filter((plan) => plan.userId === currentUser._id));
            } catch(err) {
                console.log("Error fetching plans:", err);
            }
        }
        fetchPlan();
    }, [currentUser._id]);

    const openPlanDetails = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
        document.body.classList.add('modal-open');
    };

    const closePlanDetails = () => {
        setShowModal(false);
        document.body.classList.remove('modal-open');
        setTimeout(() => setSelectedPlan(null), 300); // Delay to allow animation
    };

    return (
        <div className="fitness-plan-container container mx-auto py-5">
            <h2 className="text-center mb-4 display-5 fw-bold">Your Saved Plans</h2>
            
            {plans.length === 0 ? (
                <div className="text-center py-5">
                    <p className="lead text-muted">You don't have any saved plans yet.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {plans.map((plan, index) => (
                        <div key={index} className="col-md-6 col-lg-4">
                            <div 
                                className="plan-card card h-100 shadow-sm" 
                                onClick={() => openPlanDetails(plan)}
                            >
                                <div className="card-body d-flex flex-column">
                                    <div className="plan-card-activity">
                                        <span className="badge bg-primary">{plan.activity}</span>
                                    </div>
                                    <h3 className="card-title h5 mt-2">Plan #{index + 1}</h3>
                                    <div className="plan-card-info mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Calories</span>
                                            <span className="fw-bold">{plan.calories} kcal</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Duration</span>
                                            <span className="fw-bold">{plan.duration}</span>
                                        </div>
                                    </div>
                                    <div className="plan-card-footer mt-auto pt-3">
                                        <div className="text-center">
                                            <small className="text-muted">Click to see details</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for plan details */}
            {showModal && selectedPlan && (
                <div className={`plan-modal-overlay ${showModal ? 'show' : ''}`} onClick={closePlanDetails}>
                    <div className="plan-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="plan-modal-close" onClick={closePlanDetails}>×</button>
                        
                        <div className="plan-modal-header">
                            <h3 className="h4 mb-0">{selectedPlan.activity} Plan</h3>
                            <div className="plan-modal-details mt-3">
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="detail-item">
                                            <div className="detail-label">Calories</div>
                                            <div className="detail-value">{selectedPlan.calories}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="detail-item">
                                            <div className="detail-label">Duration</div>
                                            <div className="detail-value">{selectedPlan.duration}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="detail-item">
                                            <div className="detail-label">{currentUser.desiredweight > currentUser.weight ? "Surplus" : "Deficit"}</div>
                                            <div className="detail-value">{selectedPlan.extra}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="plan-modal-body">
                            <div className="meal-schedule">
                                <div className="row">
                                    {["Breakfast", "Lunch", "Snacks", "Dinner"].map((mealType) => (
                                        <div key={mealType} className="col-md-6 mb-4">
                                            <div className="meal-type-card">
                                                <h4 className="meal-type-title">{mealType}</h4>
                                                
                                                <div className="meal-category">
                                                    <h5 className="meal-category-title">Vegetarian</h5>
                                                    <div className="meal-list">
                                                        {selectedPlan.veg[mealType.toLowerCase()].length > 0 ? (
                                                            selectedPlan.veg[mealType.toLowerCase()].map((meal, idx) => (
                                                                <div key={idx} className="meal-item">
                                                                    <span className="meal-name">{meal}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-meals">No vegetarian meals</div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="meal-category">
                                                    <h5 className="meal-category-title">Non-Vegetarian</h5>
                                                    <div className="meal-list">
                                                        {selectedPlan.nonveg[mealType.toLowerCase()].length > 0 ? (
                                                            selectedPlan.nonveg[mealType.toLowerCase()].map((meal, idx) => (
                                                                <div key={idx} className="meal-item">
                                                                    <span className="meal-name">{meal}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-meals">No non-vegetarian meals</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedPlan;