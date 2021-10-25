export class ClientMixin {
  client: Client;
  guild() {
    return this.client.guild();
  }
  _isUnused() {
    throw new Error("This function is unimplemented.");
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
