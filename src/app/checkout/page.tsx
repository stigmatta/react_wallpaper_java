"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  MOCK_NOVA_WAREHOUSES,
  MOCK_NOVA_POSHTAMATS,
  MOCK_UKR_WAREHOUSES,
  MOCK_PICKUP_LOCATIONS,
} from "@/data/mockDelivery";
import ContactForm from "@/components/Checkout/ContactForm";
import DeliveryForm from "@/components/Checkout/DeliveryForm";
import PaymentForm from "@/components/Checkout/PaymentForm";
import OrderSummary from "@/components/Checkout/OrderSummary";

export default function CheckoutPage() {
  const { items, isLoaded, clearCart } = useCart();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<
    "nova" | "ukr" | "pickup"
  >("nova");
  // For Nova Poshta: "warehouse" | "poshtamat" | "courier"
  const [novaType, setNovaType] = useState<
    "warehouse" | "poshtamat" | "courier"
  >("warehouse");

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  // Form State
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    comment: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Delivery mock search state
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [isWarehouseListOpen, setIsWarehouseListOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Redirect to cart if empty
  useEffect(() => {
    if (!isSubmitting && isLoaded && items.length === 0) {
      router.push("/cart");
    }
  }, [items, isLoaded, router, isSubmitting]);

  // Determine which list to use based on delivery method and type
  const getActiveList = () => {
    if (deliveryMethod === "nova") {
      if (novaType === "warehouse") return MOCK_NOVA_WAREHOUSES;
      if (novaType === "poshtamat") return MOCK_NOVA_POSHTAMATS;
    }
    if (deliveryMethod === "ukr") return MOCK_UKR_WAREHOUSES;
    if (deliveryMethod === "pickup") return MOCK_PICKUP_LOCATIONS;
    return [];
  };

  const activeList = getActiveList();
  const filteredList = warehouseSearch
    ? activeList.filter((w) =>
        w.toLowerCase().includes(warehouseSearch.toLowerCase())
      )
    : activeList;

  // Reset search when method changes
  useEffect(() => {
    setWarehouseSearch("");
    setIsWarehouseListOpen(false);
    setSelectedLocation("");
  }, [deliveryMethod, novaType]);

  const totalSum = items.reduce((sum, item) => sum + item.total, 0);
  const deliveryCost = 60; // Example fixed cost
  const finalTotal = totalSum + deliveryCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleOrderSubmit = () => {
    const newErrors: Record<string, boolean> = {};

    // Basic fields
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.email.trim()) newErrors.email = true;

    // Delivery Validation
    let isDeliveryValid = true;
    if (deliveryMethod === "nova") {
      if (novaType === "courier") {
        if (!formData.city.trim()) newErrors.city = true;
        if (!formData.street.trim()) newErrors.street = true;
        if (!formData.house.trim()) newErrors.house = true;
      } else {
        if (!selectedLocation && !warehouseSearch) {
          newErrors.location = true;
          isDeliveryValid = false;
        }
      }
    } else if (deliveryMethod === "ukr" || deliveryMethod === "pickup") {
      if (!selectedLocation && !warehouseSearch) {
        newErrors.location = true;
        isDeliveryValid = false;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !isDeliveryValid) {
      alert(
        "Будь ласка, заповніть всі обов'язкові поля та оберіть відділення/адресу."
      );
      return;
    }

    setIsSubmitting(true);
    clearCart();
    router.push("/checkout/success");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 sm:px-8 md:px-[clamp(2rem,6vw,8rem)] py-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8 text-center sm:text-left">
        Оформлення замовлення
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
        {/* Left Column: Forms */}
        <div className="flex-1 space-y-8">
          <ContactForm
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />

          <DeliveryForm
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            novaType={novaType}
            setNovaType={setNovaType}
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            setErrors={setErrors}
            selectedLocation={selectedLocation}
            warehouseSearch={warehouseSearch}
            setWarehouseSearch={setWarehouseSearch}
            setSelectedLocation={setSelectedLocation}
            isWarehouseListOpen={isWarehouseListOpen}
            setIsWarehouseListOpen={setIsWarehouseListOpen}
            filteredList={filteredList}
          />

          <PaymentForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />

          <Link
            href="/cart"
            className="inline-flex items-center text-teal font-semibold hover:text-navy transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            Повернутися до корзини
          </Link>
        </div>

        {/* Right Column: Order Summary */}
        <OrderSummary
          items={items}
          totalSum={totalSum}
          deliveryCost={deliveryCost}
          finalTotal={finalTotal}
          handleOrderSubmit={handleOrderSubmit}
        />
      </div>
    </div>
  );
}
