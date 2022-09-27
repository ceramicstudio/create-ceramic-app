import axios from 'axios'
import chalk from 'chalk'

import { Command as CoreCommand } from '@oclif/core'
import { exec } from 'child_process'

import ora from 'ora'
import type { Ora } from 'ora'

export abstract class Command extends CoreCommand {
  spinner!: Ora
  chalk!: chalk
  
  async init(): Promise<void> {
    this.spinner = ora();
    this.chalk = chalk
    await this.ceramicVersion()
  }

  async ceramicVersion(): Promise<void> {
    const version = await axios.get(
      "https://registry.npmjs.org/@ceramicnetwork/cli"
    );
    const current = version.data['dist-tags'].latest.trim();
    const next = version.data["dist-tags"].next.trim();
    
    let searchTool = ''
    if(process.platform === 'win32') {
      searchTool = 'findstr'
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      searchTool = 'grep'
    } else {
      throw new Error(`create-ceramic-app does not support ${process.platform} at the moment.`);
    }

    exec(
      `yarn global list && npm list -g --depth=0 | ${searchTool} @ceramicnetwork/cli`,
      (err, stdout) => {
        if (err) {
          console.error(err);
          return;
        }
        if (!stdout.includes("@ceramicnetwork/cli")) {
          console.log(
            `${chalk.bold.red("Ceramic is not installed globally.")}`
          );
        }
        const installed = stdout.split("@ceramicnetwork/cli@")[1].trim();

        try {
          if (installed != current && installed != next) {
            console.log(
              chalk.red(
                "Your Ceramic CLI is out of date, if you do not upgrade features may not function as intended."
              )
            );
            console.log(
              `Installed: ${
                stdout.split("@ceramicnetwork/cli@")[1]
              }\n Target: ${chalk.bold.red(current)}`
            );
            // TODO: user feedback here.
            // console.log("Update now?");
          } else if (installed == current || installed == next) {
            // do nothing
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  }
  async upgradeCeramic(): Promise<void> {
    // TODO: upgrade global instance of Ceramic.
  }
  async installCeramic(): Promise<void> {
    // TODO: install ceramic globally.
  }
}