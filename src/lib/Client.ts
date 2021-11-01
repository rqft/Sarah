import { DiscordEndpoints } from "../dep/endpoints";
import { RequestTypes } from "../dep/RequestTypes";
import { addQuery, getFormatFromHash, UrlQuery } from "../dep/utils";
import { ChannelBase } from "./Channel";
import { Guild } from "./Guild";

export class Structure {
  client: Client;
  _isUnused(
    context?: discord.Message,
    options?: discord.Message.IOutgoingMessageOptions
  ) {
    if (context) {
      return context.reply(
        Object.assign({ content: "❌ This method is unused" }, options)
      );
    }
    throw new Error("This method is unused");
  }
  hashCdnUrl(
    endpoint: string,
    id: string,
    hash?: string,
    format?: string,
    query?: UrlQuery
  ) {
    if (!hash) return null;

    format = getFormatFromHash(hash, format);
    return addQuery(
      DiscordEndpoints.CDN.URL +
        DiscordEndpoints.CDN[endpoint](id, hash, format),
      query
    );
  }
  _keys: Set<string>;
  merge(data?: object): void {
    if (!data) {
      return;
    }
    for (let i in data) {
      if (i in this._keys) this[`_${i}`] = data[i];
    }
  }
}

export class Client {
  _ = discord;
  get userId() {
    return this._.getBotId();
  }
  get guildId() {
    return this._.getGuildId();
  }
  async fetchGuild() {
    return new Guild(await this._.getGuild(this.guildId));
  }
  async fetchUserSelf() {
    return this._.getBotUser();
  }
  async fetchUser(userId: string) {
    return this._.getUser(userId);
  }
  async fetchChannel(channelId: string) {
    return new ChannelBase(await this._.getChannel(channelId));
  }
  async fetchInvite(code: string, options: RequestTypes.FetchInvite = {}) {
    return this._.getInvite(code, options);
  }
}
