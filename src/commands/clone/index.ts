import {cancel, intro, isCancel, note, outro, select, spinner, text} from '@clack/prompts'
import {Command} from '@oclif/core'
import {execSync} from 'node:child_process'
import {bgBlue, bgGreen, black, green, inverse} from 'picocolors'
const tiged = require('tiged')

export default class DefaultCommand extends Command {
  async run(): Promise<void> {
    this.log(' ')

    const sp = spinner()

    intro(`${bgGreen(black(' 🧡 Welcome! Let us build you a ComposeDB example app. '))}`)

    // picocolors options:
    // bold, dim, italic, underline, inverse, hidden, strikethrough,
    // black, red, green, yellow, blue, magenta, cyan, white, gray,
    // bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite

    const getProjectName = async (message: string, defaultName: string): Promise<string> => {
      const projectName = await text({
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
      if (isCancel(projectName)) {
        cancel('Canceling.')
        process.exit(0)
      }

      return (projectName || defaultName).toLowerCase()
    }

    const projectName = await getProjectName('What is the name of your project?', 'ceramic-example-app')

    // Clone repository from https://github.com/ceramicstudio/ComposeDbExampleApp.git
    sp.start('Cloning CeramicDB Example App from repository...')
    try {
      await tiged('https://github.com/ceramicstudio/ComposeDbExampleApp.git').clone(projectName)
    } catch (error) {
      console.error('Error occurred while cloning the repository:', error)
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
    Instructions for Wheel: ${bgBlue('https://composedb.js.org/docs/0.5.x/set-up-your-environment')}
    `
    note(infoMsg)

    const readyToLaunch = await select({
      message: '🎉  Your Ceramic app with ComposeDB is ready! Ready to launch it now?',
      initialValue: 'Yes',
      options: [
        {label: 'Yes', value: 'Yes'},
        {label: 'No', value: 'No'},
      ],
    })

    if (readyToLaunch == 'Yes') {
      // Launch the example app
      outro('🏎️  Launching your example app...')

      try {
        process.chdir(projectName)
        execSync('npm run dev', {stdio: 'inherit'})
      } catch (error) {
        console.error('Error occurred while starting the example app', error)
      }
    } else {
      // Don't launch the example app. Explain how to launch it manually.
      note(`
      You don't have to launch the example app right now. You can do it later. It's easy!

      Here's how to launch the example app manually, when you're ready:
      1. ${inverse(`cd ${projectName}`)}
      2. ${inverse('npm run dev')}
      3. Open ${bgBlue('http://localhost:3000')} in your browser
      4. 🎉  Enjoy!
      `)
      outro(`${bgBlue(`🙏 Thanks and happy coding!`)}`)
    }
  }
}
