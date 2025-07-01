import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '@olimpiadas-inet/shared';
import { productService } from '@/services/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, Shield, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch (error) {
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner size={32} />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const getTypeIcon = () => {
    switch (product.type) {
      case 'flight':
        return '✈️';
      case 'hotel':
        return '🏨';
      case 'transfer':
        return '🚗';
      case 'activity':
        return '🎯';
      case 'insurance':
        return '🛡️';
      case 'assistance':
        return '🆘';
      default:
        return '📦';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            <CardTitle className="text-3xl">{product.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-600">{product.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Flexible dates available</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Multiple destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Travel insurance included</span>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Price per person</p>
                <p className="text-3xl font-bold">${product.price}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 ${
                      isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
                <Button size="lg" onClick={() => addToCart(product)}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 