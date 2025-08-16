import '@testing-library/jest-dom';
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IO,
});
