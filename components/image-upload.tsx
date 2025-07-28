"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  label?: string
  required?: boolean
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Images",
  required = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const remainingSlots = maxImages - images.length
      const filesToAdd = files.slice(0, remainingSlots)
      onImagesChange([...images, ...filesToAdd])
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && "*"}
        </Label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Button */}
      {canAddMore && (
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-2 h-32 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">Click to upload images</span>
            <span className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB each</span>
          </Button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 truncate">{file.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        {required && images.length === 0 && <span className="text-red-500">At least one image is required</span>}
        {!required && images.length === 0 && <span>No images selected</span>}
        {images.length > 0 && (
          <span>
            {images.length} image{images.length !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>
    </div>
  )
}
