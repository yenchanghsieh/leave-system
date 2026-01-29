import '@testing-library/jest-dom'

// ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// PointerEvent polyfill (simplified)
if (!global.PointerEvent) {
    class PointerEvent extends MouseEvent {
        constructor(type, params = {}) {
            super(type, params);
            this.pointerId = params.pointerId;
            this.width = params.width;
            this.height = params.height;
            this.pressure = params.pressure;
            this.tangentialPressure = params.tangentialPressure;
            this.tiltX = params.tiltX;
            this.tiltY = params.tiltY;
            this.pointerType = params.pointerType;
            this.isPrimary = params.isPrimary;
        }
    }
    global.PointerEvent = PointerEvent;
}

// matchMedia polyfill
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// HTMLElement.prototype.hasPointerCapture polyfill
if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => { };
}
if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => { };
}
