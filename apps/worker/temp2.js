import Docker from "dockerode";
import path from "path";
import fs from "fs";

const docker = new Docker();

async function runCppCode() {
    try {
        // Ensure source and input files exist
        const sourceFile = path.join(process.cwd(), "src", "main.cpp");
        const inputFile = path.join(process.cwd(), "src", "input.txt");

        if (!fs.existsSync(sourceFile)) {
            throw new Error(`Source file not found: ${sourceFile}`);
        }

        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file not found: ${inputFile}`);
        }

        // Create Docker container
        const container = await docker.createContainer({
            Image: "gcc-time",
            Tty: true,
            OpenStdin: true,
            Cmd: ["/bin/bash"],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Binds: [`${path.join(process.cwd(), "src")}:/app`],
            },
        });

        // Start the container
        await container.start();
        console.log("🟢 Container started successfully");

        // Compilation step
        const compileExec = await container.exec({
            Cmd: [
                "bash",
                "-c",
                "cd /app && g++ -std=c++17 -O2 -Wall main.cpp -o program",
            ],
            AttachStdout: true,
            AttachStderr: true,
        });

        const compileStream = await compileExec.start();

        // Capture compilation output
        const compileOutput = await new Promise((resolve, reject) => {
            let output = "";
            compileStream.on("data", (chunk) => {
                output += chunk.toString();
            });
            compileStream.on("end", () => resolve(output));
            compileStream.on("error", reject);
        });

        // Check compilation results
        if (compileOutput.includes("error")) {
            console.error("❌ Compilation Failed:", compileOutput);
            await container.stop();
            await container.remove();
            return;
        }

        console.log("✅ Compilation Successful");

        // Execution step with precise timing
        const executeExec = await container.exec({
            Cmd: [
                "bash",
                "-c",
                // Use /usr/bin/time with verbose output
                "cd /app && /usr/bin/time -v ./program < input.txt 2>&1",
            ],
            AttachStdout: true,
            AttachStderr: true,
        });

        const executeStream = await executeExec.start();

        // Capture execution output and metrics
        const executionResult = await new Promise((resolve, reject) => {
            let output = "";
            let metrics = {
                runtime: null,
                memoryUsage: null,
                cpuUsage: null,
                status: "Unknown",
            };

            executeStream.on("data", (chunk) => {
                const chunkStr = chunk.toString();
                output += chunkStr;
                console.log("🔍 Execution Chunk:", chunkStr.trim());

                // Regex patterns for extracting metrics
                const patterns = {
                    runtime:
                        /Elapsed \(wall clock\) time \(h:mm:ss or m:ss\): (\d+:\d+\.\d+)/,
                    userTime: /User time \(seconds\): (\d+\.\d+)/,
                    systemTime: /System time \(seconds\): (\d+\.\d+)/,
                    memoryUsage: /Maximum resident set size \(kbytes\): (\d+)/,
                    cpuPercentage: /Percent of CPU this job got: (\d+)%/,
                };

                // Extract metrics
                Object.keys(patterns).forEach((key) => {
                    const match = chunkStr.match(patterns[key]);
                    if (match) {
                        metrics[key] = match[1];
                        console.log(
                            `📊 ${key.charAt(0).toUpperCase() + key.slice(1)}:`,
                            metrics[key]
                        );
                    }
                });
            });

            executeStream.on("end", () => {
                metrics.status = "Completed";
                resolve({ output, metrics });
            });

            executeStream.on("error", reject);
        });

        // Stop and remove container
        await container.stop();
        await container.remove();

        return executionResult;
    } catch (error) {
        console.error("❌ Execution Error:", error);
    }
}

// Main execution
async function main() {
    console.log("🚀 Starting C++ Code Execution");
    const result = await runCppCode();

    if (result) {
        console.log("\n📊 Execution Summary:");
        console.log("Status:", result.metrics.status);
        console.log("Runtime (wall clock):", result.metrics.runtime);
        console.log("User Time:", result.metrics.userTime, "seconds");
        console.log("System Time:", result.metrics.systemTime, "seconds");
        console.log("Memory Usage:", result.metrics.memoryUsage, "KB");
        console.log("CPU Usage:", result.metrics.cpuPercentage, "%");
        console.log("\n📝 Full Output:\n", result.output);
    }
}

main();
