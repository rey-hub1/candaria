import React from 'react';

export default function ApplicationLogo({ className, ...props }) {
    return (
        <img
            src="/img/logo-color.png"
            alt="Candaria"
            className={`object-contain ${className ?? ''}`}
            {...props}
        />
    );
}
