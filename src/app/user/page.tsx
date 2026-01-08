"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Order, OrderDTO } from "@/interfaces/order";

const UserPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/orders/my-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const rawData: OrderDTO[] = await res.json();
          console.log("Raw Orders Data:", JSON.stringify(rawData, null, 2));

          // Enrich order items with product details
          const enrichedOrders = await Promise.all(
            rawData.map(async (order) => {
              const enrichedItems = await Promise.all(
                order.items.map(async (item) => {
                  let productName = "Товар";
                  let imageUrl = "";

                  // Debug logging for item
                  // console.log("Processing item:", item);

                  try {
                    // Decide endpoint based on product type
                    // Validating ID existence to separate "missing ID" from "fetch failed"
                    if (item.productId) {
                      const endpoint =
                        item.productType === "WALLPAPER"
                          ? `http://localhost:8080/wallpapers/${item.productId}`
                          : `http://localhost:8080/souvenirs/${item.productId}`;

                      const productRes = await fetch(endpoint);

                      if (productRes.ok) {
                        const productData = await productRes.json();
                        productName = productData.name;
                        imageUrl = productData.image;
                      } else {
                        console.warn(
                          `Failed to fetch product details for ${item.productId}: ${productRes.status}`
                        );
                      }
                    }
                  } catch (e) {
                    console.error("Error fetching product details", e);
                  }

                  // Robust calculation
                  const price =
                    typeof item.purchasePrice === "number"
                      ? item.purchasePrice
                      : Number(item.purchasePrice);
                  const qty =
                    typeof item.quantity === "number"
                      ? item.quantity
                      : Number(item.quantity);
                  const safePrice = isNaN(price) ? 0 : price;
                  const safeQty = isNaN(qty) ? 1 : qty;

                  return {
                    ...item,
                    productName,
                    imageUrl,
                    price: safePrice,
                    quantity: safeQty,
                    totalPrice: safePrice * safeQty,
                  };
                })
              );

              // Map root level fields safely
              const orderTotal =
                typeof order.totalPrice === "number"
                  ? order.totalPrice
                  : Number(order.totalPrice);

              return {
                id: order.id,
                orderDate: order.createdAt || new Date().toISOString(),
                // status: "COMPLETED", // Removed
                totalAmount: isNaN(orderTotal) ? 0 : orderTotal,
                // shippingAddress: "Адреса не вказана", // Removed
                items: enrichedItems,
              };
            })
          );

          // Sort orders by creation date (newest first)
          enrichedOrders.sort(
            (a, b) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );

          setOrders(enrichedOrders);
        } else {
          console.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col px-4 sm:px-8 md:px-[clamp(2rem,6vw,8rem)] py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Sidebar / User Info */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl font-bold text-navy">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-navy">{user.username}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Мій Профіль
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">ID користувача:</span>
                    <span className="font-medium text-navy">{user.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-navy">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6">
                <button
                  onClick={logout}
                  className="w-full bg-gray-50 text-navy font-bold rounded-xl py-3 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>

          {/* Main Content / Order History */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-navy mb-8">
              Історія замовлень
            </h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-gray-400 text-xl mb-6">
                  У вас ще немає замовлень
                </div>
                <Link
                  href="/wallpapers"
                  className="inline-block bg-teal text-white font-bold rounded-xl px-8 py-3 hover:bg-navy transition-colors"
                >
                  Перейти до каталогу
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-50 pb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Замовлення №
                        </div>
                        <div className="text-lg font-bold text-navy">
                          #{order.id.slice(0, 8)}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                        <div className="text-sm text-gray-500 mb-1">
                          {new Date(order.orderDate).toLocaleString("uk-UA", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          {/* Image removed */}
                          <div className="flex-1">
                            <h4 className="font-medium text-navy line-clamp-2">
                              {item.productName}
                            </h4>
                            <div className="text-sm text-gray-500">
                              {item.quantity} шт x {item.price} грн
                            </div>
                          </div>
                          <div className="font-bold text-navy">
                            {item.totalPrice} грн
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-gray-500 text-sm">
                        {/* Address removed */}
                      </div>
                      <div className="text-xl font-bold text-teal">
                        {order.totalAmount} грн
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
