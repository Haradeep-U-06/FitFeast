import React, { createContext, useState, useEffect } from 'react'

export const userContextObj = createContext();

function UserContext({children}) {
    let [currentUser, setCurrentUser] = useState(() => {
        // Try to get user data from localStorage
        try {
            const storedUser = localStorage.getItem('fitFeastUser');
            return storedUser ? JSON.parse(storedUser) : {
                firstName:"",
                lastName:"",
                email:"",
                profileImageUrl:"",
                height:0,
                weight:0,
                age:0,
                gender:"",
                desiredweight:0,
                userProducts:[],
                cost:0
            };
        } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return {
                firstName:"",
                lastName:"",
                email:"",
                profileImageUrl:"",
                height:0,
                weight:0,
                age:0,
                gender:"",
                desiredweight:0,
                userProducts:[],
                cost:0
            };
        }
    });

    // Update localStorage whenever currentUser changes
    useEffect(() => {
        try {
            if (currentUser) {
                // Make sure userProducts is always an array
                const safeUser = {
                    ...currentUser,
                    userProducts: Array.isArray(currentUser.userProducts) ? currentUser.userProducts : []
                };
                
                localStorage.setItem('fitFeastUser', JSON.stringify(safeUser));
            } else {
                localStorage.removeItem('fitFeastUser');
            }
        } catch (error) {
            console.error("Error saving user to localStorage:", error);
        }
    }, [currentUser]);

    // Create a wrapper for setCurrentUser that validates data before updating
    const updateCurrentUser = (userData) => {
        if (!userData) {
            console.error("Attempted to set null or undefined user");
            return;
        }
        
        // Ensure userProducts is always an array
        const safeUserData = {
            ...userData,
            userProducts: Array.isArray(userData.userProducts) ? userData.userProducts : []
        };
        
        setCurrentUser(safeUserData);
    };

    return (
        <userContextObj.Provider value={{currentUser, setCurrentUser: updateCurrentUser}}>
            {children}
        </userContextObj.Provider>
    );
}

export default UserContext