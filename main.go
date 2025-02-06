package main

// #include <stdlib.h>
import "C"
import (
	"fmt"
	"unsafe"
)

// cString converts a Go string to a C-compatible null-terminated string.
// The returned *C.char must be freed by the caller using FreeString or C.free to avoid memory leaks.
//
// Parameters:
// - str: string - A Go string to be converted into a C-compatible string.
//
// Returns:
// - *C.char - A pointer to a C-compatible null-terminated string.
func cString(str string) *C.char {
	return C.CString(str)
}

// goString converts a C-compatible null-terminated string (*C.char) into a Go string.
// This function safely handles the conversion without requiring manual memory management.
//
// Parameters:
// - ch: *C.char - A pointer to a C-compatible null-terminated string.
//
// Returns:
// - string - A Go string representation of the input C string.
func goString(ch *C.char) string {
	return C.GoString(ch)
}

// Greet generates a greeting message for the provided name.
// This function is exported to be callable from C or other FFI-compatible environments.
//
// Parameters:
// - name: *C.char - A pointer to a C-compatible null-terminated string representing the name to greet.
//
// Returns:
//   - *C.char - A pointer to a C-compatible null-terminated string containing the greeting message.
//     The caller is responsible for freeing this memory using FreeString or C.free to prevent memory leaks.
//
//export Greet
func Greet(name *C.char) *C.char {
	// Convert the C string to a Go string for processing.
	goName := goString(name)

	// Generate the greeting message using Go's fmt.Sprintf.
	greeting := fmt.Sprintf("Hello, %s!", goName)

	// Convert the Go string back to a C-compatible string and return it.
	// Note: The caller must free the returned C string using FreeString or C.free.
	return cString(greeting)
}

// FreeString frees the memory allocated for a C-compatible string (*C.char).
// This function is exported to allow external programs (e.g., Bun.js via bun:ffi) to manage memory safely.
//
// Parameters:
// - str: *C.char - A pointer to a C-compatible null-terminated string that needs to be freed.
//
//export FreeString
func FreeString(str *C.char) {
	if str != nil {
		C.free(unsafe.Pointer(str))
	}
}

// main is required for shared libraries but remains unused in this context.
// It serves as a placeholder to satisfy the Go compiler when building shared libraries.
func main() {}
