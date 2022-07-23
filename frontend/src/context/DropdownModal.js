import React, { useContext, createContext, useRef, useState, useEffect } from "react";
import ReactDOM from 'react-dom';

import './DropdownModal.css';

const DropdownModalContext = createContext();

export function DropdownModalProvider ({ children }) {
    const modalRef = useRef();
    const [ value, setValue ] = useState();

    useEffect(() => {
        setValue(modalRef.current);
    }, [])

    return (
        <>
            <DropdownModalContext.Provider value={value}>
                {children}
            </DropdownModalContext.Provider>
            <div ref={modalRef} />
        </>
    )
}

export function DropdownModal({ onClose, children }) {
    const modalNode = useContext(DropdownModalContext);
    if (!modalNode) return null;

    return ReactDOM.createPortal(
        <div id="dropdown-modal">
        <div id="dropdown-modal-background" onClick={onClose} />
        <div id="dropdown-modal-content">
            {children}
        </div>
        </div>,
        modalNode
    );
}
