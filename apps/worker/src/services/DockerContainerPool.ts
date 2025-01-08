import Docker from "dockerode";
import fs from "fs/promises";
import path from "path";
import { ContainerPool } from "../types";

const docker = new Docker();

interface TestCase {
    id: string;
    input: string;
    output: string;
    problem_id: string;
    is_sample: boolean;
}

interface TestResult {
    testCaseId: string;
    status:
        | "accepted"
        | "wrong_answer"
        | "runtime_error"
        | "time_limit_exceeded";
    executionTime: number;
    memoryUsed: number;
    output?: string;
    error?: string;
}

export class DockerContainerPool implements ContainerPool {
    private maxPoolSize: number;
    private imageType: string;
    private command: string;
    private availableContainers: Docker.Container[];
    private busyContainers: Set<Docker.Container>;
    private executionTimeout: number;
    private tempDir: string;
    private fileExtension: string;

    constructor(
        maxPoolSize = 5,
        imageType = "gcc:latest",
        command: string,
        executionTimeout = 10000,
        fileExtension = ".cpp"
    ) {
        this.maxPoolSize = maxPoolSize;
        this.imageType = imageType;
        this.command = command;
        this.executionTimeout = executionTimeout;
        this.availableContainers = [];
        this.busyContainers = new Set();
        this.tempDir = path.join(process.cwd(), "temp");
        this.fileExtension = fileExtension;
    }

    async initialize(): Promise<void> {
        await fs.mkdir(this.tempDir, { recursive: true });
        await this.initializePool();
    }

    async processRunCode(
        content: string,
        input?: string
    ): Promise<{ result: string; executionTimeMs: number }> {
        const container = await this.acquireContainer();
        console.log("Container acquired -> ", container.id);

        try {
            const res = await this.createFilesInContainer(
                container,
                content,
                input
            );
            const { output, executionTimeMs } = await this.executeCode(
                container
            );

            console.log("Execution time -> ", executionTimeMs);
            await this.releaseContainer(container);

            return { result: output, executionTimeMs }; // Return execution time
        } catch (error) {
            console.log("Error -> ", error);
            await this.releaseContainer(container);
            throw error;
        }
    }

    async processSubmitCode(
        code: string,
        testCases: TestCase[]
    ): Promise<{ result: string; executionTimeMs: number }> {
        const container = await this.acquireContainer();
        console.log("Container acquired for submission -> ", container.id);
        const results: TestResult[] = [];
        const startTime = performance.now();

        try {
            // First, create the code file
            await this.createCodeFile(container, code);

            // Process each test case sequentially
            for (const testCase of testCases) {
                try {
                    // Create input file for this test case
                    await this.createInputFile(container, testCase.input);

                    // Execute the code
                    const { output, executionTimeMs } = await this.executeCode(
                        container
                    );

                    console.log(
                        testCase.input,
                        " ----->>>>> ",
                        output,
                        executionTimeMs
                    );

                    // Compare output with expected output
                    const status = this.compareOutput(
                        output.trim(),
                        testCase.output.trim()
                    )
                        ? "accepted"
                        : "wrong_answer";

                    results.push({
                        testCaseId: testCase.id,
                        status,
                        executionTime: executionTimeMs,
                        memoryUsed: 0, // TODO: Implement memory tracking
                        output: output.trim(),
                    });
                } catch (error) {
                    results.push({
                        testCaseId: testCase.id,
                        status: "runtime_error",
                        executionTime: 0,
                        memoryUsed: 0,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    });
                }

                // Add a small delay between test cases to ensure file system operations complete
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            console.log(results);

            await this.releaseContainer(container);
            return {
                result: "results",
                executionTimeMs: performance.now() - startTime,
            };
        } catch (error) {
            console.error("Submission processing error:", error);
            await this.releaseContainer(container);
            throw error;
        }
    }

    private async acquireContainer(): Promise<Docker.Container> {
        if (this.availableContainers.length === 0) {
            const newContainer = await this.createContainer();

            return newContainer;
        }

        const container = this.availableContainers.pop()!;
        this.busyContainers.add(container);
        return container;
    }

    private async initializePool(): Promise<void> {
        while (this.availableContainers.length < this.maxPoolSize) {
            const container = await this.createContainer();
            this.availableContainers.push(container);
        }
    }

    private async createContainer(): Promise<Docker.Container> {
        try {
            const container = await docker.createContainer({
                Image: this.imageType,
                Tty: true,
                OpenStdin: true,
                Cmd: ["/bin/bash"],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                HostConfig: {
                    Memory: 512 * 1024 * 1024, // 512MB memory limit
                    MemorySwap: 512 * 1024 * 1024, // Disable swap
                    CpuPeriod: 100000,
                    CpuQuota: 50000, // Limit to 50% CPU
                    NetworkMode: "none", // Disable network access
                },
                // HostConfig: {
                //     Binds: [`${this.tempDir}:/app`],
                // },
            });
            await container.start();
            return container;
        } catch (error) {
            console.error("Container creation failed:", error);
            throw error;
        }
    }

    async executeCode(
        container: Docker.Container
    ): Promise<{ output: string; executionTimeMs: number }> {
        const exec = await container.exec({
            Cmd: ["sh", "-c", `${this.command}`],
            AttachStdout: true,
            AttachStderr: true,
            // WorkingDir: "/app", // Set working directory explicitly
        });

        const execStartOptions = {
            Detach: false,
            Tty: false,
            stdin: false,
        };

        return new Promise((resolve, reject) => {
            const startTime = performance.now(); // Start time

            const timeout = setTimeout(() => {
                reject(new Error("Execution timeout"));
            }, this.executionTimeout);

            exec.start(execStartOptions, (err, stream) => {
                if (err || !stream) {
                    clearTimeout(timeout);
                    return reject(err || new Error("Stream is undefined"));
                }

                let stdoutChunks: Buffer[] = [];
                let stderrChunks: Buffer[] = [];

                // Handle multiplexed streams
                stream.on("data", (chunk: Buffer) => {
                    const type = chunk[0];
                    const payload = chunk.slice(8);

                    // 1 is stdout, 2 is stderr
                    if (type === 1) stdoutChunks.push(payload);
                    else if (type === 2) stderrChunks.push(payload);
                });

                stream.on("end", () => {
                    clearTimeout(timeout);
                    const endTime = performance.now(); // End time
                    const executionTimeMs = endTime - startTime;
                    const stdout = Buffer.concat(stdoutChunks).toString("utf8");
                    const stderr = Buffer.concat(stderrChunks).toString("utf8");

                    if (stderr) {
                        reject(new Error(stderr));
                    } else {
                        resolve({ output: stdout, executionTimeMs }); // Include execution time
                    }
                });

                stream.on("error", (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        });
    }

    async createFilesInContainer(
        container: Docker.Container,
        code: string,
        input?: string
    ): Promise<void> {
        let containerCodePath = "/app/main" + this.fileExtension;
        if (this.fileExtension === ".java") {
            const classNameMatch = code.match(/public\s+class\s+(\w+)/);
            const className = classNameMatch ? classNameMatch[1] : "Main";
            containerCodePath = `/app/${className}.java`;
        }
        const containerInputPath = "/app/input.txt";

        // Escape code and input to prevent command injection and handle special characters
        // const escapedCode = code.replace(/'/g, "'\\''").replace(/"/g, '\\"');
        // const escapedInput = input ? input.replace(/'/g, "'\\''").replace(/"/g, '\\"') : '';

        // Prepare the shell command to create files and copy code and input into the container
        const createFilesCommand = `mkdir -p $(dirname ${containerCodePath}) && 
                                    echo '${code}' > ${containerCodePath} && 
                                    echo '${input}' > ${containerInputPath}`;

        try {
            const exec = await container.exec({
                Cmd: ["sh", "-c", createFilesCommand],
                AttachStdout: true,
                AttachStderr: true,
            });

            const execStartOptions = {
                Detach: false,
                Tty: false,
                stdin: false,
            };

            const result = await new Promise((resolve, reject) => {
                exec.start(execStartOptions, (err, stream) => {
                    if (err || !stream) {
                        return reject(err || new Error("Stream is undefined"));
                    }

                    let stderrChunks: Buffer[] = [];

                    // Handle stderr
                    stream.on("data", (chunk: Buffer) => {
                        const type = chunk[0];
                        if (type === 2) {
                            stderrChunks.push(chunk.slice(8)); // Collect stderr data
                        }
                    });

                    stream.on("end", () => {
                        const stderr =
                            Buffer.concat(stderrChunks).toString("utf8");

                        if (stderr) {
                            reject(new Error(stderr)); // If there's an error, reject
                        } else {
                            resolve("Files created successfully.");
                        }
                    });

                    stream.on("error", (error) => {
                        reject(error);
                    });
                });
            });
        } catch (error) {
            throw new Error(`Error in creating files: ${error}`);
        }
    }

    private async createCodeFile(
        container: Docker.Container,
        code: string
    ): Promise<void> {
        const containerCodePath = "/app/main" + this.fileExtension;
        const createCodeCommand = `mkdir -p /app && echo '${code}' > ${containerCodePath}`;

        await this.execCommand(container, createCodeCommand);
    }

    private async createInputFile(
        container: Docker.Container,
        input: string
    ): Promise<void> {
        const containerInputPath = "/app/input.txt";
        const createInputCommand = `echo '${input}' > ${containerInputPath}`;

        await this.execCommand(container, createInputCommand);
    }

    private async execCommand(
        container: Docker.Container,
        command: string
    ): Promise<void> {
        const exec = await container.exec({
            Cmd: ["sh", "-c", command],
            AttachStdout: true,
            AttachStderr: true,
        });

        return new Promise((resolve, reject) => {
            exec.start(
                {
                    Detach: false,
                    Tty: false,
                },
                (err, stream) => {
                    if (err) return reject(err);
                    if (!stream) return reject(new Error("No stream"));

                    let stderrChunks: Buffer[] = [];

                    stream.on("data", (chunk: Buffer) => {
                        if (chunk[0] === 2) {
                            // stderr
                            stderrChunks.push(chunk.slice(8));
                        }
                    });

                    stream.on("end", () => {
                        const stderr =
                            Buffer.concat(stderrChunks).toString("utf8");
                        if (stderr) reject(new Error(stderr));
                        else resolve();
                    });

                    stream.on("error", reject);
                }
            );
        });
    }

    private compareOutput(actual: string, expected: string): boolean {
        return actual === expected;
    }

    private async releaseContainer(container: Docker.Container): Promise<void> {
        this.busyContainers.delete(container);
        this.availableContainers.push(container);
    }

    async shutdown(): Promise<void> {
        const allContainers = [
            ...this.availableContainers,
            ...this.busyContainers,
        ];
        await Promise.all(
            allContainers.map(async (container) => {
                try {
                    await container.stop();
                    await container.remove();
                } catch (error) {
                    console.error(
                        `Failed to cleanup container ${container.id}:`,
                        error
                    );
                }
            })
        );

        this.availableContainers = [];
        this.busyContainers.clear();
        await fs
            .rm(this.tempDir, { recursive: true, force: true })
            .catch(console.error);
    }
}

export default DockerContainerPool;
