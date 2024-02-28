import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import createAxiosInstance from "../axios";
import Loading from "../components/Loading";
import { CartContext } from "../contexts/cart";
import Header from "../components/Header";
import { AuthContext } from "../contexts/auth";

export default function Category() {
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const axios = createAxiosInstance();
  const cart = useContext(CartContext);
  const auth = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts(id);
  }, [id]);

  const fetchProducts = (id) => {
    axios
      .get(`/categories/${id}/products?page=${page}`)
      .then((response) => {
        const { data } = response.data;
        setProducts((prevProducts) => [...prevProducts, ...data]);
        setPage((prev) => prev + 1);
        setIsLoading(false);
        setHasMore(response.data.hasNextPage);
      })
      .catch((error) => {
        console.log("Error fetching products:", error);
        setIsLoading(false);
      });
  };

  const loadMore = () => {
    fetchProducts(id);
  };
  
  const addToCart = async (productId) => {
    try {
      await cart.addToCart(productId);
    } catch (error) {
      navigate("/login");
    }
  };

  return (
    <>
      <Header CartContext={cart} AuthContext={auth} />
      <InfiniteScroll
      className="overflow-hidden"
        dataLength={products.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<Loading centered={true} size={"small"} />}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>No more products</b>
          </p>
        }
      >
        <div className="grid grid-cols-2 overflow-hidden md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center pt-2 mx-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="product shadow border bg-white rounded-lg mx-auto w-full overflow-hidden"
            >
              <img
                src={product.image}
                alt="Product"
                className="w-full h-40 object-cover mb-4"
              />
              <div className="content px-2">
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-600 mb-1">{product.smallDescription}</p>
                <p className="text-gray-800 font-semibold">${product.price}</p>
                {cart.isInCart(product.id) ? (
                  <button
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
                    Loading...
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
      </InfiniteScroll>
    </>
  );
}
