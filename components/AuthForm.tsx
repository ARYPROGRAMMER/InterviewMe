"use client";

import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  email: z.string().email(),  
  password: z.string().min(8).max(20),
  confirmPassword: z.string().min(8).max(20),
})

const AuthForm = () => {

  



  return (
    <div>
      AuthForm
    </div>
  )
}

export default AuthForm
