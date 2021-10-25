import { Structures } from "detritus-client";
import { DiscordEndpoints } from "../dep/endpoints";
import { List } from "../dep/List";
import { addQuery, getFormatFromHash, UrlQuery } from "../dep/utils";
import { ClientMixin } from "./Client";
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
    return List.from(await this.raw.getChannels());
  }
  async fetchAllTextChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v.type === discord.Channel.Type.GUILD_TEXT
    );
  }
  async fetchAllVoiceChannels() {
    return (await this.fetchChannels()).filter(
      (v) => v.type === discord.Channel.Type.GUILD_VOICE
    );
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
  get id() {
    return this.raw.id;
  }
}
discord.Guild.prototype.applicationId;
Structures.Guild.prototype.bannerUrl;
