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
    FreeString: {
      args: [FFIType.ptr]; // Pointer to the C string to free
      returns: FFIType.void; // No return value
    };
  }>;

  constructor(libraryPath: string) {
    this.lib = dlopen(libraryPath, {
      Greet: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
      },
      FreeString: {
        args: [FFIType.ptr],
        returns: FFIType.void,
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

    const result = new CString(resultPtr).toString();

    // Free the name buffer allocated by the Go function
    this.lib.symbols.FreeString(resultPtr);

    // Convert the result pointer to a JavaScript string
    return result;
  }

  private encode(data: string): Uint8Array {
    const encoder = new TextEncoder();
    // Append null terminator for C strings
    return encoder.encode(data + "\0");
  }
}
