#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.PUCKAPI_API_KEY;
if (!API_KEY) {
  console.error("PUCKAPI_API_KEY environment variable is required. Get a free key at https://puckapi.com/signup");
  process.exit(1);
}

const client = new Client({ name: "puckapi-bridge", version: "1.0.0" });

const transport = new StreamableHTTPClientTransport(new URL("https://mcp.puckapi.com/mcp"), {
  requestInit: {
    headers: { "x-api-key": API_KEY },
  },
});

await client.connect(transport);

const { tools } = await client.listTools();

const server = new Server(
  { name: "puckapi", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = await client.callTool({
    name: request.params.name,
    arguments: request.params.arguments,
  });
  return result;
});

const stdio = new StdioServerTransport();
await server.connect(stdio);
