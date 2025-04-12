"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import Image from "next/image";
import { Form } from "./ui/form";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { auth, googleProvider } from "@/firebase/client";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      if (type === "sign-up") {
        try {
          // Register the user if they're signing up
          await signUp({
            uid: user.uid,
            name: user.displayName || "Google User",
            email: user.email || "",
            password: "", // We don't need a password for Google accounts
            photoURL: user.photoURL || undefined,
          });
          
          toast.success("Account created successfully!", {
            description: "Welcome to Interview Me!"
          });
        } catch (error: any) {
          // If user already exists, just sign them in
          console.log("User might already exist, continuing with sign in");
        }
      }
      
      // Sign in the user
      await signIn({
        email: user.email || "",
        idToken,
      });
      
      if (type === "sign-in") {
        toast.success("Signed in successfully!", {
          description: "Welcome back to Interview Me!"
        });
      }
      
      router.push("/");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("An account already exists with the same email address but different sign-in credentials.");
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in canceled. Please try again when you're ready.");
      } else {
        toast.error(`Sign in failed: ${error.message || "Please try again later."}`);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result?.success) {
          toast.error(result?.message || "Account creation failed. Please try again.");
          return;
        }

        toast.success("Account created successfully! You can now sign in.", {
          description: "Welcome to Interview Me! Please sign in with your new credentials."
        });
        router.push("/sign-in");
      } else {
        const { email, password } = values;

        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed. Please check your credentials and try again.");
          return;
        }

        await signIn({
          email, idToken
        });

        toast.success("Signed in successfully!", {
          description: "Welcome back to Interview Me."
        });
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      // Handle Firebase auth errors with friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Please use a stronger password.");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  }

  const isSignin = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px] shadow-xl">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center mb-2 animate-fadeIn">
          <Image src="/logo.svg" alt="logo" height={32} width={38} className="transform hover:scale-110 transition-transform duration-300" />
          <h2 className="text-primary-100">Interview Me</h2>
        </div>
        <h3 className="text-center text-primary-100">Practice Job Interviews with AI</h3>
        <p className="text-center text-light-100/80 -mt-4 text-sm">
          {isSignin 
            ? "Welcome back! Sign in to continue your interview practice journey." 
            : "Create an account to start practicing for your next interview."}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignin && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter your full name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn mt-4" type="submit">
              {isSignin ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>
        
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-light-400/20"></div>
          <p className="px-4 text-sm text-light-400">OR</p>
          <div className="flex-1 h-px bg-light-400/20"></div>
        </div>
        
        <Button 
          type="button" 
          onClick={handleGoogleSignIn}
          className="bg-dark-200 hover:bg-dark-200/80 text-light-100 flex items-center justify-center gap-2 transition-all"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          {isSignin ? "Sign in with Google" : "Sign up with Google"}
        </Button>
        
        <p className="text-center">
          {isSignin ? "Don't have an account yet?" : "Already have an account?"}
          <Link
            href={!isSignin ? "/sign-in" : "/sign-up"}
            className="font-bold text-primary-200 ml-2 hover:underline transition-all"
          >
            {!isSignin ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
