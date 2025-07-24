import React, { useState } from 'react';

const roomData = [
  {
    id: 1,
    roomType: 'Deluxe Suite',
    price: 350,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    desc: 'Spacious suite with ocean view, king bed, and luxury amenities.'
  },
  {
    id: 2,
    roomType: 'Executive Room',
    price: 220,
    img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80',
    desc: 'Modern executive room with workspace and city view.'
  },
  {
    id: 3,
    roomType: 'Family Room',
    price: 180,
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    desc: 'Comfortable room for families, two queen beds, and play area.'
  },
  {
    id: 4,
    roomType: 'Standard Room',
    price: 120,
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    desc: 'Cozy room with all essentials for a pleasant stay.'
  },
];

const roomTypes = ['All', 'Deluxe Suite', 'Executive Room', 'Family Room', 'Standard Room'];

function BookRoom() {
  const [price, setPrice] = useState('');
  const [type, setType] = useState('All');

  const filteredRooms = roomData.filter(room => {
    const matchesType = type === 'All' || room.roomType === type;
    const matchesPrice = !price || room.price <= Number(price);
    return matchesType && matchesPrice;
  });

  return (
    <div className="flex min-h-[70vh] bg-gray-50">
      {/* Filter/Search Bar */}
      <aside className="w-1/5 min-w-[220px] bg-white p-6 border-r border-gray-200 flex flex-col gap-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Search Rooms</h2>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Max Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Any"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Room Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {roomTypes.map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
      </aside>
      {/* Rooms Grid */}
      <main className="w-4/5 p-8">
        <div className="flex flex-wrap gap-8">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className="w-[40%] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col mb-8"
            >
              <img src={room.img} alt={room.roomType} className="h-48 w-full object-cover" />
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-blue-700 mb-2">{room.roomType}</h3>
                <p className="text-gray-600 mb-4 flex-1">{room.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-semibold text-gray-800">${room.price}/night</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">Book Now</button>
                </div>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="text-gray-500 text-lg">No rooms match your criteria.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BookRoom;