// import React, { createContext, useState, useContext, useEffect } from "react";
// import { authAPI } from "../services/api";
// import {
//   setAuthToken as saveToken,
//   removeAuthToken,
//   getAuthToken,
// } from "../services/apiConfig";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = getAuthToken();
//     const savedUser = localStorage.getItem('user');

//     if (token && savedUser) {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch (error) {
//         console.error('Error parsing saved user:', error);
//         removeAuthToken();
//         localStorage.removeItem('user');
//       }
//     }

//     setLoading(false);
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await authAPI.login(credentials);

//       if (response.success && response.data && response.data.token) {
//         // Save token
//         saveToken(response.data.token);

//         // Save user data
//         const userData = {
//           id: response.data.id,
//           email: credentials.email,
//           name: response.data.name || 'Admin User',
//           role: response.data.role || 'ADMIN',
//           ...response.data
//         };

//         setUser(userData);
//         localStorage.setItem('user', JSON.stringify(userData));

//         return { success: true };
//       } else {
//         return {
//           success: false,
//           error: response.message || 'Login failed'
//         };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return {
//         success: false,
//         error: error.message || 'Login failed. Please check your credentials.'
//       };
//     }
//   };

//   const demoLogin = async () => {
//     // For demo, try to login with demo credentials
//     return await login({
//       email: 'demo@admin.com',
//       password: 'demo123'
//     });
//   };

//   const logout = () => {
//     setUser(null);
//     removeAuthToken();
//     localStorage.removeItem('user');
//   };

//   const updateUser = (userData) => {
//     const updatedUser = { ...user, ...userData };
//     setUser(updatedUser);
//     localStorage.setItem('user', JSON.stringify(updatedUser));
//   };

//   const value = {
//     user,
//     login,
//     demoLogin,
//     logout,
//     updateUser,
//     isAuthenticated: !!user,
//     loading
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	useMemo,
	useCallback,
} from 'react';

import { authAPI } from '../services/api';
import {
	setAuthToken,
	removeAuthToken,
	getAuthToken,
} from '../services/apiConfig';

const AuthContext = createContext(null);

/* ----------------------------------------
   Helpers
---------------------------------------- */
const getStoredUser = () => {
	try {
		const user = localStorage.getItem('user');
		return user ? JSON.parse(user) : null;
	} catch {
		return null;
	}
};

/* ----------------------------------------
   Provider
---------------------------------------- */
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	/* ----------------------------------------
     On App Load
  ---------------------------------------- */
	useEffect(() => {
		const token = getAuthToken();
		const storedUser = getStoredUser();

		if (token && storedUser) {
			setUser(storedUser);
		} else {
			removeAuthToken();
			localStorage.removeItem('user');
		}

		setLoading(false);
	}, []);

	/* ----------------------------------------
     Login
  ---------------------------------------- */
	const login = useCallback(async (credentials) => {
		try {
			const res = await authAPI.login(credentials);

			if (!res?.success || !res?.data?.token) {
				throw new Error(res?.message || 'Invalid login response');
			}

			const userData = {
				id: res.data.id,
				email: res.data.email,
				name: res.data.name,
				role: res.data.role,
			};

			setAuthToken(res.data.token);
			setUser(userData);
			localStorage.setItem('user', JSON.stringify(userData));

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error?.message || 'Login failed',
			};
		}
	}, []);

	/* ----------------------------------------
     Demo Login
  ---------------------------------------- */
	const demoLogin = useCallback(
		() =>
			login({
				email: 'demo@admin.com',
				password: 'demo123',
			}),
		[login]
	);

	/* ----------------------------------------
     Logout
  ---------------------------------------- */
	const logout = () => {
		setUser(null);
		removeAuthToken();
		localStorage.removeItem('user');
	};

	/* ----------------------------------------
     Update User
  ---------------------------------------- */
	const updateUser = (data) => {
		setUser((prev) => {
			const updated = { ...prev, ...data };
			localStorage.setItem('user', JSON.stringify(updated));
			return updated;
		});
	};

	/* ----------------------------------------
     Memoized Context Value
  ---------------------------------------- */
	const value = useMemo(
		() => ({
			user,
			loading,
			isAuthenticated: !!user,
			login,
			demoLogin,
			logout,
			updateUser,
		}),
		[user, loading, login, demoLogin]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ----------------------------------------
   Hook
---------------------------------------- */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used inside AuthProvider');
	}
	return context;
};

export default AuthContext;
