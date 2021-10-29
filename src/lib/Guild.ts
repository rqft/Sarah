import { DiscordEndpoints, replacePathParameters } from "../dep/endpoints";
import {
  DEFAULT_MAX_MEMBERS,
  DEFAULT_MAX_PRESENCES,
  DEFAULT_MAX_VIDEO_CHANNEL_USERS,
  GuildFeatures,
  GuildNSFWLevels,
  LocalesText,
  MAX_ATTACHMENT_SIZE,
  MAX_BITRATE,
  MAX_EMOJI_SLOTS,
  MAX_EMOJI_SLOTS_MORE,
  Permissions,
  PremiumGuildLimits,
  SystemChannelFlags,
} from "../dep/globals";
import { List } from "../dep/List";
import { checkPermissions, PermissionChecks } from "../dep/Permissions";
import { RequestTypes } from "../dep/RequestTypes";
import { timestamp } from "../dep/Snowflake";
import { addQuery, guildIdToShardId, UrlQuery } from "../dep/utils";
import { AuditLogEntry } from "./AuditLogEntry";
import { Structure } from "./Client";
export interface BeginGuildPrune {
  computePruneCount?: boolean;
  days?: number;
  includeRoles?: Array<string>;
  reason?: string;
}
export class Guild extends Structure {
  public raw: discord.Guild;
  constructor(raw: discord.Guild) {
    super();
    this.raw = raw;
  }
  ack() {
    return this;
  }
  get acronym() {
    if (!this.name) {
      return "";
    }
    return this.name.replace(/\w+/g, (match) => match[0]).replace(/\s/g, "");
  }
  get afkChannelId() {
    return this.raw.afkChannelId;
  }
  get afkTimeout() {
    return this.raw.afkTimeout;
  }

  get applicationCommandCount() {
    return this._isUnused();
  }
  get applicationId() {
    return this.raw.applicationId;
  }

  get banner() {
    return this.raw.banner;
  }
  get bannerUrl() {
    return this.bannerUrlFormat();
  }
  public bannerUrlFormat(format?: string | null, query?: UrlQuery) {
    return this.hashCdnUrl(
      DiscordEndpoints.CDN.BANNER.name,
      this.id,
      this.banner,
      format,
      query
    );
  }

  async beginPrune(options: BeginGuildPrune) {
    return this.raw.beginPrune(options);
  }

  async can(
    permissions: PermissionChecks,
    member?: discord.GuildMember | null,
    options?: {
      ignoreAdministrator?: boolean;
      ignoreOwner?: boolean;
    }
  ): Promise<boolean> {
    const ignoreAdministrator = !!options.ignoreAdministrator;
    const ignoreOwner = !!options.ignoreOwner;

    if (!ignoreOwner) {
      let memberId: string;
      if (member) {
        memberId = member.user.id;
      } else {
        if (!this.client.userId) {
          throw new Error("Provide a member object please");
        }
        memberId = this.client.userId;
      }
      if (this.isOwner(memberId)) {
        return true;
      }
    }

    if (!member) {
      member = await this.client.member();
    }
    if (member) {
      const total = member.permissions;
      if (
        !ignoreAdministrator &&
        checkPermissions(total, Permissions.ADMINISTRATOR)
      ) {
        return true;
      }
      return checkPermissions(total, permissions);
    }
    return false;
  }
  isOwner(id: string) {
    return this.ownerId === id;
  }
  get id() {
    return this.raw.id;
  }
  get canHaveBanner() {
    return this.isVerified || this.hasFeature(GuildFeatures.BANNER);
  }
  get canHaveDiscoveryFeatures() {
    return this.isDiscoverable || this.isPublic;
  }
  get canHaveNews() {
    return this.hasFeature(GuildFeatures.NEWS);
  }
  get canHavePublic(): boolean {
    return !this.hasFeature(GuildFeatures.PUBLIC_DISABLED);
  }

  get canHaveSplash(): boolean {
    return this.hasFeature(GuildFeatures.INVITE_SPLASH);
  }

  get canHaveStore(): boolean {
    return this.hasFeature(GuildFeatures.COMMERCE);
  }

  get canHaveVanityUrl(): boolean {
    return this.hasFeature(GuildFeatures.VANITY_URL);
  }

  get canHaveVipRegions(): boolean {
    return this.hasFeature(GuildFeatures.VIP_REGIONS);
  }
  get isDiscoverable(): boolean {
    return this.hasFeature(GuildFeatures.DISCOVERABLE);
  }
  get isPartnered(): boolean {
    return this.hasFeature(GuildFeatures.PARTNERED);
  }
  get isPublic(): boolean {
    return (
      this.hasFeature(GuildFeatures.PUBLIC) &&
      !this.hasFeature(GuildFeatures.PUBLIC_DISABLED)
    );
  }
  get isVerified(): boolean {
    return this.hasFeature(GuildFeatures.VERIFIED);
  }
  hasFeature(feature: GuildFeatures) {
    return this.features.has(feature);
  }
  get features() {
    return List.from(this.raw.features as unknown as Array<GuildFeatures>);
  }
  async createBan(userId: string, options: RequestTypes.CreateGuildBan) {
    await this.raw.createBan(userId, options);

    return this.raw.getBan(userId);
  }
  async createChannel(options: RequestTypes.CreateGuildChannel) {
    return this.raw.createChannel(
      options as discord.Guild.CreateChannelOptions
    );
  }
  async createEmoji(options: RequestTypes.CreateGuildEmoji) {
    return this.raw.createEmoji(options);
  }
  async createIntegration(options: RequestTypes.CreateGuildIntegration) {
    return this._isUnused();
  }
  async createRole(options: RequestTypes.CreateGuildRole) {
    return this.raw.createRole(options);
  }
  async createSticker(options: RequestTypes.CreateGuildSticker) {
    return this._isUnused();
  }
  async createTemplate(options: RequestTypes.CreateGuildTemplate) {
    return this._isUnused();
  }
  get createdAt() {
    return new Date(this.createdAtUnix);
  }
  get createdAtUnix() {
    return timestamp(this.id);
  }
  get defaultMessageNotifications() {
    return this.raw.defaultMessageNotifications;
  }
  async fetchDefaultRole() {
    return this.raw.getRole(this.id);
  }
  async delete() {
    return this._isUnused();
  }
  async deleteChannel(channelId: string, options?: RequestTypes.DeleteChannel) {
    const payload = await this.raw.getChannel(channelId);
    await payload.delete();
    return payload;
  }
  async deleteEmoji(emojiId: string, options?: RequestTypes.DeleteGuildEmoji) {
    const payload = await this.raw.getEmoji(emojiId);
    await payload.delete();
    return payload;
  }
  async deleteIntegration(
    integrationId: string,
    options?: RequestTypes.DeleteGuildIntegration
  ) {
    return this._isUnused();
  }
  async deletePremiumSubscription(subscriptionId: string) {
    return this._isUnused();
  }
  async deleteRole(roleId: string, options?: RequestTypes.DeleteGuildRole) {
    const payload = await this.raw.getRole(roleId);
    await payload.delete();
    return payload;
  }
  async deleteSticker(
    stickerId: string,
    options?: RequestTypes.DeleteGuildSticker
  ) {
    return this._isUnused();
  }
  async deleteTemplate(templateId: string) {
    return this._isUnused();
  }
  get description() {
    return this.raw.description;
  }

  get discoverySplash() {
    return this.raw.splash;
  }
  get discoverySplashUrl() {
    return this.discoverySplashUrlFormat();
  }
  discoverySplashUrlFormat(format?: string, query?: UrlQuery) {
    return this.hashCdnUrl(
      DiscordEndpoints.CDN.GUILD_SPLASH.name,
      this.id,
      this.discoverySplash,
      format,
      query
    );
  }
  async edit(options: RequestTypes.EditGuild) {
    return this.raw.edit(options as unknown as discord.Guild.IGuildOptions);
  }
  async editChannel(channelId: string, options: RequestTypes.EditChannel) {
    const payload = await this.raw.getChannel(channelId);
    return await payload.edit(options as unknown);
  }
  async editChannelPositions(
    channels: RequestTypes.EditGuildChannels,
    options?: RequestTypes.EditGuildChannelsExtra
  ) {
    return this._isUnused();
  }
  async editEmbed(options: RequestTypes.EditGuildEmbed) {
    return this._isUnused();
  }
  async editEmoji(emojiId: string, options: RequestTypes.EditGuildEmoji) {
    const payload = await this.raw.getEmoji(emojiId);
    return await payload.edit(options);
  }
  async editIntegration(
    integrationId: string,
    options?: RequestTypes.EditGuildIntegration
  ) {
    return this._isUnused();
  }
  async editMember(userId: string, options?: RequestTypes.EditGuildMember) {
    const payload = await this.raw.getMember(userId);
    return await payload.edit(options);
  }
  async editMfaLevel(options: RequestTypes.EditGuildMfaLevel) {
    return this._isUnused();
  }
  async editNick(nick: string, options?: RequestTypes.EditGuildNick) {
    return (await this.client.member()).edit({ nick: nick });
  }
  async editRole(roleId: string, options?: RequestTypes.EditGuildRole) {
    const payload = await this.raw.getRole(roleId);
    return await payload.edit(options);
  }
  async editRolePositions(
    roles: RequestTypes.EditGuildRolePositions,
    options?: RequestTypes.EditGuildRolePositionsExtra
  ) {
    return this.raw.editRolePositions(roles);
  }
  async editSticker(
    stickerId: string,
    options?: RequestTypes.EditGuildSticker
  ) {
    return this._isUnused();
  }
  async editVanityUrl(code: string, options?: RequestTypes.EditGuildVanity) {
    return this.edit({ code, ...options });
  }
  async editVoiceState(
    userId: string,
    options: RequestTypes.EditGuildVoiceState
  ) {
    const payload = await this.raw.getVoiceState(userId);
    return await payload.edit(options as unknown);
  }
  get embedChannelId() {
    return "";
  }
  get embedEnabled() {
    return false;
  }
  get explicitContentFilter() {
    return this.raw.explicitContentFilter;
  }

  async fetchApplications() {
    return this._isUnused();
  }
  async fetchAuditLogs(options: RequestTypes.FetchGuildAuditLogs) {
    let logs = new List<AuditLogEntry>();
    for await (const i of this.raw.iterAuditLogs(options)) {
      logs.add(new AuditLogEntry(i));
    }
    return logs;
  }
  async fetchBan(userId: string) {
    return this.raw.getBan(userId);
  }
  async fetchBans() {
    return List.from(await this.raw.getBans());
  }
  async fetchChannels() {
    return List.from((await this.raw.getChannels()) as discord.Channel[]);
  }
  async fetchChannel(channelId: string) {
    return this.raw.getChannel(channelId);
  }
  async fetchAfkChannel() {
    return this.fetchChannel(this.afkChannelId);
  }
  async fetchAllTextChannels() {
    return (await this.fetchChannels()).filter(
      (v) =>
        v instanceof discord.DmChannel ||
        v instanceof discord.GuildNewsChannel ||
        v instanceof discord.GuildTextChannel
    ) as List<
      discord.DmChannel | discord.GuildNewsChannel | discord.GuildTextChannel
    >;
  }
  async fetchAllVoiceChannels() {
    return (await this.fetchChannels()).filter(
      (v) =>
        v instanceof discord.GuildVoiceChannel ||
        v instanceof discord.GuildStageVoiceChannel
    ) as List<discord.GuildVoiceChannel | discord.GuildStageVoiceChannel>;
  }
  async fetchCategoryChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v instanceof discord.GuildCategory
    ) as List<discord.GuildCategory>;
  }
  async fetchTextChannels() {
    return (await this.fetchAllTextChannels()).filter(
      (v) => v instanceof discord.GuildTextChannel
    ) as List<discord.GuildTextChannel>;
  }
  async fetchStoreChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v instanceof discord.GuildStoreChannel
    ) as List<discord.GuildStoreChannel>;
  }
  async fetchVoiceChannels() {
    return (await this.fetchAllVoiceChannels()).filter(
      (v) => v instanceof discord.GuildVoiceChannel
    ) as List<discord.GuildVoiceChannel>;
  }
  async fetchStageVoiceChannels() {
    return (await this.fetchAllVoiceChannels()).filter(
      (v) => v instanceof discord.GuildStageVoiceChannel
    ) as List<discord.GuildStageVoiceChannel>;
  }
  async fetchEmbed() {
    return this._isUnused();
  }
  async fetchEmoji(emojiId: string) {
    return this.raw.getEmoji(emojiId);
  }
  async fetchEmojis() {
    return List.from(await this.raw.getEmojis());
  }
  async fetchInvites() {
    return List.from(await this.raw.getInvites());
  }
  async fetchIntegrations() {
    return this._isUnused();
  }
  async fetchMember(userId: string) {
    return this.raw.getMember(userId);
  }
  async fetchMembers(options?: discord.Guild.IIterMembersOptions) {
    let members = new List<discord.GuildMember>();
    for await (const i of this.raw.iterMembers(options)) {
      members.add(i);
    }
    return members;
  }
  async fetchMembersSearch(options?: RequestTypes.FetchGuildMembersSearch) {
    return (await this.fetchMembers()).filter(
      (value, index) => index < (options.limit ?? Infinity)
    );
  }
  async fetchPremiumSubscriptions() {
    return (await this.fetchMembers()).filter((value) => value.premiumSince);
  }
  async fetchPruneCount(options?: RequestTypes.FetchGuildPruneCount) {
    return this.raw.previewPrune(options);
  }
  async fetchRoles() {
    return List.from(await this.raw.getRoles());
  }
  async fetchSticker(stickerId: string) {
    return (await this.fetchStickers()).fetch(stickerId);
  }
  async fetchStickers() {
    return new List();
  }
  async fetchTemplates() {
    return new List();
  }
  async fetchVanityUrl() {
    return this.raw.vanityUrlCode;
  }
  async fetchVoiceRegions() {
    return new List();
  }
  async fetchWebhook(webhookId: string) {
    return (await this.fetchWebhooks()).fetch(webhookId);
  }
  async fetchWebhooks() {
    return new List();
  }
  async fetchWidget() {
    return this._isUnused();
  }
  get hasMetadata() {
    return false;
  }
  get systemChannelFlags() {
    return 0;
  }
  hasSystemChannelFlag(flag: number) {
    return (this.systemChannelFlags & flag) === flag;
  }
  get hasSystemChannelSuppressJoinNotifications() {
    return this.hasSystemChannelFlag(
      SystemChannelFlags.SUPPRESS_JOIN_NOTIFICATIONS
    );
  }
  get hasSystemChannelSuppressPremiumNotifications() {
    return this.hasSystemChannelFlag(
      SystemChannelFlags.SUPPRESS_PREMIUM_SUBSCRIPTIONS
    );
  }
  get icon() {
    return this.raw.icon;
  }
  get iconUrl() {
    return this.iconUrlFormat();
  }
  iconUrlFormat(format?: string, query?: UrlQuery) {
    return this.hashCdnUrl(
      DiscordEndpoints.CDN.GUILD_ICON.name,
      this.id,
      this.icon,
      format,
      query
    );
  }
  get isPartial() {
    return false;
  }
  get isReady() {
    return true;
  }
  async join(options: RequestTypes.JoinGuild) {
    return this._isUnused();
  }
  async fetchSelfJoinedAt() {
    return +(await this.fetchSelfJoinedAtUnix());
  }
  async fetchSelfJoinedAtUnix() {
    return +new Date((await this.client.member()).joinedAt);
  }
  get jumpLink() {
    return DiscordEndpoints.Routes.URL + DiscordEndpoints.Routes.GUILD(this.id);
  }
  get large() {
    return this.raw.memberCount > DEFAULT_MAX_MEMBERS;
  }
  get lazy() {
    return false;
  }
  async leave() {
    if (this.can(Permissions.KICK_MEMBERS)) {
      return (await this.client.member()).kick();
    }
    return this._isUnused();
  }
  get left() {
    return false;
  }
  get maxAttachmentSize() {
    const max = MAX_ATTACHMENT_SIZE;
    return Math.max(max, PremiumGuildLimits[this.raw.premiumTier].attachment);
  }
  get maxBitrate() {
    const max = MAX_BITRATE;
    return Math.max(max, PremiumGuildLimits[this.raw.premiumTier].bitrate);
  }
  get maxEmojis() {
    const max = this.hasFeature(GuildFeatures.MORE_EMOJI)
      ? MAX_EMOJI_SLOTS_MORE
      : MAX_EMOJI_SLOTS;
    return Math.max(max, PremiumGuildLimits[this.raw.premiumTier].emoji);
  }
  get maxMembers() {
    // if (this.raw.maxMembers) return this.raw.maxMembers
    return DEFAULT_MAX_MEMBERS;
  }
  get maxPresences() {
    if (this.raw.maxPresences) return this.raw.maxPresences;
    return DEFAULT_MAX_PRESENCES;
  }
  get maxVideoChannelUsers() {
    // if (this.raw.maxMembers) return this.raw.maxMembers
    return DEFAULT_MAX_VIDEO_CHANNEL_USERS;
  }
  async fetchMe() {
    return this.client.member();
  }
  get memberCount() {
    return this.raw.memberCount;
  }
  get mfaLevel() {
    return this.raw.mfaLevel;
  }
  get name() {
    return this.raw.name;
  }
  async isNsfw() {
    return (await this.fetchTextChannels()).every((v) => v.nsfw);
  }
  async getNsfwLevel(): Promise<GuildNSFWLevels> {
    let nsfw = await this.isNsfw();
    if (nsfw) {
      return GuildNSFWLevels.EXPLICIT;
    }
    return GuildNSFWLevels.SAFE;
  }
  get ownerId() {
    return this.raw.ownerId;
  }
  async fetchOwner() {
    return this.fetchMember(this.ownerId);
  }
  get preferredLocale() {
    return this.raw.preferredLocale;
  }
  get preferredLocaleText() {
    return LocalesText[this.preferredLocale] ?? this.preferredLocale;
  }
  get premiumSubscriptionCount() {
    return this.raw.premiumSubscriptionCount;
  }
  get premiumTier() {
    return this.raw.premiumTier;
  }
  async fetchPresences(options?: discord.Guild.IIterMembersOptions) {
    let presences = new List<discord.Presence>();
    for await (let i of this.raw.iterMembers(options)) {
      presences.add(await i.getPresence());
    }
  }
  async fetchPublicUpdatesChannel() {
    return this.fetchChannel(this.publicUpdatesChannelId);
  }
  get publicUpdatesChannelId() {
    return "";
  }
  get region(): string {
    return this.raw.region;
  }
  async removeBan(userId: string) {
    let payload = await this.fetchBan(userId);
    this.raw.deleteBan(userId);
    return payload;
  }
  async removeMember(userId: string, options?: RequestTypes.RemoveGuildMember) {
    let payload = await this.fetchMember(userId);
    payload.kick();
    return payload;
  }
  async removeMemberRole(
    userId: string,
    roleId: string,
    options?: RequestTypes.RemoveGuildMemberRole
  ) {
    let payload = await this.fetchMember(userId);
    payload.removeRole(roleId);
    return payload;
  }
  get rulesChannelId() {
    return "";
  }
  async fetchRulesChannel() {
    return this.fetchChannel(this.rulesChannelId);
  }
  get shardId() {
    return guildIdToShardId(this.id);
  }
  get splash() {
    return this.splash;
  }
  get splashUrl() {
    return this.splashUrlFormat;
  }
  splashUrlFormat(format?: string, query?: UrlQuery) {
    return this.hashCdnUrl(
      DiscordEndpoints.CDN.GUILD_SPLASH.name,
      this.id,
      this.splash,
      format,
      query
    );
  }
  get systemChannelId() {
    return this.raw.systemChannelId;
  }
  async fetchSystemChannel() {
    return await this.fetchChannel(this.systemChannelId);
  }
  get vanityUrlCode() {
    return this.raw.vanityUrlCode;
  }
  get verificationLevel(): number {
    return this.raw.verificationLevel;
  }
  async fetchVoiceStates() {
    let voiceStates = new List<discord.VoiceState>();
    for await (let i of this.raw.iterVoiceStates()) {
      voiceStates.add(i);
    }
    return voiceStates;
  }
  get welcomeScreen() {
    return {
      description: this.description,
      welcomeChannels: new List<
        discord.GuildTextChannel | discord.GuildNewsChannel
      >(),
    };
  }
  get widgetChannelId() {
    return this.raw.widgetChannelId;
  }
  get widgetEnabled() {
    return this.raw.widgetEnabled;
  }
  get widgetImageUrl() {
    return this.widgetImageUrlFormat();
  }
  widgetImageUrlFormat(query: UrlQuery = {}) {
    return addQuery(
      DiscordEndpoints.Api.URL_STABLE +
        DiscordEndpoints.Api.PATH +
        replacePathParameters(DiscordEndpoints.Api.GUILD_WIDGET_PNG, {
          guildId: this.id,
        }),
      query
    );
  }
  get widgetUrl() {
    return this.widgetUrlFormat();
  }
  widgetUrlFormat(options: RequestTypes.RouteWidget = {}) {
    return (
      DiscordEndpoints.Api.URL_STABLE +
      DiscordEndpoints.RoutesQuery.WIDGET(this.id, options)
    );
  }
}
