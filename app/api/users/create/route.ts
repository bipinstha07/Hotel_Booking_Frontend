import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Get the userDto and image from the form data
    const userDto = formData.get('userDto') as string
    const image = formData.get('image') as File | null

    // Create new FormData for the backend API
    const backendFormData = new FormData()
    backendFormData.append('userDto', userDto)
    
    if (image) {
      backendFormData.append('image', image)
    }

    // Make request to your backend API
    // You can set BACKEND_API_URL environment variable or update this URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/user/create`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: errorData.message || 'Registration failed' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    return NextResponse.json(userData, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 