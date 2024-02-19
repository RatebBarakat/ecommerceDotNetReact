import { toast } from 'react-toastify';

// const Toast = ({ type, message }) => {
//     const showToast = () => {
//         const types = ['info', 'success', 'error'];
//         const toastType = types.includes(type) ? type : 'info';
//         toast[toastType](message.toString());
//     };


//     return showToast();

// };


class Toast {
    type = 'info';
    message = '';

    constructor(type,message) {
        this.type = type;    
        this.message = message;    
    }

    static notify(type,message) {
        toast[type](message.toString());
    }

    static notifyMessage(type,message){
        toast[type](message);
    }
}

export default Toast;

