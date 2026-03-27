"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"

import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin/dashboard"
    case "CLUB_ADMIN":
      return "/club-admin/dashboard"
    default:
      return "/"
  }
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }

      // Fetch session to get user role for redirect
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      const role = session?.user?.role || "PUBLIC"

      toast.success("Signed in successfully")
      router.push(getDashboardUrl(role))
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      {message === "password-changed" && (
        <div className="mb-4 rounded-md border border-green-800 bg-green-900/20 px-4 py-3 text-center text-sm text-green-400">
          Password changed successfully. Please log in with your new password.
        </div>
      )}
      <CardHeader className="space-y-2 text-center">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            R<span className="text-zinc-500">+</span>R
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Premium Sports Supplements</p>
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">Sign in</h2>
        <p className="text-sm text-zinc-400">
          Enter your credentials to access your account
        </p>
      </CardHeader>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-zinc-200 hover:text-white transition-colors font-medium"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
