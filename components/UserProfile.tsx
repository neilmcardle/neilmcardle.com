"use client"

import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { User, Settings, LogOut, CreditCard } from 'lucide-react'
import { AuthModal } from './AuthModal'
import Image from "next/image"

export function UserProfile() {
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <AuthModal 
          trigger={<Button variant="outline" size="sm">Sign In</Button>}
          mode="signin"
        />
        <AuthModal 
          trigger={<Button size="sm">Sign Up</Button>}
          mode="signup"
        />
      </div>
    )
  }

  const initials = user.email
    ? user.email.charAt(0).toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8 overflow-hidden">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user?.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8 border border-gray-200"
                style={{ background: "#fff" }}
                priority
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.username || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="opacity-50">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
          <span className="ml-auto text-xs text-gray-400">Soon</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="opacity-50">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Subscription</span>
          <span className="ml-auto text-xs text-gray-400">Soon</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="opacity-50">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <span className="ml-auto text-xs text-gray-400">Soon</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}