import { Structures } from "detritus-client";
import { Client } from "./Client";
export class Guild extends Client {
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
  async addMemberRole(userId: string, roleId: string) {
    const member = await this.fetchMember(userId);
    member.addRole(roleId);
    return member;
  }
  async fetchMember(userId: string) {
    return this.raw.getMember(userId);
  }
}
Structures.Guild.prototype.fetchMember;
