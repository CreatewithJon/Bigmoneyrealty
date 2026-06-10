'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '◈' },
  { label: 'Leads', href: '/dashboard/leads', icon: '◉' },
  { label: 'Agents', href: '/dashboard/agents', icon: '◎' },
  { label: 'Campaigns', href: '/dashboard/campaigns', icon: '◆' },
  { label: 'Appointments', href: '/dashboard/appointments', icon: '◇' },
  { label: 'AI Workflows', href: '/dashboard/ai-workflows', icon: '◈' },
  { label: 'Settings', href: '/dashboard/settings', icon: '◉' },
]

interface DashboardSidebarProps {
  userName: string
  userRole: string
  orgName: string
}

export default function DashboardSidebar({
  userName,
  userRole,
  orgName,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col z-40">
      {/* Brand header */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#b8922a]/15 border border-[#b8922a]/25 flex items-center justify-center flex-shrink-0">
            <span
              className="text-[#b8922a] font-bold text-sm"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              B
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-white/80 text-sm font-medium truncate"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {orgName}
            </p>
            <p
              className="text-white/30 text-[10px] uppercase tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
              isActive(item.href)
                ? 'bg-[#b8922a]/10 text-[#b8922a]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
            }`}
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            <span
              className={`text-xs transition-colors ${
                isActive(item.href)
                  ? 'text-[#b8922a]'
                  : 'text-white/25 group-hover:text-white/50'
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <div className="px-3 py-2.5">
          <p
            className="text-white/60 text-sm truncate"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {userName}
          </p>
          <p
            className="text-white/25 text-[10px] uppercase tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {userRole.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          <span className="text-xs">→</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
