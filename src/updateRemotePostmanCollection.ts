import { Postman } from "./postmanTypes.js";

export async function updateRemotePostmanCollection({
  apiKey,
  collectionId,
  collection,
}: {
  apiKey: string;
  collectionId: string;
  collection: Postman.Collection;
}) {
  await fetch(`https://api.getpostman.com/collections/${collectionId}`, {
    method: "PUT",
    body: JSON.stringify({ collection }),
    headers: {
      "X-API-Key": apiKey,
    },
  });
}
