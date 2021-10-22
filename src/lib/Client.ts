export class Client {
  get clientUserId() {
    return discord.getBotId();
  }
  get clientGuildId() {
    return discord.getGuildId();
  }
  get client() {
    return discord;
  }
  async clientGuild() {
    return this.client.getGuild();
  }
  async clientUser() {
    return this.client.getUser(this.clientGuildId);
  }
  async clientMember() {
    return (await this.clientGuild()).getMember(this.clientUserId);
  }
}
