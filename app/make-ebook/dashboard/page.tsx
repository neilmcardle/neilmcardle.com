"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"

export default function MakeEbookDashboard() {
  const [activeProject, setActiveProject] = useState<string | null>(null)

  // Prevent default navigation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const projects = [
    {
      id: "1",
      title: "My First eBook",
      description: "A guide to digital marketing",
      progress: 65,
      lastEdited: "2 days ago",
      chapters: 5,
      words: 12500,
      status: "draft",
    },
    {
      id: "2",
      title: "Cooking Recipes",
      description: "Collection of family recipes",
      progress: 30,
      lastEdited: "5 days ago",
      chapters: 3,
      words: 4200,
      status: "draft",
    },
    {
      id: "3",
      title: "Travel Memories",
      description: "Photo journal of my travels",
      progress: 90,
      lastEdited: "Yesterday",
      chapters: 8,
      words: 18300,
      status: "review",
    },
  ]

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
            <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleClick}>
              <Plus className="mr-2 h-4 w-4" />
              New eBook
            </Button>
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
                <Button variant="outline" size="sm" onClick={handleClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  New eBook
                </Button>
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
                    <Button onClick={handleClick}>
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
    </div>
  )
}

