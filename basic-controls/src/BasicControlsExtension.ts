import { VtuberTrackingExtension } from 'vtuber-lithing-sdk';
import type { AvatarSnapshot } from 'vtuber-lithing-sdk';

export class BasicControlsExtension extends VtuberTrackingExtension {
  private panel?: HTMLElement;
  private output?: HTMLOutputElement;
  private sceneObjectId?: string;

  protected override onActivate(): void {
    this.api.capabilities.require('controls');
    this.api.capabilities.require('tracking');
    this.api.capabilities.require('integration');

    this.panel = this.createPanel('panel.title');
    this.output = document.createElement('output');
    this.renderPanel();
    this.restoreActivationCounter();
    this.listen('avatar-loaded', () => this.showAvatar());
    this.api.log(this.api.i18n.t('log.activating'));
  }

  protected override onDeactivate(): void {
    if (this.sceneObjectId) {
      this.api.scene.remove(this.sceneObjectId);
      this.sceneObjectId = undefined;
    }
    this.panel?.remove();
    this.api.log(this.api.i18n.t('log.deactivated'));
  }

  private renderPanel(): void {
    if (!this.panel || !this.output) {
      return;
    }

    const description = document.createElement('p');
    description.className = 'hint';
    description.textContent = this.api.i18n.t('panel.description');

    const avatarButton = this.createButton('button.avatar', () => this.showAvatar());
    const cubeButton = this.createButton('button.addCube', () => this.toggleCube(cubeButton));
    const throwButton = this.createButton('button.throw', () => this.throwObject());
    this.panel.append(description, avatarButton, cubeButton, throwButton, this.output);
  }

  private createButton(translationKey: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = this.api.i18n.t(translationKey);
    button.addEventListener('click', action);
    return button;
  }

  private showAvatar(): void {
    const avatar: AvatarSnapshot = this.api.avatar.snapshot();
    if (!this.output) {
      return;
    }

    this.output.textContent = avatar.loaded
      ? this.api.i18n.t('status.avatar', {
          name: avatar.name ?? 'Avatar',
          count: avatar.expressions.length
        })
      : this.api.i18n.t('status.noAvatar');
  }

  private toggleCube(button: HTMLButtonElement): void {
    if (this.sceneObjectId) {
      this.api.scene.remove(this.sceneObjectId);
      this.sceneObjectId = undefined;
      button.textContent = this.api.i18n.t('button.addCube');
      return;
    }

    this.sceneObjectId = this.api.scene.addPrimitive({
      kind: 'box',
      color: '#ff8a42',
      position: [0.5, 1.2, 0.1],
      rotation: [0.2, 0.4, 0],
      scale: 1
    });
    button.textContent = this.api.i18n.t('button.removeCube');
  }

  private throwObject(): void {
    this.api.collisions.spawn({
      kind: 'cube',
      color: 0xff8a42,
      speed: 3.2,
      size: 0.09
    });
  }

  private restoreActivationCounter(): void {
    const activations = (this.api.storage.get<number>('activations', 0) ?? 0) + 1;
    this.api.storage.set('activations', activations);
    if (this.output) {
      this.output.textContent = this.api.i18n.t('status.activations', { count: activations });
    }
  }
}
