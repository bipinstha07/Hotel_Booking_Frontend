"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, DollarSign, Filter, Eye, Check, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Booking {
  id: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  roomId: number
  roomType: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  bookingCreated: string
  notes?: string
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    // Mock bookings data
    const mockBookings: Booking[] = [
      {
        id: 1,
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "9876543210",
        roomId: 1,
        roomType: "SINGLE_AC",
        checkInDate: "2024-02-15",
        checkOutDate: "2024-02-18",
        totalPrice: 7500,
        status: "PENDING",
        bookingCreated: "2024-02-01T10:30:00",
        notes: "Early check-in requested",
      },
      {
        id: 2,
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "9876543211",
        roomId: 2,
        roomType: "DOUBLE_DELUXE",
        checkInDate: "2024-02-20",
        checkOutDate: "2024-02-23",
        totalPrice: 13500,
        status: "CONFIRMED",
        bookingCreated: "2024-02-05T14:20:00",
      },
      {
        id: 3,
        customerName: "Mike Johnson",
        customerEmail: "mike@example.com",
        roomId: 1,
        roomType: "SINGLE_AC",
        checkInDate: "2024-01-10",
        checkOutDate: "2024-01-12",
        totalPrice: 5000,
        status: "COMPLETED",
        bookingCreated: "2024-01-01T09:15:00",
      },
      {
        id: 4,
        customerName: "Sarah Wilson",
        customerEmail: "sarah@example.com",
        customerPhone: "9876543212",
        roomId: 2,
        roomType: "DOUBLE_DELUXE",
        checkInDate: "2024-02-25",
        checkOutDate: "2024-02-28",
        totalPrice: 13500,
        status: "PENDING",
        bookingCreated: "2024-02-10T16:45:00",
        notes: "Anniversary celebration",
      },
      {
        id: 5,
        customerName: "Robert Brown",
        customerEmail: "robert@example.com",
        roomId: 3,
        roomType: "FOUR_SEATER_AC",
        checkInDate: "2024-03-01",
        checkOutDate: "2024-03-05",
        totalPrice: 26000,
        status: "CANCELLED",
        bookingCreated: "2024-02-15T11:20:00",
        notes: "Cancelled due to emergency",
      },
    ]
    setBookings(mockBookings)
    setFilteredBookings(mockBookings)
  }, [router])

  // Filter bookings based on status and search term
  useEffect(() => {
    let filtered = bookings

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toString().includes(searchTerm),
      )
    }

    setFilteredBookings(filtered)
  }, [bookings, statusFilter, searchTerm])

  const handleApproveBooking = async (bookingId: number) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "CONFIRMED" as const } : booking,
    )
    setBookings(updatedBookings)
    alert("Booking approved successfully!")
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter((booking) => booking.id !== bookingId))
      alert("Booking deleted successfully!")
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "CANCELLED" as const } : booking,
    )
    setBookings(updatedBookings)
    alert("Booking cancelled successfully!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "CONFIRMED":
        return "bg-green-500"
      case "CANCELLED":
        return "bg-red-500"
      case "COMPLETED":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusActions = (booking: Booking) => {
    switch (booking.status) {
      case "PENDING":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveBooking(booking.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )
      case "CONFIRMED":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )
      default:
        return (
          <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )
    }
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setSearchTerm("")
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <h2 className="text-lg font-semibold text-gray-700">Booking Management</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("adminToken")
                  router.push("/admin/login")
                }}
              >
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
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, email, or booking ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                  Clear Filters
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found matching your criteria</p>
                  <Button onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {roomTypeLabels[booking.roomType as keyof typeof roomTypeLabels]}
                          </h3>
                          <p className="text-sm text-gray-600">Booking ID: #{booking.id}</p>
                          <p className="text-sm text-gray-600">Customer: {booking.customerName}</p>
                          <p className="text-sm text-gray-600">Email: {booking.customerEmail}</p>
                          {booking.customerPhone && (
                            <p className="text-sm text-gray-600">Phone: {booking.customerPhone}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Booking Details - #{booking.id}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Customer Name</Label>
                                    <p>{booking.customerName}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Email</Label>
                                    <p>{booking.customerEmail}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Phone</Label>
                                    <p>{booking.customerPhone || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Room Type</Label>
                                    <p>{roomTypeLabels[booking.roomType as keyof typeof roomTypeLabels]}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Check-in Date</Label>
                                    <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Check-out Date</Label>
                                    <p>{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Total Amount</Label>
                                    <p className="text-green-600 font-semibold">₹{booking.totalPrice}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Booking Date</Label>
                                    <p>{new Date(booking.bookingCreated).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {booking.notes && (
                                  <div>
                                    <Label className="font-medium">Customer Notes</Label>
                                    <p className="bg-gray-50 p-3 rounded">{booking.notes}</p>
                                  </div>
                                )}
                                <div>
                                  <Label className="font-medium">Admin Notes</Label>
                                  <Textarea
                                    placeholder="Add admin notes..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Booked On</Label>
                          <p className="font-medium">{new Date(booking.bookingCreated).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-500">Customer Notes</Label>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{booking.status}</span>
                        </p>
                        {getStatusActions(booking)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
