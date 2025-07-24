function Amenties() {
  const amenities = [
    {
      title: 'Guest Activities',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Leisure Services',
      img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Recreational Facilities',
      img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Entertainment Options',
      img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Value-added Services',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-10 text-center">Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {amenities.map((item) => (
            <div key={item.title} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
              <div className="relative">
                <img src={item.img} alt={item.title} className="w-full h-68 object-cover" />
                <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 py-2">
                  <h3 className="text-lg font-bold text-white text-center drop-shadow">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Amenties;