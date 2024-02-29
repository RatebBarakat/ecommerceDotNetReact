import { createContext, useContext, useEffect, useState } from "react";
import createAxiosInstance from "../axios";
import Toast from "../components/Toast";
import { AuthContext } from "./auth";

const CartContext = createContext({});

const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance();

  const getTotal = () => {
    var total = 0;
    carts.map((cart) => {
      total += cart.product.price * cart.quantity;
    });

    return total;
  };

  const startCheckout = (address) => {
    return new Promise((res, rej) => {
      axios
        .post("user/orders", {
          address: address,
        })
        .then(() => {
          fetchCart();
          res(true);
        })
        .catch((e) => {
          rej(e);
        });
    });
  };

  const addToCart = async (productId) => {
    return new Promise((res, reject) => {
      axios
        .post("/user/cart", {
          ProductId: productId,
          Quantity: 1,
        })
        .then(() => {
          fetchCart();
        })
        .catch((e) => {
          Toast.notifyMessage("error", "can't add item to cart");
          reject("login");
        });
    });
  };

  const deleteFromCart = async (cartId) => {
    setIsLoading(true);
    await axios
      .delete(`/user/cart/${cartId}`, {})
      .then(() => {
        fetchCart();
      })
      .catch((e) => {
        Toast.notifyMessage("error", "can't add item to cart");
      });
    setCarts(carts.filter((cart) => cart.id != cartId));
    setIsLoading(false);
  };

  const fetchCart = () => {
    setIsLoading(true);
    axios
      .get("/user/cart")
      .then((response) => {
        setCarts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cart:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const isInCart = (id) => {
    if (carts.length === 0) return false;
    return carts.some((cart) => cart.productId === id);
  };

  const updateItem = (id, quantity) => {
    axios
      .put(`/user/cart/${id}`, {
        CartId: id,
        Quantity: quantity,
      })
      .then(() => {
        fetchCart();
      })
      .catch((e) => {
        Toast.notifyMessage("error", "can't update item in cart");
      });
  };

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
    updateItem,
    startCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartProvider, CartContext };
