import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/auth";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import createAxiosInstance from "../axios";
import Toast from "../components/Toast";
import { CartContext } from "../contexts/cart";

export default function Home() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axios = createAxiosInstance();
  const cart = useContext(CartContext);

  useEffect(() => {
    axios.get('/user/google/redirect').then(r => console.log(r)).catch(e => {
      console.warn(e);
    })
    axios.get("/product").then((response) => {
      setProducts(response.data.data);
      setIsLoading(false);
    });
    axios.get("/admin/categories").then((response) => {
      setProducts(response.data.data);
      setIsLoading(false);
    });
  }, []);

  const addToCart = async (productId) => {
    await cart.addToCart(productId);
    await cart.fetchCart();
    Toast.notifyMessage("success", "added");
  };

  return (
    <>
      {isLoading ? (
        <Loading centered={false} size={7} />
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-4">
            Welcome, you cart contains {cart.carts.length}
          </h1>
          <h2 className="text-xl font-semibold mb-2">Products:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg p-4"
              >
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-500 my-2">
                  {product.small_description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-green-500 font-semibold text-xl">
                      ${product.price}
                    </p>
                    <p className="text-gray-500">
                      Quantity: {product.quantity}
                    </p>
                  </div>
                  <button
                    className={`text-white py-2 px-4 rounded-lg ${
                      cart.isInCart(product.id)
                        ? "!bg-indigo-300 cursor-not-allowed"
                        : "bg-indigo-600"
                    } hover:bg-indigo-700`}
                    onClick={() => addToCart(product.id)}
                  >
                    {cart.isLoading ? <Loading size={5} /> : 'Add to Cart'}
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 font-medium">Tags:</p>
                  <div className="flex space-x-2">
                    {product.tags &&
                      product.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 rounded-full py-1 px-2 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
