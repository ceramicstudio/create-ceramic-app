import { DIDSession } from "did-session";
import { EthereumAuthProvider } from "@ceramicnetwork/blockchain-utils-linking";
import type {CeramicApi} from "@ceramicnetwork/common"

// If you are relying on an injected provider this must be here otherwise you will have a type error. 
declare global {
  interface Window {
    ethereum: any;
  }
}

/**
 * Checks localStorage for a stored DID Session. If one is found we authenticate it, otherwise we create a new one.
 * @returns Promise<DID-Session> - The User's authenticated sesion.
 */
export const authenticateCeramic = async (ceramic: CeramicApi) => {
  const sessionStr = localStorage.getItem('did') // for production you will want a better place than localStorage for your sessions.
  let session

  if(sessionStr) {
    session = await DIDSession.fromSession(sessionStr)

  }
  if(!session || (session.hasSession && session.isExpired)) {
    if (window.ethereum === null || window.ethereum === undefined) {
      throw new Error("No injected Ethereum provider found.");
    }

    // We enable the ethereum provider to get the user's addresses.
    const ethProvider = window.ethereum;
    // request ethereum accounts.
    const addresses = await ethProvider.request({
      method: "eth_requestAccounts",
    });
    // Create our ethereum auth provider.
    const authProvider = new EthereumAuthProvider(
      window.ethereum,
      addresses[0]
    );

    /**
     * Create DIDSession & provide capabilities that we want to access.
     * @NOTE: Any production applications will want to provide a more complete list of capabilities.
     *        This is not done here to allow you to add more datamodels to your application.
     */
    session = await DIDSession.authorize(authProvider, {
      resources: ["ceramic://*"],
    });
    // Set the session in localStorage.
    localStorage.setItem('did', session.serialize());
  }

  // Set our Ceramic DID to be our session DID.
  ceramic.did = session.did
  return
}
