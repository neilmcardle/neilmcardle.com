"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Book,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
  X,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Define the type for a project
interface Project {
  id: string
  title: string
  description: string
  progress: number
  chapters: number
  words: number
  lastEdited: string
  status: "draft" | "review" | "published"
}

// Sample data for projects
const projects: Project[] = [
  {
    id: "1",
    title: "Travel Memories",
    description: "A collection of travel stories and photos.",
    progress: 75,
    chapters: 12,
    words: 15230,
    lastEdited: "Yesterday",
    status: "draft",
  },
  {
    id: "2",
    title: "Cooking Recipes",
    description: "Delicious recipes from around the world.",
    progress: 50,
    chapters: 8,
    words: 8765,
    lastEdited: "3 days ago",
    status: "review",
  },
  {
    id: "3",
    title: "My First eBook",
    description: "An introductory guide to the world of eBooks.",
    progress: 25,
    chapters: 5,
    words: 3450,
    lastEdited: "1 week ago",
    status: "draft",
  },
]

// Update the component to include state for the writer content and preview mode
export default function MakeEbookDashboard() {
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [isWriterModalOpen, setIsWriterModalOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterContent, setChapterContent] = useState("")
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit")

  const router = useRouter()

  // Prevent default navigation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Navigate to focus mode page
  const goToFocusMode = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/make-ebook/focus")
  }

  // Replace the Writer Modal section with this enhanced version
  const writerModal = (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isFullscreen ? "p-0" : ""}`}>
      <div
        className={`bg-[#FAFAFA] rounded-2xl shadow-xl overflow-hidden ${isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-4xl max-h-[90vh] overflow-auto"}`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-semibold text-[#1D1D1F]">New eBook</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsWriterModalOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs
            defaultValue="edit"
            onValueChange={(value) => setEditorMode(value as "edit" | "preview")}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsWriterModalOpen(false)
                  router.push("/make-ebook/focus")
                }}
                className="text-gray-600"
              >
                Focus Mode
              </Button>
            </div>

            <TabsContent value="edit" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-[#1D1D1F]">
                    Book Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your book title"
                    className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                  />
                </div>

                <div>
                  <Label htmlFor="author" className="text-[#1D1D1F]">
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                  />
                </div>

                <div>
                  <Label htmlFor="chapterTitle" className="text-[#1D1D1F]">
                    Chapter 1 Title
                  </Label>
                  <Input
                    id="chapterTitle"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Enter chapter title"
                    className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="chapterContent" className="text-[#1D1D1F]">
                      Chapter 1 Content
                    </Label>
                    <div className="text-xs text-muted-foreground flex items-center cursor-help">
                      eReader-compatible formatting
                    </div>
                  </div>
                  <div className="border rounded-md bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Bold">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Italic">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Underline">
                        <Underline className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 1">
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 2">
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Left">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Center">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Right">
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Bullet List">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Numbered List">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>
                    <div
                      className="p-4 min-h-[300px] focus:outline-none"
                      contentEditable
                      onInput={(e) => setChapterContent(e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: chapterContent }}
                      style={{ lineHeight: 1.6 }}
                    ></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="min-h-[500px]">
              <div className="border rounded-lg p-6 space-y-6 min-h-[500px] bg-white shadow-sm">
                {title && <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>}
                {author && <p className="text-center italic mb-12">by {author}</p>}

                {chapterTitle && <h2 className="text-xl font-semibold mt-8 mb-4">{chapterTitle}</h2>}
                {chapterContent && (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: chapterContent }} />
                )}

                {!title && !author && !chapterTitle && !chapterContent && (
                  <div className="text-center py-12 text-[#86868B]">
                    <p>Enter content in the Edit tab to see a preview</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsWriterModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsWriterModalOpen(false)}>Save Draft</Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Replace the Writer Modal section in the return statement
  return (
    <div className="flex h-screen bg-[#F5F5F7]">
      {/* Sidebar */}
      <div className="hidden md:flex w-56 flex-col bg-white border-r border-[#E5E5EA]">
        <div className="p-3 border-b border-[#E5E5EA] flex items-center">
          <MakeEbookIcon width={20} height={20} className="text-[#1D1D1F] mr-2" />
          <span className="font-semibold text-[#1D1D1F] text-sm">makeEbook</span>
          <Badge variant="outline" className="ml-auto text-xs">
            DEMO
          </Badge>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <a
            href="#"
            onClick={handleClick}
            className="flex items-center px-2 py-1.5 text-xs font-medium rounded-md bg-[#F5F5F7] text-[#1D1D1F]"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </a>
          <a
            href="#"
            onClick={handleClick}
            className="flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
          >
            <Book className="mr-2 h-4 w-4" />
            My eBooks
          </a>
          <a
            href="#"
            onClick={handleClick}
            className="flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </a>
          <a
            href="#"
            onClick={handleClick}
            className="flex items-center px-2 py-1.5 text-xs font-medium rounded-md text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </nav>
        <div className="p-3 border-t border-[#E5E5EA]">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
              <User className="h-3 w-3" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-[#1D1D1F]">Demo User</p>
              <p className="text-[10px] text-[#86868B]">demo@example.com</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={handleClick}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E5EA] py-2 px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* This is the only button that should navigate - to the makeEbook landing page */}
            <Link href="/make-ebook" className="mr-3">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to makeEbook
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-[#1D1D1F]">Dashboard</h1>
            <Badge variant="outline" className="ml-2 text-xs">
              DEMO
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {/* Removed the New eBook button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={handleClick}>
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <Book className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B]">Total eBooks</p>
                      <p className="text-lg font-semibold text-[#1D1D1F]">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B]">Published</p>
                      <p className="text-lg font-semibold text-[#1D1D1F]">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B]">In Progress</p>
                      <p className="text-lg font-semibold text-[#1D1D1F]">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1D1D1F]">My eBooks</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={goToFocusMode}>
                    <Plus className="mr-2 h-4 w-4" />
                    New eBook
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts</TabsTrigger>
                  <TabsTrigger value="review">In Review</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <CardHeader className="pb-2 pt-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{project.title}</CardTitle>
                            <CardDescription className="mt-0.5 text-xs">{project.description}</CardDescription>
                          </div>
                          <Badge
                            variant={project.status === "review" ? "secondary" : "outline"}
                            className="capitalize text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#86868B]">Progress</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>
                          <div className="flex justify-between text-xs">
                            <div>
                              <span className="text-[#86868B]">Chapters: </span>
                              <span className="font-medium">{project.chapters}</span>
                            </div>
                            <div>
                              <span className="text-[#86868B]">Words: </span>
                              <span className="font-medium">{project.words.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-2 pb-2">
                        <div className="text-xs text-[#86868B]">Last edited {project.lastEdited}</div>
                        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={handleClick}>
                          Open <ChevronRight className="h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="drafts">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects
                      .filter((p) => p.status === "draft")
                      .map((project) => (
                        <Card key={project.id} className="overflow-hidden">
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{project.title}</CardTitle>
                                <CardDescription className="mt-0.5 text-xs">{project.description}</CardDescription>
                              </div>
                              <Badge
                                variant={project.status === "review" ? "secondary" : "outline"}
                                className="capitalize text-xs"
                              >
                                {project.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[#86868B]">Progress</span>
                                  <span className="font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-1.5" />
                              </div>
                              <div className="flex justify-between text-xs">
                                <div>
                                  <span className="text-[#86868B]">Chapters: </span>
                                  <span className="font-medium">{project.chapters}</span>
                                </div>
                                <div>
                                  <span className="text-[#86868B]">Words: </span>
                                  <span className="font-medium">{project.words.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between border-t pt-2 pb-2">
                            <div className="text-xs text-[#86868B]">Last edited {project.lastEdited}</div>
                            <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={handleClick}>
                              Open <ChevronRight className="h-3 w-3" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="review">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects
                      .filter((p) => p.status === "review")
                      .map((project) => (
                        <Card key={project.id} className="overflow-hidden">
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{project.title}</CardTitle>
                                <CardDescription className="mt-0.5 text-xs">{project.description}</CardDescription>
                              </div>
                              <Badge
                                variant={project.status === "review" ? "secondary" : "outline"}
                                className="capitalize text-xs"
                              >
                                {project.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[#86868B]">Progress</span>
                                  <span className="font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-1.5" />
                              </div>
                              <div className="flex justify-between text-xs">
                                <div>
                                  <span className="text-[#86868B]">Chapters: </span>
                                  <span className="font-medium">{project.chapters}</span>
                                </div>
                                <div>
                                  <span className="text-[#86868B]">Words: </span>
                                  <span className="font-medium">{project.words.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between border-t pt-2 pb-2">
                            <div className="text-xs text-[#86868B]">Last edited {project.lastEdited}</div>
                            <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={handleClick}>
                              Open <ChevronRight className="h-3 w-3" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="published">
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-[#86868B]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">No published eBooks yet</h3>
                    <p className="text-[#86868B] max-w-md mx-auto mb-6">
                      When you publish your eBooks, they will appear here. Start by completing one of your drafts.
                    </p>
                    <Button onClick={goToFocusMode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New eBook
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-3">Recent Activity</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center p-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1D1D1F] text-sm">
                          You edited <span className="font-semibold">Travel Memories</span>
                        </p>
                        <p className="text-xs text-[#86868B]">Yesterday at 4:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1D1D1F] text-sm">
                          You created <span className="font-semibold">My First eBook</span>
                        </p>
                        <p className="text-xs text-[#86868B]">2 days ago at 10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        <Book className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1D1D1F] text-sm">
                          You added a new chapter to <span className="font-semibold">Cooking Recipes</span>
                        </p>
                        <p className="text-xs text-[#86868B]">5 days ago at 2:45 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#E5E5EA] py-2 px-4 text-center text-sm text-[#86868B]">
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="mr-2">
              DEMO
            </Badge>
            This is a demonstration of the makeEbook dashboard. No actual data is being saved.
          </div>
        </footer>
      </div>

      {/* Writer Modal */}
      {isWriterModalOpen && writerModal}
    </div>
  )
}
