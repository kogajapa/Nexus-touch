import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import AboutStory from './components/AboutStory';
import Catalog from './components/Catalog';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-dark-bg text-white min-h-screen selection:bg-neon-cyan selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <About />
        <AboutStory />
        <Catalog />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
