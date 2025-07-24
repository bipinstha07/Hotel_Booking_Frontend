function Rooms() {
    return (
        <div>
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Deluxe Room Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img 
                            src="/public/image2.jpg" 
                            alt="Deluxe Room"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Deluxe Room</h3>
                            <p className="text-gray-600 mb-4">Spacious room with modern amenities and city view</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-blue-600">$299/night</span>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Suite Room Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img 
                            src="/public/image6.jpg" 
                            alt="Suite Room"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Suite Room</h3>
                            <p className="text-gray-600 mb-4">Luxury suite with separate living area and ocean view</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-blue-600">$499/night</span>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Executive Room Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img 
                            src="/public/image5.jpg" 
                            alt="Executive Room"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Executive Room</h3>
                            <p className="text-gray-600 mb-4">Premium room with executive lounge access</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-blue-600">$399/night</span>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Rooms;