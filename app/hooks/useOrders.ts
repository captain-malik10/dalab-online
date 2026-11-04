import { useState, useCallback } from 'react';

interface OrderDetails {
  shipping_address: string;
}

interface PaymentDetails {
  orderId: number;
  method: 'EVC plus' | 'Edahab';
  phone_number: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

export function useOrders() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  const fetchUserInfo = useCallback(async (): Promise<UserInfo | null> => {
    setLoadingUserInfo(true);
    setUserInfoError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserInfoError('No authentication token found.');
        setLoadingUserInfo(false);
        return null;
      }

      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setLoadingUserInfo(false);
        return userData;
      } else {
        const errorData = await response.json();
        setUserInfoError(errorData.message || 'Failed to fetch user info.');
        setLoadingUserInfo(false);
        return null;
      }
    } catch (error: any) {
      setUserInfoError(error.message || 'Error fetching user info.');
      setLoadingUserInfo(false);
      return null;
    }
  }, []);

  const createOrder = useCallback(async (orderDetails: OrderDetails): Promise<number | null> => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to place an order');
      }

      const orderResponse = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      setOrderId(orderData.orderId);
      setIsSubmitting(false);
      return orderData.orderId;
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create order');
      setIsSubmitting(false);
      return null;
    }
  }, []);

  const processPayment = useCallback(async (paymentDetails: PaymentDetails): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const paymentResponse = await fetch(
        `http://localhost:3001/api/orders/${paymentDetails.orderId}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            method: paymentDetails.method,
            phone_number: paymentDetails.phone_number,
          }),
        },
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      setIsSubmitting(false);
      return true;
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to process payment');
      setIsSubmitting(false);
      return false;
    }
  }, []);

  return {
    isSubmitting,
    submitError,
    setSubmitError, // Expose the setter
    orderId,
    loadingUserInfo,
    userInfoError,
    fetchUserInfo,
    createOrder,
    processPayment,
  };
}
