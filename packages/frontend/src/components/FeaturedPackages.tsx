
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users } from "lucide-react";

const featuredPackages = [
  {
    id: 1,
    name: "Tropical Paradise Escape",
    destination: "Bali, Indonesia",
    price: 1299,
    originalPrice: 1599,
    duration: "7 days",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800",
    features: ["5★ Resort", "All Meals", "Private Transfer", "Spa Access"],
    discount: "19% OFF"
  },
  {
    id: 2,
    name: "Alpine Adventure Journey",
    destination: "Swiss Alps, Switzerland",
    price: 2199,
    originalPrice: 2599,
    duration: "10 days",
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800",
    features: ["Mountain Lodge", "Guided Tours", "Ski Pass", "All Transport"],
    discount: "15% OFF"
  },
  {
    id: 3,
    name: "Safari Wildlife Experience",
    destination: "Serengeti, Tanzania",
    price: 1899,
    originalPrice: 2299,
    duration: "8 days",
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&q=80&w=800",
    features: ["Luxury Camp", "Game Drives", "Expert Guide", "All Meals"],
    discount: "17% OFF"
  }
];

export const FeaturedPackages = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Featured Travel Packages
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked destinations and experiences that promise unforgettable memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPackages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="p-0 relative">
                <div className="relative overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                      {pkg.discount}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{pkg.rating}</span>
                    <span className="text-xs text-gray-600">({pkg.reviews})</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {pkg.destination}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {pkg.name}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {pkg.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      2-8 people
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ${pkg.price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${pkg.originalPrice}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">per person</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="px-8 py-3">
            View All Packages
          </Button>
        </div>
      </div>
    </section>
  );
};
