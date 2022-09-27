import { createContext, useContext } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DIDDataStore } from "@glazed/did-datastore"

import { basicProfile } from "../models"

/**
 * Configure ceramic Client & create context.
 */
const ceramic = new CeramicClient("http://localhost:7007");
export const datastore = new DIDDataStore({ceramic, model: basicProfile});

const CeramicContext = createContext(ceramic);

export const CeramicWrapper = ({ children }: any) => {
  return (
    <CeramicContext.Provider value={ceramic}>
      {children}
    </CeramicContext.Provider>
  );
};

/**
 * Provide access to the ceramic client.
 * @example const ceramic = useCeramicContext()
 * @returns CeramicClient
 */
export const useCeramicContext = () => useContext(CeramicContext);