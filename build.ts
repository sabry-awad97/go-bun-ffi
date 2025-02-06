import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import { $ } from "bun";
import dts from "bun-plugin-dts";

/**
 * Script: Build TypeScript Library and Go Shared Library
 * ------------------------------------------------------
 * This script performs two tasks:
 * 1. Builds a TypeScript library using Bun's `Bun.build` API.
 * 2. Compiles a Go shared library for the selected platform using Bun's `$` utility.
 *
 * Key Features:
 * - Supports Windows, Linux, and macOS dynamically.
 * - Uses `bun-plugin-dts` to generate TypeScript declaration files during the build process <button class="citation-flag" data-index="1">.
 * - Dynamically configures environment variables and file extensions for cross-compilation.
 * - Adds emojis and spinners for better UX and visual feedback <button class="citation-flag" data-index="3">.
 *
 * Prerequisites:
 * - Install GCC (MinGW-w64 for Windows), Clang (for macOS/Linux), or equivalent compilers.
 * - Ensure Go is installed and configured correctly.
 *
 * Usage:
 * - Run the script using `bun run build.ts`.
 */

// Step 1: Display an introductory message with an emoji
intro("✨ Welcome to the Multi-Platform Build Script! ✨");

// Prompt for user confirmation to proceed
const shouldProceed = await confirm({
  message: "🚀 Do you want to proceed with the build process?",
});

if (!shouldProceed || isCancel(shouldProceed)) {
  cancel("❌ Build process canceled by the user.");
  process.exit(0);
}

// Step 2: Build the TypeScript library
async function buildTypeScriptLibrary() {
  const s = spinner();
  s.start("⏳ Building TypeScript library...");

  // Sleep for a short duration to display the spinner
  await Bun.sleep(100);

  const result = await Bun.build({
    entrypoints: ["./src/index.ts"], // Entry point for the TypeScript build
    outdir: "./dist", // Output directory for compiled files
    external: ["bun:ffi"], // Exclude `bun:ffi` from bundling
    plugins: [dts()], // Generate TypeScript declaration files using `bun-plugin-dts` <button class="citation-flag" data-index="2">
  });

  if (!result.success) {
    s.stop("❌ TypeScript Build Failed.");
    console.error("Error Logs:", result.logs);
    outro("🛑 Exiting due to TypeScript build failure.");
    process.exit(1); // Exit with a non-zero status code to indicate failure
  }

  s.stop("✅ TypeScript Build Successful!");
}

// Step 3: Build the Go shared library
async function buildGoLibrary(platform: string) {
  const s = spinner();
  s.start(`⏳ Compiling Go shared library for ${platform}...`);
  // Sleep for a short duration to display the spinner
  await Bun.sleep(100);

  try {
    // Configure environment variables and file extension based on the platform
    const envVars: Record<
      string,
      Record<"CC" | "GOOS" | "GOARCH" | "CGO_ENABLED" | "outputFile", string>
    > = {
      windows: {
        CC: "gcc",
        GOOS: "windows",
        GOARCH: "amd64",
        CGO_ENABLED: "1",
        outputFile: "libgreet.dll",
      },
      linux: {
        CC: "gcc",
        GOOS: "linux",
        GOARCH: "amd64",
        CGO_ENABLED: "1",
        outputFile: "libgreet.so",
      },
      darwin: {
        CC: "clang",
        GOOS: "darwin",
        GOARCH: "amd64",
        CGO_ENABLED: "1",
        outputFile: "libgreet.dylib",
      },
    };

    const { CC, GOOS, GOARCH, CGO_ENABLED, outputFile } = envVars[platform];

    // Compile the Go shared library
    const shellOutput = await $`
      CC=${CC}
      GOOS=${GOOS}
      GOARCH=${GOARCH}
      CGO_ENABLED=${CGO_ENABLED}
      go build -o ${outputFile} -buildmode=c-shared main.go
    `;
    s.stop(`✅ Go Build Completed Successfully for ${platform}!`);
    log.success(`🎉 Go Build Output: ${JSON.stringify(shellOutput, null, 2)}`);
  } catch (err: any) {
    s.stop("❌ Go Build Failed.");
    // Log detailed error information for debugging
    console.error(`🚨 Go Build Failed with Exit Code: ${err.exitCode}`);
    console.error("Standard Output:", err.stdout?.toString() || "No stdout");
    console.error("Standard Error:", err.stderr?.toString() || "No stderr");

    // Provide actionable feedback based on exit codes
    if (err.exitCode === 1) {
      console.error(
        "❌ Error: Compilation failed due to syntax or configuration issues."
      );
    } else if (err.exitCode === 2) {
      console.error(
        "❌ Error: Missing dependencies or incorrect environment setup."
      );
    }
    outro("🛑 Exiting due to Go build failure.");
    process.exit(1); // Exit with a non-zero status code to indicate failure
  }
}

// Step 4: Main Build Process
async function main() {
  // Prompt for additional configuration options
  const platform = await select({
    message: "🌍 Select the target platform for the Go shared library:",
    options: [
      { value: "windows", label: "Windows 🖥️" },
      { value: "linux", label: "Linux 🐧" },
      { value: "darwin", label: "macOS 🍏" },
    ],
  });

  if (isCancel(platform)) {
    cancel("❌ Platform selection canceled.");
    process.exit(0);
  }

  log.info(`🎯 Target Platform: ${platform}`);

  // Execute the build steps
  await buildTypeScriptLibrary();
  await buildGoLibrary(platform);

  outro("🎉 Build Process Completed Successfully!");
}

main();
