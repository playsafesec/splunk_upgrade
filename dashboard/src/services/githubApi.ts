import axios, { type AxiosInstance } from 'axios';

import type { WorkflowRun, WorkflowJob, HostInventory, PackageInventory, GitHubConfig } from '../types';

class GitHubAPI {
    private api: AxiosInstance;
    private config: GitHubConfig;

    constructor(config: GitHubConfig) {
        this.config = config;
        this.api = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                Authorization: `Bearer ${config.token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });
    }

    // Trigger workflow dispatch
    async triggerWorkflow(inputs: {
        target_mode: 'single_server' | 'all_servers_in_class';
        host_class: string;
        server_name?: string;
        package_id: string;
    }): Promise<void> {
        const { owner, repo, workflowFileName } = this.config;

        await this.api.post(
            `/repos/${owner}/${repo}/actions/workflows/${workflowFileName}/dispatches`,
            {
                ref: 'main',
                inputs,
            }
        );
    }

    // Get latest workflow run
    async getLatestWorkflowRun(): Promise<WorkflowRun | null> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/actions/runs`,
                {
                    params: {
                        per_page: 1,
                        status: 'in_progress,queued,completed',
                    },
                }
            );

            if (response.data.workflow_runs.length > 0) {
                return response.data.workflow_runs[0];
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch workflow run:', error);
            return null;
        }
    }

    // Get specific workflow run
    async getWorkflowRun(runId: number): Promise<WorkflowRun | null> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/actions/runs/${runId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch workflow run:', error);
            return null;
        }
    }

    // Get workflow jobs
    async getWorkflowJobs(runId: number): Promise<WorkflowJob[]> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`
            );
            return response.data.jobs || [];
        } catch (error) {
            console.error('Failed to fetch workflow jobs:', error);
            return [];
        }
    }

    // Get workflow run logs
    async getWorkflowLogs(runId: number): Promise<string> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
                { responseType: 'text' }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch workflow logs:', error);
            return '';
        }
    }

    // Get job logs
    async getJobLogs(jobId: number): Promise<string> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
                { responseType: 'text' }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch job logs:', error);
            return '';
        }
    }

    // Get file content from repository
    async getFileContent(path: string): Promise<string> {
        const { owner, repo } = this.config;

        try {
            const response = await this.api.get(
                `/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Accept: 'application/vnd.github.raw',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch file ${path}:`, error);
            throw error;
        }
    }

    // Update file in repository
    async updateFile(
        path: string,
        content: string,
        message: string
    ): Promise<void> {
        const { owner, repo } = this.config;

        try {
            // First, get the current file to retrieve its SHA
            const fileResponse = await this.api.get(
                `/repos/${owner}/${repo}/contents/${path}`
            );
            const sha = fileResponse.data.sha;

            // Update the file
            await this.api.put(
                `/repos/${owner}/${repo}/contents/${path}`,
                {
                    message,
                    content: btoa(content), // Base64 encode the content
                    sha,
                }
            );
        } catch (error) {
            console.error(`Failed to update file ${path}:`, error);
            throw error;
        }
    }

    // Get host inventory
    async getHostInventory(): Promise<HostInventory> {
        const content = await this.getFileContent('inventory/host.json');
        return JSON.parse(content);
    }

    // Get package inventory
    async getPackageInventory(): Promise<PackageInventory> {
        const content = await this.getFileContent('inventory/package.json');
        return JSON.parse(content);
    }

    // Update host inventory
    async updateHostInventory(inventory: HostInventory): Promise<void> {
        const content = JSON.stringify(inventory, null, 4);
        await this.updateFile(
            'inventory/host.json',
            content,
            'Update host inventory via dashboard'
        );
    }

    // Update package inventory
    async updatePackageInventory(inventory: PackageInventory): Promise<void> {
        const content = JSON.stringify(inventory, null, 4);
        await this.updateFile(
            'inventory/package.json',
            content,
            'Update package inventory via dashboard'
        );
    }

    // Cancel workflow run
    async cancelWorkflowRun(runId: number): Promise<void> {
        const { owner, repo } = this.config;

        try {
            await this.api.post(
                `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`
            );
        } catch (error) {
            console.error('Failed to cancel workflow run:', error);
            throw error;
        }
    }
}

// Export singleton instance
let githubApiInstance: GitHubAPI | null = null;

export const initializeGitHubAPI = (config: GitHubConfig): GitHubAPI => {
    githubApiInstance = new GitHubAPI(config);
    return githubApiInstance;
};

export const getGitHubAPI = (): GitHubAPI => {
    if (!githubApiInstance) {
        throw new Error('GitHub API not initialized. Call initializeGitHubAPI first.');
    }
    return githubApiInstance;
};

export default GitHubAPI;
