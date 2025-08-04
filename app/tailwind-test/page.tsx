export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind CSS Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Colors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Colors</h2>
            <div className="space-y-2">
              <div className="bg-red-500 text-white p-2 rounded">Red Background</div>
              <div className="bg-green-500 text-white p-2 rounded">Green Background</div>
              <div className="bg-blue-500 text-white p-2 rounded">Blue Background</div>
              <div className="bg-yellow-500 text-black p-2 rounded">Yellow Background</div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Extra Small Text</p>
              <p className="text-sm text-gray-600">Small Text</p>
              <p className="text-base text-gray-800">Base Text</p>
              <p className="text-lg text-gray-800">Large Text</p>
              <p className="text-xl font-bold text-gray-900">Extra Large Bold</p>
            </div>
          </div>

          {/* Spacing */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spacing</h2>
            <div className="space-y-4">
              <div className="bg-gray-200 p-2">Padding 2</div>
              <div className="bg-gray-200 p-4">Padding 4</div>
              <div className="bg-gray-200 p-6">Padding 6</div>
              <div className="bg-gray-200 p-8">Padding 8</div>
            </div>
          </div>

          {/* Flexbox */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Flexbox</h2>
            <div className="flex space-x-2">
              <div className="bg-blue-500 text-white px-3 py-1 rounded">Item 1</div>
              <div className="bg-green-500 text-white px-3 py-1 rounded">Item 2</div>
              <div className="bg-red-500 text-white px-3 py-1 rounded">Item 3</div>
            </div>
          </div>

          {/* Grid */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Grid</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-500 text-white p-2 rounded text-center">1</div>
              <div className="bg-purple-500 text-white p-2 rounded text-center">2</div>
              <div className="bg-purple-500 text-white p-2 rounded text-center">3</div>
              <div className="bg-purple-500 text-white p-2 rounded text-center">4</div>
            </div>
          </div>

          {/* Responsive */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Responsive</h2>
            <div className="text-sm md:text-base lg:text-lg">
              <p className="text-red-500 md:text-blue-500 lg:text-green-500">
                This text changes color on different screen sizes
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tailwind Status</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-700">Tailwind CSS is working!</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700">Colors are applied correctly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700">Spacing and layout work</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 