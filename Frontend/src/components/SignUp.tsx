// Description: SignUp component for user registration with validation and error handling.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpUser } from "../Services/authService";
import { ROUTES } from "../constants"; // Import routes from constants

// Validation Schema using Zod
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  country: z.string().min(2, "Country is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

// SignUp Component
const SignUp = () => {
  
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const [message, setMessage] = useState<string | null>(null);

  // Function to handle form submission
  const onSubmit = async (data: any) => {
    try {
      const userData = { ...data, plan: "Free" }; // Ensure plan is always "Free" upon sign-up
      await signUpUser(userData);
      setMessage("Sign-up successful!");
      setTimeout(() => navigate(ROUTES.LOGIN), 2000); // Redirect to login
    } catch (error: any) {
      setMessage(error?.message || "An error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
      {message && <p className="text-red-500">{message}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("name")} placeholder="Name" className="input" />
        <p className="text-red-500">{errors.name?.message?.toString() || ""}</p>

        <input {...register("email")} placeholder="Email" className="input" />
        <p className="text-red-500">{errors.email?.message?.toString() || ""}</p>

        <input {...register("password")} type="password" placeholder="Password" className="input" />
        <p className="text-red-500">{errors.password?.message?.toString() || ""}</p>

        <input {...register("confirmPassword")} type="password" placeholder="Confirm Password" className="input" />
        <p className="text-red-500">{errors.confirmPassword?.message?.toString() || ""}</p>

        <input {...register("phoneNumber")} placeholder="Phone Number" className="input" />
        <p className="text-red-500">{errors.phoneNumber?.message?.toString() || ""}</p>

        <input {...register("address")} placeholder="Address" className="input" />
        <p className="text-red-500">{errors.address?.message?.toString() || ""}</p>

        <input {...register("country")} placeholder="Country" className="input" />
        <p className="text-red-500">{errors.country?.message?.toString() || ""}</p>

        <button type="submit" className="btn-primary">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
