"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, LogIn, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Footer from "@/components/footer/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  interface FormData {
    email: string
    password: string
  }

  interface ChangeEvent {
    target: {
      id: string
      value: string
    }
  }

  const handleChange = (e: ChangeEvent) => {
    const { id, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [id]: value,
    }))
  }

  interface LoginResponse {
    tokens: {
      access: string
      refresh: string
    }
    user: {
      id: string
      username: string
      email: string
      name: string
      user_id: string
    }
    error?: string
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Make sure the user object has a name field for the navigation
      const userToStore = {
        ...data.user,
        name: data.user.name || data.user.username,  // Fallback to username if name isn't provided
        user_id: data.user.user_id || data.user.id.toString() // Ensure user_id exists
      }

      // Store tokens in localStorage
      localStorage.setItem("accessToken", data.tokens.access)
      localStorage.setItem("refreshToken", data.tokens.refresh)
      localStorage.setItem("user", JSON.stringify(userToStore))

      // Dispatch a custom event that the Navigation component can listen for
      if (typeof window !== 'undefined') {
        // Create a custom event for login
        const loginEvent = new Event('userLogin')
        window.dispatchEvent(loginEvent)
      }

      // Redirect to map page
      router.push("/map")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-orange-600">Welcome Back</h1>
            <p className="text-gray-500">Log in to your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-blue-500">
                  <User size={18} />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Skip the Process</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Email: <span className="font-mono bg-blue-100 px-1 rounded">admin@gmail.com</span></p>
                    <p>Password: <span className="font-mono bg-blue-100 px-1 rounded">Admin@123</span></p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              variant="cyan"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Login with Google (Placeholder) */}
            <Button variant="outline" className="w-full" disabled>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/87/Google_Chrome_icon_%282011%29.png"
                alt="Google Logo"
                className="h-6 w-6 mr-2"
              />
              Log in with Google
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-cyan-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}