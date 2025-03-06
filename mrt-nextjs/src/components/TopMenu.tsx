'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopMenu() {
  const pathname = usePathname()

  return (
    <div className="top-menu">
      <div className="top-menu-container">
        <Link 
          href="/" 
          className={`top-menu-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          href="/journey" 
          className={`top-menu-link ${pathname === '/journey' ? 'active' : ''}`}
        >
          Journey Planner
        </Link>
        <button className="top-menu-link" id="admin-btn">
          Admin
        </button>
      </div>
    </div>
  )
}