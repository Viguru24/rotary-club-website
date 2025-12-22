import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"; // Correct import for named export

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('User Logged In:', decoded);

            // Allow all Google logins as Admin, but specifically flag Louis
            const role = 'admin';

            const adminUser = { ...decoded, role };
            setUser(adminUser);
            localStorage.setItem('user', JSON.stringify(adminUser));
        } catch (error) {
            console.error("Login Failed:", error);
        }
    };

    const memberLogin = (password) => {
        if (password === import.meta.env.VITE_MEMBER_PASSWORD) {
            const memberUser = {
                name: 'Administrator', // Changed name to reflect role
                role: 'admin', // Grant admin permissions so they see Settings
                picture: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
            };
            setUser(memberUser);
            localStorage.setItem('user', JSON.stringify(memberUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('user');
        console.log('User Logged Out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, memberLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
