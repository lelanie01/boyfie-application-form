import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import adminLogin from "./netlify/functions/admin-login.mjs";
import applications from "./netlify/functions/applications.mjs";
import recordings from "./netlify/functions/recordings.mjs";

function localFunctions() {
  return {
    name: "local-netlify-functions",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const handler =
          url.pathname === "/api/admin/login"
            ? adminLogin
            : url.pathname === "/api/applications"
              ? applications
              : url.pathname === "/api/recordings"
                ? recordings
              : null;

        if (!handler) {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of request) chunks.push(chunk);
          const headers = new Headers();
          for (const [name, value] of Object.entries(request.headers)) {
            if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
            else if (value !== undefined) headers.set(name, value);
          }
          const body = chunks.length ? Buffer.concat(chunks) : undefined;
          const apiRequest = new Request(url, {
            method: request.method,
            headers,
            ...(body ? { body, duplex: "half" } : {}),
          });
          const apiResponse = await handler(apiRequest);
          response.statusCode = apiResponse.status;
          apiResponse.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(Buffer.from(await apiResponse.arrayBuffer()));
        } catch (error) {
          server.config.logger.error("Local application API failed.", { error });
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "The application service is unavailable." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "ADMIN_PASSWORD",
    "ADMIN_TOKEN_SECRET",
    "SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_VOICE_BUCKET",
  ]) {
    if (env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), tailwindcss(), localFunctions()],
  };
});
