import { Outlet } from 'react-router-dom'
import Navbar from '@components/navigation/Navbar'
import Footer from '@components/layout/Footer'
import FloatingButtons from '@components/ui/FloatingButtons'

/**
 * Root layout shared across all pages.
 * Renders the Navbar at the top, page content via <Outlet>,
 * Footer at the bottom, and floating contact buttons.
 */
export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  )
}
