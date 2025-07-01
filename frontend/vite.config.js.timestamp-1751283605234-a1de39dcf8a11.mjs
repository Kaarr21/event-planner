// vite.config.js
import { defineConfig } from "file:///home/karoki/Development/Code/se-prep/phase-3/pyenv/Python-3.8.13/event-planner/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///home/karoki/Development/Code/se-prep/phase-3/pyenv/Python-3.8.13/event-planner/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 3e3,
    proxy: {
      "/auth": "http://localhost:5000",
      "/events": "http://localhost:5000",
      "/tasks": "http://localhost:5000",
      "/rsvps": "http://localhost:5000"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9rYXJva2kvRGV2ZWxvcG1lbnQvQ29kZS9zZS1wcmVwL3BoYXNlLTMvcHllbnYvUHl0aG9uLTMuOC4xMy9ldmVudC1wbGFubmVyL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9rYXJva2kvRGV2ZWxvcG1lbnQvQ29kZS9zZS1wcmVwL3BoYXNlLTMvcHllbnYvUHl0aG9uLTMuOC4xMy9ldmVudC1wbGFubmVyL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2thcm9raS9EZXZlbG9wbWVudC9Db2RlL3NlLXByZXAvcGhhc2UtMy9weWVudi9QeXRob24tMy44LjEzL2V2ZW50LXBsYW5uZXIvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXV0aCc6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxuICAgICAgJy9ldmVudHMnOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcbiAgICAgICcvdGFza3MnOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcbiAgICAgICcvcnN2cHMnOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJ1xuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMGIsU0FBUyxvQkFBb0I7QUFDdmQsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsTUFDVCxXQUFXO0FBQUEsTUFDWCxVQUFVO0FBQUEsTUFDVixVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
