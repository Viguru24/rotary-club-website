import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('glass'); // Default to current premium look

    // Load theme from local storage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('admin_theme');
        if (savedTheme) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    const changeTheme = (theme) => {
        setCurrentTheme(theme);
        localStorage.setItem('admin_theme', theme);
    };

    return (
        <AdminThemeContext.Provider value={{ currentTheme, changeTheme }}>
            {children}
        </AdminThemeContext.Provider>
    );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
