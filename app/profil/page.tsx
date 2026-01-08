"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { MoreVertical, Grid3x3, List, Plus } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { SignupPopup } from "@/components/signup-popup"
import { CVThumbnail } from "@/components/cv-thumbnail"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CV {
  id: string
  title: string
  created_at: string
  updated_at: string
  cvData?: any
}

type ViewMode = "grid" | "list"

export default function ProfilePage() {
  const { user } = useAuth()
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<string | null>(null)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [popupMode, setPopupMode] = useState<"signup" | "login">("login")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchCVs()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/get-user-cvs', {
        credentials: 'include',
      })
      const result = await response.json()
      
      if (result.success) {
        // Fetch full CV data for each CV
        const cvPromises = result.cvs.map(async (cv: any) => {
          try {
            const cvResponse = await fetch(`/api/load-cv?id=${cv.id}`, {
              credentials: 'include',
            })
            const response = await cvResponse.json()
            
            // Extract the actual CV data from the response
            const cvData = response.success ? response.cv : response
            
            return {
              id: cv.id,
              title: cv.cv_name || 'CV utan titel',
              created_at: cv.created_at,
              updated_at: cv.updated_at,
              cvData: cvData, // Store entire CV data
            }
          } catch (error) {
            return {
              id: cv.id,
              title: cv.cv_name || 'CV utan titel',
              created_at: cv.created_at,
              updated_at: cv.updated_at,
              cvData: null,
            }
          }
        })
        
        const mappedCVs = await Promise.all(cvPromises)
        setCvs(mappedCVs)
      } else {
        console.error('Failed to load CVs:', result.error)
      }
    } catch (error) {
      console.error('Error fetching CVs:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ladda dina CV:n. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!cvToDelete) return

    try {
      const response = await fetch(`/api/delete-cv?id=${cvToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      
      if (result.success) {
        setCvs(cvs.filter(cv => cv.id !== cvToDelete))
        toast({
          title: "Raderat",
          description: "CV:t har raderats.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting CV:', error)
      toast({
        title: "Fel",
        description: "Kunde inte radera CV:t. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setCvToDelete(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="text-center">
              <h1 className="text-3xl font-semibold mb-3">Välkommen till CV.se</h1>
              <p className="text-gray-600 mb-6">Logga in för att se dina sparade CV:n</p>
            </div>
            <Button 
              className="bg-[#00bf63] hover:bg-[#00a857] text-white px-8 py-6 text-lg"
              onClick={() => {
                setIsSignupOpen(true)
                setPopupMode("login")
              }}
            >
              Logga in
            </Button>
          </div>
        </div>
        <SignupPopup
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSignupSuccess={() => {
            setIsSignupOpen(false)
          }}
          onOpenLogin={() => setPopupMode("login")}
          mode={popupMode}
          setMode={setPopupMode}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <nav className="px-3 py-6 space-y-1">
            <button
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-white shadow-sm text-gray-900"
            >
              CV:n
            </button>
            <button
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-white hover:text-gray-900"
            >
              Mina sidor
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 px-6 py-6">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-normal text-gray-900">CV:n</h1>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                title="Rutnätsvy"
              >
                <Grid3x3 className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
                title="Listvy"
              >
                <List className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* CV Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00bf63]"></div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Inga CV:n än</h2>
              <p className="text-gray-600 mb-6">Skapa ditt första CV för att komma igång</p>
            </div>
            <Link href="/profil/skapa-cv?new=true">
              <Button className="bg-[#00bf63] hover:bg-[#00a857] text-white px-6 py-5">
                <Plus className="h-5 w-5 mr-2" />
                Skapa nytt CV
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {/* Create New Card */}
                <Link href="/profil/skapa-cv?new=true">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-[#00bf63] hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#00bf63] flex items-center justify-center transition-colors">
                        <Plus className="h-6 w-6 text-gray-600 group-hover:text-white" />
                      </div>
                      <p className="text-sm text-gray-600 group-hover:text-[#00bf63] font-medium">Skapa nytt cv</p>
                    </div>
                  </div>
                </Link>

                {/* CV Cards */}
                {cvs.map((cv) => (
                  <div key={cv.id} className="group">
                    <Link href={`/profil/skapa-cv?id=${cv.id}`}>
                      <div className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer overflow-hidden bg-white">
                        {/* CV Preview Thumbnail */}
                        <div className="aspect-[3/4] bg-gray-50 border-b border-gray-200 overflow-hidden">
                          <CVThumbnail cvData={cv.cvData} />
                        </div>
                        
                        {/* CV Info */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{cv.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Redigerad för {format(new Date(cv.updated_at), 'P', { locale: sv })}
                              </p>
                            </div>
                            
                            <DropdownMenu open={openDropdownId === cv.id} onOpenChange={(open) => setOpenDropdownId(open ? cv.id : null)}>
                              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-gray-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/profil/skapa-cv?id=${cv.id}`} className="cursor-pointer">
                                    Öppna
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setOpenDropdownId(null) // Close dropdown
                                    setCvToDelete(cv.id)
                                    setShowDeleteDialog(true)
                                  }}
                                >
                                  Radera
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div key={cv.id} className="group">
                    <Link href={`/profil/skapa-cv?id=${cv.id}`}>
                      <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{cv.title}</h3>
                          <p className="text-xs text-gray-500">
                            Redigerad för {format(new Date(cv.updated_at), 'P', { locale: sv })}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <button className="p-2 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/profil/skapa-cv?id=${cv.id}`} className="cursor-pointer">
                                Öppna
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                setCvToDelete(cv.id)
                                setShowDeleteDialog(true)
                              }}
                            >
                              Radera
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Radera CV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              Detta CV kommer att raderas och tas bort från din lista. Du kan alltid kontakta support om du vill återställa det.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="px-6"
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="px-6 bg-red-600 hover:bg-red-700"
              >
                Radera
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
