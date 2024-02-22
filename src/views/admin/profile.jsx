import { useContext, useEffect, useState } from "react";
import Input from "../../components/input";
import Toast from "../../components/Toast";
import ErrorHelper from "../../helpers/errors";
import Loading from "../../components/Loading";
import { AuthContext } from "../../contexts/auth";
import { ProfileContext } from "../../contexts/profile";
import createAxiosInstance from "../../axios";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors,setErrors] = useState([]);
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance(auth);
  const [profile, setProfile] = useState({
    postal_code: null,
    country: null,
    state: null,
    city: null,
    address: null,
    phone: null,
  });
  const [avatar, setAvatar] = useState(null);
  const useProfile = useContext(ProfileContext);

  useEffect(() => {
    useProfile.profile
      ? setProfile(useProfile.profile)
      : axios
          .get("/api/profile")
          .then((response) => {
            setProfile(response.data.data);
            useProfile.setProfile(response.data.data);
          })
          .finally(() => {
            setIsLoading(false);
          });
          setIsLoading(false)
  }, []);


  const changeHandler = (event) => {
    const file = event.target.files[0];
    setAvatar(file);
    setAvatar(file);
  };

  const handleSubmission = (event) => {
    event.preventDefault();
    setErrors({});
    setProcessing(true);
    useProfile.setIsProfileLoading(true);
    const form = new FormData();
    for (const key in profile) {
      if (key !== "avatar") {
        form.append(key, profile[key]);
      }
    }

    if (avatar) {
      form.append("avatar", avatar);
    }
    axios.post("/api/profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log('response :>> ', response);
        setProfile(response.data.data);
        useProfile.setProfile(response.data.data);
        Toast.notifyMessage("success", "category added");
      })
      .catch((error) => {
        const errorsMessages = ErrorHelper.extractErrorMessage(error);
        errors && setErrors(errorsMessages);
        Toast.notifyMessage("error", "error");
      })
      .finally(() => {
        setProcessing(false);
        useProfile.setIsProfileLoading(false);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loading size="large" />
      ) : (
        <form
          onSubmit={handleSubmission}
          action=""
          className="lg:!w-3/4 sm:grid mt-3 rounded shadow-2xl sm:grid-cols-2 sm:gap-3 mx-auto justify-center p-4"
        >
          <h2
            className="text-center font-bold text-3xl text-indigo-600"
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          >
            profile
          </h2>
          {/* <Input
            label="postal_code"
            type="text"
            value={profile.postal_code}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, postal_code: event.target.value })
            }
            error={errors?.postal_code || null}
            placeholder="postal_code"
          />
          <Input
            label="country"
            type="text"
            value={profile.country}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, country: event.target.value })
            }
            error={errors?.country || null}
            placeholder="country"
          />
          <Input
            label="state"
            type="text"
            value={profile.state}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, state: event.target.value })
            }
            error={errors?.state || null}
            placeholder="state"
          />
          <Input
            label="city"
            type="text"
            value={profile.city}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, city: event.target.value })
            }
            error={errors?.city || null}
            placeholder="city"
          />
          <Input
            label="address"
            type="text"
            value={profile.address}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, address: event.target.value })
            }     
             error={errors?.address || null}
            placeholder="address"
          />
          <Input
            label="phone"
            type="text"
            value={profile.phone}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProfile({ ...profile, phone: event.target.value })
            }
            error={errors?.phone || null}
            placeholder="phone"
          /> */}
          <Input
            label="avatar"
            type="file"
            name="file"
            error={errors?.avatar || null}
            onChange={(event) => changeHandler(event)}
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          />
          <button
            disabled={processing}
            className="group disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            type="submit"
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          >
            update profile
          </button>
        </form>
      )}
    </>
  );
}
