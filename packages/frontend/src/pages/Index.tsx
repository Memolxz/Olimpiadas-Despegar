
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { FeaturedPackages } from "@/components/FeaturedPackages";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductSearch } from "@/components/ProductSearch";
import { AuthModal } from "@/components/auth/AuthModal";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onOpenAuth={handleOpenAuth} />
      <Hero onOpenAuth={handleOpenAuth} />
      
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <ProductSearch />
        </div>
      </section>

      <FeaturedPackages />
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
