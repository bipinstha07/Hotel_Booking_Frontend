"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

function AdminLoginForm() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for unauthorized redirect
  useEffect(() => {
    const unauthorized = searchParams.get('unauthorized')
    if (unauthorized === 'true') {
      setError("Access denied. Please use your admin credentials to login.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password
        })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("adminToken", data.token)
        router.push("/admin/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Invalid credentials")
      }
    } catch (error) {
    
      setError("Network error. Please try again.")
    }

    setLoading(false)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      
      // Set the copied field to show check icon
      setCopiedField(type.toLowerCase())
      
      // Reset the copied field after 2 seconds
      setTimeout(() => {
        setCopiedField(null)
      }, 2000)
      
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
        variant: "default",
        duration: 2000,
        className: "bg-green-500 border-green-200 text-white",
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="LuxuryStay Logo"
              width={180}
              height={180}
              className="rounded-lg "
            />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your admin account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="admin@gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
                Back to Home
              </Link>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">To test the Admin Panel, use the following credentials:</p>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Email:</span>
                <div className="flex items-center justify-between bg-white p-2 rounded border flex-1">
                  <span className="text-xs text-gray-600">admin@gmail.com</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("admin@gmail.com", "Email")}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Password:</span>
                <div className="flex items-center justify-between bg-white p-2 rounded border flex-1">
                  <span className="text-xs text-gray-600">admin123</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("admin123", "Password")}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    {copiedField === "password" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
