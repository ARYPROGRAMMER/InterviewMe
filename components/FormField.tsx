import React from 'react'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'

const FormField = () => {
  return (
    <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="shadcn" {...field} />
        </FormControl>
        <FormDescription>
            This is the General Message
        </FormDescription>
        <FormMessage/>
      </FormItem>
    )}
  />
  )
}

export default FormField
