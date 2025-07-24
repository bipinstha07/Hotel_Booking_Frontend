function RouterConfig() {
    return (
        <Routes>
            <Route path="/" element={<Header />}>
                <Route index element={<Hero />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="book" element={<BookRoom />} />
                <Route path="amenities" element={<Amenties />} />
            </Route>
        </Routes>
    )
}

export default RouterConfig;