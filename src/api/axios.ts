import axios from "axios";

// Since the client and server are served from the same host in full-stack,
// we use a relative path /api to hit our backend.
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
