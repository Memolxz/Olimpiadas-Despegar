import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { format } from "date-fns";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  paymentMethod: string;
  discountApplied?: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders([
          {
            id: "ORD-001",
            items: [
              {
                productId: "1",
                productName: "Paris Weekend Getaway",
                quantity: 2,
                price: 599,
              },
            ],
            total: 1198,
            status: "completed",
            createdAt: "2024-03-15T10:30:00Z",
            paymentMethod: "Credit Card",
            discountApplied: 10,
          },
          {
            id: "ORD-002",
            items: [
              {
                productId: "2",
                productName: "Tokyo Adventure Package",
                quantity: 1,
                price: 1299,
              },
            ],
            total: 1299,
            status: "pending",
            createdAt: "2024-03-14T15:45:00Z",
            paymentMethod: "PayPal",
          },
        ]);
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <LoadingSpinner size={32} />;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), "PPP")}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${item.quantity * item.price}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  {order.discountApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount Applied</span>
                      <span>{order.discountApplied}%</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 