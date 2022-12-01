import degit from "degit"
import inquirer from 'inquirer'
import chalk from 'chalk'

import { Command } from "../command.js"

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
      // FUTURE: Allow users to provide their own URL to clone from. If no full url is provided (including a .com/ca/xyz etc) assume it's one of
        // our defaults & use the appropriate URL.
      const emitter = degit(
        templates[answers.template],
        {
          cache: false,
          force: false,
        }
      );
      
      emitter.on('info', info => {
        if(info.code === 'SUCCESS') {
          this.spinner.succeed(`Project cloned successfully at ${chalk.green.bold(info.dest)}`);
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