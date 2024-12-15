import { AnyProcedure, AnyTRPCRouter, ProcedureType } from "@trpc/server";
import { RouterRecord } from "@trpc/server/unstable-core-do-not-import";
import { startCase } from "lodash-es";
import { z } from "zod";
import { getExampleForZodSchema } from "./getExampleFromZodSchema.js";
import { Postman } from "./postmanTypes.js";
import { ProcedureBuilderDef } from "./trpcTypes.js";
import { entries } from "./utils.js";

export function trpcToPostmanCollection({
  collectionName,
  router,
  bearerTokenVariable,
  basePath = "",
}: {
  collectionName: string;
  router: AnyTRPCRouter;
  bearerTokenVariable?: `{{${string}}}`;
  basePath?: string;
}): Postman.Collection {
  const collection: Postman.Collection = {
    info: {
      name: collectionName,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: getItemsForRouterRecord({
      routerRecord: router._def.record as RouterRecord,
      breadcrumbs: [],
      basePath,
    }),
  };

  if (bearerTokenVariable != null) {
    collection.auth = {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: bearerTokenVariable,
          type: "string",
        },
      ],
    };
  }

  return collection;
}

const PROCEDURE_TYPE_HTTP_METHOD_MAP: Record<
  ProcedureType,
  Postman.RequestInfo["method"] | undefined
> = {
  query: "GET",
  mutation: "POST",
  subscription: undefined,
};

function getItemsForRouterRecord({
  routerRecord,
  breadcrumbs,
  basePath,
}: {
  routerRecord: RouterRecord;
  breadcrumbs: string[];
  basePath: string;
}): Postman.Item[] {
  const items: Postman.Item[] = [];

  for (const [name, procedureOrRouterRecord] of entries(routerRecord)) {
    const nameStr = String(name);
    const newBreadcrumbs = [...breadcrumbs, nameStr];

    if (isProcedure(procedureOrRouterRecord)) {
      const item = getItemForProcedure({
        procedureName: nameStr,
        procedure: procedureOrRouterRecord,
        path: basePath + "/" + newBreadcrumbs.join("."),
      });
      if (item != null) items.push(item);
    } else {
      items.push({
        name: startCase(nameStr),
        item: getItemsForRouterRecord({
          routerRecord: procedureOrRouterRecord,
          breadcrumbs: newBreadcrumbs,
          basePath,
        }),
      });
    }
  }

  return items;
}

function getItemForProcedure({
  procedureName,
  procedure,
  path,
}: {
  procedureName: string;
  procedure: AnyProcedure;
  path: string;
}): Postman.Item | undefined {
  const def = procedure._def as unknown as AnyProcedure["_def"] &
    ProcedureBuilderDef;

  const method = PROCEDURE_TYPE_HTTP_METHOD_MAP[def.type];
  if (method == null) {
    return undefined;
  }

  let url: Postman.RequestInfo["url"] = {
    host: ["{{base_url}}"],
    path: [path],
  };
  let body: Postman.RequestInfo["body"];
  let header: Postman.RequestInfo["header"];

  if (def.inputs[0] != null) {
    const requestExample = getExampleForZodSchema(def.inputs[0] as z.ZodSchema);
    if (method === "GET") {
      url = {
        host: ["{{base_url}}"],
        path: [path],
        query: [
          {
            key: "input",
            value: JSON.stringify(requestExample),
          },
        ],
      };
    } else {
      body = {
        mode: "raw",
        raw: JSON.stringify(requestExample, undefined, 4),
        options: {
          raw: {
            language: "json",
          },
        },
      };
      header = [
        {
          key: "Content-Type",
          value: "application/json",
          type: "text",
        },
      ];
    }
  }

  return {
    name: procedureName,
    request: {
      method,
      url,
      body,
      header,
    },
  };
}

function isProcedure(
  maybeProcedure: AnyProcedure | RouterRecord,
): maybeProcedure is AnyProcedure {
  return (maybeProcedure as AnyProcedure)._def?.procedure === true;
}
