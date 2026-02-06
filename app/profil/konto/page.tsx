"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Header } from "@/components/header"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { supabase } from "@/lib/supabase"
import { Crown, Loader2 } from "lucide-react"

const STRIPE_BILLING_PORTAL_URL = "https://billing.stripe.com/p/login/28EdR9gGxab32dj87xenS00"

export default function AccountPage() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('premium')
          .select('premium, created_at')
          .eq('uid', user.id)
          .single()

        if (error) {
          console.log('No premium record found:', error.message)
          setIsPremium(false)
        } else {
          setIsPremium(data?.premium === 'true')
          if (data?.created_at) {
            setCreatedAt(new Date(data.created_at))
          }
        }
      } catch (err) {
        console.error('Error checking premium status:', err)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPremiumStatus()
  }, [user])

  // Check if account was created more than 48 hours ago
  const canCancelSubscription = () => {
    if (!createdAt) return false
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation > 48
  }

  if (!user) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Profil</h1>
            <Link href="/profil/skapa-cv">
              <Button className="bg-[#00bf63] hover:bg-[#00a857] text-white">
                Logga in för att se ditt konto
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Logga in för att se din kontoinformation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <ProfileSidebar />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Mitt Konto</h1>
            </div>
            
            {/* Account Info Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-medium">E-post</label>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="font-medium">Medlemskap</label>
                      <div className="flex items-center gap-2 mt-1">
                        {isPremium ? (
                          <>
                            <Crown className="h-5 w-5 text-yellow-500" />
                            <span className="text-green-600 font-medium">Premium</span>
                          </>
                        ) : (
                          <span className="text-gray-600">Gratis</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      {isPremium ? (
                        canCancelSubscription() ? (
                          <a
                            href={STRIPE_BILLING_PORTAL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                              Avsluta medlemskap
                            </Button>
                          </a>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Du kan avsluta ditt medlemskap 48 timmar efter registrering.
                          </div>
                        )
                      ) : (
                        <Link href="/profil/skapa-cv">
                          <Button className="bg-[#00bf63] hover:bg-[#00a857] text-white">
                            <Crown className="h-4 w-4 mr-2" />
                            Uppgradera till premium
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 