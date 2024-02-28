import {
    createBrowserRouter,
  } from "react-router-dom";
import Home from "./views/Home";
import GuestLayout from "./layouts/GuestLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./views/Login";
import Register from "./views/Register";
import VerifyEmail from "./views/VerifyEmail";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import Categories from "./views/admin/category";
import Profile from "./views/admin/profile";
import Dashboard from "./views/admin/dashboard";
import Products from "./views/admin/product";
import CreateProduct from "./views/admin/product/create";
import Updateproduct from "./views/admin/product/update";
import Tags from "./views/admin/tag";
import AdminLayout from "./layouts/AdminLayout";
import Cart from "./views/cart";
import Roles from "./views/admin/roles";
import Orders from "./views/orders";
import Category from "./views/Category";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/category/:id',
        element: <Category />
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'register',
                element: <Register />
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword />
            },
            {
                path: 'password-reset',
                element: <ResetPassword />
            },
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'categories',
                element: <Categories />
            },
            {
                path: 'roles',
                element: <Roles />
            },
            {
                path: 'products',
                element: <Products />
            },
            {
                path: 'tags',
                element: <Tags />
            },
            {
                path: 'products/create',
                element: <CreateProduct />
            },
            {
                path: 'products/edit/:id',
                element: <Updateproduct />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'verify',
                element: <VerifyEmail />
            },
        ]
    },
    {
        path: '/user',
        element: <AuthLayout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'order',
                element: <Orders />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'verify',
                element: <VerifyEmail />
            },
            {
                path: 'cart',
                element: <Cart />
            },
        ]
    },
]);

export default router;

