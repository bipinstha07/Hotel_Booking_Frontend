"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Upload, Calendar, Mail, Phone, MapPin, Edit, RefreshCw, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { userService } from "@/lib/user-service"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CustomerData {
  name: string
  email: string
  number?: string
  address?: string
  dateOfBirth?: string
  profileImage?: string
  isLoadingImage?: boolean
}

interface Booking {
  id: number
  roomType: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: string
  paymentStatus?: string
  paymentIntentId?: string
  bookingCreated: string
  notes?: string
  numberOfGuest?: number
}

export default function CustomerProfile() {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CustomerData>({
    name: "",
    email: "",
  })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if customer is logged in
    const customerToken = localStorage.getItem("customerToken")
    if (!customerToken) {
      router.push("/customer/login")
      return
    }

    // Load customer data from localStorage
    const storedData = localStorage.getItem("customerData")
    console.log('Profile page - stored data:', storedData)
    
    if (storedData) {
      const data = JSON.parse(storedData)
      console.log('Profile page - parsed data:', data)
      console.log('Profile page - userDetails:', data.userDetails)
      
      // Extract user details from the stored data
      if (data.userDetails) {
        const userDetails = data.userDetails
        console.log('Profile page - userDetails extracted:', userDetails)
        const customerInfo = {
          name: userDetails.name || "",
          email: userDetails.email || "",
          number: userDetails.number || "",
          address: userDetails.address || "",
          dateOfBirth: userDetails.dateOfBirth || "",
          profileImage: userDetails.userImage || "",
        }
        console.log('Profile page - customerInfo:', customerInfo)
        setCustomerData(customerInfo)
        setEditData(customerInfo)
        
        // Fetch profile picture from API if we have an email
        if (customerInfo.email) {
          fetchProfileImage(customerInfo.email)
        }
      } else {
        console.log('Profile page - no userDetails, using fallback')
        // Fallback to basic data
        const fallbackData = {
          name: data.username || "",
          email: data.username || "",
        }
        setCustomerData(fallbackData)
        setEditData(fallbackData)
        
        // Try to fetch profile picture for fallback data
        if (fallbackData.email) {
          fetchProfileImage(fallbackData.email)
        }
      }
    } else {
      console.log('Profile page - no stored data found')
    }

    // Load actual bookings from localStorage
    const storedDataForBookings = localStorage.getItem("customerData")
    if (storedDataForBookings) {
      const data = JSON.parse(storedDataForBookings)
      if (data.bookings && Array.isArray(data.bookings)) {
        const actualBookings: Booking[] = data.bookings.map((booking: any) => ({
          id: booking.id || Math.random(),
          roomType: booking.roomType || booking.roomEntity?.roomType || "UNKNOWN",
          checkInDate: booking.checkInDate || "",
          checkOutDate: booking.checkOutDate || "",
          totalPrice: booking.totalPrice || 0,
          status: booking.bookingStatus || "PENDING",
          paymentStatus: booking.paymentStatus || "pending",
          paymentIntentId: booking.paymentIntentId || "",
          bookingCreated: booking.bookingCreated || "",
          notes: booking.notes || "",
          numberOfGuest: booking.numberOfGuest || 1,
        }))
        setBookings(actualBookings)
      } else {
        // Fallback to mock data if no bookings
        const mockBookings: Booking[] = [
          {
            id: 1,
            roomType: "DOUBLE_DELUXE",
            checkInDate: "2024-02-15",
            checkOutDate: "2024-02-18",
            totalPrice: 13500,
            status: "Confirmed",
            paymentStatus: "confirmed",
            paymentIntentId: "pi_mock_123456789",
            bookingCreated: "2024-02-01T10:30:00",
            notes: "Test",
            numberOfGuest: 2,
          },
          {
            id: 2,
            roomType: "SINGLE_AC",
            checkInDate: "2024-03-10",
            checkOutDate: "2024-03-12",
            totalPrice: 5000,
            status: "Completed",
            paymentStatus: "confirmed",
            paymentIntentId: "pi_mock_987654321",
            bookingCreated: "2024-02-25T14:20:00",
            notes: "Can I bring my pet?",
            numberOfGuest: 1,
          },
        ]
        setBookings(mockBookings)
      }
    }
  }, [router])

  const fetchProfileImage = async (email: string) => {
    try {
      setCustomerData(prev => ({ ...prev, isLoadingImage: true }))
      const imageUrl = await userService.getUserProfileImage(email)
      setCustomerData(prev => ({ ...prev, profileImage: imageUrl, isLoadingImage: false }))
      setEditData(prev => ({ ...prev, profileImage: imageUrl }))
    } catch (error) {
      console.error('Error fetching profile image:', error)
      setCustomerData(prev => ({ ...prev, isLoadingImage: false }))
      toast.error("Failed to load profile picture. Using placeholder image.")
      // Keep the existing profile image or use placeholder
    }
  }

  const refreshBookings = async () => {
    if (!customerData.email) {
      toast.error("User email not found")
      return
    }

    try {
      setIsLoadingBookings(true)
      const customerToken = localStorage.getItem("customerToken")
      
      if (!customerToken) {
        toast.error("Authentication required")
        return
      }
      console.log('Bipin Testing',customerToken);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${customerData.email}/booking`, {
        
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('Bipin Testing',customerToken);
      if (response.ok) {
        console.log('Bipin Testing',customerToken);
        const apiBookings = await response.json()
        
        // Transform API bookings to match our interface
        const transformedBookings: Booking[] = apiBookings.map((booking: any) => ({
          id: booking.id || Math.random(),
          roomType: booking.roomType || booking.roomEntity?.roomType || "UNKNOWN",
          checkInDate: booking.checkInDate || "",
          checkOutDate: booking.checkOutDate || "",
          totalPrice: booking.totalPrice || 0,
          status: booking.bookingStatus || "PENDING",
          paymentStatus: booking.paymentStatus || "pending",
          paymentIntentId: booking.paymentIntentId || "",
          bookingCreated: booking.bookingCreated || "",
          notes: booking.notes || "",
          numberOfGuest: booking.numberOfGuest || 1,
        }))

        setBookings(transformedBookings)
        
        // Update localStorage with fresh booking data
        const storedData = localStorage.getItem("customerData")
        if (storedData) {
          const data = JSON.parse(storedData)
          const updatedData = {
            ...data,
            bookings: apiBookings
          }
          localStorage.setItem("customerData", JSON.stringify(updatedData))
        }

        toast.success(`Refreshed! Found ${transformedBookings.length} booking(s)`)
        console.log('Bookings refreshed:', transformedBookings)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to refresh bookings: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error refreshing bookings:', error)
      toast.error("Failed to refresh bookings. Please try again.")
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleUpdateProfile = async () => {
    // Validation
    if (!editData.name) {
      toast.error("Name is required")
      return
    }

    if (editData.number && !/^\d{10}$/.test(editData.number)) {
      toast.error("Phone number must be 10 digits")
      return
    }

    try {
      const customerToken = localStorage.getItem("customerToken")
      if (!customerToken) {
        toast.error("Authentication required")
        return
      }

      // Prepare user data (excluding userEmail as per API spec)
      const userData = {
        name: editData.name,
        number: editData.number || "",
        address: editData.address || "",
        dateOfBirth: editData.dateOfBirth || "",
        // Don't include userEmail as per API specification
      }

      // Create FormData for multipart/form-data
      const formData = new FormData()
      
      // Add user data as JSON string
      formData.append('userDto', JSON.stringify(userData))
      
      // Add image if there's a new one selected
      if (selectedImageFile) {
        formData.append('image', selectedImageFile)
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update/${customerData.email}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          // Don't set Content-Type for FormData, browser will set it automatically with boundary
        },
        body: formData
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        // Update local state with the response data
        const updatedCustomerData = {
          ...editData,
          name: updatedUser.name || editData.name,
          number: updatedUser.number || editData.number,
          address: updatedUser.address || editData.address,
          dateOfBirth: updatedUser.dateOfBirth || editData.dateOfBirth,
        }
        
        setCustomerData(updatedCustomerData)
        
        // Update localStorage
        const storedData = localStorage.getItem("customerData")
        if (storedData) {
          const data = JSON.parse(storedData)
          const updatedData = {
            ...data,
            userDetails: {
              ...data.userDetails,
              ...updatedCustomerData
            }
          }
          localStorage.setItem("customerData", JSON.stringify(updatedData))
        }
        
        setIsEditing(false)
        setSelectedImageFile(null) // Clear selected image file
        toast.success("Profile updated successfully!")
      } else {
        const errorData = await response.json()
        toast.error(`Failed to update profile: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file")
        return
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error("Image size should be less than 1MB")
        return
      }
      
      // Store the selected file for API upload
      setSelectedImageFile(file)
      
      // Create a preview URL for immediate display
      const imageUrl = URL.createObjectURL(file)
      setEditData({ ...editData, profileImage: imageUrl })
      
      toast.success("Profile picture selected! Click 'Save Changes' to upload.")
    }
  }

  const handleLogout = () => {
    // Clear all storage tokens
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerData")
    localStorage.removeItem("adminToken")
    
    // Redirect to home page
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-500"
      case "APPROVED":
      case "CONFIRMED":
        return "bg-green-500"
      case "CANCELLED":
      case "CANCEL":
        return "bg-red-500"
      case "COMPLETED":
        return "bg-blue-500"
      case "DELETED":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-500"
      case "PENDING":
        return "bg-yellow-500"
      case "FAILED":
        return "bg-red-500"
      case "PROCESSING":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBorderColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "border-l-green-500"
      case "PENDING":
        return "border-l-yellow-500"
      case "CANCELLED":
        return "border-l-red-500"
      case "COMPLETED":
        return "border-l-blue-500"
      default:
        return "border-l-gray-400"
    }
  }

  const roomTypeLabels = {
    SINGLE_AC: "Single AC",
    SINGLE_DELUXE: "Single Deluxe",
    SINGLE_NORMAL: "Single Normal",
    DOUBLE_AC: "Double AC",
    DOUBLE_DELUXE: "Double Deluxe",
    DOUBLE_NORMAL: "Double Normal",
    FOUR_SEATER_AC: "Four Seater AC",
    FOUR_SEATER_DELUXE: "Four Seater Deluxe",
    FOUR_SEATER_NORMAL: "Four Seater Normal",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/">
              <Image
                src="/logo.png"
                alt="LuxuryStay Logo"
                width={130}
                height={130}
                className="mr-3 rounded-lg"
              />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will need to login again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button variant="outline" onClick={() => {
                    if (!isEditing) {
                      setSelectedImageFile(null) // Clear selected image file when starting to edit
                    }
                    setIsEditing(!isEditing)
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <Avatar className="h-24 w-24 md:h-28 md:w-28 border-3 border-white shadow-md">
                      <AvatarImage 
                        src={customerData.profileImage || "/placeholder-user.jpg"} 
                        alt={`${customerData.name}'s profile picture`}
                        className={`object-cover ${customerData.isLoadingImage ? "animate-pulse" : ""}`}
                      />
                      <AvatarFallback className="text-2xl md:text-3xl">
                        {customerData.isLoadingImage ? (
                          <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-gray-900"></div>
                        ) : (
                          <User className="h-8 w-8 md:h-10 md:w-10" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{customerData.name}</h2>
                    <p className="text-sm text-gray-600 mb-3">{customerData.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    {isEditing && (
                      <>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profileImageUpload"
                        />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById("profileImageUpload")?.click()}>
                          <Upload className="h-3 w-3 mr-1" />
                          Change Photo
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => customerData.email && fetchProfileImage(customerData.email)}
                      disabled={customerData.isLoadingImage}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${customerData.isLoadingImage ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {/* Image Preview Section */}
                  {isEditing && selectedImageFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h4>
                        <div className="relative inline-block">
                          <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage 
                              src={editData.profileImage || "/placeholder-user.jpg"} 
                              alt="Preview"
                              className="object-cover"
                            />
                            <AvatarFallback className="text-lg">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {selectedImageFile.name} ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedImageFile(null)
                            setEditData({ ...editData, profileImage: customerData.profileImage })
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? editData.name : customerData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        disabled={!isEditing}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address 
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        disabled={true}
                        className="h-9 text-sm bg-gray-50"
                        placeholder="Email cannot be changed"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="number" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="number"
                        value={isEditing ? editData.number || "" : customerData.number || ""}
                        onChange={(e) => setEditData({ ...editData, number: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={isEditing ? editData.dateOfBirth || "" : customerData.dateOfBirth || ""}
                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        disabled={!isEditing}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                    <Input
                      id="address"
                      value={isEditing ? editData.address || "" : customerData.address || ""}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditing(false)
                      setSelectedImageFile(null) // Clear selected image file
                    }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleUpdateProfile}>Save Changes</Button>
                  </div>
                )}

                {!isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{customerData.email}</span>
                    </div>
                    {customerData.number && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{customerData.number}</span>
                      </div>
                    )}
                    {customerData.address && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{customerData.address}</span>
                      </div>
                    )}
                    {customerData.dateOfBirth && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(customerData.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Bookings</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshBookings}
                    disabled={isLoadingBookings}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                    {isLoadingBookings ? "Refreshing..." : "Refresh Bookings"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Refreshing bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings found</p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                      Book a Room
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 rounded-t-lg p-4 mb-0">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-3 border-r border-gray-200 pr-4">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</h3>
                        </div>
                        <div className="lg:col-span-3 border-r border-gray-200 pr-4">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">BOOKING DETAILS</h3>
                        </div>
                        <div className="lg:col-span-2 border-r border-gray-200 pr-4">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">STAY DETAILS</h3>
                        </div>
                        <div className="lg:col-span-2 border-r border-gray-200 pr-4">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">PAYMENT</h3>
                        </div>
                        <div className="lg:col-span-2 pr-4">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">STATUS</h3>
                        </div>
                        
                      </div>
                    </div>
                    
                    {/* Bookings List */}
                    <div className="space-y-0">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${getStatusBorderColor(booking.status)}`}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Customer - 3 columns */}
                            <div className="lg:col-span-3 border-r border-gray-200 pr-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {customerData.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-gray-900 truncate">{customerData.name}</p>
                                  <p className="text-sm text-gray-500 truncate">{customerData.email}</p>
                                  {customerData.number && (
                                    <p className="text-xs text-gray-400">{customerData.number}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Booking Details - 2 columns */}
                            <div className="lg:col-span-3 border-r border-gray-200 pr-4">
                              <div className="text-center">
                                <p className="text-xs font-mono text-gray-500">#{booking.id}</p>
                                <p className="font-semibold text-lg">{roomTypeLabels[booking.roomType as keyof typeof roomTypeLabels] || booking.roomType || 'Room'}</p>
                                <p className="text-sm text-gray-600">Room Type</p>
                              </div>
                            </div>

                            {/* Stay Details - 2 columns */}
                            <div className="lg:col-span-2 border-r border-gray-200 pr-4">
                              <div className="text-center space-y-1">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium">
                                    {new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-sm font-medium">
                                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{booking.numberOfGuest || 1} guest{(booking.numberOfGuest || 1) !== 1 ? 's' : ''}</p>
                                {booking.notes && (
                                  <div className="mt-2">
                                    <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors duration-200">
                                      {booking.notes}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Payment - 2 columns */}
                            <div className="lg:col-span-2 border-r border-gray-200 pr-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-green-600">${booking.totalPrice}</p>
                                <Badge className={`text-xs ${getPaymentStatusColor(booking.paymentStatus || 'pending')}`}>
                                  {booking.paymentStatus || 'Pending'}
                                </Badge>
                                {booking.paymentIntentId && (
                                  <p className="text-xs font-mono text-gray-400 mt-1 break-all" title={booking.paymentIntentId}>
                                    {booking.paymentIntentId}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status - 1 column */}
                            <div className="lg:col-span-2 pr-4">
                              <div className="text-center">
                                <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                                  {booking.status || 'Unknown'}
                                </Badge>
                              </div>
                            </div>

                            {/* Actions - 2 columns */}
                         
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
