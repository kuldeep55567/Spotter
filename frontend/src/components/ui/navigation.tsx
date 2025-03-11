"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Truck, Menu, X, User, MapPin } from "lucide-react"

export function Navigation() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  type User = {
    name: string;
    user_id?: string;
  };

  const [user, setUser] = React.useState<User | null>(null)

  // Load user data from localStorage
  const loadUserData = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          console.log('User data loaded in Navigation:', userData.name)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error)
        setUser(null)
      }
    }
  }, [])

  // Listen for login/logout events
  React.useEffect(() => {
    // Initial load of user data
    loadUserData()
    
    // Set up event listeners for login and logout
    if (typeof window !== 'undefined') {
      // Function to handle login event
      const handleLogin = () => {
        console.log('Login event detected')
        loadUserData()
      }
      
      // Function to handle logout event
      const handleLogout = () => {
        console.log('Logout event detected')
        setUser(null)
      }
      
      // Add event listeners
      window.addEventListener('userLogin', handleLogin)
      window.addEventListener('userLogout', handleLogout)
      
      // Clean up event listeners when component unmounts
      return () => {
        window.removeEventListener('userLogin', handleLogin)
        window.removeEventListener('userLogout', handleLogout)
      }
    }
  }, [loadUserData])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Remove user from localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // Update state
      setUser(null)
      setIsMobileMenuOpen(false)
      
      // Dispatch a logout event
      const logoutEvent = new Event('userLogout')
      window.dispatchEvent(logoutEvent)
      
      // Redirect to home page
      router.push('/')
      
      // Force a page refresh
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto max-w-6xl">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Truck className="h-8 w-8" />
          <span className="font-bold text-2xl">TruckFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex mx-6">
          <NavigationMenuList>
            <NavigationMenuItem>
              {user ? (
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              ) : (
                <Link href="/doc" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Docs
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
            {user && (
              <NavigationMenuItem>
                <Link href="/map" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      Map
                    </span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden ml-auto p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-t z-50">
            <div className="px-4 py-2 max-w-6xl mx-auto">
              {user && (
                <div className="flex items-center justify-between mb-4 p-2 border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Hello, {user.name}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
              <NavigationMenu>
                <NavigationMenuList className="flex flex-col space-y-2">
                  {user && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/dashboard" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Dashboard
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/map" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              Map
                            </span>
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                  <NavigationMenuItem>
                    <Link href="/pricing" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/contact" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Contact
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        )}

        {/* Login/Signup or User Welcome */}
        <div className="hidden md:flex ml-auto items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="font-medium">Hello, {user.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="cyan">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"