function Hero() {
    return (
        <div className="relative h-screen">
            {/* Hero Background */}
            <div className="absolute inset-0">
                <img 
                    src="/public/image1.jpg" 
                    alt="Luxury Hotel Exterior"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>
            
            {/* Hero Content */}
            <div className="relative max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                    Experience Luxury & Comfort
                </h1>
                <p className="text-xl text-white mb-8 max-w-2xl">
                    Welcome to Private Hotel, where exceptional service meets unparalleled comfort. Discover your perfect stay with us.
                </p>
                <a
                    href="#book"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition duration-300"
                >
                    Book Your Stay
                </a>
            </div>
        </div>
    )
}

export default Hero;