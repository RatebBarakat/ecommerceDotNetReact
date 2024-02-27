import { useContext, useEffect, useState } from "react";
import Loading from "../components/Loading";
import createAxiosInstance from "../axios";
import { CartContext } from "../contexts/cart";
import Header from "../components/Header";
import { AuthContext } from "../contexts/auth";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axios = createAxiosInstance();
  const cart = useContext(CartContext);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/user/products/home").then((response) => {
      setCategories(response.data);
      setIsLoading(false);
    });
  }, []);

  const addToCart = async (productId) => {
    cart.addToCart(productId).catch(() => {
      navigate("/login");
    });
  };

  return (
    <>
      {isLoading ? (
        <Loading centered={false} size={7} />
      ) : (
        <>
          <Header AuthContext={auth} CartContext={cart} />
          <div className="cotainer p-2 border shadow-lg bg-gray-100">
            {categories.map((category) => (
              <div
                key={category.name}
                className="shadow mb-2 rounded pb-2 bg-gray-50"
              >
                <h2 className="text-md text-center text-indigo-600 font-bold border mb-2 rounded py-2">
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center">
                  {category.products.map((product) => (
                    <div
                      key={product.id}
                      className="product shadow border bg-white rounded-lg mx-auto w-full overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt="no image"
                        className="w-full h-40 object-cover mb-4"
                      />
                      <div className="content px-2">
                        <h3 className="text-lg font-semibold mb-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-1">
                          {product.smallDescription}
                        </p>
                        <p className="text-gray-800 font-semibold">
                          ${product.price}
                        </p>
                        {cart.isInCart(product.id) ? (
                          <button
                            onClick={() => addToCart(product.id)}
                            disabled
                            className="bg-indigo-200 text-white px-2 py-1 rounded-md mb-2"
                          >
                            In Cart
                          </button>
                        ) : cart.isLoading ? (
                          <button
                            disabled
                            className="bg-indigo-300 text-white px-2 py-1 rounded-md mb-2"
                          >
                            loading...
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded-md mb-2"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
