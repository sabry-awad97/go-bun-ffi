# go-bun-ffi

This project demonstrates how to use Bun.js to interface with a Go shared library using FFI (Foreign Function Interface). It includes a TypeScript library that interacts with a Go shared library to greet users.

## Prerequisites

- [Bun](https://bun.sh) v1.2.2 or later
- Go 1.23.4 or later
- GCC (MinGW-w64 for Windows), Clang (for macOS/Linux), or equivalent compilers

## Installation

To install dependencies, run:

```bash
bun install
```

## Building the Project

To build the TypeScript library and the Go shared library, run:

```bash
bun run build.ts
```

You will be prompted to select the target platform for the Go shared library (Windows, Linux, or macOS).

## Running the Project

To run the project, execute:

```bash
To run the project, execute:
```

This will load the appropriate shared library for your platform and call the `Greet` function from the Go library.

## Project Structure

`build.ts`: Script to build the TypeScript library and compile the Go shared library.
`main.go`: Go source file that defines the `Greet` function.
`ffi.ts`: TypeScript file that defines the `SharedLibrary` class to interface with the Go shared library.
`index.ts`: Entry point for running the project, demonstrating the usage of the `SharedLibrary` class.

## Usage

The `SharedLibrary` class in `ffi.t`s provides a method to call the `Greet` function from the `Go` shared library. The `index.ts` file demonstrates how to use this class:

```ts
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
```

## License

This project is licensed under the MIT License.

For more details, refer to the source files:

- [build.ts](build.ts)
- [main.go](main.go)
- [src/ffi.ts](src/ffi.ts)
- [src/index.ts](src/index.ts)
