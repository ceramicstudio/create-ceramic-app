import degit from "degit"
import inquirer from 'inquirer'

import { Command } from "../command.js"

export default class Clone extends Command {

  static description = "Clones existing repo"
  static flags = Command.flags

  async run(): Promise<void> {
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
        }
      ])
      console.log(answers)

      // FUTURE: Allow users to provide their own URL to clone from. If no full url is provided (including a .com/ca/xyz etc) assume it's one of
        // our defaults & use the appropriate URL.
      const emitter = degit(
        // "https://github.com/ceramicstudio/create-ceramic-app/tree/main/templates/basic-profile",
        "https://github.com/Sterahi/d-vyce",
        {
          cache: false,
          force: false,
        }
      );
      
      emitter.on('info', info => {
        if(info.code === 'SUCCESS') {
          console.info(`Project cloned successfully at ${info.dest}`);
        }
      })
      await emitter.clone(`${process.cwd()}/${answers.destination}`)
      // await emitter.clone(process.cwd().toString());
    } catch (e) {
      console.error(e)
    }
  }
}