import { CString, dlopen, FFIType, ptr, type Library } from "bun:ffi";

interface ILibrary {
  greet(name: string): string;
}

export class SharedLibrary implements ILibrary {
  private lib: Library<{
    Greet: {
      args: FFIType.ptr[];
      returns: FFIType.ptr;
    };
  }>;

  constructor(libraryPath: string) {
    this.lib = dlopen(libraryPath, {
      Greet: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
      },
    });
  }

  greet(name: string): string {
    // Encode the name to a null-terminated UTF-8 buffer
    const encodedName = this.encode(name);
    // Get the pointer to the encoded buffer
    const namePtr = ptr(encodedName);
    // Call the Go function and get the result pointer
    const resultPtr = this.lib.symbols.Greet(namePtr);

    // Check if the result pointer is null
    if (!resultPtr) {
      throw new Error("Failed to call Greet function");
    }

    // Convert the result pointer to a JavaScript string
    return new CString(resultPtr).toString();
  }

  private encode(data: string): Uint8Array {
    const encoder = new TextEncoder();
    // Append null terminator for C strings
    return encoder.encode(data + "\0");
  }
}

