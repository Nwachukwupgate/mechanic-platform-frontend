import { Link } from 'react-router-dom'
import { Wrench, MapPin, Clock, Star } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Find Trusted Mechanics Near You</h1>
          <p className="text-xl mb-8">Connect with skilled mechanics for all your vehicle repair needs</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
            >
              Get Started
            </Link>
            <Link
              to="/for-mechanics"
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600"
            >
              For Mechanics
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register Your Vehicle</h3>
              <p className="text-gray-600">Add your vehicle details and describe the issue</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Nearby Mechanics</h3>
              <p className="text-gray-600">Browse mechanics based on location and expertise</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Vehicle Fixed</h3>
              <p className="text-gray-600">Chat with mechanics, track progress, and pay securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <MapPin className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Location-Based</h3>
              <p className="text-gray-600 text-sm">Find mechanics near your location</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Star className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Verified Mechanics</h3>
              <p className="text-gray-600 text-sm">All mechanics are verified and rated</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Clock className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600 text-sm">Track your job status in real-time</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Wrench className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Expert Service</h3>
              <p className="text-gray-600 text-sm">Skilled mechanics for all vehicle types</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers</p>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  )
}
