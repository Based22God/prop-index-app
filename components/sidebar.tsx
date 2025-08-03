"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Home,
  BarChart3,
  User,
  Film,
  Headphones,
  Bot,
  FileText,
  ChevronDown,
  ChevronUp,
  Bell,
  Plus,
  AlertTriangle,
  MapPin,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RecentSearch {
  id: string
  query: string
  type: "area" | "postcode" | "profile"
  timestamp: Date
}

interface SidebarSectionProps {
  title?: string
  children: React.ReactNode
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mt-6 first:mt-0">
      {title && <div className="px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  hasArrow?: boolean
  hasPlus?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, active = false, hasArrow = false, hasPlus = false, onClick }: SidebarItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-3 py-2 h-auto text-sm font-medium",
        active
          ? "bg-zinc-800/80 text-white dark:bg-zinc-800/80 dark:text-white"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50",
      )}
      onClick={onClick || (hasArrow ? () => setExpanded(!expanded) : undefined)}
    >
      <span className="flex items-center w-full">
        <span className="mr-3">{icon}</span>
        <span className="flex-1 text-left truncate">{label}</span>
        {hasPlus && <Plus className="h-4 w-4" />}
        {hasArrow && (expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
      </span>
    </Button>
  )
}

interface RecentSearchItemProps {
  search: RecentSearch
  onClick: (search: RecentSearch) => void
}

function RecentSearchItem({ search, onClick }: RecentSearchItemProps) {
  const getTypeIcon = (type: RecentSearch["type"]) => {
    switch (type) {
      case "area":
        return <MapPin className="h-4 w-4" />
      case "postcode":
        return <MapPin className="h-4 w-4" />
      case "profile":
        return <User className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start px-3 py-1.5 h-auto text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
      onClick={() => onClick(search)}
    >
      <span className="flex items-center w-full">
        <span className="mr-2">{getTypeIcon(search.type)}</span>
        <span className="flex-1 text-left truncate">{search.query}</span>
        <span className="text-xs text-zinc-500 ml-2">{formatTime(search.timestamp)}</span>
      </span>
    </Button>
  )
}

interface SidebarProps {
  className?: string
  onSearchSelect?: (query: string) => void
}

export function Sidebar({ className, onSearchSelect }: SidebarProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setRecentSearches(parsed)
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, [])

  // Save recent searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
  }, [recentSearches])

  // Function to add a new search
  const addRecentSearch = (query: string, type: RecentSearch["type"] = "area") => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query,
      type,
      timestamp: new Date(),
    }

    setRecentSearches((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((search) => search.query.toLowerCase() !== query.toLowerCase())
      // Add new search at the beginning and limit to 10 items
      return [newSearch, ...filtered].slice(0, 10)
    })
  }

  // Function to handle clicking on a recent search
  const handleRecentSearchClick = (search: RecentSearch) => {
    // Update timestamp for clicked item
    setRecentSearches((prev) =>
      prev
        .map((item) => (item.id === search.id ? { ...item, timestamp: new Date() } : item))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    )

    // Call the callback if provided
    if (onSearchSelect) {
      onSearchSelect(search.query)
    }
  }

  // Expose addRecentSearch function globally for use in other components
  useEffect(() => {
    ;(window as any).addRecentSearch = addRecentSearch
  }, [])

  return (
    <div className={cn("w-64 bg-black dark:bg-black text-white flex flex-col h-full", className)}>
      <div className="p-4 font-bold text-xl">PropIndex</div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <SidebarSection>
          <SidebarItem icon={<Home className="h-5 w-5" />} label="Home" active />
        </SidebarSection>

        <SidebarSection title="Tools">
          <SidebarItem icon={<FileText className="h-5 w-5" />} label="AI Description" />
          <SidebarItem icon={<BarChart3 className="h-5 w-5" />} label="Insights" />
          <SidebarItem icon={<User className="h-5 w-5" />} label="Leads" />
        </SidebarSection>

        <SidebarSection title="Recently Searched">
          {recentSearches.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-500">No recent searches</div>
          ) : (
            recentSearches.map((search) => (
              <RecentSearchItem key={search.id} search={search} onClick={handleRecentSearchClick} />
            ))
          )}
        </SidebarSection>

        <SidebarSection title="Products">
          <SidebarItem icon={<Film className="h-5 w-5" />} label="Studio" />
          <SidebarItem icon={<Headphones className="h-5 w-5" />} label="Dubbing" />
          <SidebarItem icon={<Bot className="h-5 w-5" />} label="Conversational AI" hasArrow />
          <SidebarItem icon={<FileText className="h-5 w-5" />} label="Speech to Text" />
        </SidebarSection>

        <SidebarSection>
          <SidebarItem icon={<User className="h-5 w-5" />} label="Audio Tools" hasArrow />
          <SidebarItem icon={<Bell className="h-5 w-5" />} label="Notifications" />
        </SidebarSection>
      </div>

      <div className="mt-auto border-t border-zinc-800 p-3">
        <div className="bg-zinc-900/50 rounded-md p-2 mb-3 flex items-center text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
          <span className="text-white">10 credits</span>
          <span className="ml-auto bg-zinc-700 px-2 py-0.5 rounded text-xs">Upgrade</span>
        </div>
        <Button variant="ghost" className="w-full justify-start px-2 py-2 h-auto">
          <User className="h-5 w-5 mr-3 p-0.5 rounded-full bg-zinc-800" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">My Account</span>
            <span className="text-xs text-zinc-400">My Workspace</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </div>
  )
}
