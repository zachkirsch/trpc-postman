import { JSONSchemaFaker } from "json-schema-faker";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { entries } from "./utils.js";

JSONSchemaFaker.option("alwaysFakeOptionals", true);

export function getExampleForZodSchema(schema: z.ZodSchema) {
  return simplifyDummyValues(
    JSONSchemaFaker.generate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (zodToJsonSchema as any)(schema),
    ),
  );
}

function simplifyDummyValues<T>(object: T): T {
  if (object == null) {
    return object;
  }

  if (typeof object === "string") {
    return "" as T;
  }

  if (typeof object === "number") {
    return 0 as T;
  }

  if (Array.isArray(object)) {
    return object.map(simplifyDummyValues) as T;
  }

  if (typeof object === "object") {
    for (const [key, value] of entries(object)) {
      object[key] = simplifyDummyValues(value);
    }
  }

  return object;
}
