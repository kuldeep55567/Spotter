"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Check, Info } from 'lucide-react'

export default function PricingPage() {
  const pricingPlans = [
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      description: "Essential features for small operations",
      features: [
        "Route planning for up to 5 trucks",
        "Basic ELD compliance logs",
        "Standard email support",
        "7-day trip history"
      ],
      highlighted: false,
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "Advanced features for growing fleets",
      features: [
        "Route planning for up to 25 trucks",
        "Advanced ELD compliance logs",
        "Rest stop recommendations",
        "Fuel optimization",
        "Priority email support",
        "30-day trip history"
      ],
      highlighted: true,
      buttonText: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "per month",
      description: "Complete solution for large fleets",
      features: [
        "Unlimited trucks",
        "Complete ELD compliance suite",
        "Advanced analytics & reporting",
        "Fuel card integration",
        "Dedicated account manager",
        "API access",
        "90-day trip history"
      ],
      highlighted: false,
      buttonText: "Contact Sales"
    }
  ]

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your fleet size and operational needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {pricingPlans.map((plan, index) => (
          <div 
            key={index} 
            className={`rounded-lg overflow-hidden border shadow-sm ${
              plan.highlighted ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-md relative' : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-0 right-0 bg-cyan-500 text-white text-center py-1 text-sm font-medium">
                MOST POPULAR
              </div>
            )}
            <div className={`p-6 ${plan.highlighted ? 'pt-8' : ''}`}>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground"> {plan.period}</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <Button 
                className={`w-full ${plan.highlighted ? 'bg-cyan-600 hover:bg-cyan-700' : ''}`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {plan.buttonText}
              </Button>
            </div>
            <div className="bg-muted p-6 border-t">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-slate-50 rounded-xl p-8 border shadow-sm my-12">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Info className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">More Details Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              We're working on expanding our pricing options and adding specialized features for different industries.
              Stay tuned for updates including:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Feature text="Custom pricing calculator" />
              <Feature text="Industry-specific packages" />
              <Feature text="Annual billing discounts" />
              <Feature text="Add-on features marketplace" />
              <Feature text="Partner integrations" />
              <Feature text="Volume discounts" />
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <FaqItem 
            question="Is there a free trial available?"
            answer="Yes, we offer a 14-day free trial on all plans. No credit card required to start."
          />
          <FaqItem 
            question="Can I switch between plans?"
            answer="Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
          />
          <FaqItem 
            question="How does billing work?"
            answer="We bill monthly by default, but annual options with discounts will be available soon. You can pay via credit card or invoice for Enterprise plans."
          />
          <FaqItem 
            question="What kind of support is included?"
            answer="All plans include email support. Professional plans include priority support, while Enterprise plans come with a dedicated account manager."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold mb-4">Ready to optimize your fleet operations?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get started today and see how TruckFlow can transform your logistics efficiency.
        </p>
        <div className="flex justify-center space-x-4">
          <Button  variant ="orange" size="lg">Start Free Trial</Button>
          <Button variant="outline" size="lg">Contact Sales</Button>
        </div>
      </div>
    </div>
  )
}

// Helper components
const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-2">
    <div className="h-2 w-2 rounded-full bg-blue-500" />
    <span>{text}</span>
  </div>
)

const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="border rounded-lg p-6">
    <h3 className="text-xl font-medium mb-2">{question}</h3>
    <p className="text-muted-foreground">{answer}</p>
  </div>
)