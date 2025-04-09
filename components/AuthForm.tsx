"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import Image from "next/image";
import { Form } from "./ui/form";
import Link from "next/link";

const formSchema = z.object({
  username: z.string().max(40),
});

const AuthForm = ( {type} : {type: FormType} ) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const isSignin = type === 'sign-in' ;

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Interview Me</h2>
        </div>
        <h3>Practice Job Interviews with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            
            {!isSignin && <p>Name</p>}
            <p>Email</p>
            <p>Password</p>

            <Button className="btn" type="submit">{isSignin? 'Sign In': 'Create an Account'} </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignin?'No account yet?':'Have an account already'}
          <Link href={!isSignin? '/sign-in': '/sign-up'} className="font-bold text-user-primary ml-1">
            {!isSignin ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
