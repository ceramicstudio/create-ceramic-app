import ora from 'ora'
import KeyDIDResolver from 'key-did-resolver'

import { Command as CoreCommand } from '@oclif/core'
import type { Ora } from 'ora'
import { randomBytes } from 'crypto';
import { toString } from 'uint8arrays/to-string';
import { writeFile } from 'fs';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import {homedir} from "os"

export abstract class Command extends CoreCommand {
  spinner!: Ora;
  searchTool!: string;

  async init(): Promise<void> {
    this.spinner = ora();
  }

  generateAdminKeyDid = async (): Promise<{seed: string, did: DID}> => {
    const seed = new Uint8Array(randomBytes(32))
    const keyResolver = KeyDIDResolver.getResolver()
    const did = new DID({
      provider: new Ed25519Provider(seed),
      resolver: { ...keyResolver },
    });

    await did.authenticate()
    return {seed:toString(seed, 'base16'), did}
  };

  generateLocalConfig = async (adminSeed: string, adminDid:DID, directory: string) => {
    this.spinner.info("Generating ComposeDB configuration file");
    const configData = {
      anchor: {},
      "http-api": {
        "cors-allowed-origins": [".*"],
        "admin-dids": [adminDid.id],
      },
      ipfs: {
        mode: "bundled",
      },
      logger: {
        "log-level": 2,
        "log-to-files": false,
      },
      metrics: {
        "metrics-exporter-enabled": false,
        "metrics-port": 9090,
      },
      network: {
        name: "testnet-clay",
      },
      node: {},
      "state-store": {
        mode: "fs",
        "local-directory": `~/.ceramic/statestore/`,
      },
      indexing: {
        db: `sqlite://${homedir()}/.ceramic/indexing.sqlite`,
        "allow-queries-before-historical-sync": true,
        models: [],
      },
    };

      writeFile(
        `${process.cwd()}/${directory}/composedb.config.json`,
        JSON.stringify(configData),
        (err) => {
          if (err) {
            console.error(err);
          }
          this.spinner.succeed("ComposeDB file generated successfully.");
        }
      );

      writeFile(`${process.cwd()}/${directory}/admin_seed.txt`, adminSeed,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
  }

  generateScriptFiles = async (directory: string): Promise<void> => {
    const {seed, did} = await this.generateAdminKeyDid()
    const sourceTemplates = './TemplateScripts'
    const scripts = await readdir(sourceTemplates)
    
    let file = ''

    if(!existsSync(`${process.cwd()}/${directory}/scripts`)) {
      this.spinner.info('Creating /scripts directory')
      mkdirSync(`${process.cwd()}/${directory}/scripts`)
    }

    this.spinner.info('Generating scripts...')
    for(const script in scripts) {
      file = readFileSync(`${sourceTemplates}/${scripts[script]}`).toString()
      await writeFile(`${directory}/scripts/${scripts[script]}`, file)
    }
    await this.generateLocalConfig(seed, did, directory)
    this.spinner.succeed('Scripts created successfully!')
  }

  updateScripts = async (directory: string): Promise<void> => {
    // update script key in package.json
    const original = JSON.parse(readFileSync(`${process.cwd()}/${directory}/package.json`).toString())
    const scripts = original?.scripts
    const updated = {...original, ...scripts}

    this.spinner.info('Updating package.json to use new scripts')
    this.spinner.info(`Prior package.json has been moved to ${process.cwd()}/${directory}/package.json.bak`)

    scripts["nextDev"] = scripts.dev
    scripts["dev"] = "node scripts/run.mjs"
    scripts["ceramic"] = "CERAMIC_ENABLE_EXPERIMENTAL_COMPOSE_DB='true' npx ceramic daemon --config ./composedb.config.json"
    scripts["ceramic:local"] = "CERAMIC_ENABLE_EXPERIMENTAL_COMPOSE_DB='true' npx ceramic daemon"

    writeFile(`${process.cwd()}/${directory}/package.json`, JSON.stringify(updated, null, 2), (err) => {
      if(err){
        console.error(err.message)
      }
    })
    writeFile(`${process.cwd()}/${directory}/package.json.bak`, JSON.stringify(original, null, 2), err => {
      if(err){
        console.error(err.message)
      }
    })
    this.spinner.succeed('Scripts updated successfully.')
  }
}