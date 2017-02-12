export function Throw(message = 'Error occured'): never {
    throw new Error(message);
}

export function ThrowNotImplemented(): never {
    return Throw('Not implemented');
}

export function ThrowInvalidOperation(): never {
    return Throw('Invalid operation occured');
}

