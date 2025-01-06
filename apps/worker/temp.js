class DockerContainerPool {
    constructor(maxPoolSize = 5, imageType = 'gcc:latest') {
        this.maxPoolSize = maxPoolSize;
        this.imageType = imageType;
        this.availableContainers = [];
        this.busyContainers = new Set();
    }

    async initializePool() {
        while (this.availableContainers.length < this.maxPoolSize) {
            const container = await this.createContainer();
            this.availableContainers.push(container);
        }
    }

    async createContainer() {
        try {
            const container = await docker.createContainer({
                Image: this.imageType,
                Tty: true,
                OpenStdin: true,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true
            });
            await container.start();
            return container;
        } catch (error) {
            console.error('Container creation failed:', error);
            throw error;
        }
    }

    async acquireContainer() {
        if (this.availableContainers.length === 0) {
            // If no containers are available, create a new one
            const newContainer = await this.createContainer();
            return newContainer;
        }

        const container = this.availableContainers.pop();
        this.busyContainers.add(container);
        return container;
    }

    async releaseContainer(container) {
        // Clean up container
        await this.resetContainer(container);

        // Remove from busy containers
        this.busyContainers.delete(container);

        // Add back to available pool if not exceeding max
        if (this.availableContainers.length < this.maxPoolSize) {
            this.availableContainers.push(container);
        } else {
            // Remove excess container
            await container.remove();
        }
    }

    async resetContainer(container) {
        // Remove any existing files
        await container.exec({
            Cmd: ['rm', '-rf', '/app/*'],
            AttachStdout: true,
            AttachStderr: true
        });
    }

    async processCode(content, inputData) {
        const container = await this.acquireContainer();

        try {
            // Copy code and input to container
            await this.copyFilesToContainer(container, content, inputData);

            // Compile and run code
            const result = await this.executeCode(container);

            // Release container back to pool
            await this.releaseContainer(container);

            return result;
        } catch (error) {
            // Ensure container is released even if an error occurs
            await this.releaseContainer(container);
            throw error;
        }
    }

    async copyFilesToContainer(container, content, inputData) {
        // Implementation to copy files to container
        // Use docker CP or volume mounting
    }

    async executeCode(container) {
        // Execute compilation and run
        const exec = await container.exec({
            Cmd: ['sh', '-c', 'g++ /app/main.cpp -o /app/main && /app/main < /app/input.txt'],
            AttachStdout: true,
            AttachStderr: true
        });

        const stream = await exec.start();
        return new Promise((resolve, reject) => {
            let output = '';
            stream.on('data', (chunk) => {
                output += chunk.toString();
            });
            stream.on('end', () => resolve(output));
            stream.on('error', reject);
        });
    }
}

// Usage
const containerPool = new DockerContainerPool();
await containerPool.initializePool();

const result = await containerPool.processCode(codeContent, inputData);