import React from 'react';

export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={'text-sm text-red-600 font-medium ' + className}>
            {message}
        </p>
    ) : null;
}
