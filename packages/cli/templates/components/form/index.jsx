"use client"
import { Button } from "./button"
import { Input } from "./input"

export function Form({ children, onSubmit, ...props }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" {...props}>
      {children}
    </form>
  )
}

export function FormExample() {
  return (
    <Form onSubmit={(e) => { e.preventDefault(); console.log("Submitted") }}>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button type="submit">Submit</Button>
    </Form>
  )
}

