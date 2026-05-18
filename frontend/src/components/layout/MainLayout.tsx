import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
