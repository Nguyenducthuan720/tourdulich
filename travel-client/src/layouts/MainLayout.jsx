import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import AIChatbot from '../components/AIChatbot';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <AIChatbot user={user} />
    </div>
  )
}
