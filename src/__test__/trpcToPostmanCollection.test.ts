import { initTRPC } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Postman } from "../postmanTypes.js";
import { trpcToPostmanCollection } from "../trpcToPostmanCollection.js";

describe("trpcToPostmanCollection", () => {
  it("simple router", () => {
    const t = initTRPC.create();
    const router = t.router({
      createThing: t.procedure
        .input(z.object({ name: z.string() }))
        .mutation(() => undefined),
      getThing: t.procedure
        .input(z.object({ name: z.string() }))
        .query(() => undefined),
    });

    const postmanCollection = trpcToPostmanCollection({
      collectionName: "My API",
      router,
    });

    expect(postmanCollection).toEqual({
      info: {
        name: "My API",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [
        {
          name: "createThing",
          request: {
            method: "POST",
            url: { host: ["{{base_url}}"], path: ["/createThing"] },
            body: {
              mode: "raw",
              raw: '{\n    "name": ""\n}',
              options: { raw: { language: "json" } },
            },
            header: [
              { key: "Content-Type", value: "application/json", type: "text" },
            ],
          },
        },
        {
          name: "getThing",
          request: {
            method: "GET",
            url: {
              host: ["{{base_url}}"],
              path: ["/getThing"],
              query: [{ key: "input", value: '{"name":""}' }],
            },
          },
        },
      ],
    });
  });

  it("nested router", () => {
    const t = initTRPC.create();
    const router = t.mergeRouters(
      t.router({
        myRouter: t.router({
          createThing: t.procedure
            .input(z.object({ name: z.string() }))
            .mutation(() => undefined),
          getThing: t.procedure
            .input(z.object({ name: z.string() }))
            .query(() => undefined),
        }),
      }),
    );

    const postmanCollection = trpcToPostmanCollection({
      collectionName: "My API",
      router,
    });

    expect(postmanCollection).toEqual({
      info: {
        name: "My API",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [
        {
          name: "My Router",
          item: [
            {
              name: "createThing",
              request: {
                method: "POST",
                url: {
                  host: ["{{base_url}}"],
                  path: ["/myRouter.createThing"],
                },
                body: {
                  mode: "raw",
                  raw: '{\n    "name": ""\n}',
                  options: { raw: { language: "json" } },
                },
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json",
                    type: "text",
                  },
                ],
              },
            },
            {
              name: "getThing",
              request: {
                method: "GET",
                url: {
                  host: ["{{base_url}}"],
                  path: ["/myRouter.getThing"],
                  query: [{ key: "input", value: '{"name":""}' }],
                },
              },
            },
          ],
        },
      ],
    });
  });

  it("basePath", () => {
    const t = initTRPC.create();
    const simpleRouter = t.router({
      createThing: t.procedure
        .input(z.object({ name: z.string() }))
        .mutation(() => undefined),
      getThing: t.procedure
        .input(z.object({ name: z.string() }))
        .query(() => undefined),
    });

    const postmanCollection = trpcToPostmanCollection({
      collectionName: "My API",
      router: simpleRouter,
      basePath: "/my-base-path",
    });

    expect((postmanCollection.item[0] as Postman.Request).request?.url).toEqual(
      {
        host: ["{{base_url}}"],
        path: ["/my-base-path/createThing"],
      },
    );
  });

  it("bearerTokenVariable", () => {
    const t = initTRPC.create();
    const simpleRouter = t.router({
      createThing: t.procedure
        .input(z.object({ name: z.string() }))
        .mutation(() => undefined),
      getThing: t.procedure
        .input(z.object({ name: z.string() }))
        .query(() => undefined),
    });

    const postmanCollection = trpcToPostmanCollection({
      collectionName: "My API",
      router: simpleRouter,
      bearerTokenVariable: "{{my-bearer}}",
    });

    expect(postmanCollection.auth).toEqual({
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{my-bearer}}",
          type: "string",
        },
      ],
    });
  });
});
