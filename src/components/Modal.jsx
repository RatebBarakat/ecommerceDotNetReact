import React, { useEffect, useState, useCallback } from 'react';
import {
  TERipple,
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalFooter,
} from 'tw-elements-react';
// eslint-disable-next-line react/prop-types
const Modal = ({ header, errors, identifier, showModal, toggleModal, onSubmit, children }) => {
  const [show, setShow] = useState(showModal);

  const handleOutsideClick = useCallback((event) => {
    const modalContent = document.getElementById('modal-content' + identifier);
    if (show && modalContent && !modalContent.contains(event.target)) {
      toggleModal(false);
    }
  }, [show, identifier, toggleModal]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    setShow(showModal);
  }, [showModal]);

  useEffect(() => {
    if (show) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [show, handleOutsideClick]);

  return (
    <div>
      <TEModal show={show}>
        <TEModalDialog>
          <TEModalContent id={`modal-content${identifier}`} className='p-3'>
            <TEModalHeader>
              <h2>{header}</h2>
            </TEModalHeader>
            {errors && Object.keys(errors).map((field, index) => (
              <span key={index} className='text-red-600'>
                {errors[field]}
              </span>
            ))}
            {children}
            <TEModalFooter>
              <TERipple rippleColor="light">
                <button
                  type="button"
                  className="inline-block rounded bg-indigo-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-indigo-700 transition duration-150 ease-in-out hover-bg-indigo-accent-100 focus-bg-indigo-accent-100 focus-outline-none focus-ring-0 active-bg-indigo-accent-200"
                  onClick={() => toggleModal(false)}
                >
                  Close
                </button>
              </TERipple>
              <TERipple rippleColor="light">
                <button
                  type="button"
                  className="ml-1 inline-block rounded bg-indigo px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-indigo-600 border border-indigo-600 transition duration-150 ease-in-out hover-text-white hover-bg-indigo-600"
                  onClick={handleSubmit}
                >
                  Save changes
                </button>
              </TERipple>
            </TEModalFooter>
          </TEModalContent>
        </TEModalDialog>
      </TEModal>
    </div>
  );
};

export default React.memo(Modal);
