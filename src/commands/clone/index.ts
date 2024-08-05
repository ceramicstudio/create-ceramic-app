import {Command} from '@oclif/core'
import {execSync} from 'node:child_process'
import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors'
const { bgBlue, bgGreen, black, green, inverse } = picocolors;

import {simpleGit} from 'simple-git'


export default class Clone extends Command {
  static description = "Create a sample app with Ceramic and ComposeDB"

  async run(): Promise<void> {
    this.log(' ')
    const clack = await import('@clack/prompts');
    const sp = clack.spinner()

    clack.intro(`${bgGreen(black(' 🧡 Welcome! Let us build you a ComposeDB example app. '))}`)

    // picocolors options:
    // bold, dim, italic, underline, inverse, hidden, strikethrough,
    // black, red, green, yellow, blue, magenta, cyan, white, gray,
    // bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite

    const getProjectName = async (message: string, defaultName: string): Promise<string> => {
      const projectName = await clack.text({
        message,
        placeholder: defaultName,
        validate(value: string = ''): string | void {
          // if (!isReasonableFilename(value)) {
          if (!/^[\da-z-]*$/i.test(value) || /[\s-]$/i.test(value)) {
            return 'Only letters, numbers and dashes please. The name will be used to create a directory.'
          }

          return undefined
        },
      })
      if (clack.isCancel(projectName)) {
        clack.cancel('Canceling.')
        throw process.exit(0)
      }

      return (projectName || defaultName).toLowerCase()
    }

    const projectName = await getProjectName('What is the name of your project?', 'ceramic-example-app')

    // Clone repository from https://github.com/ceramicstudio/ComposeDbExampleApp.git
    sp.start('Cloning CeramicDB Example App from repository...')
    try {
      const git = simpleGit();
      await git.clone('https://github.com/ceramicstudio/ComposeDbExampleApp.git', projectName, ['--depth', '1'])
      // Remove the .git directory to avoid keeping the git history
      fs.rmSync(path.join(projectName, '.git'), { force: true, recursive: true });
    } catch (error) {
      console.error('Error occurred while cloning the repository:', error)
      sp.stop("Failed to clone repository")
      return;
    }

    sp.stop(green('✅ Repository cloned. ⬇️  Now installing dependencies...'))

    // Install dependencies
    sp.start('⬇️ Installing dependencies...')
    try {
      process.chdir(projectName)
      execSync('npm install --loglevel=error', {stdio: 'inherit'}) // npm install and suppress all warnings
      process.chdir('..')
    } catch (error) {
      console.error('Error occurred while installing dependencies:', error)
    }

    this.log(' ')
    sp.stop(green('✅ Dependencies installed.'))

    const infoMsg = `
    Your example app will have this default configuration:

    - Project Name: ${green(projectName)}
    - Project Directory: ${green(`${process.cwd()}/${projectName}`)}
    - Network: ${green('InMemory')}
    - Ceramic ${green('Included')}
    - ComposeDB ${green('Included')}
    
    If you want to configure all these aspects of your Ceramic environment,
    please use Wheel to generate a development environment.
    Instructions for Wheel: ${bgBlue('https://developers.ceramic.network/docs/composedb/set-up-your-environment')}
    `
    clack.note(infoMsg)

    const readyToLaunch = await clack.select({
      message: '🎉  Your Ceramic app with ComposeDB is ready! Ready to launch it now?',
      initialValue: 'Yes',
      options: [
        {label: 'Yes', value: 'Yes'},
        {label: 'No', value: 'No'},
      ],
    })

    if (readyToLaunch === 'Yes') {
      // Launch the example app
      clack.outro('🏎️  Launching your example app...')

      try {
        process.chdir(projectName)
        execSync('npm run dev', {stdio: 'inherit'})
      } catch (error) {
        console.error('Error occurred while starting the example app', error)
      }
    } else {
      // Don't launch the example app. Explain how to launch it manually.
      clack.note(`
      You don't have to launch the example app right now. You can do it later. It's easy!

      Here's how to launch the example app manually, when you're ready:
      1. ${inverse(`cd ${projectName}`)}
      2. ${inverse('npm run dev')}
      3. Open ${bgBlue('http://localhost:3000')} in your browser
      4. 🎉  Enjoy!
      `)
      clack.outro(`${bgBlue(`🙏 Thanks and happy coding!`)}`)
    }
  }
}
