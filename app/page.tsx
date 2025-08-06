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
import { bookingService } from "@/lib/booking-service"
import PaymentForm from "@/components/payment-form"

interface Room {
  id: number
  roomType: string
  roomNumber: string
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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [currentBookingRoom, setCurrentBookingRoom] = useState<Room | null>(null)
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
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [selectedRoomForPayment, setSelectedRoomForPayment] = useState<Room | null>(null)
  const [bookingDataForPayment, setBookingDataForPayment] = useState<any>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isBookingLoading, setIsBookingLoading] = useState(false)

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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/room/${roomId}/images`, {
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
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/room/${roomId}/images/${imageId}`
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/room/getAll`, {
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

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    setPaymentData(null)
    setSelectedRoomForPayment(null)
    setBookingData({ customerName: "", customerEmail: "", phone: "", notes: "" })
    setCheckInDate(undefined)
    setCheckOutDate(undefined)
    setBookingGuests(1)
    setBookingError(null) // Clear any errors
    
    toast.success('Payment successful! Your booking has been confirmed.', {
      description: 'You will receive a confirmation email shortly.',
    })
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setPaymentData(null)
    setSelectedRoomForPayment(null)
    setBookingError(null) // Clear any errors
    
    toast.info('Payment cancelled. You can try booking again.', {
      description: 'Your booking was not confirmed.',
    })
  }

  const handleBooking = async (room: Room) => {
    const roomToBook = currentBookingRoom || room
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    // Validate dates are in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkInDate < today) {
      toast.error("Check-in date must be in the future")
      return
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    // If user is logged in, use their data; otherwise require manual input
    if (!customerData && (!bookingData.customerName || !bookingData.customerEmail)) {
      toast.error("Please fill all required fields")
      return
    }

    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * roomToBook.pricePerNight

    const bookingDataToSend = {
      customerName: customerData?.userDetails?.name || bookingData.customerName,
      customerEmail: customerData?.userDetails?.email || bookingData.customerEmail,
      userId: customerData?.userDetails?.id || 'user123',
      roomId: roomToBook.id.toString(),
      checkInDate: format(checkInDate, "yyyy-MM-dd"),
      checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
      numberOfGuest: bookingGuests,
      notes: bookingData.notes || "",
      phoneNumber: bookingData.phone ? parseInt(bookingData.phone.replace(/\D/g, '')) : undefined,
      totalPrice: Math.round(totalPrice * 100), // Convert to cents for Stripe
    }

    console.log('Sending booking data:', bookingDataToSend)
    console.log('Check-in date:', checkInDate)
    console.log('Check-out date:', checkOutDate)
    console.log('Today:', today)

    setIsBookingLoading(true)
    setBookingError(null)

    // Immediately close booking form and show payment
    setSelectedRoom(null) // Close the booking dialog
    setSelectedRoomForPayment(room)
    
    try {
      console.log('Creating booking with data:', bookingDataToSend)
      
      const paymentResponse = await bookingService.createBooking(bookingDataToSend)
      console.log('Payment response received:', paymentResponse)
      
      // Store booking data for payment before clearing
      const bookingDataForPayment = {
        checkInDate,
        checkOutDate,
        bookingGuests,
        room: roomToBook
      }
      
      // Close booking dialog and clear form data
      setBookingDialogOpen(false)
      setSelectedRoom(null)
      setCurrentBookingRoom(null)
      setBookingData({ customerName: "", customerEmail: "", phone: "", notes: "" })
      setCheckInDate(undefined)
      setCheckOutDate(undefined)
      setBookingGuests(1)
      setBookingError(null)
      
      // Set payment data
      setPaymentData(paymentResponse)
      setSelectedRoomForPayment(bookingDataForPayment.room)
      setBookingDataForPayment(bookingDataForPayment)
      setShowPayment(true)
      
      toast.success('Booking created! Please complete payment.', {
        description: `Booking ID: ${paymentResponse.bookingId}`,
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      // Show the exact backend error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking. Please try again.'
      setBookingError(errorMessage)
      setShowPayment(false) // Hide payment form if booking failed
      setSelectedRoomForPayment(null)
      toast.error('Booking Failed', {
        description: errorMessage,
      })
    } finally {
      setIsBookingLoading(false)
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
            <nav className="flex items-center space-x-4">
              {mounted && customerData ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                        <img 
                          src={profileImage || "/placeholder-user.jpg"} 
                          alt="Profile" 
                          className={`w-7 h-7 sm:w-full sm:h-full object-cover ${isLoadingProfileImage ? 'animate-pulse' : ''}`}
                        />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">
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
                  <Dialog open={bookingDialogOpen && currentBookingRoom?.id === room.id} onOpenChange={(open) => {
                    if (!open) {
                      setBookingDialogOpen(false)
                      setCurrentBookingRoom(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => {
                        setCurrentBookingRoom(room)
                        setSelectedRoom(room)
                        setBookingDialogOpen(true)
                      }}>
                        Book Now
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>Book {roomTypes[currentBookingRoom?.roomType as keyof typeof roomTypes]}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 p-3 lg:grid-cols-2 gap-8 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
                      {/* Left Column - Booking Form */}
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
                                <Calendar 
                                  mode="single" 
                                  selected={checkInDate} 
                                  onSelect={setCheckInDate} 
                                  initialFocus
                                  disabled={(date) => date < new Date()}
                                  fromDate={new Date()}
                                />
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
                                <Calendar 
                                  mode="single" 
                                  selected={checkOutDate} 
                                  onSelect={setCheckOutDate} 
                                  initialFocus
                                  disabled={(date) => date <= (checkInDate || new Date())}
                                  fromDate={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                                />
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
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (value > 0) {
                                setBookingGuests(value)
                              }
                            }}
                            placeholder={`Max ${room.capacity} guests`}
                            className={bookingGuests > room.capacity || bookingGuests <= 0 ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {(bookingGuests > room.capacity || bookingGuests <= 0) && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-red-700 text-sm font-medium">
                                  {bookingGuests <= 0 
                                    ? "Please enter at least 1 guest for booking." 
                                    : `Maximum capacity for this room is ${room.capacity} guests. Please reduce the number of guests.`
                                  }
                                </span>
                              </div>
                            </div>
                          )}
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
                      </div>

                      {/* Right Column - Room Details & Summary */}
                      <div className="space-y-4">
                        {/* Room Details */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4">Room Details</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room Type:</span>
                              <span className="font-medium">{roomTypes[room.roomType as keyof typeof roomTypes]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price per Night:</span>
                              <span className="font-medium">${room.pricePerNight}</span>
                            </div>
                        
            
                          </div>
                        </div>

                        {/* Booking Summary */}
                        {checkInDate && checkOutDate && (
                          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold mb-4 text-blue-900">Booking Summary</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Check-in:</span>
                                <span className="font-medium">{format(checkInDate, "PPP")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Check-out:</span>
                                <span className="font-medium">{format(checkOutDate, "PPP")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Duration:</span>
                                <span className="font-medium">
                                  {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Guests:</span>
                                <span className="font-medium">{bookingGuests} person(s)</span>
                              </div>
                              <div className="border-t border-blue-200 pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold text-blue-900">
                                  <span>Total:</span>
                                  <span>
                                    ${Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) * room.pricePerNight}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Error Display */}
                        {bookingError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-red-700 text-sm font-medium">
                                {bookingError}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Book Button */}
                        <Button
                          className="w-full"
                          onClick={() => handleBooking(room)}
                          disabled={!checkInDate || !checkOutDate || (!customerData && (!bookingData.customerName || !bookingData.customerEmail)) || bookingGuests > room.capacity || bookingGuests <= 0 || isBookingLoading}
                        >
                          {isBookingLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating Booking...</span>
                            </div>
                          ) : (
                            customerData ? "Book with My Account" : "Confirm Booking"
                          )}
                        </Button>
                        
                         
                       </div>
                     </div>
                     <div className="pb-4"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
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
                    <p className="text-gray-600">Moltrasio, Italy</p>
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
              
                <div className="flex space-x-4 text-sm">
                  <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Privacy Policy</Link>
                  <Link href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Terms of Service</Link>
                  <Link href="/cookies" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">Cookie Policy</Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-gray-500">&copy; 2024 El Cae Deara. All rights reserved.</p>
                <div>
                  
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              <span className="text-gray-500 text-sm">Designed and Developed by Bipin Shrestha</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment Form Modal */}
      {showPayment && paymentData && selectedRoomForPayment && bookingDataForPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600  text-white relative">
              <button
                onClick={handlePaymentCancel}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className=" bg-white/20 rounded-full flex items-center justify-center mx-auto ">
                  <svg className="w-1 h-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Complete Payment</h2>
                <p className="text-blue-100 text-xs">Secure payment powered by Stripe</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Left Column - Booking Summary */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Booking Summary
                </h3>
                
                <div className="space-y-3">
                  {/* Room Info */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium text-gray-900">{selectedRoomForPayment.roomType}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-600">Price/Night:</span>
                      <span className="font-medium text-gray-900">${selectedRoomForPayment.pricePerNight}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {bookingDataForPayment.checkOutDate && bookingDataForPayment.checkInDate ? 
                          Math.ceil((bookingDataForPayment.checkOutDate.getTime() - bookingDataForPayment.checkInDate.getTime()) / (1000 * 60 * 60 * 24)) : 0} nights
                      </span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100 text-xs">Total Payment:</span>
                      <span className="text-lg font-bold">
                        ${Math.round((bookingDataForPayment.checkOutDate && bookingDataForPayment.checkInDate ? 
                          Math.ceil((bookingDataForPayment.checkOutDate.getTime() - bookingDataForPayment.checkInDate.getTime()) / (1000 * 60 * 60 * 24)) * selectedRoomForPayment.pricePerNight : 0))}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-xs font-medium">SSL Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Form */}
              <div className="p-4 bg-white md:col-span-2">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Details
                  <div className="text-xs text-gray-500 mt-3 mb-3 flex items-center ml-2 ">
                    <span>Test Card: 378282246310005</span>
                    <button 
                      onClick={async () => {
                        try {
                          // Try the newer clipboard API first
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText('378282246310005');
                          } else {
                            // Fallback for older browsers/mobile
                            const textArea = document.createElement('textarea');
                            textArea.value = '378282246310005';
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            textArea.style.top = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            document.execCommand('copy');
                            textArea.remove();
                          }
                          // Could add toast notification here that copy succeeded
                        } catch (err) {
                          console.error('Failed to copy text: ', err);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      title="Copy card number"
                    >
                      <svg 
                        className="w-3 h-3 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <span className="border-l-2 pl-4"> Use any value for other fields</span>
                  </div>
                </h3>
                
                <PaymentForm
                  clientSecret={paymentData.clientSecret}
                  bookingId={paymentData.bookingId}
                  amount={Math.round((bookingDataForPayment.checkOutDate && bookingDataForPayment.checkInDate ? 
                    Math.ceil((bookingDataForPayment.checkOutDate.getTime() - bookingDataForPayment.checkInDate.getTime()) / (1000 * 60 * 60 * 24)) * selectedRoomForPayment.pricePerNight : 0) * 100)}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
