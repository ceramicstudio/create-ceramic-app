import degit from "degit"
import inquirer from 'inquirer'
import chalk from 'chalk'

import { Command } from "../command.js"
import { spawn } from "node:child_process"
import { Flags } from "@oclif/core"


export default class Clone extends Command {

  static description = "Clones existing repo"

  static flags = {
    ...Command.flags,
    repo: Flags.string({description: 'Github Template Repo', char: 'r'})
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Clone)
    var repository = flags.repo || ''

    if(flags.repo?.includes('github.com')) {
      if(repository.includes('tree')) {
        const split = repository.split('https://')[1].split('/')
        split.splice(split.indexOf('tree'), 2)
        repository = `https://${split.join('/')}`
      }
    } else if (flags.repo !== undefined) {
      this.spinner.fail('Only GitHub repositories are supported at this time.')
    }

    const templates = {
      "DID-DataStore":
        "https://github.com/ceramicstudio/create-ceramic-app/templates/basic-profile",
      "[DEVELOPER PREVIEW] ComposeDB":
        "https://github.com/ceramicstudio/create-ceramic-app/templates/composedb-profile",
    };
    
    try {
      const questions: Array<{}> = [{
        type: 'input',
        name: 'destination',
        message: 'Project name: ',
        validate(value:string) {
          const pass = value.match(
            /[^\s-]$/i
          );
          if (pass) {
            return true;
          }

          return "Sorry, name can only contain URL-friendly characters.";
        }
      }]

      if(!flags.repo) {       
        questions.push({
          type: 'list',
          name: 'template',
          message:'Choose your Template',
          choices: [
            'DID-DataStore',
            '[DEVELOPER PREVIEW] ComposeDB'
          ]
        })
      }
      
      const answers = await inquirer.prompt(questions)

      this.spinner.start(`Cloning ${(repository || templates[answers.template])}`);
      const emitter = degit(
        // (repository || templates[answers.template] ),
        (templates[answers.template] || repository),
        {
          cache: false,
          force: false,
          verbose: true
        }
      );

      await emitter.clone(`${process.cwd()}/${answers.destination}`)
      this.spinner.succeed(`Project cloned successfully at ${chalk.green.bold(`${process.cwd()}/${answers.destination}`)}`);
      
      const composeDb = await this.usesComposeDB(answers.destination)
      if(composeDb) {
        this.spinner.info('ComposeDB detected, updating scripts.')
        this.updateScripts(answers.destination)
        this.generateScriptFiles(answers.destination)
      }
      spawn('npm', ['install', '--prefix', `${process.cwd()}/${answers.destination}`], { stdio: 'inherit' })
      
    } catch (e) {
      this.spinner.fail((e as Error).message);
      console.error(e)
    }
  }
}