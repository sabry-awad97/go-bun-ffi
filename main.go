package main

import "C"
import "fmt"

func ch(str string) *C.char {
	return C.CString(str)
}

func str(ch *C.char) string {
	return C.GoString(ch)
}

//export Greet
func Greet(name *C.char) *C.char {
	greeting := fmt.Sprintf("Hello, %s!", str(name))
	return ch(greeting)
}

func main() {} // Required but unused for shared libraries
