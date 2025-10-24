export default function HotelInfoPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Hotel Information
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Learn more about our hotel, amenities, and services.
                    </p>
                </header>

                <section className="space-y-6">
                    <article>
                        <h2 className="text-2xl font-semibold text-gray-800">About Us</h2>
                        <p className="mt-2 text-gray-600">
                            Welcome to our luxurious hotel, where comfort meets elegance. Our hotel offers
                            top-notch amenities and exceptional service to ensure a memorable stay.
                        </p>
                    </article>

                    <article>
                        <h2 className="text-2xl font-semibold text-gray-800">Amenities</h2>
                        <ul className="mt-2 list-disc list-inside text-gray-600">
                            <li>Free Wi-Fi</li>
                            <li>Swimming Pool</li>
                            <li>Spa & Fitness Center</li>
                            <li>24/7 Room Service</li>
                            <li>Concierge Services</li>
                        </ul>
                    </article>

                    <article>
                        <h2 className="text-2xl font-semibold text-gray-800">Contact Information</h2>
                        <p className="mt-2 text-gray-600">For any inquiries or assistance, please contact our front desk at (123) 456-7890 or email us at</p>
                    </article>
                </section>
            </div>
        </main>
    );
}                        
                     
                            