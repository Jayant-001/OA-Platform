import { WorkerService } from './services/WorkerService';
import { DashboardService } from './services/DashboardService';

async function main() {
    const workerService = new WorkerService();
    const dashboardService = new DashboardService(
        workerService.getInputQueue(),
        workerService.getOutputQueue()
    );

    const shutdown = async () => {
        console.log("Shutting down the services...");
        await Promise.all([
            workerService.shutdown(),
            dashboardService.shutdown()
        ]);
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);  // Add SIGINT listener

    await dashboardService.start();
    await workerService.start();

    console.log('Worker service and dashboard started');
}

main().catch(console.error);
