import { createApp, type App as VueApp } from "vue";
import { createPinia } from "pinia";
import App from "../App.vue";
import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_VUE_TEST = "vue-test-view";

export class VueTestView extends ItemView {
  vueApp: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    this.icon = "flask-conical";

    this.vueApp = createApp(App);
    this.vueApp.use(createPinia());
  }

  getViewType() {
    return VIEW_TYPE_VUE_TEST;
  }

  getDisplayText() {
    return "Vue Test View";
  }

  async onOpen() {
    const mountPoint = this.containerEl.children[1];

    this.vueApp.mount(mountPoint);
  }

  async onClose() {
    this.vueApp.unmount();
  }
}
