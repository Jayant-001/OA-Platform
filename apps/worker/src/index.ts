import { WorkerService } from "./services/WorkerService";
import { DashboardService } from "./services/DashboardService";
import RabbitMQService from './services/rabbitmqService';

async function main() {
    try {
        // Initialize RabbitMQ first
        await RabbitMQService.initialize();
        console.log("RabbitMQ connection established");

        const workerService = new WorkerService();
      //  const dashboardService = new DashboardService();

        const shutdown = async () => {
            console.log("Shutting down the services...");
            await Promise.all([
                workerService.shutdown(),
             //   dashboardService.shutdown(),
                RabbitMQService.close()
            ]);
            process.exit(0);
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

       //
       //  await dashboardService.start();
        await workerService.start();

        console.log("Worker service and dashboard started");
    } catch (error) {
        console.error("Failed to start services:", error);
        process.exit(1);
    }
}

main().catch(console.error);
