import { createClient } from "next-sanity";

import { SANITY_DATASET, SANITY_PROJECT_ID, IS_DEV } from '@/util/env';

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: !IS_DEV,
});
