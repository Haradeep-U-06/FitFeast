import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContextObj } from '../../Contexts/UserContext';
import { useForm } from "react-hook-form";
import Filter from './Filter';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import MealPlanner from './MealPlanner';
import StickyMacroTracker from './StickyMacroTracker';
import MealDisplay from './MealDisplay';
import SelectedMealsDrawer from './SelectedMealsDrawer';
import FloatingActionButton from './FloatingActionButton';
import './Plan.css';

function Plan() {
    const { currentUser, setCurrentUser } = useContext(userContextObj);
    const [status, setStatus] = useState(0);
    const [chng, setchng] = useState(0);
    const [fl, setfl] = useState(0);
    const [durationVal, setDuration] = useState('');
    const [activityVal, setActivity] = useState('');
    const [selectedMeals, setSelectedMeals] = useState([]);
    const [planSaved, setPlanSaved] = useState(false);
    const [validationResult, setValidationResult] = useState({ isValid: true, message: "" });
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navigate = useNavigate();

    const handleDuration = (e) => setDuration(e.target.value);
    const handleActivity = (e) => setActivity(e.target.value);

    const { handleSubmit } = useForm();

    const calculatePlan = () => {
        if (!durationVal || !activityVal) return;
        setStatus(1);

        let bmr = 0, cal1 = 0, fat = 0, cal2 = 0, final = 0;
        const u = currentUser;

        if (u.gender === "Male") {
            bmr = (10 * u.weight) + (6.25 * u.height) - (5 * u.age) + 5;
        } else {
            bmr = (10 * u.weight) + (6.25 * u.height) - (5 * u.age) - 161;            
        }

        if (activityVal === "Sedentary") cal1 = Math.round(bmr * 1.2);
        else if (activityVal === "Lightly Active") cal1 = Math.round(bmr * 1.375);
        else if (activityVal === "Moderately Active") cal1 = Math.round(bmr * 1.55);
        else if (activityVal === "Very Active") cal1 = Math.round(bmr * 1.725);

        if (u.desiredweight > u.weight) {
            fat = (u.desiredweight - u.weight) * 7700;
        } else {
            fat = (u.weight - u.desiredweight) * 7700;
        }

        if (durationVal === "1 week") cal2 = Math.round(fat / 7);
        else if (durationVal === "2 weeks") cal2 = Math.round(fat / 14);
        else if (durationVal === "1 month") cal2 = Math.round(fat / 4 / 7);
        else if (durationVal === "2 months") cal2 = Math.round(fat / 8 / 7);
        else if (durationVal === "3 months") cal2 = Math.round(fat / 12 / 7);

        final = u.desiredweight > u.weight ? cal1 + cal2 : cal1 - cal2;

        setchng(cal2);
        setfl(final);

        const validation = isValid(final, cal2);
        setValidationResult(validation);
    };

    // Update handle meal selection to fix the duplicate selection issue
    const handleMealSelection = (meal) => {
        if (meal.quantity === 0) {
            // Remove meal by uniqueKey (meal ID + meal type combination)
            setSelectedMeals(selectedMeals.filter((m) => 
                !(m._id === meal._id && m.mealTypeKey === meal.mealTypeKey)
            ));
        } else {
            // Find meal by ID and meal type
            const existingMealIndex = selectedMeals.findIndex((m) => 
                m._id === meal._id && m.mealTypeKey === meal.mealTypeKey
            );
            
            if (existingMealIndex !== -1) {
                // Update existing meal
                const updatedMeals = [...selectedMeals];
                updatedMeals[existingMealIndex] = meal;
                setSelectedMeals(updatedMeals);
            } else {
                // Add new meal
                setSelectedMeals([...selectedMeals, meal]);
            }
        }
    };

    const groupMealsByType = () => {
        const groupedVeg = {
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: [],
        };
        const groupedNonVeg = {
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: [],
        };

        selectedMeals.forEach((meal) => {
            const quantity = meal.quantity || 1;
            const mealName = `${meal.name} ${quantity > 1 ? `x${quantity}` : ''}`;
            
            meal.type.forEach((type) => {
                if (type === "Non-vegetarian") {
                    meal.mealType.forEach((type) => {
                        if (type.toLowerCase().includes("breakfast")) groupedNonVeg.breakfast.push(mealName);
                        if (type.toLowerCase().includes("lunch")) groupedNonVeg.lunch.push(mealName);
                        if (type.toLowerCase().includes("snack")) groupedNonVeg.snacks.push(mealName);
                        if (type.toLowerCase().includes("dinner")) groupedNonVeg.dinner.push(mealName);
                    });
                } else if (type === "Vegetarian" || type === "Vegan") {
                    meal.mealType.forEach((type) => {
                        if (type.toLowerCase().includes("breakfast")) groupedVeg.breakfast.push(mealName);
                        if (type.toLowerCase().includes("lunch")) groupedVeg.lunch.push(mealName);
                        if (type.toLowerCase().includes("snack")) groupedVeg.snacks.push(mealName);
                        if (type.toLowerCase().includes("dinner")) groupedVeg.dinner.push(mealName);
                    });
                }
            });
        });

        return { groupedVeg, groupedNonVeg };
    };

    const getMacroMatchStatus = () => {
        const proteinTarget = Math.round((fl * 0.3) / 4);
        const carbsTarget = Math.round((fl * 0.5) / 4);
        const fatsTarget = Math.round((fl * 0.2) / 9);
      
        let totalProtein = 0, totalCarbs = 0, totalFats = 0;
      
        selectedMeals.forEach(meal => {
            const quantity = meal.quantity || 1;
            totalProtein += (meal.proteinPer100g || 0) * quantity;
            totalCarbs += (meal.carbsPer100g || 0) * quantity;
            totalFats += (meal.fatsPer100g || 0) * quantity;
        });
      
        return {
            proteinOK: totalProtein >= 0.9 * proteinTarget && totalProtein <= 1.1 * proteinTarget,
            carbsOK: totalCarbs >= 0.85 * carbsTarget && totalCarbs <= 1.1 * carbsTarget,
            fatsOK: totalFats >= 0.8 * fatsTarget && totalFats <= 1.05 * fatsTarget,
            protein: { total: Math.round(totalProtein), target: proteinTarget },
            carbs: { total: Math.round(totalCarbs), target: carbsTarget },
            fats: { total: Math.round(totalFats), target: fatsTarget }
        };
    };
    
    const matchStatus = getMacroMatchStatus();
    const allOK = matchStatus.proteinOK && matchStatus.carbsOK && matchStatus.fatsOK;

    const savePlan = async () => {
        const { groupedVeg, groupedNonVeg } = groupMealsByType();
        const planData = {
            userId: currentUser._id,
            calories: fl,
            veg: groupedVeg,
            nonveg: groupedNonVeg,
            duration: durationVal,
            extra: chng,
            activity: activityVal
        };
        
        try {
            const res = await axios.post(`${getBaseUrl()}/plan-api/plans`, planData);
            if (res.status === 201) setPlanSaved(true);
        } catch(err) {
            console.log("Error saving plan: ", err);
        }
    };
    
    const navigateToSavedPlans = () => {
        navigate('/saved-plans');
    };

    if (currentUser.age === 0 || currentUser.height === 0 || currentUser.weight === 0 || currentUser.gender === "" || currentUser.desiredweight === 0) {
        return (
            <div className="container mx-auto my-5 text-center">
                <div className="card shadow-sm border-0 p-5">
                    <h2 className="mb-4">Complete Your Profile</h2>
                    <p className="mb-4">Please add your age, height, gender, and weight to create a personalized fitness plan.</p>
                    <button className="btn btn-primary px-4 py-2" onClick={() => navigate(`/user-profile/${currentUser.email}`)}>
                        Edit Profile
                    </button>
                </div>
            </div>
        );
    }

    const isValid = (fl, chng) => {
        if ((fl - chng) > 3000) return { isValid: false, message: "It is not recommended for you to gain weight." };
        else {
            if (currentUser.desiredweight > currentUser.weight) {
                if (fl > 3500) return { isValid: false, message: "It is dangerous to gain too much weight in short periods of time. We suggest you not to gain so much weight in a short period of time." };
            }
        }
        if ((fl + chng) < 1900) return { isValid: false, message: "It is not recommended for you to lose weight." };
        else {
            if (chng > 1000 && fl < 1500) return { isValid: false, message: "It is dangerous to lose too much weight in short periods of time. We suggest you not to lose so much weight in a short period of time." };
        }
        return { isValid: true, message: "" };
    };

    return (
        <div className="container mx-auto my-5">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4">
                    <h2 className="text-center mb-0">Create Your Fitness Plan</h2>
                </div>
                <div className="card-body px-4 py-4">
                    <form onSubmit={handleSubmit(calculatePlan)}>
                        <div className="row g-3 align-items-center">
                            <div className="col-md-5">
                                <label htmlFor="activity-select" className="form-label fw-medium">Activity Level</label>
                                <select 
                                    id="activity-select"
                                    className="form-select shadow-sm" 
                                    onChange={handleActivity} 
                                    required
                                >
                                    <option value="">Select Activity</option>
                                    <option value="Sedentary">Sedentary</option>
                                    <option value="Lightly Active">Lightly Active</option>
                                    <option value="Moderately Active">Moderately Active</option>
                                    <option value="Very Active">Very Active</option>
                                </select>
                            </div>
                            
                            <div className="col-md-5">
                                <label htmlFor="duration-select" className="form-label fw-medium">Plan Duration</label>
                                <select 
                                    id="duration-select"
                                    className="form-select shadow-sm" 
                                    onChange={handleDuration} 
                                    required
                                >
                                    <option value="">Select Duration</option>
                                    <option value="1 week">1 week</option>
                                    <option value="2 weeks">2 weeks</option>
                                    <option value="1 month">1 month</option>
                                    <option value="2 months">2 months</option>
                                    <option value="3 months">3 months</option>
                                </select>
                            </div>
                            
                            <div className="col-md-2 d-flex align-items-end">
                                <button type="submit" className="btn btn-primary w-100 fw-medium">
                                    Calculate Plan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {status === 1 && (
                <>
                    {!validationResult.isValid && (
                        <div className="alert alert-warning shadow-sm border-0 mt-4">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {validationResult.message}
                        </div>
                    )}

                    {validationResult.isValid && (
                        <div className="plan-results">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom-0 pt-3">
                                    <h3 className="h5 text-center mb-0">Your Calorie Plan</h3>
                                </div>
                                <div className="card-body px-4 pb-4 pt-2">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="border-0">Activity</th>
                                                    <th className="border-0">Duration</th>
                                                    <th className="border-0">Calories {currentUser.desiredweight > currentUser.weight ? "Surplus" : "Deficit"}</th>
                                                    <th className="border-0">Calories Per Day</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td><span className="fw-medium text-primary">{activityVal}</span></td>
                                                    <td><span className="fw-medium text-primary">{durationVal}</span></td>
                                                    <td><span className="fw-medium text-primary">{chng}</span></td>
                                                    <td><span className="fw-bold text-primary">{fl}</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky macro tracker */}
                            <StickyMacroTracker fl={fl} selectedMeals={selectedMeals} matchStatus={matchStatus} />
                            
                            {/* Only show Save Plan button when all macros are OK */}
                            {selectedMeals.length > 0 && (
                                <div className="card shadow-sm border-0 mb-4 save-plan-card">
                                    <div className="card-body p-4 text-center">
                                        {allOK && !planSaved && (
                                            <button
                                                className="btn btn-primary px-4 py-2"
                                                onClick={savePlan}
                                            >
                                                Save My Plan
                                            </button>
                                        )}
                                        
                                        {planSaved && (
                                            <div className="d-flex flex-column align-items-center">
                                                <p className="text-success mb-3">
                                                    <i className="bi bi-check-circle-fill me-2"></i>
                                                    Plan saved successfully!
                                                </p>
                                                <button
                                                    className="btn btn-success px-4 py-2"
                                                    onClick={navigateToSavedPlans}
                                                >
                                                    <i className="bi bi-list-check me-2"></i>
                                                    Show Saved Plans
                                                </button>
                                            </div>
                                        )}
                                        
                                        {!allOK && !planSaved && (
                                            <div className="alert alert-warning mb-0">
                                                <i className="bi bi-info-circle-fill me-2"></i>
                                                Your macro values are not within healthy range. Please adjust your meals to save your plan.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="card shadow-sm border-0 mb-5">
                                <div className="card-header bg-white border-bottom-0 pt-3">
                                    <h3 className="h5 text-center mb-0">Meal Selection</h3>
                                </div>
                                <div className="card-body px-4 pb-4 pt-2">
                                    <Filter />
                                    
                                    {/* Display meals with quantity controls */}
                                    {status === 1 && (
                                        <div className="mt-4">
                                            {["Breakfast", "Lunch", "Snack", "Dinner"].map((mealType) => (
                                                <MealDisplay
                                                    key={mealType}
                                                    mealType={mealType}
                                                    mealss={MealPlanner.getFilteredMeals(mealType, fl)}
                                                    onSelectMeal={handleMealSelection}
                                                    selectedMeals={selectedMeals}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Floating action button */}
                            <FloatingActionButton 
                                onClick={() => setDrawerOpen(true)}
                                selectedMeals={selectedMeals}
                            />
                            
                            {/* Selected meals drawer */}
                            <SelectedMealsDrawer
                                isOpen={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                selectedMeals={selectedMeals}
                                onUpdateMeal={handleMealSelection}
                                matchStatus={matchStatus}
                                allOK={allOK}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Plan;