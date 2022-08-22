import {Command as CoreCommand} from '@oclif/core'
import axios from 'axios'
import { exec } from 'child_process'

// import ora from 'ora'
// import type { Ora } from 'ora'


export abstract class Command extends CoreCommand {
  // spinner!: Ora
  
  async init(): Promise<void> {
    // this.spinner = ora();
    await this.ceramicVersion()
  }

  async ceramicVersion(): Promise<void> {
    const version = await axios.get(
      "https://registry.npmjs.org/@ceramicnetwork/cli"
    );
    const current = version.data['dist-tags'].latest.trim();
    const next = version.data["dist-tags"].next.trim();

    // TODO: test for windows here.
    exec('yarn global list && npm list -g --depth=0 | grep @ceramicnetwork/cli', (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }
      if (!stdout.includes('@ceramicnetwork/cli')) {
        console.log(`Ceramic is not installed globally.`)
      }
      const installed = stdout.split("@ceramicnetwork/cli@")[1].trim();
      
      try {
        if (installed != current || installed != next) {
          console.log('Your Ceramic CLI is out of date, if you do not upgrade features may not function as intended.')
          console.log(`Installed: ${stdout.split("@ceramicnetwork/cli@")[1]}\nTarget: ${current}`);
          // TODO: user feedback here.
          console.log('Update now?')
        } else if (installed == current || installed == next) {
          console.log('continuing...')
        }
      } catch (err) {
        console.error(err)
      }
    })
  }
  async upgradeCeramic(): Promise<void> {
    // TODO: upgrade global instance of Ceramic.
  }
  async installCeramic(): Promise<void> {
    // TODO: install ceramic globally.
  }
}