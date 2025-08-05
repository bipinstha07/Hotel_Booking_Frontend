"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function CustomerAuth() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    address: "",
    dateOfBirth: "",
    profileImage: null as File | null,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!loginData.email || !loginData.password) {
      setError("Please fill all fields")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Login successful!')
        console.log('Bearer Token:', data.token)
        console.log('Username:', data.username)
        localStorage.setItem("customerToken", data.token)
        
        // Fetch customer details using the token
        try {
          console.log('Fetching user details for:', data.username)
          console.log('Using token:', data.token)
          console.log('Full Authorization header:', `Bearer ${data.token}`)
          
          // Test if the endpoint is accessible
          console.log('Testing endpoint accessibility...')
          
          // Add a small delay to ensure token is valid
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const userResponse = await fetch(`http://localhost:8080/user/${data.username}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          })
          
          console.log('User response status:', userResponse.status)
          console.log('User response headers:', userResponse.headers)
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            
            // Fetch user bookings
            try {
              console.log('Fetching bookings for user:', data.username)
              const bookingsResponse = await fetch(`http://localhost:8080/user/${data.username}/booking`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${data.token}`,
                  'Content-Type': 'application/json',
                },
              })
              
              console.log('Bookings response status:', bookingsResponse.status)
              
              if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json()
                console.log('User bookings:', bookingsData)
                
                const customerDataToStore = {
                  username: data.username,
                  token: data.token,
                  userDetails: userData,
                  bookings: bookingsData
                }
                console.log('Login - storing customer data:', customerDataToStore)
                localStorage.setItem("customerData", JSON.stringify(customerDataToStore))
              } else {
                console.log('Failed to fetch bookings, using empty array')
                localStorage.setItem("customerData", JSON.stringify({
                  username: data.username,
                  token: data.token,
                  userDetails: userData,
                  bookings: []
                }))
              }
            } catch (bookingError) {
              console.error('Error fetching bookings:', bookingError)
              localStorage.setItem("customerData", JSON.stringify({
                username: data.username,
                token: data.token,
                userDetails: userData,
                bookings: []
              }))
            }
            
            // Show success toast with user details
            toast({
              title: "Login Successful!",
              description: `Welcome back, ${userData.name || data.username}!`,
              variant: "default",
              duration: 3000,
              className: "bg-green-500 border-green-200 text-white",
            })
          } else {
            // Log error details
            const errorText = await userResponse.text()
            console.error('User details fetch failed:', userResponse.status, errorText)
            
            // Fallback if user details fetch fails
            localStorage.setItem("customerData", JSON.stringify({
              username: data.username,
              token: data.token,
            }))
            
            toast({
              title: "Login Successful!",
              description: `Welcome back, ${data.username}!`,
              variant: "default",
              duration: 3000,
              className: "bg-green-500 border-green-200 text-white",
            })
          }
        } catch (error) {
          console.error('Error fetching user details:', error)
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            type: error instanceof Error ? error.constructor.name : 'Unknown type'
          })
          
          // Fallback if user details fetch fails
          localStorage.setItem("customerData", JSON.stringify({
            username: data.username,
            token: data.token,
          }))
          
          toast({
            title: "Login Successful!",
            description: `Welcome back, ${data.username}!`,
            variant: "default",
            duration: 3000,
            className: "bg-green-500 border-green-200 text-white",
          })
        }
        
        router.push("/")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!signupData.name || !signupData.email || !signupData.password) {
      setError("Please fill all required fields")
      setLoading(false)
      return
    }

    if (signupData.password.length < 5) {
      setError("Password must be at least 5 characters long")
      setLoading(false)
      return
    }

    if (signupData.number && !/^\d{10}$/.test(signupData.number)) {
      setError("Phone number must be exactly 10 digits")
      setLoading(false)
      return
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/
    if (!emailRegex.test(signupData.email)) {
      setError("Invalid email format")
      setLoading(false)
      return
    }

    try {
      // Prepare user data for API
      const userDto = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        number: signupData.number || null,
        address: signupData.address || null,
        dateOfBirth: signupData.dateOfBirth || null,
      }

      // Create FormData for multipart request
      const formData = new FormData()
      formData.append("userDto", JSON.stringify(userDto))
      
      if (signupData.profileImage) {
        formData.append("image", signupData.profileImage)
      }

      // Make API call
      const response = await fetch("/api/users/create", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const userData = await response.json()
      
      // Store user data in localStorage
      localStorage.setItem("customerToken", userData.token || "user-token")
      localStorage.setItem(
        "customerData",
        JSON.stringify({
          name: userData.name,
          email: userData.email,
          id: userData.id,
        }),
      )
      
      // Show success toast
      toast({
        title: "Account Created Successfully!",
        description: `Welcome, ${userData.name}! Your account has been created. Please log in.`,
        variant: "default",
        duration: 4000,
        className: "bg-green-500 border-green-200 text-white",
      })
      
      // Switch to login tab after successful registration
      setActiveTab("login")
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignupData({ ...signupData, profileImage: file })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="LuxuryStay Logo"
              width={180}
              height={180}
              className="rounded-lg "
            />
          </div>
          <h2 className=" text-3xl font-bold text-gray-900">Customer Portal</h2>
          <p className=" text-sm text-gray-600">Sign in to your account or create a new one</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Welcome Back</CardTitle>
                  </CardHeader>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="loginEmail">Email Address</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Create Account</CardTitle>
                  </CardHeader>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signupEmail">Email Address *</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signupPassword">Password * (min 5 characters)</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Enter your password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="number">Phone Number (exactly 10 digits)</Label>
                    <Input
                      id="number"
                      value={signupData.number}
                      onChange={(e) => setSignupData({ ...signupData, number: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={signupData.address}
                      onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={signupData.dateOfBirth}
                      onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("profileImage")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {signupData.profileImage ? signupData.profileImage.name : "Upload Image"}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
                Back to Home
              </Link>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">To test the Customer Panel, use the following credentials:</p>
              <p className="text-xs text-gray-500">Email: customer@gmail.com</p>
              <p className="text-xs text-gray-500">Password: customer123</p>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
