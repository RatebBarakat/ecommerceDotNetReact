import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/auth";
import Loading from "../components/Loading";

export default function GuestLayout() {
  const auth = useContext(AuthContext);
  
  return auth.isLoading ? (
    <Loading centered={true} size={"large"} />
  ) : auth.user ? (
    <Navigate
      to={auth.isAdmin === false ? "/user/dashboard" : "/admin/dashboard"}
    />
  ) : (
    <Outlet />
  );
}
