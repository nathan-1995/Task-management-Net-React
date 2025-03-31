// Description: Login component for user authentication using React Hook Form and Zod for validation.
// It handles form submission, error messages, and redirects based on user role.

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser } from "../Services/authService";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants";
import LoginTemplate from "../UI/Login/LoginTemplate";
import { UserRole, ApiError, LoginFormInputs } from "../types";

// Login form state type using discriminated union
type LoginState = 
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success', role: UserRole }
  | { status: 'error', message: string };

// Validation Schema with generic error messages
const loginSchema = z.object({
  email: z.string().email("Invalid credentials"),
  password: z.string().nonempty("Password is required"),
});


const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const [loginState, setLoginState] = useState<LoginState>({ status: 'idle' });

  // If already authenticated, redirect immediately
  if (isAuthenticated && role) {
    return <Navigate to={role === UserRole.Admin ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />; // Redirect to the appropriate route based on role
  }

  // Handle form submission
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data): Promise<void> => {
    setLoginState({ status: 'submitting' });
    
    try {
      const response = await loginUser(data);
      
      if (!response.user?.role) {
        throw new Error("Invalid response from server");
      }

      // Call login function from AuthContext
      login(response.user.role);
      setLoginState({ status: 'success', role: response.user.role });
      
      // The Navigate component in the render condition will handle the redirect
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Login error:", apiError);
      setLoginState({ 
        status: 'error', 
        message: "Invalid credentials"
      });
    }
  };

  // Handle form submission with validation check
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    if (!isValid) {
      e.preventDefault();
      setLoginState({ status: 'error', message: "Invalid credentials" });
      return;
    }
    handleSubmit(onSubmit)(e);
  };
  
  // If login was successful, redirect immediately
  if (loginState.status === 'success') {
    return <Navigate to={loginState.role === UserRole.Admin ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  }
  
  return ( 
    <LoginTemplate
      onSubmit={handleFormSubmit}
      register={register}
      errors={errors}
      message={loginState.status === 'error' ? loginState.message : null}
      isSubmitting={loginState.status === 'submitting'}
    />
  );
};

export default Login;