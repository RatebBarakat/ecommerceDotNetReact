import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import { Link } from "react-router-dom";
import createAxiosInstance from "../axios.jsx";

const Orders = () => {
  const [isLoading,setIsLoading] = useState(true);
  const [orders,setOrders] = useState([]);

  const axios = createAxiosInstance();

  useEffect(() => {
    axios.get('user/orders')
    .then(response => {
      console.log('response.data :>> ', response.data);
      setOrders(response.data);
    }).catch(e => {
      console.log('e :>> ', e);
    }).finally(() => {
      setIsLoading(false);
    })
  }, [])

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>
      <div className="w-full md:w-3/4 shadow-lg mx-auto">
        {isLoading ? (
          <Loading />
        ) : orders?.length < 1 ? (
          <div className="p-4 text-center">
            <p>no orders</p>
            <Link to="/" className="text-blue-500 hover:underline">
              Continue shopping and create one
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-2">total</th>
                <th className="py-2">address</th>
                <th className="py-2">products</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.total}</td>
                  <td className="py-2">{item.address}</td>
                  <td className="py-2">{Array.from(item.items).map(i => i.name).join(',')}</td>               
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
