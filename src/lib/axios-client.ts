import axios from "axios";

type CustomError = Error & {
  errorCode?: string;
};

const baseURL = process.env.NEXT_PUBLIC_APP_URL + "/api";

const options = {
  baseURL,
  withCredentials: true,
  timeout: 100000,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { data, status } = error.response;

    if (data === "Unauthorized" && status === 401) {
      window.location.href = "/";
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
