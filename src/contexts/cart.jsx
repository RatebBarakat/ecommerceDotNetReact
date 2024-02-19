import { createContext, useEffect, useState } from "react";
import createAxiosInstance from "../axios";

const CartContext = createContext({});

const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState([]);
  const [total,setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const axios = createAxiosInstance();

  const getTotal = () => {
    var total = 0;
    carts.map((cart) => {
      total += cart.product.price * cart.product.quantity;
    });

    return total;
  };

  const addToCart = async (productId) => {
    await axios.post("/api/cart", {
      product_id: productId,
      quantity: 1,
    });
  };

  const deleteFromCart = async (cartId) => {
    setIsLoading(true);
    await axios.delete(`/api/cart/${cartId}`, {
    });
    setCarts(carts.filter((cart) => cart.id != cartId));
    setIsLoading(false);
  };

  const fetchCart = async () => {
    !isLoading && setIsLoading(true);

    axios
      .get("/api/cart")
      .then((response) => {
        setCarts(response.data.data);
        setTotal(response.data.total);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const isInCart = (id) => {
    if (carts.length === 0) return false;
    return carts.some((cart) => cart.product.id === id);
  };

  const updateItem = (id,quantity) => {
    axios.put(`/api/cart/${id}`,{
      quantity : quantity
    })
  }

  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    carts,
    isLoading,
    total,
    fetchCart,
    isInCart,
    addToCart,
    getTotal,
    deleteFromCart,
    updateItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartProvider, CartContext };
