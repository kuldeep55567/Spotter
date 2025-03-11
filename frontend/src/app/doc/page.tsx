"use client"

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MapPin, Clock, Route, Truck, FileText, Server, Zap, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <div className="flex flex-col space-y-4 mb-8">
                <h1 className="text-4xl font-bold">TruckFlow Documentation</h1>
                <p className="text-xl text-muted-foreground">
                    Complete guide to using TruckFlow for optimized trucking operations
                </p>
            </div>

            <Alert className="mb-8 border-blue-500 bg-blue-50 dark:bg-blue-950">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">Testing Credentials</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Use <strong>admin@gmail.com</strong> and password <strong>Admin@123</strong> to test the platform's functionality.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                    <TabsTrigger value="eld-logs">ELD Logs</TabsTrigger>
                    <TabsTrigger value="route-planning">Route Planning</TabsTrigger>
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">TruckFlow Platform Overview</CardTitle>
                            <CardDescription>
                                A comprehensive solution for truck drivers and fleet managers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FeatureCard
                                    icon={<Route className="h-10 w-10 text-indigo-500" />}
                                    title="Intelligent Route Planning"
                                    description="Optimize your routes with real-time traffic data and ELD compliance built-in"
                                />
                                <FeatureCard
                                    icon={<FileText className="h-10 w-10 text-green-500" />}
                                    title="Automated ELD Logs"
                                    description="Automatically generated electronic logging device sheets that comply with regulations"
                                />
                                <FeatureCard
                                    icon={<MapPin className="h-10 w-10 text-red-500" />}
                                    title="Rest Stop & Fuel Planning"
                                    description="Find optimal locations for rest breaks and refueling along your journey"
                                />
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-semibold mb-4">Technology Stack</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <TechCard title="Frontend" tech="Next.js & React" description="Modern UI with server components" />
                                    <TechCard title="Backend" tech="Django" description="Robust API and business logic" />
                                    <TechCard title="Maps" tech="Mapbox API" description="High-quality maps and routing" />
                                    <TechCard title="Hosting" tech="AWS & Vercel" description="Reliable cloud infrastructure" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Business Requirements</CardTitle>
                            <CardDescription>
                                Key features and functionality for trucking operations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-600 text-sm font-bold">✓</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Hours of Service Compliance</span>
                                        <p className="text-muted-foreground">Property-carrying driver, 70hrs/8days, no adverse driving conditions</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-600 text-sm font-bold">✓</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Fuel Planning</span>
                                        <p className="text-muted-foreground">Automatic fueling stops at least once every 1,000 miles</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-600 text-sm font-bold">✓</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Accurate Time Estimations</span>
                                        <p className="text-muted-foreground">1 hour for pickup and drop-off operations built into schedule</p>
                                    </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Getting Started Tab */}
                <TabsContent value="getting-started" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Getting Started with TruckFlow</CardTitle>
                            <CardDescription>
                                Quick guide to using the TruckFlow platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">1. Create an Account</h3>
                                <p>Sign up with your email or use our demo account:</p>
                                <div className="bg-muted p-4 rounded-md">
                                    <code>Email: admin@gmail.com</code><br />
                                    <code>Password: login</code>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-xl font-semibold">2. Set Up Your First Trip</h3>
                                <ol className="list-decimal pl-6 space-y-3">
                                    <li>Navigate to the <strong>Route Planning</strong> section</li>
                                    <li>Enter your current location, pickup point, and delivery destination</li>
                                    <li>Input your current hours used in your cycle</li>
                                    <li>Click on <strong>Generate Route</strong> to create your optimal path</li>
                                </ol>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-xl font-semibold">3. Understanding Your Results</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Map View</h4>
                                        <p>Interactive map displaying your route with:</p>
                                        <ul className="list-disc pl-6">
                                            <li>Required rest stops</li>
                                            <li>Fueling locations</li>
                                            <li>Estimated arrival times</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">ELD Logs</h4>
                                        <p>Automatically generated logs showing:</p>
                                        <ul className="list-disc pl-6">
                                            <li>Driving periods</li>
                                            <li>Off-duty time</li>
                                            <li>Required breaks</li>
                                            <li>Compliant with FMCSA regulations</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ELD Logs Tab */}
                <TabsContent value="eld-logs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Electronic Logging Device (ELD) System</CardTitle>
                            <CardDescription>
                                Automatically generate compliant driver logs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">ELD Log Generation</h3>
                                <p>
                                    TruckFlow automatically creates ELD logs based on your planned route. The system accounts for:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Maximum 11 hours of driving time per day</li>
                                    <li>Required 10-hour rest periods</li>
                                    <li>30-minute breaks after 8 hours of driving</li>
                                    <li>70-hour limit in 8 consecutive days</li>
                                </ul>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Sample ELD Log</h4>
                                <div className="h-60 bg-white rounded border overflow-hidden relative">
                                    {/* This would be replaced with an actual ELD log visualization */}
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        ELD Log Visualization
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t mt-4">
                                <h3 className="text-xl font-semibold">Log Management</h3>
                                <p>
                                    All generated logs are stored in your account and can be:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-bold">→</span>
                                        </div>
                                        <span>Downloaded as PDF</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-bold">→</span>
                                        </div>
                                        <span>Printed for physical records</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-bold">→</span>
                                        </div>
                                        <span>Shared with dispatchers</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-bold">→</span>
                                        </div>
                                        <span>Exported to fleet management systems</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Route Planning Tab */}
                <TabsContent value="route-planning" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Advanced Route Planning</CardTitle>
                            <CardDescription>
                                Optimize your journeys with intelligent routing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Map Interface</h3>
                                <p>
                                    TruckFlow uses the Mapbox API to provide high-quality maps with truck-specific routing options.
                                </p>
                                <div className="mt-4 aspect-video rounded-lg bg-slate-100 flex items-center justify-center border">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                                        <p>Interactive Route Map Visualization</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Route Inputs</h3>
                                    <div className="space-y-2">
                                        <InputExample label="Current Location" placeholder="Seattle, WA" />
                                        <InputExample label="Pickup Location" placeholder="Portland, OR" />
                                        <InputExample label="Dropoff Location" placeholder="San Francisco, CA" />
                                        <InputExample label="Current Cycle Used (Hrs)" placeholder="12" type="number" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Route Outputs</h3>
                                    <ul className="space-y-3">
                                        <li className="p-3 bg-muted rounded-md flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Optimal Route with Traffic</span>
                                                <p className="text-sm text-muted-foreground">Real-time traffic consideration with frequent updates</p>
                                            </div>
                                        </li>
                                        <li className="p-3 bg-muted rounded-md flex items-start space-x-3">
                                            <Clock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Required Rest Periods</span>
                                                <p className="text-sm text-muted-foreground">Strategic rest locations with amenities information</p>
                                            </div>
                                        </li>
                                        <li className="p-3 bg-muted rounded-md flex items-start space-x-3">
                                            <Truck className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Fueling Recommendations</span>
                                                <p className="text-sm text-muted-foreground">Optimal fuel stops with pricing when available</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Tab */}
                <TabsContent value="api" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">TruckFlow API</CardTitle>
                            <CardDescription>
                                Integrate TruckFlow's capabilities into your own systems
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">REST API Endpoints</h3>
                                <p>TruckFlow provides a comprehensive API for integration with your existing systems.</p>

                                <div className="rounded-md border">
                                    <div className="bg-muted p-4 rounded-t-md font-mono text-sm flex items-center">
                                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-3">GET</span>
                                        <span>/api/user/:user_id/trips</span>
                                    </div>
                                    <div className="p-4 text-sm">
                                        <p className="mb-2">Get all routes for the authenticated user</p>
                                        <div className="text-muted-foreground">
                                            Returns a list of route objects with their associated logs and stops
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-md border">
                                    <div className="bg-muted p-4 rounded-t-md font-mono text-sm flex items-center">
                                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-3">POST</span>
                                        <span>/api/signup</span>
                                    </div>
                                    <div className="p-4 text-sm">
                                        <p className="mb-2">Create a user  </p>
                                        <div className="text-muted-foreground mb-4">
                                            Required fields: name, email, username, password
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-md font-mono text-xs">
                                            {`{
  "name": "Kuldeep",
  "email": "kuldeep@gmail.com",
  "username": "kuldeep",
  "password": "kuldeep@43
}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t mt-4">
                                <h3 className="text-xl font-semibold">API Authentication</h3>
                                <p>
                                    TruckFlow API uses JWT token authentication. Obtain your token through:
                                </p>
                                <div className="rounded-md border">
                                    <div className="bg-muted p-4 rounded-t-md font-mono text-sm flex items-center">
                                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs mr-3">POST</span>
                                        <span>/api/login</span>
                                    </div>
                                    <div className="p-4 text-sm">
                                        <div className="bg-slate-50 p-3 rounded-md font-mono text-xs mb-4">
                                            {`{
  "email": "your-email@example.com",
  "password": "your-password"
}`}
                                        </div>
                                        <div className="text-muted-foreground">
                                            Include the token in all subsequent requests using the Authorization header:
                                            <div className="bg-slate-50 p-2 rounded-md font-mono text-xs mt-2">
                                                Authorization: Bearer {`{your_token}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Deployment Tab */}
                <TabsContent value="deployment" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Deployment Architecture</CardTitle>
                            <CardDescription>
                                Our robust cloud-based infrastructure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center space-x-2">
                                        <Server className="h-5 w-5 text-indigo-500" />
                                        <span>Backend (Django)</span>
                                    </h3>
                                    <p>
                                        Our Django backend is deployed on AWS for maximum reliability and scalability.
                                    </p>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">AWS EC2</span>
                                                <p className="text-sm text-muted-foreground">Scalable compute instances</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">RDS MySQL</span>
                                                <p className="text-sm text-muted-foreground">Managed database service</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Elastic Load Balancing</span>
                                                <p className="text-sm text-muted-foreground">Traffic distribution</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center space-x-2">
                                        <Zap className="h-5 w-5 text-indigo-500" />
                                        <span>Frontend (Next.js)</span>
                                    </h3>
                                    <p>
                                        Our Next.js frontend is deployed on Vercel for lightning-fast performance.
                                    </p>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Vercel Edge Network</span>
                                                <p className="text-sm text-muted-foreground">Global CDN distribution</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Server-Side Rendering</span>
                                                <p className="text-sm text-muted-foreground">For optimal performance and SEO</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 text-sm font-bold">→</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Continuous Deployment</span>
                                                <p className="text-sm text-muted-foreground">Automatic builds from GitHub</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-muted rounded-lg border">
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                                    Security & Compliance
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-white rounded-md shadow-sm">
                                        <div className="font-medium">End-to-End Encryption</div>
                                        <p className="text-sm text-muted-foreground">All data in transit is encrypted</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-md shadow-sm">
                                        <div className="font-medium">FMCSA Compliance</div>
                                        <p className="text-sm text-muted-foreground">ELD logs meet regulatory standards</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-md shadow-sm">
                                        <div className="font-medium">Regular Backups</div>
                                        <p className="text-sm text-muted-foreground">Multiple daily database backups</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper Components
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
        <div className="mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

interface TechCardProps {
    title: string;
    tech: string;
    description: string;
}

const TechCard: React.FC<TechCardProps> = ({ title, tech, description }) => (
    <div className="border rounded-md p-4 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
        <div className="font-semibold mb-1">{tech}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
    </div>
);

interface InputExampleProps {
    label: string;
    placeholder: string;
    type?: string;
}

const InputExample: React.FC<InputExampleProps> = ({ label, placeholder, type = "text" }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center border rounded-md bg-muted/50 px-3 py-2 text-sm">
            <input
                type={type}
                placeholder={placeholder}
                className="bg-transparent flex-1 outline-none"
                disabled
            />
        </div>
    </div>
);