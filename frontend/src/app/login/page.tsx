"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, LogIn } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer/footer"
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-orange-600">Welcome Back</h1>
            <p className="text-gray-500">Login to your account</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Username or Email
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username or email"
                  required
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
                />
              </div>
            </div>

            <Button type="submit" variant="cyan" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login
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
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google Logo"
                className="h-4 w-4 mr-2"
              />
              Login with Google
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

      {/* Footer */}
      <Footer />
    </div>
  )
}