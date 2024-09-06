import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";

export class API {
  constructor(query, apiUrl, apiHost) {
    this.url = apiUrl;
    this.host = apiHost;
    this.ua = Helper.randomUserAgent();
    this.query = query;
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    process.on("warning", (warning) => {
      if (
        warning.name === "DeprecationWarning" &&
        warning.message.includes("TLS")
      ) {
        return;
      }
      // console.warn(warning);
    });
  }

  generateHeaders(token) {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      "Content-Type": "application/json",
      Host: this.host,
      Origin: this.url,
      Referer: this.url + "/",
    };

    if (token) {
      headers.Authorization = token;
    }

    return headers;
  }

  async fetch(endpoint, method, token, body = {}) {
    try {
      const url = `${this.url}${endpoint}`;
      const headers = this.generateHeaders(token);
      const options = {
        cache: "default",
        headers,
        method,
        rejectUnauthorized: false,
      };
      logger.info(`${method} : ${url}`);
      logger.info(`Request Header : ${JSON.stringify(headers)}`);

      if (method !== "GET") {
        options.body = `${JSON.stringify(body)}`;
        logger.info(`Request Body : ${options.body}`);
      }

      const res = await fetch(url, options);

      logger.info(`Response : ${res.status} ${res.statusText}`);
      if (res.ok || res.status == 400) {
        const data = await res.json();
        logger.info(`Response Data : ${JSON.stringify(data)}`);
        return data;
      } else {
        throw new Error(`${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      logger.error(`Error : ${err.message}`);
      throw err;
    }
  }
}
