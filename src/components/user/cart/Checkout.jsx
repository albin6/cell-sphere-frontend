import React, { useEffect, useState } from "react";
import { ChevronRight, Edit2, X } from "lucide-react";
import {
  useCartProduct,
  useDirectCheckoutProduct,
  useProfileAddress,
  useProfileAddressMutation,
} from "../../../hooks/CustomHooks";
import {
  addNewAddress,
  updateUserAddress,
} from "../../../utils/address/addressCRUD";
import AddEditAddressModal from "../address/AddEditAddressModal";
import OrderSummaryModal from "../my-orders/OrderSummaryModal";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Paypal from "../paypal-payment/Paypal";
import { applyCoupon } from "../../../utils/coupon/couponCRUD";
import AvailableCouponModal from "./AvailableCouponModal";
import { axiosInstance } from "../../../config/axiosInstance";

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  // ==============================================================================
  // ==============================================================================

  const query = useQueryParams();
  const productId = query.get("productId");
  const variant = query.get("currVariant");

  const { data: singleProduct } = useDirectCheckoutProduct({
    variant,
    productId,
  });

  // ==============================================================================
  // ==============================================================================

  const { data: products, isError, isLoading } = useCartProduct();

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [addresses, setAddresses] = useState(null);
  const [cart, setCart] = useState([]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrderSummaryModalOpen, setIsOrderSummaryModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [eligibleProducts, setEligibleProducts] = useState(null);
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [amountAfterApplyingCoupon, setAmountAfterApplyingCoupon] =
    useState(null);
  const [discountAfterApplyingCoupon, setDiscountAfterApplyingCoupon] =
    useState(null);

  const { data: profileAddress } = useProfileAddress();
  const { mutate: addAddress } = useProfileAddressMutation(addNewAddress);
  const { mutate: updateAddress } =
    useProfileAddressMutation(updateUserAddress);

  useEffect(() => {
    setAddresses(profileAddress?.addresses);
  }, [profileAddress]);

  useEffect(() => {
    console.log("this is cart ======>", cart);
  }, [cart]);

  useEffect(() => {
    if (productId) {
      console.log(productId, variant);
      console.log("direct checkout=================>", singleProduct);
      setCart(singleProduct);
    } else {
      setCart(products);
    }
  }, [products, singleProduct]);

  const handleAddressEdit = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = (addressData) => {
    if (editingAddress) {
      updateAddress(addressData, {
        onSuccess: () => toast.success("Address updated successfully"),
      });
    } else {
      addAddress(addressData, {
        onSuccess: () => toast.success("Address added successfully"),
      });
    }
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  let subtotal = 0;

  if (products?.items) {
    subtotal = products.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
    console.log("this is subtotal of cart items ==>", subtotal);
  }
  const shipping = 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    console.log(selectedAddress, paymentMethod);
    if (!selectedAddress) {
      return toast.error("please choose an address", {
        position: "top-center",
      });
    } else if (!paymentMethod) {
      return toast.error("please choose a payment method", {
        position: "top-center",
      });
    } else {
      const order_data = {
        order_items: cart.items.map((item) => ({
          product: item.product._id,
          variant: item.variant,
          quantity: item.quantity,
        })),
      };
      axiosInstance
        .post("/api/users/product/quantity", {
          order_data,
        })
        .then((response) => {
          if (response.data.success) {
            setIsOrderSummaryModalOpen(true);
          }
        })
        .catch((error) => toast.error(error.response.data.message));
    }
  };

  const handleApplyCoupon = () => {
    const categoryIds = cart?.items.map((item) => ({
      id: item.product.category,
      amount: item.totalPrice,
      code: couponCode,
    }));
    setCode(couponCode);

    applyCoupon(categoryIds)
      .then((data) => {
        console.log(data);

        let totalDiscount = 0;
        let totalAmountAfterDiscount = 0;
        let eligibleProducts = [];
        let totalEligibleAmount = 0; // For calculating the total amount before discount
        const hasDiscount = data.some((product) => product.discountAmount > 0);

        // Process each item's response
        if (hasDiscount) {
          data.forEach((item) => {
            // if (item.discountAmount > 0) {
            totalDiscount += item.discountAmount;
            totalAmountAfterDiscount += item.total_after_discount;
            eligibleProducts.push({ id: item.id, message: item.message });
            totalEligibleAmount += item.total_after_discount; // Update the eligible total amount
            // } else {
            //   // Handle non-eligible products if necessary
            // }
          });

          // Update state with the calculated values
          setIsCouponApplied(true);
          setDiscountAfterApplyingCoupon(totalDiscount);
          setAmountAfterApplyingCoupon(totalEligibleAmount); // Set total amount after discount
          setEligibleProducts(eligibleProducts);
          setAppliedCoupon(couponCode);
          setCouponCode("");

          // Show success message
          toast.success("Coupon applied successfully!", {
            position: "top-center",
          });
        } else {
          toast.warn(data[0].message, {
            position: "top-center",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message, { position: "top-center" });
      });
  };

  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setEligibleProducts([]);
    setDiscountAfterApplyingCoupon(null);
    setAmountAfterApplyingCoupon(null);
    setAppliedCoupon(null);
  };

  useEffect(() => {
    if (eligibleProducts) {
      console.log(eligibleProducts);
    }
  }, [eligibleProducts]);

  const final = productId
    ? !isCouponApplied
      ? Number(cart?.totalAmount).toFixed(2)
      : Number(amountAfterApplyingCoupon).toFixed(2)
    : Number(amountAfterApplyingCoupon) || Number(cart?.totalAmount);

  console.log("total == =>", total);
  if (cart?.totalAmount) {
    console.log("this is cart total amount ===>", cart?.totalAmount);
  }
  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-8 text-sm">
        <a href="#" className="text-gray-500 hover:text-gray-700">
          Account
        </a>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
        <a href="#" className="text-gray-500 hover:text-gray-700">
          Product
        </a>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
        <a href="#" className="text-gray-500 hover:text-gray-700">
          View Cart
        </a>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />
        <span className="text-gray-900 font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Billing Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          {addresses && addresses.length > 0 ? (
            addresses.map((address, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg relative">
                <input
                  type="radio"
                  id={`address-${index}`}
                  name="address"
                  value={index}
                  checked={selectedAddress === index}
                  onChange={() => setSelectedAddress(index)}
                  className="absolute right-4 top-4"
                />
                <button
                  onClick={() => handleAddressEdit(address)}
                  className="absolute right-12 top-4 text-gray-500 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <label
                  htmlFor={`address-${index}`}
                  className="flex flex-col cursor-pointer"
                >
                  <h3 className="font-semibold">{address.name}</h3>
                  <p>
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.address}</p>
                  <p>{`${address.district}, ${address.state} ${address.pinCode}`}</p>
                  <p>{address.phone}</p>
                </label>
              </div>
            ))
          ) : (
            <div className="h-1/5 text-center font-medium text-xl">
              No Addresses!
            </div>
          )}
          <button
            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
            onClick={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
          >
            Add New Address
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-4">Payment Methods</h2>
          <p className="mb-4 text-sm text-gray-600">
            Select any payment methods
          </p>

          {["Wallet", "Paypal", "Razorpay", "Cash on Delivery"].map(
            (method, index) => (
              <div key={index} className="flex items-center mb-4">
                {method == "Cash on Delivery" &&
                (productId
                  ? !isCouponApplied
                    ? Number(cart?.totalAmount).toFixed(2)
                    : (
                        Number(cart?.totalAmount) - discountAfterApplyingCoupon
                      ).toFixed(2)
                  : (!isCouponApplied
                      ? total
                      : total - discountAfterApplyingCoupon
                    ).toFixed(2)) > 15000 ? (
                  <>
                    <input
                      type="radio"
                      id={`payment-${index}`}
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="mr-2"
                      disabled={true}
                    />
                    <label
                      htmlFor={`payment-${index}`}
                      className="line-through"
                    >
                      {method}
                    </label>
                  </>
                ) : (
                  <>
                    <input
                      type="radio"
                      id={`payment-${index}`}
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="mr-2"
                    />
                    <label htmlFor={`payment-${index}`}>{method}</label>{" "}
                  </>
                )}
              </div>
            )
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart?.items &&
            cart.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/products/${
                      item.product.variants.filter(
                        (variant) => variant.sku === item.variant
                      )[0].images[0]
                    }`}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover mr-4"
                  />
                  <div className="flex flex-col">
                    <span>{item.product.name}</span>

                    {item.product.variants
                      .filter((variant) => variant.sku === item.variant)
                      .map((variant) => (
                        <span key={variant.sku} className="text-xs">
                          {variant.ram}, {variant.storage}, {variant.color}
                        </span>
                      ))}
                  </div>
                </div>
                {eligibleProducts &&
                  eligibleProducts.some(
                    (pro) =>
                      item.product.category._id == pro.id._id &&
                      pro.message === "Coupon applied successfully"
                  ) && <span className="text-green-800">Coupon Applied</span>}
                {productId ? (
                  <span>
                    ₹{item.totalPrice.toFixed(2)} x {item.quantity}
                  </span>
                ) : (
                  <span>
                    ₹
                    {(item.price - (item.price * item.discount) / 100).toFixed(
                      2
                    )}{" "}
                    x {item.quantity}
                  </span>
                )}
              </div>
            ))}

          {productId ? (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{Number(cart?.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {isCouponApplied && (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Amount after applying coupon:</span>
                    <span>
                      {(
                        Number(cart?.totalAmount) - discountAfterApplyingCoupon
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Coupon discount:</span>
                    <span>-₹{discountAfterApplyingCoupon.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>
                  ₹
                  {!isCouponApplied
                    ? Number(cart?.totalAmount).toFixed(2)
                    : (
                        Number(cart?.totalAmount) - discountAfterApplyingCoupon
                      ).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {isCouponApplied && (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Amount after applying coupon:</span>
                    <span>
                      {(total - discountAfterApplyingCoupon).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Coupon iscount:</span>
                    <span>-₹{discountAfterApplyingCoupon.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>
                  ₹
                  {(!isCouponApplied
                    ? total
                    : total - discountAfterApplyingCoupon
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {appliedCoupon && (
            <div className="mt-4 p-2 bg-gray-100 rounded-md flex justify-between items-center">
              <span>Applied Coupon: {appliedCoupon}</span>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-8 flex space-x-2">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-grow border rounded px-3 py-2"
            />

            <button
              onClick={handleApplyCoupon}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              disabled={isCouponApplied}
            >
              Apply Coupon
            </button>
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={openModal}
              className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none "
            >
              View Coupons
            </button>
          </div>
          {productId ? (
            (!isCouponApplied
              ? Number(cart?.totalAmount).toFixed(2)
              : Number(cart?.totalAmount) -
                discountAfterApplyingCoupon.toFixed(2)) == 0 ? (
              <button
                disabled={true}
                className="w-full opacity-50 bg-gray-800 text-white py-3 rounded mt-5 hover:bg-gray-700 transition-colors"
              >
                Place Order
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gray-800 text-white py-3 rounded mt-5 hover:bg-gray-700 transition-colors"
              >
                Place Order
              </button>
            )
          ) : (!isCouponApplied
              ? total.toFixed(2)
              : total - discountAfterApplyingCoupon.toFixed(2)) == 0 ? (
            <button
              disabled={true}
              className="w-full opacity-50 bg-gray-800 text-white py-3 rounded mt-5 hover:bg-gray-700 transition-colors"
            >
              Place Order
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-gray-800 text-white py-3 rounded mt-5 hover:bg-gray-700 transition-colors"
            >
              Place Order
            </button>
          )}
        </div>
      </div>
      {isOpen && <AvailableCouponModal closeModal={closeModal} />}
      {isAddressModalOpen && (
        <AddEditAddressModal
          address={editingAddress}
          onClose={() => {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleAddressSave}
        />
      )}

      {isOrderSummaryModalOpen && !productId ? (
        <Paypal>
          <OrderSummaryModal
            cart={cart}
            subtotal={subtotal}
            shipping={shipping}
            coupon={discountAfterApplyingCoupon}
            code={code}
            total={
              !isCouponApplied
                ? total.toFixed(2)
                : (total - discountAfterApplyingCoupon).toFixed(2)
            }
            paymentMethod={paymentMethod}
            selectedAddress={addresses[selectedAddress]}
            onPlace={(orderId) => {
              setIsOrderSummaryModalOpen(false);
              navigate(`/profile/orders/${orderId}`);
            }}
            onClose={() => setIsOrderSummaryModalOpen(false)}
          />
        </Paypal>
      ) : (
        isOrderSummaryModalOpen && (
          <Paypal>
            <OrderSummaryModal
              cart={cart}
              subtotal={
                !isCouponApplied
                  ? Number(cart?.totalAmount).toFixed(2)
                  : (
                      Number(cart?.totalAmount) - discountAfterApplyingCoupon
                    ).toFixed(2)
              }
              shipping={shipping}
              coupon={discountAfterApplyingCoupon}
              code={code}
              total={
                !isCouponApplied
                  ? Number(cart?.totalAmount).toFixed(2)
                  : (
                      Number(cart?.totalAmount) - discountAfterApplyingCoupon
                    ).toFixed(2)
              }
              paymentMethod={paymentMethod}
              selectedAddress={addresses[selectedAddress]}
              onPlace={(orderId) => {
                setIsOrderSummaryModalOpen(false);
                navigate(`/profile/orders/${orderId}`);
              }}
              onClose={() => setIsOrderSummaryModalOpen(false)}
            />
          </Paypal>
        )
      )}
    </div>
  );
}
