import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

export function CartSheet() {
  const { items, total, itemCount, updateQuantity, removeItem, applyCoupon, removeCoupon, appliedCoupon, discountedTotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    setIsApplying(true);
    try {
      await applyCoupon(couponCode);
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch (error) {
      toast.error("Invalid coupon code");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.product.price} per person
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              
              {/* Coupon Section */}
              <div className="space-y-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                    <div>
                      <p className="text-sm font-medium">
                        Coupon applied: {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appliedCoupon.discount}% off
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeCoupon}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponCode}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal</span>
                  <span>${total}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-${(total - discountedTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>${discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => window.location.href = '/checkout'}
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 