import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Shield, 
  BarChart3, 
  Truck, 
  Check, 
  Route, 
  Settings, 
  Navigation, 
  Map, 
  Package, 
  CalendarClock,
  Sparkles
} from "lucide-react";
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      {/* Hero Section with Abstract Transport Graphics */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-100">
        {/* Decorative SVG elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-20 left-10 text-blue-500">
            <Truck size={120} strokeWidth={1} />
          </div>
          <div className="absolute top-40 right-20 text-cyan-600">
            <Map size={100} strokeWidth={1} />
          </div>
          <div className="absolute bottom-20 left-1/4 text-orange-500">
            <Route size={80} strokeWidth={1} />
          </div>
          <div className="absolute top-1/3 right-1/3 text-green-500">
            <Navigation size={90} strokeWidth={1} />
          </div>
          <div className="absolute bottom-40 right-1/4 text-indigo-500">
            <Package size={70} strokeWidth={1} />
          </div>
          <div className="absolute top-2/3 left-1/3 text-rose-500">
            <CalendarClock size={60} strokeWidth={1} />
          </div>
        </div>

        {/* Animated paths representing routes */}
        <svg className="absolute inset-0 w-full h-full z-0 opacity-5" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,100 Q250,0 500,100 T1000,100"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
          <path
            d="M0,200 Q250,300 500,200 T1000,200"
            fill="none"
            stroke="#0e7490"
            strokeWidth="4"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
          <path
            d="M0,300 Q250,200 500,300 T1000,300"
            fill="none"
            stroke="#0891b2"
            strokeWidth="4"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
          <path
            d="M0,400 Q250,500 500,400 T1000,400"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
          <path
            d="M0,500 Q250,400 500,500 T1000,500"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="4"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
        </svg>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-32 text-black">
          <div className="max-w-3xl">
            <div className="flex items-center mb-6 text-cyan-600">
              <Sparkles className="mr-2" />
              <span className="font-semibold tracking-wide">NEXT-GENERATION TRUCKING PLATFORM</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Smart Fleet Management for Modern Logistics
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Streamline your operations with real-time tracking, route optimization, and comprehensive fleet management tools.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link href="/map">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50" asChild>
                <Link href="/doc">Documentation</Link>
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="bg-cyan-100 p-2 rounded-full text-cyan-600 mr-3">
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-medium">Real-time Tracking</span>
              </div>
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mr-3">
                  <Route size={18} />
                </div>
                <span className="text-sm font-medium">Route Optimization</span>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                  <Clock size={18} />
                </div>
                <span className="text-sm font-medium">ELD Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Everything you need to manage your fleet
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Route Optimization"
              description="Plan the most efficient routes with real-time traffic updates and road conditions."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="ELD Compliance"
              description="Stay compliant with automatic hours of service tracking and electronic logging."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Safety Management"
              description="Monitor driver behavior and maintain safety standards across your fleet."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Analytics"
              description="Get insights into fleet performance, fuel efficiency, and maintenance needs."
            />
          </div>
        </div>
      </section>

      {/* Step-by-Step Tracking Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            How We Track Your Fleet
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Step Cards */}
            <div className="space-y-10 mt-20">
              <StepCard
                step={1}
                icon={<Truck className="h-6 w-6" />}
                title="Real-Time Location Tracking"
                description="Track your fleet in real-time with GPS-enabled devices."
              />
              <StepCard
                step={2}
                icon={<Route className="h-6 w-6" />}
                title="Route Optimization"
                description="Optimize routes based on traffic, weather, and road conditions."
              />
              <StepCard
                step={3}
                icon={<Check className="h-6 w-6" />}
                title="Compliance & Safety"
                description="Ensure compliance with ELD regulations and monitor driver safety."
              />
              <StepCard
                step={4}
                icon={<Settings className="h-6 w-6" />}
                title="Advanced Analytics"
                description="Gain insights into fleet performance, fuel efficiency, and maintenance needs."
              />
            </div>

            {/* Image */}
            <div className="rounded-lg overflow-hidden flex justify-center items-center">
              <img
                src="https://freepngimg.com/download/machine/67105-map-material-tracking-icon-route-global-positioning.png"
                alt="Map"
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ComparisonCard
              title="Competitor A"
              features={["Basic Tracking", "Limited Support", "No ELD Compliance"]}
            />
            <ComparisonCard
              title="Competitor B"
              features={["Advanced Tracking", "Email Support", "Partial ELD Compliance"]}
            />
            <ComparisonCard
              title="TruckFlow"
              features={["Real-Time Tracking", "24/7 Support", "Full ELD Compliance", "Route Optimization"]}
              isHighlighted
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to optimize your fleet operations?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust TruckFlow for their logistics management needs.
          </p>
          <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 text-cyan-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({
  step,
  icon,
  title,
  description
}: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-600 text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function ComparisonCard({
  title,
  features,
  isHighlighted = false
}: {
  title: string
  features: string[]
  isHighlighted?: boolean
}) {
  return (
    <div className={`p-6 rounded-lg border ${isHighlighted ? "bg-cyan-50 border-cyan-600" : "bg-white"}`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-600 flex items-center gap-2">
            <Check className="h-4 w-4 text-cyan-600" /> {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}