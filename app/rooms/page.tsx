"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, Users, Filter, X, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [selectedRoomType, setSelectedRoomType] = useState<string>("SINGLE_AC") // Updated default value
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
  })
  const [loading, setLoading] = useState(true)

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

  // Fetch all rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/admin/room/getAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.status}`)
      }

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
      setFilteredRooms(transformedRooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      // Fallback to empty array if API fails
      setRooms([])
      setFilteredRooms([])
    } finally {
      setLoading(false)
    }
  }

  // Load rooms on component mount
  useEffect(() => {
    fetchRooms()
  }, [])

  // Filter rooms based on criteria
  useEffect(() => {
    let filtered = rooms.filter((room) => room.available)

    if (guests > 0) {
      filtered = filtered.filter((room) => room.capacity >= guests)
    }

    if (selectedRoomType) {
      filtered = filtered.filter((room) => room.roomType === selectedRoomType)
    }

    if (priceRange.min) {
      filtered = filtered.filter((room) => room.pricePerNight >= Number.parseInt(priceRange.min))
    }

    if (priceRange.max) {
      filtered = filtered.filter((room) => room.pricePerNight <= Number.parseInt(priceRange.max))
    }

    setFilteredRooms(filtered)
  }, [rooms, guests, selectedRoomType, priceRange])

  const handleBooking = async (room: Room) => {
    if (!checkInDate || !checkOutDate || !bookingData.customerName || !bookingData.customerEmail) {
      toast.error("Please fill all required fields")
      return
    }

    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * room.pricePerNight

    const booking = {
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      checkInDate: format(checkInDate, "yyyy-MM-dd"),
      checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
      totalPrice,
      roomId: room.id,
    }

    // Here you would make API call to create booking
    console.log("Booking data:", booking)
    toast.success(`Booking confirmed! Total: $${totalPrice}`)
    setSelectedRoom(null)
    setBookingData({ customerName: "", customerEmail: "", phone: "" })
  }

  const clearFilters = () => {
    setSelectedRoomType("")
    setPriceRange({ min: "", max: "" })
    setGuests(1)
  }

  const nextImage = () => {
    if (selectedRoom && selectedRoom.images && selectedRoom.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === selectedRoom.images.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (selectedRoom && selectedRoom.images && selectedRoom.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedRoom.images.length - 1 : prev - 1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                LuxuryStay Hotel
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/customer/login">
                <Button variant="outline">Customer Login</Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline">Admin Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="checkin">Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                <Label htmlFor="checkout">Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="guests">Guests</Label>
                <Input
                  type="number"
                  min="1"
                  max="4"
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {Object.entries(roomTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price Range (₹)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </p>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={room.images && room.images.length > 0 ? room.images[0] : "/placeholder.svg"}
                  alt={roomTypes[room.roomType as keyof typeof roomTypes]}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-green-500">Available</Badge>
                {room.images && room.images.length > 1 && (
                  <Badge className="absolute top-2 left-2 bg-blue-500">{room.images.length} Photos</Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{roomTypes[room.roomType as keyof typeof roomTypes]}</span>
                  <span className="text-blue-600">₹{room.pricePerNight}/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Up to {room.capacity} guests</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities && Array.isArray(room.amenities) && room.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedRoom(room)
                        setCurrentImageIndex(0)
                      }}
                    >
                      View Details & Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{roomTypes[room.roomType as keyof typeof roomTypes]}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Image Gallery */}
                      <div className="space-y-4">
                        <div className="relative h-64 lg:h-80">
                          <Image
                            src={room.images && room.images.length > currentImageIndex ? room.images[currentImageIndex] : "/placeholder.svg"}
                            alt={`Room image ${currentImageIndex + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {room.images && room.images.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                                onClick={prevImage}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                                onClick={nextImage}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {room.images && room.images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto">
                            {room.images.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`relative w-16 h-16 flex-shrink-0 rounded border-2 ${
                                  currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                                }`}
                              >
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Thumbnail ${index + 1}`}
                                  fill
                                  className="object-cover rounded"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Room Details & Booking */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-2xl font-bold text-blue-600">₹{room.pricePerNight}</span>
                            <span className="text-gray-600">per night</span>
                          </div>
                          <div className="flex items-center mb-4">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">Up to {room.capacity} guests</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-gray-600 text-sm">{room.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Booking Form */}
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-4">Book This Room</h4>
                          <div className="space-y-3">
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
                                <div className="flex justify-between items-center font-bold">
                                  <span>Total:</span>
                                  <span>
                                    ₹
                                    {Math.ceil(
                                      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
                                    ) * room.pricePerNight}
                                  </span>
                                </div>
                              </div>
                            )}
                            <Button
                              className="w-full"
                              onClick={() => handleBooking(room)}
                              disabled={!checkInDate || !checkOutDate}
                            >
                              Confirm Booking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No rooms found matching your criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}
