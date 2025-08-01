"use client"

import type React from "react"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Users, BedDouble, DollarSign, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Room {
  id: string | number
  roomNumber: string
  roomType: string
  pricePerNight: number
  capacity: number
  images: string[]
  amenities: string[]
  description: string
  available: boolean
}

interface Booking {
  id?: string | number
  customerName: string
  customerEmail: string
  phoneNumber: number
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  bookingStatus: string
  bookingCreated: string
  notes: string
  numberOfGuest: number
  roomId: string
  roomNumber?: string
  roomEntity?: {
    id: string
    roomType: string
    pricePerNight: number
    capacity: number
    description: string
  }
}

const roomTypes = [
  "SINGLE_AC",
  "SINGLE_DELUXE",
  "SINGLE_NORMAL",
  "DOUBLE_AC",
  "DOUBLE_DELUXE",
  "DOUBLE_NORMAL",
  "FOUR_SEATER_AC",
  "FOUR_SEATER_DELUXE",
  "FOUR_SEATER_NORMAL",
]

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

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [editingRoomNewImages, setEditingRoomNewImages] = useState<File[]>([])
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "",
    pricePerNight: "",
    capacity: "",
    description: "",
    amenities: "",
    images: [] as File[],
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">("rooms")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'room' | 'booking', id: string | number, name?: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [bookingSearchTerm, setBookingSearchTerm] = useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL")
  const router = useRouter()
  const { toast } = useToast()

  // Image Slider Component
  const ImageSlider = ({ images, roomId }: { images: string[], roomId: string | number }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    console.log(`Rendering slider for room ${roomId} with ${images.length} images:`, images)
    console.log(`Current image URL (index ${currentImageIndex}):`, images[currentImageIndex])

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
          src={images[currentImageIndex]}
          alt={`Room ${roomId} image ${currentImageIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:8080/admin/room/booking/getAll')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      toast({
        title: "Error",
        description: "Failed to fetch bookings from the API",
        variant: "destructive",
      })
    }
  }

  const fetchRoomImages = async (roomId: string | number) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return []

      const response = await fetch(`http://localhost:8080/admin/room/${roomId}/images`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch images for room ${roomId}: ${response.status}`)
        return []
      }

      const imageIds = await response.json()
      console.log(`Image IDs for room ${roomId}:`, imageIds)
      
      // Use image IDs directly with the image serving endpoint
      const imageUrls = imageIds.map((imageId: string) => {
        if (imageId.startsWith('http')) {
          console.log(`Already full URL: ${imageId}`)
          return imageId // Already a full URL
        }
        
        // Use the image ID directly with the serving endpoint
        // This will call: GET /admin/room/{roomId}/images/{imageId}
        const imageUrl = `http://localhost:8080/admin/room/${roomId}/images/${imageId}`
        console.log(`Image ID: ${imageId} → Serving URL: ${imageUrl}`)
        
        return imageUrl
      })
      
      console.log(`Final image URLs for room ${roomId}:`, imageUrls)
      return imageUrls
    } catch (error) {
      console.error(`Error fetching images for room ${roomId}:`, error)
      return []
    }
  }

  const fetchRooms = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        router.push("/admin/login")
        return
      }

      const response = await fetch('http://localhost:8080/admin/room/getAll', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
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
          roomNumber: room.roomNumber || '',
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
    } catch (error) {
      console.error('Error fetching rooms:', error)
      // Fallback to empty array if API fails
      setRooms([])
    }
  }





  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setEditingRoomNewImages(prev => [...prev, ...files])
    }
  }

  const removeEditImage = (index: number) => {
    if (editingRoom) {
      const updatedImages = editingRoom.images.filter((_, i) => i !== index)
      setEditingRoom({ ...editingRoom, images: updatedImages })
    }
  }

  const removeEditNewImage = (index: number) => {
    setEditingRoomNewImages(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!mounted) return

    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    fetchRooms()
    
    // Initialize with empty bookings since we're using local state management
    setBookings([])
  }, [router, mounted])

  const handleCreateRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.roomType || !newRoom.pricePerNight || !newRoom.capacity || newRoom.images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields (Room Number, Room Type, Price, Capacity) and add at least one image",
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
      return
    }

    // Validate room type pattern
    const validRoomTypes = [
      "SINGLE_AC", "SINGLE_DELUXE", "SINGLE_NORMAL",
      "DOUBLE_AC", "DOUBLE_DELUXE", "DOUBLE_NORMAL",
      "FOUR_SEATER_AC", "FOUR_SEATER_DELUXE", "FOUR_SEATER_NORMAL"
    ]
    
    if (!validRoomTypes.includes(newRoom.roomType)) {
      toast({
        title: "Invalid Room Type",
        description: "Please select a valid room type",
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
      return
    }

    try {
      setIsCreatingRoom(true)
      
      // Get admin token for authentication
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to create rooms",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      // Create room data object
      const roomData = {
        roomNumber: newRoom.roomNumber,
        roomType: newRoom.roomType,
        pricePerNight: Number.parseInt(newRoom.pricePerNight),
        capacity: Number.parseInt(newRoom.capacity),
        description: newRoom.description || '',
        amenities: newRoom.amenities || ''
      }

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('roomData', JSON.stringify(roomData))
      
      // Append all images to FormData
      newRoom.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('image', image)
        }
      })

      // Make API call to create room
      const response = await fetch('http://localhost:8080/admin/room/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create room')
      }

      const createdRoom = await response.json()
      console.log("Room created successfully:", createdRoom)
      console.log("Created room images:", createdRoom.images)
      console.log("Created room structure:", JSON.stringify(createdRoom, null, 2))

      // Check if the response status is 201 (CREATED)
      if (response.status === 201) {
        // Refresh the rooms list to get the updated data from the server
        await fetchRooms()
        
        // Reset form
        setNewRoom({
          roomNumber: "",
          roomType: "",
          pricePerNight: "",
          capacity: "",
          description: "",
          amenities: "",
          images: [] as File[],
        })
        setIsCreateDialogOpen(false)
        
        // Show green success toast for CREATED status
        toast({
          title: "Room Created Successfully!",
          description: "New room has been added to the system",
          variant: "default",
          duration: 5000,
          className: "bg-green-500 border-green-200 text-white text-sm",
        })
      } else {
        // Handle other success statuses (200, etc.)
        await fetchRooms()
        setNewRoom({
          roomNumber: "",
          roomType: "",
          pricePerNight: "",
          capacity: "",
          description: "",
          amenities: "",
          images: [] as File[],
        })
        setIsCreateDialogOpen(false)
        toast({
          title: "Room Created!",
          description: "Room has been created successfully",
          variant: "default",
          duration: 5000,
          className: "text-sm",
        })
      }
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Creation Failed",
        description: `Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleUpdateRoom = async () => {
    if (!editingRoom) return

    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to update rooms",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      // Create room data object
      const roomData = {
        roomNumber: editingRoom.roomNumber,
        roomType: editingRoom.roomType,
        pricePerNight: editingRoom.pricePerNight,
        capacity: editingRoom.capacity,
        description: editingRoom.description || '',
        amenities: Array.isArray(editingRoom.amenities) ? editingRoom.amenities.join(',') : editingRoom.amenities || ''
      }

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('roomData', JSON.stringify(roomData))
      
      // Append new images to FormData if any
      editingRoomNewImages.forEach((image, index) => {
        formData.append('image', image)
      })
      
      // Make API call to update room
      const response = await fetch(`http://localhost:8080/admin/room/update/${editingRoom.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update room')
      }

      const updatedRoom = await response.json()
      console.log("Room updated successfully:", updatedRoom)

      // Refresh the rooms list to get the updated data from the server
      await fetchRooms()
      
      setEditingRoom(null)
      setEditingRoomNewImages([])
      toast({
        title: "Room Updated Successfully!",
        description: "Room has been updated in the system",
        variant: "default",
        duration: 5000,
        className: "bg-green-500 border-green-200 text-white text-sm",
      })
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update room: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    }
  }

  const handleDeleteRoom = (roomId: string | number, roomType?: string) => {
    setItemToDelete({ 
      type: 'room', 
      id: roomId, 
      name: roomType || 'this room' 
    })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to perform this action",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      if (itemToDelete.type === 'room') {
        const response = await fetch(`http://localhost:8080/admin/room/delete/${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to delete room: ${response.status}`)
        }

        await fetchRooms()
        toast({
          title: "Room Deleted!",
          description: "Room has been deleted successfully",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
      } else if (itemToDelete.type === 'booking') {
        // Call the backend API to update booking status to DELETED
        console.log('Making API call to delete booking:', {
          bookingId: itemToDelete.id,
          bookingStatus: "DELETED",
          adminToken: adminToken ? 'Present' : 'Missing'
        })

        let response
        try {
          response = await fetch(`http://localhost:8080/admin/room/booking/update/${itemToDelete.id}?bookingStatus=DELETED`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            }
          })
        } catch (fetchError) {
          console.error('Network error during fetch:', fetchError)
          throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
        }

        console.log('API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error response:', errorText)
          throw new Error(`Failed to delete booking: ${response.status} - ${errorText}`)
        }

        // Parse response as text (since backend returns plain string)
        const responseData = await response.text()
        console.log('API Response data:', responseData)

        // Update local state after successful API call - mark as deleted instead of removing
        const updatedBookings = bookings.map((booking) =>
          booking.id === itemToDelete.id ? { ...booking, bookingStatus: "DELETED" } : booking,
        )
        setBookings(updatedBookings)
        toast({
          title: "Booking Deleted!",
          description: "Booking has been marked as deleted",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Deletion Failed",
        description: `Failed to delete ${itemToDelete.type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    } finally {
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  const handleApproveBooking = async (bookingId: string | number) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to perform this action",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      // Call the backend API to update booking status
      console.log('Making API call to update booking status:', {
        bookingId,
        bookingStatus: "APPROVED",
        adminToken: adminToken ? 'Present' : 'Missing'
      })

      let response
      try {
                  response = await fetch(`http://localhost:8080/admin/room/booking/update/${bookingId}?bookingStatus=APPROVED`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        })
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
      }

      console.log('API Response status:', response.status)
      console.log('API Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        throw new Error(`Failed to update booking status: ${response.status} - ${errorText}`)
      }

      // Parse response as text (since backend returns plain string)
      const responseData = await response.text()
      console.log('API Response data:', responseData)

      // Update local state after successful API call
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: "APPROVED" } : booking,
      )
      setBookings(updatedBookings)
      
      toast({
        title: "Booking Approved!",
        description: "Booking has been approved successfully",
        variant: "default",
        duration: 5000,
        className: "text-sm",
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: "Update Failed",
        description: `Failed to approve booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    }
  }

  const handleDeleteBooking = (bookingId: string | number, customerName?: string) => {
    setItemToDelete({ 
      type: 'booking', 
      id: bookingId, 
      name: customerName || 'this booking' 
    })
    setShowDeleteConfirm(true)
  }

  const handleCancelBooking = async (bookingId: string | number) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to perform this action",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      // Call the backend API to update booking status
      console.log('Making API call to cancel booking:', {
        bookingId,
        bookingStatus: "CANCELLED",
        adminToken: adminToken ? 'Present' : 'Missing'
      })

      let response
      try {
        response = await fetch(`http://localhost:8080/admin/room/booking/update/${bookingId}?bookingStatus=CANCELLED`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        })
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
      }

      console.log('API Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        throw new Error(`Failed to update booking status: ${response.status} - ${errorText}`)
      }

      // Parse response as text (since backend returns plain string)
      const responseData = await response.text()
      console.log('API Response data:', responseData)

      // Update local state after successful API call
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: "CANCELLED" } : booking,
      )
      setBookings(updatedBookings)
      
      toast({
        title: "Booking Cancelled!",
        description: "Booking has been cancelled successfully",
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: "Update Failed",
        description: `Failed to cancel booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    }
  }

  const handleCompleteBooking = async (bookingId: string | number) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to perform this action",
          variant: "destructive",
          duration: 5000,
          className: "text-sm",
        })
        router.push("/admin/login")
        return
      }

      // Call the backend API to update booking status
      console.log('Making API call to complete booking:', {
        bookingId,
        bookingStatus: "COMPLETED",
        adminToken: adminToken ? 'Present' : 'Missing'
      })

      let response
      try {
        response = await fetch(`http://localhost:8080/admin/room/booking/update/${bookingId}?bookingStatus=COMPLETED`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          }
        })
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
      }

      console.log('API Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        throw new Error(`Failed to update booking status: ${response.status} - ${errorText}`)
      }

      // Parse response as text (since backend returns plain string)
      const responseData = await response.text()
      console.log('API Response data:', responseData)

      // Update local state after successful API call
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: "COMPLETED" } : booking,
      )
      setBookings(updatedBookings)
      
      toast({
        title: "Booking Completed!",
        description: "Booking has been marked as completed",
        variant: "default",
        duration: 5000,
        className: "text-sm",
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: "Update Failed",
        description: `Failed to complete booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
        className: "text-sm",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
      case "CANCEL":
        return "bg-red-100 text-red-800 border-red-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "DELETED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Filter rooms based on search term
  const filteredRooms = rooms.filter((room) => {
    const roomTypeLabel = roomTypeLabels[room.roomType as keyof typeof roomTypeLabels]
    return roomTypeLabel.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = bookingSearchTerm.toLowerCase()
    const matchesSearch = (
      (booking.id?.toString() || '').toLowerCase().includes(searchLower) ||
      booking.customerName.toLowerCase().includes(searchLower) ||
      booking.customerEmail.toLowerCase().includes(searchLower)
    )
    
    // Apply status filter
    const matchesStatus = bookingStatusFilter === "ALL" || 
      booking.bookingStatus?.toUpperCase() === bookingStatusFilter.toUpperCase()
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    // Sort bookings by check-in date priority: today > tomorrow > future > past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const aCheckIn = new Date(a.checkInDate)
    aCheckIn.setHours(0, 0, 0, 0)
    
    const bCheckIn = new Date(b.checkInDate)
    bCheckIn.setHours(0, 0, 0, 0)
    
    // Get priority for each booking
    const getPriority = (date: Date) => {
      if (date.getTime() === today.getTime()) return 1 // Today
      if (date.getTime() === tomorrow.getTime()) return 2 // Tomorrow
      if (date > today) return 3 // Future
      return 4 // Past
    }
    
    const aPriority = getPriority(aCheckIn)
    const bPriority = getPriority(bCheckIn)
    
    // Sort by priority first, then by date within same priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    // Within same priority, sort by date (earliest first)
    return aCheckIn.getTime() - bCheckIn.getTime()
  })

  const getStatusActions = (booking: Booking) => {
    switch (booking.bookingStatus) {
      case "PENDING":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveBooking(booking.id!)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id!)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id!, booking.customerName)}>
              Delete
            </Button>
          </div>
        )
      case "APPROVED":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleCompleteBooking(booking.id!)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Complete
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id!)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id!, booking.customerName)}>
              Delete
            </Button>
          </div>
        )
      case "COMPLETED":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id!, booking.customerName)}>
              Delete
            </Button>
          </div>
        )
      case "DELETED":
        return (
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 italic">No actions available</span>
          </div>
        )
      default:
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveBooking(booking.id!)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id!, booking.customerName)}>
              Delete
            </Button>
          </div>
        )
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }



  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.filter((r) => r.available).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,25,000</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "rooms" ? "default" : "outline"}
            onClick={() => setActiveTab("rooms")}
            className="flex items-center gap-2"
          >
            <BedDouble className="h-4 w-4" />
            Room Management
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Booking Management
          </Button>
        </div>

        {/* Room Management Tab */}
        {activeTab === "rooms" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Room Management</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Room</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="roomNumber">Room Number *</Label>
                        <Input
                          id="roomNumber"
                          type="text"
                          value={newRoom.roomNumber}
                          onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                          placeholder="Enter room number (e.g., 101, A1, etc.)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="roomType">Room Type *</Label>
                          <Select
                            value={newRoom.roomType}
                            onValueChange={(value) => setNewRoom({ ...newRoom, roomType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {roomTypeLabels[type as keyof typeof roomTypeLabels]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacity *</Label>
                          <Input
                            id="capacity"
                            type="number"
                            min="1"
                            max="4"
                            value={newRoom.capacity}
                            onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                            placeholder="Number of guests"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pricePerNight">Price Per Night ($) *</Label>
                        <Input
                          id="pricePerNight"
                          type="number"
                          value={newRoom.pricePerNight}
                          onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                          placeholder="Enter price per night"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newRoom.description}
                          onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                          placeholder="Room description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amenities">Amenities (comma separated)</Label>
                        <Input
                          id="amenities"
                          value={newRoom.amenities}
                          onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                          placeholder="AC, WiFi, TV, Mini Bar"
                        />
                      </div>
                      <ImageUpload
                        images={newRoom.images}
                        onImagesChange={(images) => setNewRoom({ ...newRoom, images })}
                        maxImages={10}
                        label="Room Images"
                        required={true}
                      />
                      <Button 
                        onClick={handleCreateRoom} 
                        className="w-full"
                        disabled={isCreatingRoom}
                      >
                        {isCreatingRoom ? "Creating Room..." : "Create Room"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search by room type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                {searchTerm && (
                  <p className="text-sm text-gray-600 mt-2">
                    Showing {filteredRooms.length} of {rooms.length} rooms
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden h-[600px] flex flex-col">
                    <div className="relative h-64">
                      <ImageSlider images={room.images} roomId={room.id} />
                      <Badge className={`absolute top-2 right-2 z-10 ${room.available ? "bg-green-500" : "bg-red-500"}`}>
                        {room.available ? "Available" : "Occupied"}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <div>
                          <span className="block font-semibold">{roomTypeLabels[room.roomType as keyof typeof roomTypeLabels]}</span>
                          <span className="text-sm text-gray-500">Room #{room.roomNumber}</span>
                        </div>
                        <span className="text-blue-600">${room.pricePerNight}/night</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">Up to {room.capacity} guests</span>
                      </div>
                      <p className="text-gray-600 mb-4 text-sm flex-1">{room.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {room.amenities && Array.isArray(room.amenities) && room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-auto h-10">
                        <Button variant="outline" size="sm" onClick={() => setEditingRoom(room)} className="flex-1 h-8">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id, roomTypeLabels[room.roomType as keyof typeof roomTypeLabels])}
                          className="flex-1 h-8"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Management Tab */}
        {activeTab === "bookings" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Booking Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search by booking ID, name, or email..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  {bookingSearchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookingSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={bookingStatusFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("ALL")}
                  className="text-xs"
                >
                  ALL
                </Button>
                <Button
                  variant={bookingStatusFilter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("PENDING")}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200"
                >
                  Pending
                </Button>
                <Button
                  variant={bookingStatusFilter === "APPROVED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("APPROVED")}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                >
                  Approved
                </Button>
                <Button
                  variant={bookingStatusFilter === "DELETED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("DELETED")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                >
                  Deleted
                </Button>
                <Button
                  variant={bookingStatusFilter === "CANCELLED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("CANCELLED")}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                >
                  Cancelled
                </Button>
                <Button
                  variant={bookingStatusFilter === "COMPLETED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookingStatusFilter("COMPLETED")}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                >
                  Completed
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {bookings.length === 0 ? "No bookings found" : "No bookings match your search"}
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-lg text-gray-900">
                                Booking #{booking.id}
                              </h3>
                              {booking.roomNumber && (
                                <span className="text-sm font-medium text-blue-600">Room No. {booking.roomNumber}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Room ID: {booking.roomId}
                              {booking.roomEntity?.roomType && ` • ${booking.roomEntity.roomType}`}
                            </p>
                            <p className="text-sm text-gray-500">Customer: {booking.customerName}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs px-2 py-1 ${getStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Check-in</p>
                          <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Check-out</p>
                          <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Amount</p>
                          <p className="font-medium text-green-600">${booking.totalPrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📧 {booking.customerEmail}</span>
                          <span>📞 {booking.phoneNumber}</span>
                          <span>👥 {booking.numberOfGuest} guests</span>
                        </div>
                        <div className="flex gap-1">
                          {getStatusActions(booking)}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 italic">"{booking.notes}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Room Dialog */}
        {editingRoom && (
          <Dialog open={!!editingRoom} onOpenChange={(open) => {
            if (!open) {
              setEditingRoom(null)
              setEditingRoomNewImages([])
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editRoomNumber">Room Number</Label>
                  <Input
                    id="editRoomNumber"
                    type="text"
                    value={editingRoom.roomNumber}
                    onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                    placeholder="Enter room number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRoomType">Room Type</Label>
                    <Select
                      value={editingRoom.roomType}
                      onValueChange={(value) => setEditingRoom({ ...editingRoom, roomType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {roomTypeLabels[type as keyof typeof roomTypeLabels]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editCapacity">Capacity</Label>
                    <Input
                      id="editCapacity"
                      type="number"
                      min="1"
                      max="4"
                      value={editingRoom.capacity}
                      onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editPrice">Price Per Night ($)</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    value={editingRoom.pricePerNight}
                    onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingRoom.description}
                    onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editAmenities">Amenities (comma separated)</Label>
                  <Input
                    id="editAmenities"
                    value={Array.isArray(editingRoom.amenities) ? editingRoom.amenities.join(", ") : editingRoom.amenities || ""}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, amenities: e.target.value.split(",").map((a) => a.trim()) })
                    }
                  />
                </div>
                <div>
                  <Label>Current Images</Label>
                  <div className="space-y-2">
                    {editingRoom.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {editingRoom.images.map((image, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Room image ${index + 1}`}
                              width={100}
                              height={80}
                              className="object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
                              onClick={() => removeEditImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {editingRoomNewImages.length > 0 && (
                      <div className="mt-4">
                        <Label>New Images to Upload</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {editingRoomNewImages.map((file, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`New image ${index + 1}`}
                                width={100}
                                height={80}
                                className="object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
                                onClick={() => removeEditNewImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="w-full" />
                    <p className="text-sm text-gray-500">Add more images to the room</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingRoom.available}
                    onChange={(e) => setEditingRoom({ ...editingRoom, available: e.target.checked })}
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>
                <Button onClick={handleUpdateRoom} className="w-full">
                  Update Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Are you sure you want to delete {itemToDelete?.name}?
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone. The {itemToDelete?.type} will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setItemToDelete(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    </div>
  )
}
