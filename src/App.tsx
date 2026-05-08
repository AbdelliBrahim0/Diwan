import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PureShowcase from './components/PureShowcase';
import ProductGrid from './components/ProductGrid';
import Gallery from './components/Gallery';
import Experience from './components/Experience';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <PureShowcase />
        <ProductGrid />
        <Gallery />
        <Experience />
        <Footer />
      </main>
    </div>
  );
}

export default App;
