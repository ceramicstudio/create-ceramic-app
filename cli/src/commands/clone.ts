import degit from "degit"
import inquirer from 'inquirer'
import chalk from 'chalk'

import { Command } from "../command.js"
import { exec } from "node:child_process"

export default class Clone extends Command {

  static description = "Clones existing repo"
  static flags = Command.flags

  async run(): Promise<void> {
    const templates = {
      "DID-DataStore":
        "https://github.com/ceramicstudio/create-ceramic-app/templates/basic-profile",
      "[DEVELOPER PREVIEW] ComposeDB":
        "https://github.com/ceramicstudio/create-ceramic-app/templates/composedb-profile",
    };
    
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'destination',
          message: 'Project name: ',
          validate(value) {
            const pass = value.match(
              /[^\s-]$/i
            );
            if (pass) {
              return true;
            }

            return "Sorry, name can only contain URL-friendly characters.";
          }
        }, {
          type: 'list',
          name: 'template',
          message:'Choose your Template',
          choices: [
            'DID-DataStore',
            '[DEVELOPER PREVIEW] ComposeDB'
          ]
        }
      ])

      this.spinner.start("cloning...");
      const emitter = degit(
        templates[answers.template],
        {
          cache: false,
          force: false,
        }
      );
      
      emitter.on('info', async (info) => {
        if(info.code === 'SUCCESS') {
          this.spinner.succeed(`Project cloned successfully at ${chalk.green.bold(info.dest)}`);
          const composeDb = await this.usesComposeDB(answers.destination)
          if(composeDb) {
            this.spinner.info('ComposeDB detected, updating scripts.')
            await this.updateScripts(answers.destination)
            await this.generateScriptFiles(answers.destination)
          }
          this.spinner.start('Installing dependencies')
          exec(`cd ${process.cwd()}/${answers.destination} && npm install`)
        }
      })

      await emitter.clone(`${process.cwd()}/${answers.destination}`)
      
      if(answers.template === '[DEVELOPER PREVIEW] ComposeDB') {
        this.spinner.start('Generating Admin Key')
        const {seed, did} = await this.generateAdminKeyDid()
        this.spinner.info(did.id)
        this.spinner.succeed(`${seed} . ${chalk.bold.red('Be sure to save this key somewhere safe.')}`);
        await this.generateLocalConfig(seed, did, `${answers.destination}`)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message);
      console.error(e)
    }
  }
}