import { Plugin } from "obsidian";
import { VIEW_TYPE_VUE_TEST, VueTestView } from "./view";

export default class VueTestPlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE_VUE_TEST, (leaf) => new VueTestView(leaf));

    this.addCommand({
      id: "show-vue-test-view",
      name: "Show Vue Test View",
      callback: () => {
        this.activateView();
      },
    });

    await this.createView();
  }

  async onunload() {
    this.findView()?.detach();
  }

  findView() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_VUE_TEST)) {
      if (leaf.view instanceof VueTestView) {
        return leaf;
      }
    }
  }

  async createView() {
    const leaf = this.app.workspace.getLeftLeaf(false);

    await leaf.setViewState({ type: VIEW_TYPE_VUE_TEST, active: true });

    return leaf;
  }

  async activateView() {
    const leaf = this.findView() ?? (await this.createView());

    this.app.workspace.revealLeaf(leaf);
  }
}
