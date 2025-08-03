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
import { User, Upload, Calendar, Mail, Phone, MapPin, Edit, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { userService } from "@/lib/user-service"
import Image from "next/image"

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
  bookingCreated: string
}

export default function CustomerProfile() {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CustomerData>({
    name: "",
    email: "",
  })
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
          roomType: booking.roomEntity?.roomType || "UNKNOWN",
          checkInDate: booking.checkInDate || "",
          checkOutDate: booking.checkOutDate || "",
          totalPrice: booking.totalPrice || 0,
          status: booking.bookingStatus || "PENDING",
          bookingCreated: booking.bookingCreated || "",
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
            bookingCreated: "2024-02-01T10:30:00",
          },
          {
            id: 2,
            roomType: "SINGLE_AC",
            checkInDate: "2024-03-10",
            checkOutDate: "2024-03-12",
            totalPrice: 5000,
            status: "Completed",
            bookingCreated: "2024-02-25T14:20:00",
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

  const handleUpdateProfile = async () => {
    // Validation
    if (!editData.name || !editData.email) {
      toast.error("Name and email are required")
      return
    }

    if (editData.number && !/^\d{10}$/.test(editData.number)) {
      toast.error("Phone number must be 10 digits")
      return
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/
    if (!emailRegex.test(editData.email)) {
      toast.error("Invalid email format")
      return
    }

    // Here you would make API call to update customer data
    console.log("Updating customer data:", editData)

    setCustomerData(editData)
    localStorage.setItem("customerData", JSON.stringify(editData))
    setIsEditing(false)
    toast.success("Profile updated successfully!")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for immediate display
      const imageUrl = URL.createObjectURL(file)
      setEditData({ ...editData, profileImage: imageUrl })
      
      // Here you would typically upload the image to your backend
      // For now, we'll just show the preview
      toast.success("Profile picture updated! (Note: This is a preview - actual upload would require backend integration)")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerData")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500"
      case "Completed":
        return "bg-blue-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
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
              <Image
                src="/logo.png"
                alt="LuxuryStay Logo"
                width={130}
                height={130}
                className="mr-3 rounded-lg"
              />
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
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
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editData.email : customerData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        disabled={!isEditing}
                        className="h-9 text-sm"
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
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
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
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings found</p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                      Book a Room
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {roomTypeLabels[booking.roomType as keyof typeof roomTypeLabels]}
                              </h3>
                              <p className="text-sm text-gray-600">Booking ID: #{booking.id}</p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Check-in</Label>
                              <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Check-out</Label>
                              <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                              <p className="font-medium text-green-600">₹{booking.totalPrice}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              Booked on {new Date(booking.bookingCreated).toLocaleDateString()}
                            </p>
                            {booking.status === "Confirmed" && (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
