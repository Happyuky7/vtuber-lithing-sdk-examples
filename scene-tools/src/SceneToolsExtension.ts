import { VtuberTrackingExtension } from 'vtuber-lithing-sdk';
import type { Transform3D } from 'vtuber-lithing-sdk';

interface SceneEntry {
  id: string;
  name: string;
  transform: Required<Transform3D>;
  visible: boolean;
}

type Axis = 'x' | 'y' | 'z';

export class SceneToolsExtension extends VtuberTrackingExtension {
  private panel?: HTMLElement;
  private hierarchy?: HTMLSelectElement;
  private status?: HTMLOutputElement;
  private readonly entries = new Map<string, SceneEntry>();

  protected override onActivate(): void {
    this.api.capabilities.require('controls');
    this.api.capabilities.require('integration');
    this.panel = this.createPanel('panel.title');
    this.render();
  }

  protected override onDeactivate(): void {
    for (const entry of this.entries.values()) {
      this.api.scene.remove(entry.id);
    }
    this.entries.clear();
    this.panel?.remove();
  }

  private render(): void {
    if (!this.panel) {
      return;
    }

    const description = document.createElement('p');
    description.className = 'hint';
    description.textContent = this.api.i18n.t('panel.description');

    const actions = document.createElement('div');
    actions.append(
      this.button('button.model', () => void this.addSampleModel()),
      this.button('button.cube', () => this.addPrimitive('box')),
      this.button('button.sphere', () => this.addPrimitive('sphere')),
      this.button('button.remove', () => this.removeSelected())
    );

    this.hierarchy = document.createElement('select');
    this.hierarchy.setAttribute('aria-label', this.api.i18n.t('hierarchy.label'));
    this.hierarchy.addEventListener('change', () => this.syncControls());

    const transformEditor = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = this.api.i18n.t('transform.title');
    transformEditor.append(legend);
    for (const group of ['position', 'rotation'] as const) {
      for (const axis of ['x', 'y', 'z'] as const) {
        transformEditor.append(this.numberInput(group, axis));
      }
    }
    transformEditor.append(this.numberInput('scale', 'x'));

    const visibility = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.dataset.sceneField = 'visible';
    checkbox.addEventListener('change', () => this.updateVisibility(checkbox.checked));
    visibility.append(checkbox, ` ${this.api.i18n.t('transform.visible')}`);

    this.status = document.createElement('output');
    this.status.textContent = this.api.i18n.t('status.ready');
    this.panel.append(description, actions, this.hierarchy, transformEditor, visibility, this.status);
    this.refreshHierarchy();
  }

  private async addSampleModel(): Promise<void> {
    try {
      const assetUrl = this.api.assets.url('assets/sample.gltf');
      const id = await this.api.scene.addModel(assetUrl, {
        normalize: true,
        position: [0.45, 1.15, 0.05],
        rotation: [0, 0, 0],
        scale: 0.35
      });
      this.register(id, this.api.i18n.t('object.model'), [0.45, 1.15, 0.05], 0.35);
    } catch (error) {
      this.setStatus(this.api.i18n.t('status.error', { message: error instanceof Error ? error.message : String(error) }));
    }
  }

  private addPrimitive(kind: 'box' | 'sphere'): void {
    const position: [number, number, number] = [-0.45 + this.entries.size * 0.12, 1.1, 0];
    const id = this.api.scene.addPrimitive({ kind, color: kind === 'box' ? '#806cf0' : '#ff8a42', position });
    this.register(id, this.api.i18n.t(kind === 'box' ? 'object.cube' : 'object.sphere'), position, 1);
  }

  private register(id: string, name: string, position: [number, number, number], scale: number): void {
    this.entries.set(id, {
      id,
      name: `${name} ${this.entries.size + 1}`,
      transform: { position, rotation: [0, 0, 0], scale },
      visible: true
    });
    this.refreshHierarchy(id);
    this.setStatus(this.api.i18n.t('status.added', { name }));
  }

  private numberInput(group: 'position' | 'rotation' | 'scale', axis: Axis): HTMLLabelElement {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'number';
    input.step = group === 'rotation' ? '5' : '0.05';
    input.dataset.sceneField = `${group}.${axis}`;
    input.addEventListener('change', () => this.updateTransform(group, axis, Number(input.value)));
    const key = group === 'scale' ? 'transform.scale' : `transform.${group}.${axis}`;
    label.append(`${this.api.i18n.t(key)} `, input);
    return label;
  }

  private updateTransform(group: 'position' | 'rotation' | 'scale', axis: Axis, value: number): void {
    const entry = this.selected();
    if (!entry || !Number.isFinite(value)) {
      return;
    }
    if (group === 'scale') {
      entry.transform.scale = Math.max(0.01, value);
    } else {
      const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
      const target = entry.transform[group];
      target[index] = group === 'rotation' ? value * Math.PI / 180 : value;
    }
    this.api.scene.setTransform(entry.id, entry.transform);
  }

  private updateVisibility(visible: boolean): void {
    const entry = this.selected();
    if (!entry) {
      return;
    }
    entry.visible = visible;
    this.api.scene.setVisible(entry.id, visible);
  }

  private removeSelected(): void {
    const entry = this.selected();
    if (!entry) {
      return;
    }
    this.api.scene.remove(entry.id);
    this.entries.delete(entry.id);
    this.refreshHierarchy();
    this.setStatus(this.api.i18n.t('status.removed', { name: entry.name }));
  }

  private refreshHierarchy(selectedId?: string): void {
    if (!this.hierarchy) {
      return;
    }
    this.hierarchy.replaceChildren();
    if (this.entries.size === 0) {
      const empty = new Option(this.api.i18n.t('hierarchy.empty'), '');
      this.hierarchy.add(empty);
    } else {
      for (const entry of this.entries.values()) {
        this.hierarchy.add(new Option(entry.name, entry.id));
      }
      this.hierarchy.value = selectedId ?? this.hierarchy.options[0]?.value ?? '';
    }
    this.syncControls();
  }

  private syncControls(): void {
    const entry = this.selected();
    const fields = this.panel
      ? Array.from(this.panel.querySelectorAll<HTMLInputElement>('[data-scene-field]'))
      : [];
    for (const input of fields) {
      input.disabled = !entry;
      const field = input.dataset.sceneField;
      if (!entry || !field) {
        continue;
      }
      if (field === 'visible') {
        input.checked = entry.visible;
        continue;
      }
      const [group, axis] = field.split('.') as ['position' | 'rotation' | 'scale', Axis];
      if (group === 'scale') {
        input.value = String(entry.transform.scale);
      } else {
        const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        const value = entry.transform[group][index];
        input.value = String(group === 'rotation' ? Math.round(value * 180 / Math.PI) : value);
      }
    }
  }

  private selected(): SceneEntry | undefined {
    return this.hierarchy ? this.entries.get(this.hierarchy.value) : undefined;
  }

  private button(key: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = this.api.i18n.t(key);
    button.addEventListener('click', action);
    return button;
  }

  private setStatus(message: string): void {
    if (this.status) {
      this.status.textContent = message;
    }
  }
}
