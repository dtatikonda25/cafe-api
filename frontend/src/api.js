import axios from "axios";

// If your backend runs elsewhere, change baseURL accordingly.
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
