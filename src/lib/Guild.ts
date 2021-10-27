import { Structures } from "detritus-client";
import { DiscordEndpoints } from "../dep/endpoints";
import { GuildFeatures, Permissions } from "../dep/globals";
import { List } from "../dep/List";
import { checkPermissions, PermissionChecks } from "../dep/Permissions";
import { RequestTypes } from "../dep/RequestTypes";
import { timestamp } from "../dep/Snowflake";
import { addQuery, getFormatFromHash, UrlQuery } from "../dep/utils";
import { ClientMixin } from "./Client";
export interface BeginGuildPrune {
  computePruneCount?: boolean;
  days?: number;
  includeRoles?: Array<string>;
  reason?: string;
}
export class Guild extends ClientMixin {
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
  get name() {
    return this.raw.name;
  }
  async fetchAfkChannel() {
    return this.raw.getChannel(this.afkChannelId);
  }
  get afkChannelId() {
    return this.raw.afkChannelId;
  }
  get afkTimeout() {
    return this.raw.afkTimeout;
  }
  async fetchChannels() {
    return List.from((await this.raw.getChannels()) as discord.Channel[]);
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
      (v) => v instanceof discord.GuildVoiceChannel
    );
  }
  async fetchCategoryChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v instanceof discord.GuildCategory
    );
  }
  async fetchTextChannels() {
    return (await this.fetchAllTextChannels()).filter(
      (v) => v instanceof discord.GuildTextChannel
    );
  }
  async fetchStoreChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v instanceof discord.GuildStoreChannel
    );
  }
  async fetchVoiceChannels() {
    return this.fetchAllVoiceChannels;
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
    if (!this.banner) return null;
    const hash = this.banner;
    format = getFormatFromHash(hash, format);
    return addQuery(
      DiscordEndpoints.CDN.URL +
        DiscordEndpoints.CDN.BANNER(this.id, hash, format),
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
        if (!this.client.user) {
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
  get ownerId() {
    return this.raw.ownerId;
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
  async fetchApplications() {
    return this._isUnused();
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
    if (!this.discoverySplash) return null;
    const hash = this.discoverySplash;
    format = getFormatFromHash(hash, format);
    return addQuery(
      DiscordEndpoints.CDN.URL +
        DiscordEndpoints.CDN.BANNER(this.id, hash, format),
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
  async fetchEmojis() {
    return this.raw.getEmojis();
  }
  get explicitContentFilter() {
    return this.raw.explicitContentFilter;
  }

  async;
}
discord.Guild.prototype.beginPrune;
Guild.prototype.bannerUrlFormat;
Structures.Guild.prototype.fetchApplications;
