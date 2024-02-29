import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth";
import Loading from "../components/Loading";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ProfileContext } from "../contexts/profile";
import Cookies from "js-cookie";
import Toast from "../components/Toast";
import createAxiosInstance from "../axios";
import Header from "../components/Header";
import { CartContext } from "../contexts/cart";

export default function AuthLayout() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const cart = useContext(CartContext);
  const profile = useContext(ProfileContext);
  const [avatar, setAvatar] = useState();


    useEffect(() => {
      setAvatar(profile.profile?.avatar || null);
      if(profile.profile?.avatar && document.getElementById('avatar')){
        document.getElementById('avatar').src = profile.profile?.avatar;
      }
    }, [profile.isLoading]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const axios = createAxiosInstance();

  const logout = async () => {
    try {
      if (!Cookies.get("XSRF-TOKEN")) {
        await axios.get("/sanctum/csrf-cookie", {
          withCredentials: "include",
        });
      }
      await auth.logout();
      return navigate("/login",{
        replace : true
      });
    } catch (error) {
      Toast.notifyMessage('Failed to logout');
    }
  };  

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      if (auth.isLoading === false && !auth.user) {
        navigate("/login");
      } else if (auth.isLoading === false && auth.isVerified === false) {
        navigate("/user/verify");
      }
    };
    fetchUserAndRedirect();
  }, [auth.isLoading,auth.isVerified,auth.isVerified,auth.user]);

  if (auth.isLoading) {
    return <Loading centered={true} size={"large"} />;
  }

  return (
    auth.user && (
      <>
        <Header AuthContext={auth} CartContext={cart} />
        <hr />
        <Outlet />
      </>
    )
  );
}
