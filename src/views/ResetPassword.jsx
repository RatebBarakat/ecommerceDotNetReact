import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { AuthContext } from '../contexts/auth';
import createAxiosInstance from '../axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const axios = createAxiosInstance(auth);

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handlePasswordConfChange = (event) => {
        setPasswordConf(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const params = new URLSearchParams(location.search);
            const payload = {
                token : params.get('token'),
                email : params.get('email'),
                password : password,
                password_conf : passwordConf,
            };
            const response = await axios.post('/reset-password', payload);
            Toast.notify('success',response.data.status ?? response.data.message);
            navigate('/login');
        } catch (error) {
            Toast.notify('error',error.response.data.message);
        }
    };

    return (
        <>
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                        <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Reset Password
                        </h2>
                        <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                    placeholder="name@company.com"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="passwordConf" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                <input
                                    type="password"
                                    name="passwordConf"
                                    id="passwordConf"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                    placeholder="Confirm password"
                                    value={passwordConf}
                                    onChange={handlePasswordConfChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                Reset Password
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;
