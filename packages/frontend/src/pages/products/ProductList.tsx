import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@olimpiadas-inet/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductFilters, type ProductFilters as Filters } from "@/components/products/ProductFilters";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts([
          {
            id: "1",
            name: "Paris Weekend Getaway",
            description: "Experience the magic of Paris with this romantic weekend package.",
            price: 599,
            type: "hotel",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2",
            name: "Tokyo Adventure Package",
            description: "Explore the vibrant culture of Tokyo with this comprehensive tour.",
            price: 1299,
            type: "activity",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "3",
            name: "New York City Flight",
            description: "Direct flights to the Big Apple from major cities.",
            price: 450,
            type: "flight",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFiltersChange = (filters: Filters) => {
    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(product => product.type === filters.type);
    }

    // Apply price range filter
    filtered = filtered.filter(
      product => product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  if (isLoading) {
    return <LoadingSpinner size={32} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <ProductFilters onFiltersChange={handleFiltersChange} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-6">Travel Packages</h1>
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No packages found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-4">
                      <span className="line-clamp-2">{product.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={isInWishlist(product.id) ? "text-red-500" : ""}
                        onClick={() => {
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id);
                          } else {
                            addToWishlist(product);
                          }
                        }}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isInWishlist(product.id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-500 mb-4 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold">
                        ${product.price}
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            addToCart(product);
                            toast.success("Added to cart");
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 