import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Your wishlist is empty</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/")}
            >
              Browse Packages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-4">
                <span className="line-clamp-2">{product.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 shrink-0"
                  onClick={() => removeItem(product.id)}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
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
                      removeItem(product.id);
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
    </div>
  );
} 