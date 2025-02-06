import { SharedLibrary } from "./ffi";

// Usage
const libraryPath =
  process.platform === "win32"
    ? "./libgreet.dll"
    : process.platform === "linux"
    ? "./libgreet.so"
    : "./libgreet.dylib";
const library = new SharedLibrary(libraryPath);
const result = library.greet("Bun.js");
console.log(result); // Outputs: Hello, Bun.js!
