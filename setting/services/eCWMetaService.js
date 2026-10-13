// services/ecwMetadataService.js
import axios from "axios";

const ecwMetadataCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Fetches the eCW CapabilityStatement and extracts the SMART
 * authorization_endpoint / token_endpoint from the security extension.
 */
export async function getEcwSmartEndpoints(iss) {
  const cached = ecwMetadataCache.get(iss);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const { data: capabilityStatement } = await axios.get(
    `${iss}/metadata?_format=json`
  );

  const security = capabilityStatement?.rest?.[0]?.security;
  const oauthExtension = security?.extension?.find(
    (ext) => ext.url === "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris"
  );

  const extensions = oauthExtension?.extension || [];

  const authorization_endpoint = extensions.find(
    (e) => e.url === "authorize"
  )?.valueUri;

  const token_endpoint = extensions.find(
    (e) => e.url === "token"
  )?.valueUri;

  if (!authorization_endpoint || !token_endpoint) {
    throw new Error(
      `Could not locate SMART OAuth endpoints in eCW CapabilityStatement for iss=${iss}`
    );
  }

  const result = { authorization_endpoint, token_endpoint };
  ecwMetadataCache.set(iss, { data: result, timestamp: Date.now() });

  return result;
}