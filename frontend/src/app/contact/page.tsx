"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Briefcase, Github, Globe, Coffee } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const personalInfo = {
    name: "Kanha",
    email: "truckFlow@gmail.com",
    phone: "+91 6203167922",
    github: "https://github.com/kuldeep55567",
    portfolio: "https://kuldeept.medium.com/",
    hobbies: ["Travelling", "Development", "Reading"],
    company: "TruckFlow",
    location: "India",
    bio: "TruckFlow is a logistics company that provides a platform for truck drivers to connect with shippers. We are a team of passionate individuals who are dedicated to making the trucking industry more efficient and sustainable."
  }

interface FormData {
    name: string;
    email: string;
    message: string;
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const formData: FormData = { name, email, message }
    console.log(formData)
    // Here you would normally send the form data to your backend
    setSubmitted(true)
    // Reset form after submission
    setTimeout(() => {
        setName('')
        setEmail('')
        setMessage('')
        setSubmitted(false)
    }, 3000)
}

return (
  <div className="max-w-6xl mx-auto py-12 px-4 md:px-6">
    <h1 className="text-4xl font-bold text-center mb-12 text-orange-600">Get In Touch</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Personal Info Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-500">Contact Information</CardTitle>
          <CardDescription>Feel free to reach out through any of these channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-indigo-600" />
              <a href={`mailto:${personalInfo.email}`} className="hover:text-indigo-600 transition-colors">
                {personalInfo.email}
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-indigo-600" />
              <a href={`tel:${personalInfo.phone}`} className="hover:text-indigo-600 transition-colors">
                {personalInfo.phone}
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Github className="w-5 h-5 text-indigo-600" />
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                GitHub Profile
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-indigo-600" />
              <a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                Portfolio Website
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>{personalInfo.company}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>{personalInfo.location}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Coffee className="w-5 h-5 text-indigo-600" />
              <span>Hobbies: {personalInfo.hobbies.join(", ")}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">About Me</h3>
            <p className="text-muted-foreground">{personalInfo.bio}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Contact Form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-500">Send Me a Message</CardTitle>
          <CardDescription>I will get back to you as soon as possible</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <Textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                rows={6}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button">Cancel</Button>
          <Button 
            onClick={() => document.getElementById('contact-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            disabled={submitted}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {submitted ? "Message Sent!" : "Send Message"}
          </Button>
        </CardFooter>
      </Card>
    </div>
    
    {/* Map or Additional Details Section */}
    <div className="bg-muted rounded-xl p-8 shadow-inner">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect with me on socials</h2>
      <div className="flex justify-center space-x-6">
        <SocialButton icon={<Github className="w-5 h-5" />} label="GitHub" href={personalInfo.github} />
        <SocialButton icon={<Globe className="w-5 h-5" />} label="Portfolio" href={personalInfo.portfolio} />
        <SocialButton icon={<Mail className="w-5 h-5" />} label="Email" href={`mailto:${personalInfo.email}`} />
      </div>
    </div>
  </div>
)
}

// Helper component for social buttons
interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function SocialButton({ icon, label, href }: SocialButtonProps) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" className="flex items-center space-x-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  )
}