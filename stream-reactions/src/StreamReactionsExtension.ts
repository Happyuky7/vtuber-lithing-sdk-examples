import { VtuberTrackingExtension } from 'vtuber-lithing-sdk';
import type { CollisionSpawnOptions, StreamEvent } from 'vtuber-lithing-sdk';

interface ReactionSettings {
  minimumBits: number;
  minimumSuperChat: number;
  ballPerFollow: boolean;
  cubesPerSubscription: number;
}

const defaults: ReactionSettings = { minimumBits: 100, minimumSuperChat: 5, ballPerFollow: true, cubesPerSubscription: 3 };
const settingsKey = 'settings';
const maxLogLines = 8;

/**
 * Turns Twitch and YouTube events from the Stream Integrations module into
 * objects thrown at the avatar. Shows typed host events, persistent settings
 * and the collisions bridge working together.
 */
export class StreamReactionsExtension extends VtuberTrackingExtension {
  private settings: ReactionSettings = { ...defaults };
  private log?: HTMLOListElement;
  private empty?: HTMLParagraphElement;

  protected override onActivate(): void {
    this.api.capabilities.require('controls');
    this.api.capabilities.require('integration');
    this.settings = { ...defaults, ...this.api.storage.get<Partial<ReactionSettings>>(settingsKey, {}) };

    const panel = this.createPanel('panel.title');
    const description = document.createElement('p');
    description.className = 'hint';
    description.textContent = this.api.i18n.t('panel.description');
    panel.append(
      description,
      this.numberField('settings.bits', 'minimumBits', 1),
      this.numberField('settings.superchat', 'minimumSuperChat', 1),
      this.numberField('settings.subs', 'cubesPerSubscription', 1, 10),
      this.checkboxField('settings.follows', 'ballPerFollow'),
      this.logView()
    );

    this.listen('stream-event', (event) => this.react(event));
  }

  private react(event: StreamEvent): void {
    const reaction = this.reactionFor(event);
    if (reaction) {
      for (let index = 0; index < reaction.count; index++) {
        // Stagger multiple objects so they do not overlap in flight.
        window.setTimeout(() => this.api.collisions.spawn(reaction.object), index * 180);
      }
    }
    this.addLogLine(event, reaction);
  }

  private reactionFor(event: StreamEvent): { count: number; object: CollisionSpawnOptions } | undefined {
    const { minimumBits, minimumSuperChat, ballPerFollow, cubesPerSubscription } = this.settings;
    switch (event.type) {
      case 'bits':
        return event.amount >= minimumBits ? { count: 1, object: { kind: 'star', color: 0xa78bfa, speed: 4 } } : undefined;
      case 'superchat':
        return event.amount >= minimumSuperChat ? { count: 1, object: { kind: 'star', color: 0xfacc15, speed: 4 } } : undefined;
      case 'subscription':
      case 'membership':
      case 'gift':
        return { count: cubesPerSubscription * Math.max(1, event.type === 'gift' ? event.amount : 1), object: { kind: 'cube', color: 0x7c3aed, speed: 3 } };
      case 'follow':
        return ballPerFollow ? { count: 1, object: { kind: 'ball', color: 0x38bdf8, speed: 3 } } : undefined;
      case 'raid':
        return { count: Math.min(10, Math.ceil(event.amount / 10)), object: { kind: 'can', speed: 3.5 } };
      default:
        return undefined;
    }
  }

  private numberField(labelKey: string, setting: 'minimumBits' | 'minimumSuperChat' | 'cubesPerSubscription', min: number, max?: number): HTMLLabelElement {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = String(min);
    if (max !== undefined) input.max = String(max);
    input.value = String(this.settings[setting]);
    input.addEventListener('change', () => {
      const value = Math.max(min, Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.round(Number(input.value) || min)));
      input.value = String(value);
      this.save({ [setting]: value });
    });
    label.append(`${this.api.i18n.t(labelKey)} `, input);
    return label;
  }

  private checkboxField(labelKey: string, setting: 'ballPerFollow'): HTMLLabelElement {
    const label = document.createElement('label');
    label.className = 'check';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.settings[setting];
    input.addEventListener('change', () => this.save({ [setting]: input.checked }));
    label.append(input, ` ${this.api.i18n.t(labelKey)}`);
    return label;
  }

  private logView(): HTMLElement {
    const section = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = this.api.i18n.t('log.title');
    this.empty = document.createElement('p');
    this.empty.className = 'hint';
    this.empty.textContent = this.api.i18n.t('log.empty');
    this.log = document.createElement('ol');
    section.append(title, this.empty, this.log);
    return section;
  }

  private addLogLine(event: StreamEvent, reaction: { count: number; object: CollisionSpawnOptions } | undefined): void {
    if (!this.log) return;
    this.empty?.remove();
    const line = document.createElement('li');
    line.textContent = this.api.i18n.t('event.line', { platform: event.platform, user: event.user, type: event.type, amount: event.amount });
    if (reaction) line.textContent += ` → ${this.api.i18n.t('event.reaction', { count: reaction.count, kind: reaction.object.kind ?? 'ball' })}`;
    this.log.prepend(line);
    while (this.log.children.length > maxLogLines) this.log.lastElementChild?.remove();
  }

  private save(patch: Partial<ReactionSettings>): void {
    this.settings = { ...this.settings, ...patch };
    this.api.storage.set(settingsKey, this.settings);
  }
}
