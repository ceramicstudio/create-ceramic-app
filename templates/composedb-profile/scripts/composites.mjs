import { CeramicClient } from '@ceramicnetwork/http-client'
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";

import { DID } from 'dids';
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const ceramic = new CeramicClient("http://localhost:7007");

export const writeComposite = async (spinner) => {
  await authenticate()
  spinner.info("writing composite to Ceramic")
  const composite = await createComposite(ceramic, './scripts/basicProfile.graphql')
  await writeEncodedComposite(composite, "./src/__generated__/definition.json");
  spinner.info('creating composite for runtime usage')
  await writeEncodedCompositeRuntime(
    ceramic,
    "./src/__generated__/definition.json",
    "./src/__generated__/definition.js"
  );
  spinner.info('deploying composite')
  const deployComposite = await readEncodedComposite(ceramic, './src/__generated__/definition.json')

  await deployComposite.startIndexingOn(ceramic)
  spinner.succeed("composite deployed & ready for use");
}

const authenticate = async () => {
  const key = fromString(
    "2da13c1d357fb08d9a2bf0245e431974fde139f9ff4b1b23cb2e73831dfad053",
    "base16"
  ); // TODO: import adminkey.txt & use that.
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key)
  })
  await did.authenticate()
  ceramic.did = did
}