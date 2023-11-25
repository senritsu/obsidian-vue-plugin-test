# obsidian-vue-plugin-test

This repo demonstrates building an [Obsidian](https://obsidian.md/) plugin using [Vue 3](https://vuejs.org/) and [Vite](https://vitejs.dev/).

Few changes are needed from the standard Vite template. This README will give a concise outline, for a more detailed example check the source code of this repo.

This is the outline of what you need to do:

- Create a regular vue app and add the `obsidian` package
- Mount your vue app inside an Obsidian View, and register that View in an Obsidian Plugin
- Add the plugin manifest
- Change Vite to use library mode, and adjust output filenames
- Automate build and reload for a better dev experience

## Create your Vue app

All commands here use `pnpm`, but it should work just as well using `npm` or `yarn`.

```bash
pnpm create vue@latest
```

and follow the wizard 🧙‍♂️.

Afterwards install the `obsidian` package.

```bash
pnpm i obsidian
```

## Add the plugin and make Vite output things Obsidian understands

### Add your view

`/src/plugin/view.ts`

Beyond the standard parts of a view according to the [plugin development docs on Views](https://docs.obsidian.md/Plugins/User+interface/Views) the actual Vue part is fairly small. You can basically just copy-paste your standard Vue `main.ts` into the `ItemView`, distributed over the relevant lifecycle methods.

```ts
import App from "../App.vue";

// other imports and view type omitted for brevity

export class VueTestView extends ItemView {
  vueApp: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.vueApp = createApp(App);
    this.vueApp.use(createPinia());
  }

  // getViewType and getDisplayText omitted for brevity

  async onOpen() {
    const mountPoint = this.containerEl.children[1];

    this.vueApp.mount(mountPoint);
  }

  async onClose() {
    this.vueApp.unmount();
  }
}
```

### Add a plugin

`/src/plugin/main.ts`

The plugin itself is no different from the one in [the docs](https://docs.obsidian.md/Plugins/User+interface/Views). Just add whatever you need and register your view.

```ts
import { Plugin } from "obsidian";
import { VIEW_TYPE_VUE_TEST, VueTestView } from "./view";

export default class VueTestPlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE_VUE_TEST, (leaf) => new VueTestView(leaf));

    // whatever else you need to actually show your View
  }

  // other methods omitted for brevity
}
```

Make sure to clean up after yourself, as detailed in [the docs on Views](https://docs.obsidian.md/Plugins/User+interface/Views).

### Add required static assets

Add your plugin manifest to `/public/manifest.json`, you can take [the one in the obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/manifest.json) as reference.

If you want to use the [Hot Reload Plugin](https://github.com/pjeby/hot-reload) during development, which you probably do, add an empty `/public/.hotreload` file. Also don't forget to actually install the plugin to Obsidian.

Vite will just copy all files in `public` over to the `dist` directory on build.

To reduce noise, you also probably want to clean up the default static assets like `favicon.ico` from the Vue template, even if Obsidian would just ignore them.

### Adjust Vite config

There are just a few additional options needed to make the build output the correct files for an Obsidian plugin, all located inside the `build` property.

```ts
// imports omitted for brevity

export default defineConfig({
  // default config options omitted for brevity
  build: {
    // Build in lib mode
    lib: {
      entry: resolve(__dirname, "src/plugin/main.ts"),
      // Obsidian expects a "main.js"
      fileName: "main",
      formats: ["cjs"],
    },
    rollupOptions: {
      // the obsidian package does not need to be included in the plugin
      external: ["obsidian"],
      output: {
        // default is "style.css", Obsidian needs plural
        assetFileNames: "styles.css",
      },
    },
    // Run the build in watch mode, to not have to build manually when making changes
    watch: {},
  },
});
```

### Automate dev deployment

To test your plugin, it needs to reside inside the `.obsidian/plugins` directory inside your vault. Copying it there manually is annoying, having your checked-out repo inside there feels gross, so let's just automate it with a minimal Vite plugin. The plugin will just copy the whole `dist` folder to the correct obsidian plugin folder (taken from the manifest) in a post-build step.

Add an `.env.local` file containing an environment variable that points to your local plugins folder

```env
OBSIDIAN_PLUGIN_DIRECTORY="/wherever/your/vault/lives/.obsidian/plugins"
```

Add the custom plugin directly into `vite.config.ts` or into its own module, and add the plugin to the Vite config.

```ts
import { defineConfig, loadEnv, PluginOption } from "vite";
import { cp } from "node:fs/promises";

// rest of the imports omitted for brevity

const obsidianDev = (): PluginOption => {
  let pluginDirectory: string;

  return {
    name: "copy-to-obsidian",
    async config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");

      pluginDirectory = env.OBSIDIAN_PLUGIN_DIRECTORY;
    },
    async closeBundle() {
      if (!pluginDirectory) return;

      const manifest = require(resolve(__dirname, "public/manifest.json"));

      const source = resolve(__dirname, "dist");
      const target = resolve(pluginDirectory, manifest.id);

      await cp(source, target, { recursive: true });
    },
  };
};

export default defineConfig({
  plugins: [vue(), obsidianDev()],
  // rest of the config omitted for brevity
});
```

## Run your plugin

After following the previous steps, you should now be able to just run

```bash
pnpm build
```

Your plugin should now show up in the Obsidian settings, and if you enable it you should be able to activate your View (using whatever UI or command you registered in your `main.ts`).

With the combination of Vite watch mode, the [Hot Reload](https://github.com/pjeby/hot-reload) plugin for Obsidian, and the custom Vite plugin, you should be able to see changes to the plugin source reflected in Obsidian instantly ⚡.
