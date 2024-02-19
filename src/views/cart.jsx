import { useContext, useMemo, useState } from "react";
import Loading from "../components/Loading.jsx";
import { Link } from "react-router-dom";
import { CartContext } from "../contexts/cart.jsx";
import Toast from "../components/Toast.jsx";

const Cart = () => {
  const cart = useContext(CartContext);
  const [updatingItem, setUpdatingQuantity] = useState({
    id: 0,
    quantity: 0,
  });

  const updateItem = async () => {
    await cart.updateItem(updatingItem.id, updatingItem.quantity);
    await cart.fetchCart();
    Toast.notifyMessage("success", "Item updated");
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
      <div className="w-full md:w-3/4 shadow-lg mx-auto">
        {cart.isLoading ? (
          <Loading />
        ) : cart.carts?.length < 1 ? (
          <div className="p-4 text-center">
            <p>Your shopping cart is empty</p>
            <Link to="/" className="text-blue-500 hover:underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-2">Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Total</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.carts.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.product.name}</td>
                  <td className="py-2">{item.product.price}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      name="qt"
                      id="qt"
                      className="w-16 p-2 border"
                      value={
                        updatingItem.id == item.id
                          ? updatingItem.quantity
                          : item.quantity
                      }
                      onChange={(event) =>
                        setUpdatingQuantity({
                          id: item.id,
                          quantity: event.target.value,
                        })
                      }
                    />
                  </td>
                  <td className="py-2">
                    {item.quantity * item.product.price}
                  </td>
                  <td className="py-2">
                    {updatingItem.id == item.id &&
                      updatingItem.quantity != item.quantity && (
                        <button
                          onClick={() => updateItem()}
                          className="bg-green-500 text-white px-2 py-1 mr-2"
                        >
                          Update
                        </button>
                      )}
                    <button
                      onClick={() => cart.deleteFromCart(item.id)}
                      className="bg-red-500 text-white px-2 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="py-2 text-right">
                  Total
                </td>
                <td className="py-2">{cart.total}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Cart;
