import React from 'react'
import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-xl font-bold mb-4">TruckFlow</h3>
        <p className="text-gray-400">
          Empowering modern logistics with smart fleet management solutions.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><Link href="/about" className="text-gray-400 hover:text-cyan-600">About Us</Link></li>
          <li><Link href="/careers" className="text-gray-400 hover:text-cyan-600">Careers</Link></li>
          <li><Link href="/contact" className="text-gray-400 hover:text-cyan-600">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
        <ul className="space-y-2">
          <li className="text-gray-400 flex items-center gap-2">
            <Phone className="h-4 w-4" /> +1 (800) 123-4567
          </li>
          <li className="text-gray-400 flex items-center gap-2">
            <Mail className="h-4 w-4" /> support@truckflow.com
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">Follow Us</h3>
        <div className="flex gap-4">
          <Link href="#" className="text-gray-400 hover:text-cyan-600">Facebook</Link>
          <Link href="#" className="text-gray-400 hover:text-cyan-600">Twitter</Link>
          <Link href="#" className="text-gray-400 hover:text-cyan-600">LinkedIn</Link>
        </div>
      </div>
    </div>
  </footer>
  )
}

export default Footer