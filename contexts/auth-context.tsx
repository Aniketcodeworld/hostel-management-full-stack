"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithEmailAndPassword
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { toast } from "react-hot-toast"

// Static admin credentials
const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "admin@123"

type User = {
  email: string
  role: "admin" | "allottee"
  uid: string
  isLocalAdmin?: boolean
}

type AuthContextType = {
  user: User | null
  loginWithGoogle: () => Promise<void>
  loginAsAdmin: (email: string, password: string) => Promise<void>
  loginAsAllottee: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Check for existing session on mount and listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        
        // First check for Firebase auth
        if (firebaseUser) {
          // Determine if user is admin based on email
          const isAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
          
          const userData: User = {
            email: firebaseUser.email || "",
            role: isAdmin ? "admin" : "allottee",
            uid: firebaseUser.uid
          }
          setUser(userData)
        } 
        // Then check for localStorage admin (our custom solution)
        else {
          const localAdmin = localStorage.getItem("admin_session")
          if (localAdmin === "true") {
            setUser({
              email: ADMIN_EMAIL,
              role: "admin",
              uid: "admin-local",
              isLocalAdmin: true
            })
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      // Make sure any local admin is logged out first
      localStorage.removeItem("admin_session")
      
      await signInWithPopup(auth, googleProvider)
      toast.success("Logged in successfully")
    } catch (error: any) {
      console.error("Google login failed:", error)
      toast.error(error.message || "Google login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginAsAdmin = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Verify this is the admin email and password
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Invalid admin credentials")
      }
      
      // Set local admin session
      localStorage.setItem("admin_session", "true")
      setUser({
        email: ADMIN_EMAIL,
        role: "admin",
        uid: "admin-local",
        isLocalAdmin: true
      })
      toast.success("Admin login successful")
    } catch (error: any) {
      console.error("Admin login failed:", error)
      toast.error(error.message || "Admin login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginAsAllottee = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Make sure any local admin is logged out first
      localStorage.removeItem("admin_session")
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Verify this is an allottee email
      if (userCredential.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        await signOut(auth)
        throw new Error("Please use the admin login page for admin access")
      }
      
      toast.success("Logged in successfully")
    } catch (error: any) {
      console.error("Allottee login failed:", error)
      toast.error(error.message || "Login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      // Clear local admin session
      localStorage.removeItem("admin_session")
      
      // Sign out from Firebase if logged in
      if (auth.currentUser) {
        await signOut(auth)
      }
      
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error: any) {
      console.error("Logout failed:", error)
      toast.error(error.message || "Logout failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginWithGoogle, 
      loginAsAdmin,
      loginAsAllottee,
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

