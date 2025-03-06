import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield, BarChart3, Truck, Check, Route, Users, Settings, Phone, Mail, Map } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer/footer";
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        {/* <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('https://d2qt0ksb47ks9g.cloudfront.net/new-uploads/Activities/1741287724894_pngimg.com%20-%20truck_PNG16226.png')",
            filter: "brightness(0.4)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        /> */}
        <div className="relative z-10 container mx-auto px-4 py-32 text-black">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Smart Fleet Management for Modern Logistics
            </h1>
            <p className="text-xl mb-8 text-gray-500">
              Streamline your operations with real-time tracking, route optimization, and comprehensive fleet management tools.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="orange" className="bg-orange-600 hover:bg-orange-700" asChild>
                <Link href="/demo">Request Demo</Link>
              </Button>
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
<Footer/>
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