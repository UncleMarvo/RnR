"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"

import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    if (!termsAccepted) {
      toast.error("You must accept the terms and conditions")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Registration failed")
        return
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error("Account created but could not sign in. Please log in manually.")
        router.push("/login")
        return
      }

      toast.success("Welcome to R+R!")
      router.push("/")
      router.refresh()
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
        <h2 className="text-xl font-semibold text-zinc-100">Create an account</h2>
        <p className="text-sm text-zinc-400">
          Sign up to start shopping with R+R
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-zinc-300">
                First name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-zinc-300">
                Last name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>At least 8 characters</li>
              <li>At least 1 uppercase letter</li>
              <li>At least 1 number</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-300">
              Phone{" "}
              <span className="text-zinc-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+353 1234567"
              autoComplete="tel"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("phone")}
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setTermsAccepted(checked === true)
              }
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-zinc-400 cursor-pointer leading-snug">
              I agree to the terms and conditions and privacy policy
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full h-11 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
          <div className="mt-4 pt-4 border-t border-zinc-800 w-full text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-zinc-200 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
