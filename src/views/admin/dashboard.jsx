import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Permission } from "../../helpers/permissions";
import { AuthContext } from "../../contexts/auth";
import createAxiosInstance from "../../axios";

const DashboardLink = ({ to, text, count = 0, bg }) => (
  <div className={`container mx-auto text-center border hover:shadow-lg ${bg}`}>
    <Link
      to={to}
      className="dashboard-link w-full flex items-center justify-between px-3"
    >
      <div className="dashboard-link-content p-4 text-white rounded-lg">
        <span className="dashboard-link-text text-lg font-semibold">
          {text}
        </span>
      </div>
      <span>
        {/* <h6 className="text-gray-100 p-4">{count}</h6> */}
      </span>
    </Link>
  </div>
);

export default function Dashboard() {
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance(auth);
  const [counts, setCounts] = useState([
    {categories : 0},
    {products : 0},
    {tags : 0},
  ]);

  const dashboardLinks = [
    {
      permission: "read-categories",
      route: "/admin/categories",
      text: "Categories",
      bg: "bg-red-600",
      count : counts['categories']
    },
    {
      permission: "read-products",
      route: "/admin/products",
      text: "Products",
      bg: "bg-blue-600",
      count : counts['products']
    },
    // {
    //   permission: "read-tags",
    //   route: "/admin/tags",
    //   text: "Tags",
    //   bg: "bg-green-600",
    //   count : counts['tags']
    // },
    {
      permission: "read-roles",
      route: "/admin/roles",
      text: "Roles",
      bg: "bg-yellow-600",
      count : 0
    },
  ];

  useEffect(() => {
    axios.get("/api/counts").then((response) => {
      setCounts(response.data);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardLinks.map(
          ({ permission, route, text, bg,count }) =>
            Permission.can(auth, permission) && (
              <DashboardLink
                key={permission}
                to={route}
                // count={count}
                text={text}
                bg={bg}
              />
            )
        )}
      </div>
    </div>
  );
}
