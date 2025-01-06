import { Queue, QueueEvents } from "bullmq";
import { config } from "../config";
import { CodeExecutionJob, ExecutionResult } from "../types";
import { performance } from "perf_hooks";

interface SampleCode {
    fibonacci: string;
    sort: string;
    countAndSay: string;
}

interface LanguageSamples {
    [key: string]: SampleCode;
}

const sampleCodes: LanguageSamples = {
    cpp: {
        fibonacci: `
            #include <iostream>
            using namespace std;

            int fibonacci(int n) {
                if (n <= 1) return n;
                return fibonacci(n-1) + fibonacci(n-2);
            }

            int main() {
                int n;
                cin >> n;
                cout << fibonacci(n) << endl;
                return 0;
            }
        `,
        sort: `
            #include <iostream>
            #include <vector>
            #include <algorithm>
            using namespace std;

            int main() {
                int n;
                cin >> n;
                vector<int> arr(n);
                for(int i = 0; i < n; i++) {
                    arr[i] = n - i;
                }
                sort(arr.begin(), arr.end());
                for(int x : arr) cout << x << " ";
                cout << endl;
                return 0;
            }
        `,
        countAndSay: `
            #include <bits/stdc++.h>
            using namespace std;

            string solve(string &s, int i) {
                if(i >= s.size()) return "";
                char first = s[i];
                int count = 0;
                while(i < s.length() && s[i] == first) count++, i++;
                
                string res = to_string(count);
                res.push_back(first);
                return res + solve(s, i);
            }

            string countAndSay(int n) {
                string s = "1";
                for(int i = 1; i < n; i++) {
                    s = solve(s, 0);
                }
                return s;
            }

            int main() {
                int n;
                cin >> n;
                cout << countAndSay(n) << endl;
                return 0;
            }
        `
    },
    python: {
        fibonacci: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

n = int(input())
print(fibonacci(n))
        `,
        sort: `
n = int(input())
arr = list(range(n, 0, -1))
arr.sort()
print(' '.join(map(str, arr)))
        `,
        countAndSay: `
def solve(s, i):
    if i >= len(s):
        return ""
    first = s[i]
    count = 0
    while i < len(s) and s[i] == first:
        count += 1
        i += 1
    return str(count) + first + solve(s, i)

def countAndSay(n):
    s = "1"
    for i in range(1, n):
        s = solve(s, 0)
    return s

n = int(input())
print(countAndSay(n))
        `
    },
    java: {
        fibonacci: `
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }

    public static void main(String[] args) {
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(fibonacci(n));
    }
}
        `,
        sort: `
public class Main {
    public static void main(String[] args) {
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int n = scanner.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) {
            arr[i] = n - i;
        }
        java.util.Arrays.sort(arr);
        for(int x : arr) {
            System.out.print(x + " ");
        }
        System.out.println();
    }
}
        `,
        countAndSay: `
public class Main {
    public static String solve(String s, int i) {
        if(i >= s.length()) return "";
        char first = s.charAt(i);
        int count = 0;
        while(i < s.length() && s.charAt(i) == first) {
            count++;
            i++;
        }
        return count + String.valueOf(first) + solve(s, i);
    }

    public static String countAndSay(int n) {
        String s = "1";
        for(int i = 1; i < n; i++) {
            s = solve(s, 0);
        }
        return s;
    }

    public static void main(String[] args) {
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(countAndSay(n));
    }
}
        `
    },
    javascript: {
        fibonacci: `
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('', n => {
    console.log(fibonacci(parseInt(n)));
    readline.close();
});
        `,
        sort: `
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('', n => {
    n = parseInt(n);
    const arr = Array.from({length: n}, (_, i) => n - i);
    arr.sort((a, b) => a - b);
    console.log(arr.join(' '));
    readline.close();
});
        `,
        countAndSay: `
console.log(100);
        `
    }
};


interface BenchmarkOptions {
    language: keyof typeof sampleCodes;
    concurrency: number;
    totalJobs: number;
    codeType?: keyof SampleCode;
}

class BenchmarkTester {
    private inputQueue: Queue;
    private outputQueue: Queue;
    private results: Map<string, ExecutionResult>;
    private startTime: number = 0;
    private completedJobs: number;
    private totalJobs: number;
    private times: number[] = [];  // Add this to track individual job times

    constructor() {
        this.inputQueue = new Queue(config.queues.input, {
            connection: config.redis,
        });
        this.outputQueue = new Queue(config.queues.output, {
            connection: config.redis,
        });
        this.results = new Map();
        this.completedJobs = 0;
        this.totalJobs = 0;
    }

    async runBenchmark(options: BenchmarkOptions) {
        this.startTime = performance.now();
        this.totalJobs = options.totalJobs;

        console.log(`Starting benchmark with ${options.totalJobs} jobs...`);

        const queueEvents = new QueueEvents(config.queues.output, {
            connection: config.redis,
        });

        queueEvents.on(
            "completed",
            async (args: { jobId: string; returnvalue: string }) => {
                const result = JSON.parse(args.returnvalue) as ExecutionResult;
                this.handleResult(result);
            }
        );

        await queueEvents.waitUntilReady();

        // Generate and send jobs
        const jobs = this.generateJobs(options);
        await Promise.all(
            jobs.map((job) => this.inputQueue.add("code-execution", job))
        );

        // Wait for all results
        await this.waitForCompletion();
        await this.cleanup();
        this.printStats();
    }

    private generateJobs(options: BenchmarkOptions): CodeExecutionJob[] {
        const jobs: CodeExecutionJob[] = [];
        const code = options.codeType
            ? sampleCodes[options.language][options.codeType]
            : sampleCodes[options.language].fibonacci;

        for (let i = 1; i <= options.totalJobs; i++) {
            jobs.push({
                id: `benchmark-${i}`,
                language: options.language.toString(), // Convert to string
                code,
                input: `${i}`,
                timeout: 5000,
            });
        }
        return jobs;
    }

    private handleResult(result: ExecutionResult) {
        this.results.set(result.jobId, result);
        this.completedJobs++;
        
        if (result.executionTime) {
            this.times.push(result.executionTime);
        }

        console.log(`Job ${result.jobId} completed:`);
        console.log(`  Status: ${result.success ? 'Success' : 'Failed'}`);
        console.log(`  Execution Time: ${result.executionTime}ms`);
        if (result.error) {
            console.log(`  Error: ${result.error}`);
        }
        console.log(`  Progress: ${this.completedJobs}/${this.totalJobs} (${((this.completedJobs/this.totalJobs)*100).toFixed(2)}%)`);
    }

    private async waitForCompletion(): Promise<void> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.completedJobs >= this.totalJobs) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    private async cleanup() {
        await this.inputQueue.close();
        await this.outputQueue.close();
    }

    private printStats() {
        const endTime = performance.now();
        const totalTime = endTime - this.startTime;
        const avgTime = totalTime / this.totalJobs;

        const minTime = Math.min(...this.times);
        const maxTime = Math.max(...this.times);
        const medianTime = this.times.sort((a,b) => a-b)[Math.floor(this.times.length/2)];

        console.log('\nDetailed Benchmark Results:');
        console.log('-------------------------');
        console.log(`Total jobs: ${this.totalJobs}`);
        console.log(`Total wall clock time: ${totalTime.toFixed(2)}ms`);
        console.log(`Average time per job (wall clock): ${avgTime.toFixed(2)}ms`);
        console.log(`Throughput: ${(this.totalJobs / (totalTime / 1000)).toFixed(2)} jobs/second`);
        
        console.log('\nExecution Time Statistics:');
        console.log(`  Minimum: ${minTime.toFixed(2)}ms`);
        console.log(`  Maximum: ${maxTime.toFixed(2)}ms`);
        console.log(`  Median: ${medianTime.toFixed(2)}ms`);
        console.log(`  Average: ${(this.times.reduce((a,b) => a+b, 0) / this.times.length).toFixed(2)}ms`);

        const successfulJobs = Array.from(this.results.values()).filter(r => r.success).length;
        const failedJobs = this.totalJobs - successfulJobs;
        
        console.log('\nSuccess/Failure Statistics:');
        console.log(`  Successful: ${successfulJobs} (${((successfulJobs/this.totalJobs)*100).toFixed(2)}%)`);
        console.log(`  Failed: ${failedJobs} (${((failedJobs/this.totalJobs)*100).toFixed(2)}%)`);

        if (failedJobs > 0) {
            console.log('\nFailure Analysis:');
            const failures = Array.from(this.results.values()).filter(r => !r.success);
            const errorGroups = failures.reduce((acc, curr) => {
                const error = curr.error || 'Unknown error';
                acc[error] = (acc[error] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            Object.entries(errorGroups).forEach(([error, count]) => {
                console.log(`  ${error}: ${count} occurrences (${((count/failedJobs)*100).toFixed(2)}%)`);
            });
        }
    }
}

async function main() {
    const tester = new BenchmarkTester();
    const languages = ['javascript', 'cpp', 'python', 'java', 'javascript'] as const;
    const testTypes = ['countAndSay', 'sort', 'countAndSay'] as const;

    // Test each language with each type
    for (const language of languages) {
        for (const testType of testTypes) {
            console.log(`\nRunning ${testType} test for ${language}`);

            await tester.runBenchmark({
                language,
                concurrency: 5,
                totalJobs: 5,
                codeType: testType
            });
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}
