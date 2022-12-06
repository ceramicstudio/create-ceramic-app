import ora from 'ora'

import { spawn } from "child_process"
import { EventEmitter } from 'events'
import { writeComposite } from './composites.mjs';

const events = new EventEmitter()
const spinner = ora();
const args = process.argv.slice(2)

let ceramic

if(args.includes('-g') || args.includes('--global')) {
  ceramic = spawn("npm", ["run", `ceramic:local`]);
} else {
  ceramic = spawn("npm", ["run", `ceramic ${args.includes('-l')}`]);
}

ceramic.stdout.on("data", (buffer) => {
  console.log('[Ceramic]', buffer.toString())
  if (buffer.toString().includes("0.0.0.0:7007")) {
    events.emit("ceramic", true);
    spinner.succeed("ceramic node started");
  }
})

ceramic.stderr.on('data', (err) => {
  // TODO: figure out what causes this error in the Ceramic Daemon
  if(!err.toString().includes('MaxListenersExceededWarning')) {
    spinner.fail("[Ceramic] Ceramic node failed to start with error:");
    spinner.fail(`[Ceramic] ${err.toString()}`);
    events.emit("ceramic", false);
  }
})

const bootstrap = async () => {
  try {
    spinner.info("[Composites] bootstrapping composites");
    await writeComposite(spinner)
    spinner.succeed("Composites] composites bootstrapped");
  } catch (err) {
    spinner.fail(err.message)
    ceramic.kill()
  }
}

const graphiql = async () => {
  spinner.info("[GraphiQL] starting graphiql");
  const graphiql = spawn('node', ['./scripts/graphiql.mjs'])
  spinner.succeed("[GraphiQL] graphiql started");
  graphiql.stdout.on('data', (buffer) => {
    console.log('[GraphiqQL]',buffer.toString())
  })
}

const next = async () => {
  const next = spawn('npm', ['run', 'nextDev'])
  spinner.info("[NextJS] starting nextjs app");
  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const start = async () => {
  try {
    spinner.start('[Ceramic] Starting Ceramic node\n')
    events.on('ceramic', async (isRunning) => {
      if(isRunning) {
        await bootstrap()
        graphiql()
        next()
      }
      if(isRunning === false) {
        ceramic.kill()
        process.exit()
      }
    })
  } catch (err) {
    ceramic.kill()
    spinner.fail(err)
  }
}

start()

process.on("SIGTERM", () => {
  ceramic.kill();
});
process.on("beforeExit", () => {
  ceramic.kill();
});