// Polyfill for Node.js crypto module to fix "crypto externalized" error
export function randomBytes(size: number) {
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  return Array.from(arr); // bcryptjs can use an array of numbers
}
export default { randomBytes };
