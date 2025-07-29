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
import { User, Upload, Calendar, Mail, Phone, MapPin, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CustomerData {
  name: string
  email: string
  number?: string
  address?: string
  dateOfBirth?: string
  profileImage?: string
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

    // Load customer data
    const storedData = localStorage.getItem("customerData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setCustomerData(data)
      setEditData(data)
    }

    // Mock bookings data
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
  }, [router])

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
      // Here you would upload the image and get the URL
      const imageUrl = URL.createObjectURL(file)
      setEditData({ ...editData, profileImage: imageUrl })
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
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
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
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={customerData.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profileImageUpload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById("profileImageUpload")?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? editData.name : customerData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editData.email : customerData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Phone Number</Label>
                    <Input
                      id="number"
                      value={isEditing ? editData.number || "" : customerData.number || ""}
                      onChange={(e) => setEditData({ ...editData, number: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={isEditing ? editData.dateOfBirth || "" : customerData.dateOfBirth || ""}
                      onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={isEditing ? editData.address || "" : customerData.address || ""}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
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
