export class ClientMixin {
  client: Client;
  guild() {
    return this.client.guild();
  }
}
export class Structure extends ClientMixin {
  isUnused(context?: discord.Message, options?: discord.Message.IOutgoingMessageOptions) {
    if (context) {
      return context.reply(Object.assign({ content: "❌ This method is unused" }, options))
    }
    throw new Error("This method is unused")
  }
}
export class Client {
  get raw() {
    return discord;
  }
  get userId() {
    return this.raw.getBotId();
  }
  get guildId() {
    return this.raw.getGuildId();
  }
  async guild() {
    return this.raw.getGuild();
  }
  async user() {
    return this.raw.getUser(this.userId);
  }
  async member() {
    return (await this.guild()).getMember(this.userId);
  }
}
