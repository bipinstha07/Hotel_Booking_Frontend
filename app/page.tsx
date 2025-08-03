"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, Coffee, Star, MapPin } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { userService } from "@/lib/user-service"

interface Room {
  id: number
  roomType: string
  pricePerNight: number
  capacity: number
  images: string[]
  amenities: string[]
  description: string
  available: boolean
}

const roomTypes = {
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

// Room Image Slider Component - moved outside main component and memoized
const RoomImageSlider = memo(({ images, roomId }: { images: string[], roomId: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="relative h-64 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  return (
    <div className="relative h-64 group">
      <Image
        src={images[currentIndex]}
        alt={`Room ${roomId} image ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority={currentIndex === 0}
      />
      
      {/* Navigation arrows - only visible on hover when more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Image indicators - only visible on hover when more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
})

RoomImageSlider.displayName = 'RoomImageSlider'

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [bookingGuests, setBookingGuests] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    notes: "",
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [customerData, setCustomerData] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string>("")
  const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Background images for hero slider - memoized to prevent recreation
  const heroImages = useMemo(() => [
    "/heroImages/image1.jpg",
    "/heroImages/image2.jpg", 
    "/heroImages/image3.jpg",
    "/heroImages/image4.jpg",
    "/heroImages/image5.jpg",
    "/heroImages/image6.jpg",
    "/heroImages/image7.jpg",
    "/heroImages/image8.jpg",
    "/heroImages/image9.jpg",
    "/heroImages/image10.jpg"
  ], [])

  // Fetch room images for a specific room
  const fetchRoomImages = async (roomId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/admin/room/${roomId}/images`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch images for room ${roomId}: ${response.status}`)
        return []
      }

      const imageIds = await response.json()
      
      // Use image IDs directly with the image serving endpoint
      const imageUrls = imageIds.map((imageId: string) => {
        if (imageId.startsWith('http')) {
          return imageId // Already a full URL
        }
        
        // Use the image ID directly with the serving endpoint
        const imageUrl = `http://localhost:8080/admin/room/${roomId}/images/${imageId}`
        return imageUrl
      })
      
      return imageUrls
    } catch (error) {
      console.error(`Error fetching images for room ${roomId}:`, error)
      return []
    }
  }

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/admin/room/getAll', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const roomsData = await response.json()
          
          // Transform the API response to match our Room interface
          const transformedRooms: Room[] = await Promise.all(roomsData.map(async (room: any) => {
            // Fetch images for each room
            const roomImages = await fetchRoomImages(room.id)
            
            return {
              id: room.id,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              description: room.description || '',
              amenities: typeof room.amenities === 'string' 
                ? room.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
                : Array.isArray(room.amenities) 
                  ? room.amenities 
                  : [],
              images: roomImages.length > 0 
                ? roomImages
                : ["/placeholder.svg?height=300&width=400"],
              available: true, // Default to available, you might want to add this field to your API
            }
          }))

          setRooms(transformedRooms)
        } else {
          console.error('Failed to fetch rooms:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Check for customer authentication
  useEffect(() => {
    setMounted(true)
    const customerToken = localStorage.getItem("customerToken")
    const storedCustomerData = localStorage.getItem("customerData")
    
    console.log('Checking authentication...')
    console.log('Customer token:', customerToken ? 'Present' : 'Missing')
    console.log('Stored customer data:', storedCustomerData)
    
    if (customerToken && storedCustomerData) {
      try {
        const parsedData = JSON.parse(storedCustomerData)
        console.log('Parsed customer data:', parsedData)
        setCustomerData(parsedData)
        
        // Fetch profile image if we have user details
        if (parsedData.userDetails?.email) {
          fetchProfileImage(parsedData.userDetails.email)
        } else if (parsedData.username) {
          // Fallback to username if no email in userDetails
          fetchProfileImage(parsedData.username)
        }
      } catch (error) {
        console.error("Error parsing customer data:", error)
      }
    } else {
      console.log('No customer data found')
    }
  }, [])

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 7000) // Change image every 7 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  const fetchProfileImage = async (email: string) => {
    try {
      setIsLoadingProfileImage(true)
      const imageUrl = await userService.getUserProfileImage(email)
      setProfileImage(imageUrl)
    } catch (error) {
      console.error('Error fetching profile image:', error)
      // Keep existing profile image or use placeholder
    } finally {
      setIsLoadingProfileImage(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerData")
    setCustomerData(null)
    setProfileImage("")
    setIsLoadingProfileImage(false)
    window.location.reload()
  }

  const handleBooking = async (room: Room) => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    // If user is logged in, use their data; otherwise require manual input
    if (!customerData && (!bookingData.customerName || !bookingData.customerEmail)) {
      toast.error("Please fill all required fields")
      return
    }

    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * room.pricePerNight

    const booking = {
      customerName: customerData?.userDetails?.name || bookingData.customerName,
      customerEmail: customerData?.userDetails?.email || bookingData.customerEmail,
      phoneNumber: customerData?.userDetails?.number || bookingData.phone,
      checkInDate: format(checkInDate, "yyyy-MM-dd"),
      checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
      numberOfGuest: bookingGuests,
      totalPrice,
      notes: bookingData.notes,
      roomId: room.id.toString(),
    }

    try {
      const response = await fetch('http://localhost:8080/user/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
      })
      
      if (response.ok) {
        toast.success(`Booking confirmed! Total: $${totalPrice}`)
        setSelectedRoom(null)
        setBookingData({ customerName: "", customerEmail: "", phone: "", notes: "" })
      } else {
        const errorData = await response.json()
        toast.error(`Booking failed: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking. Please try again.')
    }
  }

  // Memoize filtered rooms to prevent unnecessary re-renders
  const filteredRooms = useMemo(() => rooms.filter((room) => {
    // Check if room is available
    if (!room.available) return false
    
    // Check guest capacity
    if (room.capacity < guests) return false
    
    // Check room type filter
    if (selectedRoomType !== "all" && room.roomType !== selectedRoomType) return false
    
    // Check price range
    if (priceRange.min && room.pricePerNight < Number.parseInt(priceRange.min)) return false
    if (priceRange.max && room.pricePerNight > Number.parseInt(priceRange.max)) return false
    
    return true
  }), [rooms, guests, selectedRoomType, priceRange.min, priceRange.max])

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
          
            </div>
            <nav className="flex items-center space-x-4">
              {mounted && customerData ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={profileImage || "/placeholder-user.jpg"} 
                          alt="Profile" 
                          className={`w-full h-full object-cover ${isLoadingProfileImage ? 'animate-pulse' : ''}`}
                        />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        Welcome, {customerData.userDetails?.name || customerData.username}
                      </span>
                    </div>
                    <Link href="/customer/profile">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/customer/login">
                    <Button variant="outline">Customer Login</Button>
                  </Link>
                  <Link href="/admin/login">
                    <Button variant="outline">Admin Login</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={image}
                alt={`Luxury hotel background ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Experience Luxury Like Never Before</h2>
            <p className="text-xl md:text-2xl mb-8">Book your perfect stay with us</p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white transform transition-all hover:-translate-y-1 hover:shadow-lg"
              onClick={() => {
                document.getElementById('why-choose-us')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              Explore El Cae Deara
            </Button>
          </div>
        </div>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
        
      </section>

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Room Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(roomTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="guests">Guests</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                  className="w-full"
                  placeholder="Number of guests"
                />
              </div>
              <div>
                <Label htmlFor="minPrice">Min Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full"
                  placeholder="Min price"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full"
                  placeholder="Max price"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Search Rooms</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rooms Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8">Available Rooms</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading rooms...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow h-[600px] flex flex-col">
              <div className="relative">
                <RoomImageSlider key={`${room.id}-${room.images.length}`} images={room.images} roomId={room.id} />
                <Badge className="absolute top-2 right-2 z-20 bg-green-500">Available</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{roomTypes[room.roomType as keyof typeof roomTypes]}</span>
                  <span className="text-blue-600">${room.pricePerNight}/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Up to {room.capacity} guests</span>
                </div>
                <p className="text-gray-600 mb-4 text-sm flex-1">{room.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities && Array.isArray(room.amenities) && room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedRoom(room)}>
                        Book Now
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {roomTypes[room.roomType as keyof typeof roomTypes]}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {customerData ? (
                        // Show logged-in user info (read-only)
                        <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">Logged in as: {customerData.userDetails?.name || customerData.username}</span>
                            </div>
                            <div className="text-sm text-green-700">
                              <p>Email: {customerData.userDetails?.email || customerData.username}</p>
                              {customerData.userDetails?.number && (
                                <p>Phone: {customerData.userDetails?.number}</p>
                              )}
                            </div>
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mt-2">
                              <p>Debug - customerData keys: {Object.keys(customerData).join(', ')}</p>
                              <p>Debug - userDetails: {customerData.userDetails ? 'Present' : 'Missing'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Show manual input fields for non-logged-in users
                        <>
                          <div>
                            <Label htmlFor="customerName">Full Name *</Label>
                            <Input
                              id="customerName"
                              value={bookingData.customerName}
                              onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerEmail">Email *</Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={bookingData.customerEmail}
                              onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={bookingData.phone}
                              onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Check-in and Check-out Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="checkIn">Check-in Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="checkOut">Check-out Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      {/* Number of Guests */}
                      <div>
                        <Label htmlFor="booking-guests">Number of Guests *</Label>
                        <Input
                          id="booking-guests"
                          type="number"
                          min="1"
                          max={room.capacity}
                          value={bookingGuests}
                          onChange={(e) => setBookingGuests(Number.parseInt(e.target.value))}
                          placeholder={`Max ${room.capacity} guests`}
                        />
                      </div>
                      
                      {/* Notes */}
                      <div>
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={bookingData.notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookingData({ ...bookingData, notes: e.target.value })}
                          placeholder="Any special requests or notes..."
                          rows={3}
                        />
                      </div>
                      
                      {/* Booking Summary */}
                      {checkInDate && checkOutDate && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span>Check-in:</span>
                            <span>{format(checkInDate, "PPP")}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Check-out:</span>
                            <span>{format(checkOutDate, "PPP")}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Guests:</span>
                            <span>{bookingGuests} person(s)</span>
                          </div>
                          <div className="flex justify-between items-center font-bold">
                            <span>Total:</span>
                            <span>
                              $
                              {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) *
                                room.pricePerNight}
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => handleBooking(room)}
                        disabled={!checkInDate || !checkOutDate || (!customerData && (!bookingData.customerName || !bookingData.customerEmail))}
                      >
                        {customerData ? "Book with My Account" : "Confirm Booking"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-10 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-15 blur-lg"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-64 h-64 rounded-full mb-1">
            <Image
                src="/logo.png"
                alt="LuxuryStay Logo"
                width={640}
                height={640}
                className="mr-3"
              />
            </div>
           
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Why Choose El Cae Deara?
            </h2>
            <p className="text-md text-gray-600 max-w-3xl mx-auto">
              Experience the epitome of seven-star luxury at its finest, where unparalleled opulence meets impeccable service. Indulge in our world-class amenities, Michelin-starred dining, and personalized butler service that exceeds all expectations
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Premium Quality */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience luxury redefined with our meticulously designed rooms featuring premium materials, 
                  state-of-the-art amenities, and attention to every detail.
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Prime Location */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Prime Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  Strategically located in the heart of the city, offering easy access to major attractions, 
                  business districts, and transportation hubs.
                </p>
                <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                  <span>Explore Area</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 24/7 Service */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Service</h3>
                <p className="text-gray-600 leading-relaxed">
                  Round-the-clock concierge service, room service, and dedicated support team ensuring 
                  your comfort and satisfaction at any hour.
                </p>
                <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                  <span>Our Services</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Exclusive Experience */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Exclusive Experience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Personalized attention, exclusive amenities, and bespoke services tailored to create 
                  unforgettable memories for every guest.
                </p>
                <div className="mt-6 flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                  <span>Discover More</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Luxury Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </section>



      {/* Customer Reviews Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent mb-4">
              What Our Guests Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover why guests choose El Cae Deara for their most memorable experiences
            </p>
          </div>

          {/* Reviews Horizontal Scroll */}
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6 min-w-max">
              {/* Review 1 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Sarah Johnson</h4>
                    <p className="text-xs text-gray-600">Business Executive</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "Absolutely breathtaking! The service was impeccable and the rooms were beyond luxurious. 
                  Every detail was perfect - from the personalized welcome to the world-class amenities."
                </p>
              </div>

              {/* Review 2 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Michael Chen</h4>
                    <p className="text-xs text-gray-600">Tech Entrepreneur</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "The attention to detail here is unmatched. The staff anticipated our every need before we even asked. 
                  The spa treatments were rejuvenating and the dining experience was Michelin-star quality."
                </p>
              </div>

              {/* Review 3 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Emma Rodriguez</h4>
                    <p className="text-xs text-gray-600">Travel Influencer</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "I've stayed at luxury hotels worldwide, but El Cae Deara stands in a league of its own. 
                  The private beach access, infinity pools, and personalized butler service created an 
                  unforgettable experience."
                </p>
              </div>

              {/* Review 4 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">David Thompson</h4>
                    <p className="text-xs text-gray-600">Investment Banker</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "Perfect for our anniversary celebration. The staff went above and beyond to make our stay special. 
                  The room was immaculate, the food was exceptional, and the spa treatments were world-class."
                </p>
              </div>

              {/* Review 5 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Lisa Wang</h4>
                    <p className="text-xs text-gray-600">Fashion Designer</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "The design aesthetic is absolutely stunning. Every corner is Instagram-worthy! 
                  The attention to detail in the interior design matches the exceptional service."
                </p>
              </div>

              {/* Review 6 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 min-w-[300px] max-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Robert Anderson</h4>
                    <p className="text-xs text-gray-600">Film Director</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "As someone who travels extensively for work, I can say this is the finest hotel I've ever experienced. 
                  The level of service is unmatched, and the facilities are world-class."
                </p>
              </div>
            </div>
          </div>

          {/* Review Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Guest Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Happy Guests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="El Cae Deara Logo"
                  width={100}
                  height={100}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    El Cae Deara
                  </h3>
                  <p className="text-sm text-gray-600">Seven-Star Luxury</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Experience the epitome of luxury hospitality where every detail is crafted to perfection. 
                Your journey to unparalleled opulence begins here.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-gray-900">
                Quick Links
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/rooms" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    Our Rooms
                  </Link>
                </li>
                <li>
                  <Link href="/amenities" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="/dining" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    Fine Dining
                  </Link>
                </li>
                <li>
                  <Link href="/spa" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    Spa & Wellness
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    Events & Celebrations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-gray-900">
                Contact Us
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">123 Luxury Avenue</p>
                    <p className="text-gray-600">Dubai, UAE</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">+971 4 123 4567</p>
                    <p className="text-gray-600">+971 50 987 6543</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">reservations@elcaedeara.com</p>
                    <p className="text-gray-600">concierge@elcaedeara.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-gray-900">
                Our Location
              </h4>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2778.5815748725063!2d9.096322943828412!3d45.85967294231135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478427699ec1e4e3%3A0x869b99e92e2fe9bb!2sPassalacqua!5e0!3m2!1sen!2sus!4v1753679101914!5m2!1sen!2sus"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-gray-500">&copy; 2024 El Cae Deara. All rights reserved.</p>
                <div className="flex space-x-4 text-sm">
                  <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Privacy Policy</Link>
                  <Link href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Terms of Service</Link>
                  <Link href="/cookies" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Cookie Policy</Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-gray-500 text-sm">Seven-Star Luxury Experience</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
