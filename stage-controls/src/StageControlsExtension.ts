import { VtuberTrackingExtension, isNetworkError } from 'vtuber-lithing-sdk';
import type { HotkeyRegistration, OverlayHandle } from 'vtuber-lithing-sdk';

const toggleAccelerator = 'CommandOrControl+Alt+H';

/**
 * Tour of the host-rendered APIs: an expression held on top of tracking, a
 * floating button on the stage, a system-wide hotkey, a modal, the mode events
 * and a native HTTP request to a device on the local network. Everything it
 * creates is released by the application when the extension stops.
 */
export class StageControlsExtension extends VtuberTrackingExtension {
  private panel?: HTMLElement;
  private output?: HTMLOutputElement;
  private select?: HTMLSelectElement;
  private overlay?: OverlayHandle;
  private hotkey?: HotkeyRegistration;
  private expression = '';
  private held = false;

  protected override async onActivate(): Promise<void> {
    this.expression = this.api.storage.get<string>('expression', 'happy') ?? 'happy';
    this.held = false;

    this.panel = this.createPanel('panel.title');
    this.renderPanel();

    // A button floating over the stage. Hidden in stream mode unless showInStreamMode is true.
    this.overlay = this.api.ui.overlay({ position: 'bottom-left' });
    const floating = this.createButton('button.toggle', () => this.toggle());
    floating.className = 'primary';
    this.overlay.element.append(floating);

    // System-wide on desktop; on Android the result is `unsupported`.
    this.hotkey = await this.registerHotkey(toggleAccelerator, () => this.toggle());
    this.show(this.hotkey.ok
      ? this.api.i18n.t('status.hotkey', { accelerator: this.hotkey.accelerator })
      : this.api.i18n.t('status.noHotkey', { reason: this.hotkey.reason }));

    this.listen('avatar-loaded', (event) => { if (!event.preview) this.fillExpressions(); });
    this.listen('stream-mode', ({ active }) => this.show(this.api.i18n.t(active ? 'status.streamOn' : 'status.streamOff')));
    this.listen('recording', ({ active }) => this.show(this.api.i18n.t(active ? 'status.recordingOn' : 'status.recordingOff')));
  }

  protected override onDeactivate(): void {
    // The host also releases expressions, overlays and hotkeys; this only resets local state.
    this.held = false;
  }

  private renderPanel(): void {
    if (!this.panel) return;
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = this.api.i18n.t('panel.description');

    const label = document.createElement('label');
    label.textContent = this.api.i18n.t('label.expression');
    this.select = document.createElement('select');
    this.select.addEventListener('change', () => {
      if (this.held) this.api.avatar.clearExpression(this.expression);
      this.expression = this.select!.value;
      this.api.storage.set('expression', this.expression);
      if (this.held) this.api.avatar.setExpression(this.expression, 1);
    });
    label.append(this.select);
    this.fillExpressions();

    const toggle = this.createButton('button.toggle', () => this.toggle());
    const about = this.createButton('button.about', () => void this.showAbout());

    const urlLabel = document.createElement('label');
    urlLabel.textContent = this.api.i18n.t('label.url');
    const url = document.createElement('input');
    url.type = 'text';
    url.value = this.api.storage.get<string>('url', 'http://127.0.0.1:8080/') ?? '';
    urlLabel.append(url);
    const ping = this.createButton('button.ping', () => void this.ping(url.value));

    this.output = document.createElement('output');
    this.panel.append(hint, label, toggle, about, urlLabel, ping, this.output);
  }

  private fillExpressions(): void {
    if (!this.select) return;
    const names = this.api.avatar.expressions().map((expression) => expression.name);
    if (!names.includes(this.expression)) names.unshift(this.expression);
    this.select.replaceChildren(...names.map((name) => new Option(name, name, false, name === this.expression)));
  }

  /** Holds the chosen expression at full weight; tracking and the user's own expressions still show through. */
  private toggle(): void {
    this.held = !this.held;
    const found = this.api.avatar.setExpression(this.expression, this.held ? 1 : 0);
    this.show(this.api.i18n.t(!found ? 'status.missing' : this.held ? 'status.held' : 'status.released', { name: this.expression }));
  }

  private async showAbout(): Promise<void> {
    const { action } = await this.api.ui.modal({
      title: this.api.i18n.t('modal.title'),
      text: this.api.i18n.t('modal.text'),
      actions: [{ id: 'reset', label: this.api.i18n.t('modal.reset'), kind: 'danger' }, { id: 'close', label: this.api.i18n.t('modal.close') }]
    }).result;
    if (action === 'reset') {
      this.api.storage.remove('expression');
      this.api.storage.remove('url');
      this.show(this.api.i18n.t('status.reset'));
    }
  }

  /** Native HTTP: no CORS, works on Android, limited to the local network and approved hosts. */
  private async ping(url: string): Promise<void> {
    this.api.storage.set('url', url);
    if (!this.api.network.isAllowed(url)) {
      this.show(this.api.i18n.t('status.blocked'));
      return;
    }
    try {
      const response = await this.api.network.request({ url, timeoutMs: 3000 });
      this.show(this.api.i18n.t('status.response', { status: response.status, bytes: response.body.byteLength }));
    } catch (error) {
      this.show(this.api.i18n.t('status.failed', { code: isNetworkError(error) ? error.code : 'error' }));
    }
  }

  private createButton(translationKey: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.api.i18n.t(translationKey);
    button.addEventListener('click', action);
    return button;
  }

  private show(text: string): void {
    if (this.output) this.output.textContent = text;
  }
}
