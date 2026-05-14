#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const API_KEY = process.env.PUCKAPI_API_KEY;
if (!API_KEY) {
  console.error("PUCKAPI_API_KEY environment variable is required. Get a free key at https://puckapi.com/signup");
  process.exit(1);
}

const REMOTE_URL = "https://mcp.puckapi.com/mcp";

const client = new Client({ name: "puckapi-bridge", version: "1.0.0" });

const transport = new StreamableHTTPClientTransport(new URL(REMOTE_URL), {
  requestInit: {
    headers: { "x-api-key": API_KEY },
  },
});

await client.connect(transport);

const { tools } = await client.listTools();

const server = new McpServer({ name: "puckapi", version: "1.0.0" });

for (const tool of tools) {
  server.tool(tool.name, tool.description ?? "", tool.inputSchema?.properties ?? {}, async (params) => {
    const result = await client.callTool({ name: tool.name, arguments: params });
    return result;
  });
}

const stdio = new StdioServerTransport();
await server.connect(stdio);
