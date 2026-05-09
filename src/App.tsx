import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PureShowcase from './components/PureShowcase';
import ProductGrid from './components/ProductGrid';
import Gallery from './components/Gallery';
import Experience from './components/Experience';
import Footer from './components/Footer';
import './App.css';
import ProductsPage from './pages/ProductsPage';
import HappyHourPage from './pages/HappyHourPage';
import BlackFridayPage from './pages/BlackFridayPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CartNotification from './components/CartNotification';
import { useEffect, useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('diwan_is_logged_in') === 'true');
  const [view, setView] = useState<'home' | 'products' | 'happyhour' | 'blackfriday' | 'auth' | 'profile'>('home')

  const handleNavigate = (to: 'home' | 'products' | 'happyhour' | 'blackfriday' | 'auth' | 'profile') => {
    let target = to;
    if (to === 'auth' && isLoggedIn) {
      target = 'profile';
    }
    
    setView(target)
    const nextPath = target === 'products' ? '/catalog' : 
                     target === 'happyhour' ? '/happy-hour' : 
                     target === 'blackfriday' ? '/black-friday' : 
                     target === 'auth' ? '/auth' : 
                     target === 'profile' ? '/profile' : '/';
                     
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    localStorage.setItem('diwan_is_logged_in', 'true');
    localStorage.setItem('diwan_user_data', JSON.stringify(userData));
    handleNavigate('profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('diwan_is_logged_in');
    localStorage.removeItem('diwan_user_data');
    localStorage.removeItem('diwan_auth_token');
    handleNavigate('home');
  };

  return (
    <div className="app">
      <Navbar onNavigate={handleNavigate} />
      <main>
        {view === 'home' ? (
          <>
            <Hero onNavigate={() => handleNavigate('products')} />
            <PureShowcase onNavigate={() => handleNavigate('products')} />
            <ProductGrid onNavigate={() => handleNavigate('products')} />
            <Gallery />
            <Experience />
            <Footer />
          </>
        ) : view === 'products' ? (
          <ProductsPage onBack={() => handleNavigate('home')} />
        ) : view === 'happyhour' ? (
          <HappyHourPage
            onBack={() => handleNavigate('home')}
            onExploreCatalog={() => handleNavigate('products')}
          />
        ) : view === 'blackfriday' ? (
          <BlackFridayPage
            onBack={() => handleNavigate('home')}
            onExploreCatalog={() => handleNavigate('products')}
          />
        ) : view === 'auth' ? (
          <AuthPage onBack={() => handleNavigate('home')} onSuccess={handleLoginSuccess} />
        ) : (
          <ProfilePage onBack={() => handleNavigate('home')} onLogout={handleLogout} />
        )}
      </main>
      <CartNotification />
    </div>
  );
}

export default App;
