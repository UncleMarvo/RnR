"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      setSubmitted(true)
      toast.success("Check your email for a reset link")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <CardHeader className="space-y-2 text-center">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            R<span className="text-zinc-500">+</span>R
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Premium Sports Supplements</p>
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Reset password</h2>
        <p className="text-sm text-zinc-400">
          {submitted
            ? "If an account exists with that email, we've sent a reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </CardHeader>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Sending…" : "Send reset link"}
            </Button>
            <div className="mt-4 pt-4 border-t border-zinc-800 w-full text-center">
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
