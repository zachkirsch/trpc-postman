export declare namespace Postman {
  export interface Collection {
    info: {
      name: string;
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";
    };
    item: Postman.Item[];
    auth?: PostmanAuth;
  }

  export type Item = Postman.Folder | Postman.Request;

  export interface Folder {
    name: string;
    item: Postman.Item[];
  }

  export interface Request {
    name: string;
    request?: Postman.RequestInfo;
  }

  export interface RequestInfo {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    header?: Postman.Header[];
    body?: {
      mode: "raw";
      raw: string;
      options: {
        raw: {
          language: "json";
        };
      };
    };
    url: {
      host: string[];
      path: string[];
      query?: Postman.Query[];
    };
  }

  export interface Header {
    key: string;
    value: string;
    type: "text";
  }

  export interface Query {
    key: string;
    value: string;
  }

  export type PostmanAuth = Postman.BearerAuth;

  export interface BearerAuth {
    type: "bearer";
    bearer: [
      {
        key: "token";
        value: string;
        type: "string";
      },
    ];
  }
}
