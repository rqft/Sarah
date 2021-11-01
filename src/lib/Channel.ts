import { Structures } from "detritus-client";
import { DiscordEndpoints } from "../dep/endpoints";
import { ChannelTypes, ChannelVideoQualityModes } from "../dep/globals";
import { List } from "../dep/List";
import { RequestTypes } from "../dep/RequestTypes";
import { timestamp } from "../dep/Snowflake";
import { Structure } from "./Client";

export class ChannelBase extends Structure {
  rawChannelBase: discord.Channel;

  applicationId?: string;
  bitrate?: number;
  deleted: boolean = false;
  guildId?: string;
  id: string = "";
  icon?: null | string;
  isPartial: boolean = false;
  lastMessageId?: null | string;
  lastPinTimestampUnix?: number;
  memberCount?: number;
  messageCount?: number;
  ownerId?: string;
  parentId?: null | string;
  position?: number;
  rateLimitPerUser?: number;
  rtcRegion?: null | string;
  topic: null | string = null;
  type: ChannelTypes = ChannelTypes.BASE;
  userLimit?: number;
  videoQualityMode?: ChannelVideoQualityModes;

  _keys = new Set(["id", "type"]);
  _name: string;
  _nsfw: string;
  constructor(raw: discord.Channel) {
    super();
    this.merge(raw);
    this.rawChannelBase = raw;
  }

  get canAddReactions(): boolean {
    return this.canMessage;
  }

  get canAttachFiles(): boolean {
    return this.canMessage;
  }

  get canDeafenMembers(): boolean {
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canEdit(): boolean {
    return this.isDm;
  }

  get canEmbedLinks(): boolean {
    return this.canMessage;
  }

  get canJoin(): boolean {
    if (this.isDm) {
      if (this.client.userId && true /* client.user().bot */) {
        return false;
      }
      return true;
    }
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canManageMessages(): boolean {
    return false;
  }

  get canManageWebhooks(): boolean {
    return false;
  }

  get canMentionEveryone(): boolean {
    return this.isText;
  }

  get canMessage(): boolean {
    return this.isText;
  }

  get canManageThreads(): boolean {
    return false;
  }

  get canMoveMembers(): boolean {
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canMuteMembers(): boolean {
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canPrioritySpeaker(): boolean {
    return false;
  }

  get canSendTTSMessage(): boolean {
    return this.isText && !this.isDm;
  }

  get canSpeak(): boolean {
    if (this.isDm) {
      if (this.client.userId && true /* client.user().bot */) {
        return false;
      }
      return true;
    }
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canStream(): boolean {
    return this.isGuildStageVoice || this.isGuildVoice;
  }

  get canReadHistory(): boolean {
    return this.isText;
  }

  get canUseExternalEmojis(): boolean {
    return this.isDm;
  }

  get canUsePrivateThreads(): boolean {
    return false;
  }

  get canUsePublicThreads(): boolean {
    return false;
  }

  get canUseVAD(): boolean {
    return this.isVoice;
  }

  get canView(): boolean {
    return this.isText;
  }

  get children() {
    return new List();
  }

  get createdAt(): Date {
    return new Date(this.createdAtUnix);
  }

  get createdAtUnix(): number {
    return timestamp(this.id);
  }

  get defaultIconUrl(): null | string {
    return null;
  }

  get iconUrl(): null | string {
    return null;
  }

  get isDm(): boolean {
    return this.isDmSingle || this.isDmGroup;
  }

  get isDmGroup(): boolean {
    return this.type === ChannelTypes.GROUP_DM;
  }

  get isDmSingle(): boolean {
    return this.type === ChannelTypes.DM;
  }

  get isGuildCategory(): boolean {
    return this.type === ChannelTypes.GUILD_CATEGORY;
  }

  get isGuildChannel(): boolean {
    return (
      this.isGuildCategory ||
      this.isGuildText ||
      this.isGuildVoice ||
      this.isGuildNews ||
      this.isGuildStore ||
      this.isGuildThreadNews ||
      this.isGuildThreadPrivate ||
      this.isGuildThreadPublic ||
      this.isGuildStageVoice
    );
  }

  get isGuildNews(): boolean {
    return this.type === ChannelTypes.GUILD_NEWS;
  }

  get isGuildStageVoice(): boolean {
    return this.type === ChannelTypes.GUILD_STAGE_VOICE;
  }

  get isGuildStore(): boolean {
    return this.type === ChannelTypes.GUILD_STORE;
  }

  get isGuildText(): boolean {
    return this.type === ChannelTypes.GUILD_TEXT;
  }

  get isGuildThread(): boolean {
    return (
      this.isGuildThreadNews ||
      this.isGuildThreadPrivate ||
      this.isGuildThreadPublic
    );
  }

  get isGuildThreadNews(): boolean {
    return this.type === ChannelTypes.GUILD_NEWS_THREAD;
  }

  get isGuildThreadPrivate(): boolean {
    return this.type === ChannelTypes.GUILD_PRIVATE_THREAD;
  }

  get isGuildThreadPublic(): boolean {
    return this.type === ChannelTypes.GUILD_PUBLIC_THREAD;
  }

  get isGuildVoice(): boolean {
    return this.type === ChannelTypes.GUILD_VOICE;
  }

  get isLive(): boolean {
    return !!this.stageInstance;
  }

  get isManaged(): boolean {
    return !!this.applicationId;
  }

  get isSyncedWithParent(): boolean {
    return this.isSyncedWith(this.parent);
  }

  get isText(): boolean {
    return (
      this.isDm || this.isGuildText || this.isGuildNews || this.isGuildThread
    );
  }

  get isVoice(): boolean {
    return this.isDm || this.isGuildVoice || this.isGuildStageVoice;
  }

  get joined(): boolean {
    return false;
  }

  get jumpLink(): string {
    return (
      DiscordEndpoints.Routes.URL +
      DiscordEndpoints.Routes.CHANNEL(null, this.id)
    );
  }

  get lastMessage(): null {
    return null;
  }

  get lastPinTimestamp(): Date | null {
    if (this.lastPinTimestampUnix) {
      return new Date(this.lastPinTimestampUnix);
    }
    return null;
  }

  get members() {
    return new List();
  }

  get messages() {
    return new List();
  }

  get mention(): string {
    return `<#${this.id}>`;
  }

  get name(): string {
    return this._name;
  }

  get nsfw(): boolean {
    return !!this._nsfw;
  }

  get owner() {
    if (this.ownerId) {
      return this.client;
    }
    return null;
  }

  get parent(): ChannelGuildCategory | ChannelGuildText | null {
    if (this.parentId && this.client.channels.has(this.parentId)) {
      return this.client.channels.get(this.parentId) as
        | ChannelGuildCategory
        | ChannelGuildText;
    }
    return null;
  }

  get permissionOverwrites(): BaseCollection<string, Overwrite> {
    if (this._permissionOverwrites) {
      return this._permissionOverwrites;
    }
    return emptyBaseCollection;
  }

  get stageInstance(): StageInstance | null {
    if (this.isGuildStageVoice) {
      const guild = this.guild;
      if (guild) {
        for (let [stageId, stage] of guild.stageInstances) {
          if (stage.channelId === this.id) {
            return stage;
          }
        }
      }
    }
    return null;
  }

  get recipients() {
    return new List();
  }

  get typing() {
    return new List();
  }

  get voiceStates(): BaseCollection<string, VoiceState> {
    return emptyBaseCollection;
  }

  can(
    permissions: PermissionTools.PermissionChecks,
    memberOrRole?: Member | Role
  ): boolean {
    return false;
  }

  iconUrlFormat(format?: null | string, query?: UrlQuery): null | string {
    return null;
  }

  isSyncedWith(parent: ChannelGuildCategory | null): boolean {
    return false;
  }

  async addPinnedMessage(messageId: string) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.addPinnedMessage(this.id, messageId);
  }

  async addMember(userId: string) {
    if (!this.isGuildThread) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.addThreadMember(this.id, userId);
  }

  async addRecipient(userId: string) {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.addRecipient(this.id, userId);
  }

  async bulkDelete(messageIds: Array<string>) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.bulkDeleteMessages(this.id, messageIds);
  }

  async close() {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.delete();
  }

  async createInvite(options: RequestTypes.CreateChannelInvite) {
    return this.client.rest.createChannelInvite(this.id, options);
  }

  async createMessage(options: RequestTypes.CreateMessage | string = {}) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.createMessage(this.id, options);
  }

  async createReaction(messageId: string, emoji: string) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.createReaction(this.id, messageId, emoji);
  }

  async createStageInstance(
    options: PartialBy<RequestTypes.CreateStageInstance, "channelId">
  ) {
    if (!this.isGuildStageVoice) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.createStageInstance({
      ...options,
      channelId: this.id,
    });
  }

  async createThread(options: RequestTypes.CreateChannelThread) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.createChannelThread(this.id, options);
  }

  async createWebhook(options: RequestTypes.CreateWebhook) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.createWebhook(this.id, options);
  }

  async crosspostMessage(messageId: string) {
    if (!this.isGuildNews) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.crosspostMessage(this.id, messageId);
  }

  async delete(options: RequestTypes.DeleteChannel = {}) {
    return this.client.rest.deleteChannel(this.id, options);
  }

  async deleteMessage(
    messageId: string,
    options: RequestTypes.DeleteMessage = {}
  ) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deleteMessage(this.id, messageId, options);
  }

  async deleteOverwrite(
    overwriteId: string,
    options: RequestTypes.DeleteChannelOverwrite = {}
  ) {
    if (!this.isGuildChannel) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deleteChannelOverwrite(
      this.id,
      overwriteId,
      options
    );
  }

  async deletePin(messageId: string) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deletePinnedMessage(this.id, messageId);
  }

  async deleteReaction(
    messageId: string,
    emoji: string,
    userId: string = "@me"
  ) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deleteReaction(this.id, messageId, emoji, userId);
  }

  async deleteReactions(messageId: string) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deleteReactions(this.id, messageId);
  }

  async deleteStageInstance() {
    if (!this.isGuildStageVoice) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.deleteStageInstance(this.id);
  }

  edit(options: RequestTypes.EditChannel = {}) {
    return this.client.rest.editChannel(this.id, options);
  }

  async editMessage(messageId: string, options: RequestTypes.EditMessage = {}) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.editMessage(this.id, messageId, options);
  }

  async editOverwrite(
    overwriteId: string,
    options: RequestTypes.EditChannelOverwrite = {}
  ) {
    if (!this.isGuildChannel) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.editChannelOverwrite(this.id, overwriteId, options);
  }

  async editStageInstance(options: RequestTypes.EditStageInstance = {}) {
    if (!this.isGuildStageVoice) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.editStageInstance(this.id, options);
  }

  async fetchCallStatus() {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelCall(this.id);
  }

  async fetchInvites() {
    return this.client.rest.fetchChannelInvites(this.id);
  }

  async fetchMembers() {
    if (!this.isGuildThread) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchThreadMembers(this.id);
  }

  async fetchMessage(messageId: string) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchMessage(this.id, messageId);
  }

  async fetchMessages(options: RequestTypes.FetchMessages = {}) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchMessages(this.id, options);
  }

  async fetchPins() {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchPinnedMessages(this.id);
  }

  async fetchReactions(
    messageId: string,
    emoji: string,
    options: RequestTypes.FetchReactions = {}
  ) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchReactions(this.id, messageId, emoji, options);
  }

  async fetchStageInstance() {
    if (!this.isGuildStageVoice) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchStageInstance(this.id);
  }

  async fetchStoreListing() {
    if (!this.isGuildStore) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelStoreListing(this.id);
  }

  async fetchThreadsActive() {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelThreadsActive(this.id);
  }

  async fetchThreadsArchivedPrivate(
    options: RequestTypes.FetchChannelThreadsArchivedPrivate = {}
  ) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelThreadsArchivedPrivate(
      this.id,
      options
    );
  }

  async fetchThreadsArchivedPrivateJoined(
    options: RequestTypes.FetchChannelThreadsArchivedPrivateJoined = {}
  ) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelThreadsArchivedPrivateJoined(
      this.id,
      options
    );
  }

  async fetchThreadsArchivedPublic(
    options: RequestTypes.FetchChannelThreadsArchivedPublic = {}
  ) {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelThreadsArchivedPublic(this.id, options);
  }

  async fetchWebhooks() {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.fetchChannelWebhooks(this.id);
  }

  async follow(options: RequestTypes.FollowChannel) {
    if (!this.isGuildNews) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.followChannel(this.id, options);
  }

  async grantEntitlement() {
    if (!this.isGuildStore) {
      throw new Error("Channel type doesn't support this.");
    }
  }

  async join(): Promise<void>;
  async join(options?: CallOptions): Promise<VoiceConnectObject | null>;
  async join(options?: CallOptions): Promise<VoiceConnectObject | null | void> {
    if (this.isGuildThread) {
      return this.client.rest.joinThread(this.id);
    } else if (this.isVoice) {
      if (options && this.isDm) {
        if (options.verify || options.verify === undefined) {
          await this.fetchCallStatus();
        }
        if (options.recipients) {
          await this.startCallRinging(options.recipients);
        }
      }
      return this.client.voiceConnect(
        this.guildId || undefined,
        this.id,
        options
      );
    } else {
      throw new Error("Channel type doesn't support this.");
    }
  }

  async leave() {
    if (!this.isGuildThread) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.leaveThread(this.id);
  }

  async removeMember(userId: string) {
    if (!this.isGuildThread) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.removeThreadMember(this.id, userId);
  }

  async removeRecipient(userId: string) {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.removeRecipient(this.id, userId);
  }

  async search(options: RequestTypes.SearchOptions, retry?: boolean) {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.searchChannel(this.id, options, retry);
  }

  async startCallRinging(recipients?: Array<string>) {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.startChannelCallRinging(this.id, { recipients });
  }

  async stopCallRinging(recipients?: Array<string>) {
    if (!this.isDm) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.stopChannelCallRinging(this.id, { recipients });
  }

  async triggerTyping() {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.triggerTyping(this.id);
  }

  async turnIntoNewsChannel() {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.edit({
      type: ChannelTypes.GUILD_NEWS,
    });
  }

  async turnIntoTextChannel() {
    if (!this.isGuildText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.edit({
      type: ChannelTypes.GUILD_TEXT,
    });
  }

  async unack() {
    if (!this.isText) {
      throw new Error("Channel type doesn't support this.");
    }
    return this.client.rest.unAckChannel(this.id);
  }
}
discord.DmChannel.prototype.triggerTypingIndicator;
Structures.ChannelDM.prototype.createMessage();
