# Create Ceramic App CLI

CLI for downloading, installing and launching a ComposeDB Example App from Ceramic.

## Usage

### `create-ceramic-app`

Run this command to create a new example app:

```sh-session
npx @ceramicnetwork/create-ceramic-app
```

You will be guided through the process and in the end you'll have a new folder with your app.

The app will be ready to run with just this one command above but during the configuration process you can choose to only install the app and choose to launch it later.

If you choose to launch it later, you can run the app with this command:

```sh-session
cd <your-app-name>
npm run dev
```

This will start the app and you'll be able to access it at http://localhost:3000

🎉 &nbsp;Happy hacking!

## Support

If you have any questions or just want to hang out with others building on Ceramic, our Forum is a great place to start:
[https://forum.ceramic.network/](https://forum.ceramic.network/)

## Next steps

The example app runs Ceramic locally, in memory. This is the easiest and the fastest way to get started with Ceramic. However, if you want to run Ceramic in a more production-like environment, you can launch a Ceramic node on testnet or mainnet.

To properly configure all the aspects of your Ceramic environment for this, please use Wheel to generate a development environment.

Instructions for Wheel: [https://composedb.js.org/docs/0.5.x/set-up-your-environment](https://composedb.js.org/docs/0.5.x/set-up-your-environment)

## Contributing

Contributions are always welcome! Please create a PR & the Ceramic Network Team will review & provide feedback.
