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
        {/* <nav className="w-full mx-auto p-2 flex justify-between items-center bg-indigo-600">
          <Link to="/admin/dashboard" className="text-2xl text-white font-bold">
            nav
          </Link>
          <div>
            {profile.isProfileLoading && (
              <div>
                <div className="text-center">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className={`inline mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600`}
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
            )}
            {!profile.isProfileLoading && (
              <>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="">
                      <img
                      id="avatar"
                        className="w-12 h-12 rounded-full"
                        src={avatar ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIoAAAB7CAMAAACcl+jqAAAALVBMVEXK0eL////N1OT4+fvX3Ona3+vHzuDT2efx8/f7/P3p7PPk6PDt7/Xg5O719vngRy7KAAADoUlEQVR4nO3c63KrIBQFYOXqDd//cQsaEzUge20lk7aumXP+tON8RcANmFQ1O+0qcsooxynNI4NPN3QhfYhzvdNah39a+Vgf8UhVVXLJ6yLDdInnBcIlpug5Si2XmSOeqcIFEzHpHy2xicuYkPn/OflLncvhH/LZ3JRYbkos9qZE8kUUdVMi+SKKvimRXEO55M85QzHGus6XN486Z9DnCokTFNvJfVnXacHXcCnGdm2syJSabXFMiotCQtxnKWI4qL67T1LsvpNsM/AoPYMijiV13bBuOocyZiQ8i2FQjvrJEmnxgdShFOMIEj/FKAYFjEiO4m3G4hTT0yR1rXEKeIOoErxZUIoiU+DeglI0mVL34CAaQAq5q/jJpTCFMqksFExSNSCloVPQfluQUrhVRP758x8pufpgTQFHUMlWKUwp2CrgiLspZynDr6UI+S8o3U35W5QWo2RWy5uABSVIAaqVcJ4HFdogBWiTqV2Qa1uIQl0ZLoF2fTAK2irQAvGmXEABargQW45ioMFc11CBaGuIAqwNQ5BroxRgxeyDPVQUJqdvaYRgFSVIQZ6G6PMQpGB3CBpAKAWa+sFtPg1SKtpWaYgEN/lgiiBTHLj2gCn0WQ7rKRxKR70/4IVxCnmLEt4mxynUWQ4+LHMwhTqc0a5icAqx38JdhUEhdhZ0K5tFIe0it/CBF4tC6S1wo4THG04hWBhnhzxKvrugw4dPyTULPHzKUfBzw+mJUoKCbqn/DYr92xQ/c/5ySm5e4YwgHiW7BJGcl4w4FJffT+gZL400hYqEEbcwKLTSCV16cCiWJGFUCTiFuDwEt7I5FOo6aIQpI0yhbsfBLxjBFPKaGZ3mBEox9PdXwBc7hQQpmr7tNGqorIQoRvTgFvLY05uGTjHCgZu2U9pGUT6jRKeYSr295ktvGkd6CNAovAZ5RVLuU57iG+ScY0qbx/h6+RhytkHWmFMUocGjjmPM4eA+ohhDqJEwzKDTwylN8bcGPCgkalSi19gEBZ/N6PGDO4ZJUVwxSIiMHfpGKaYsZMa8tUyMcsU8kk+7b5l3iqDuVp9Oow4pRhW/N6+0m4+HqN1R48eaZE6fpnyklyQsWwp2XnpJVJQClK3X5fWW2JqCnZZeFRWhgMfZV+W5itRrSjN/mn+UybTMhJeNdoT28X0Czy1eve4rSKps1pXS9CH/fabfEM9f0+ArDAXzZRR9GBWNtatvbHiLEJvvcUikmm7amvIDTuIuybQHTykAAAAASUVORK5CYII="}
                        alt="Rounded avatar"
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/user/profile"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              onClick={logout}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              logout
                            </div>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            )}
          </div>
        </nav> */}
        <Header AuthContext={auth} CartContext={cart} />
        <hr />
        <Outlet />
      </>
    )
  );
}
