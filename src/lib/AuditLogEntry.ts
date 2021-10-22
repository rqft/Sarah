import { Snowflake } from "detritus-client/lib/utils";
import { Client } from "./Client";
export class AuditLogEntry extends Client {
  public raw: discord.AuditLogEntry.AnyAction | discord.AuditLogEntry;
  public parent: discord.AuditLogEntry;

  constructor(raw: discord.AuditLogEntry.AnyAction | discord.AuditLogEntry) {
    super();
    this.raw = raw;
    this.parent = raw as discord.AuditLogEntry;
  }
  get actionType() {
    return this.raw.actionType;
  }
  get changes() {
    if (!("changes" in this.raw)) {
      throw new Error("Cannot get changes of entry without a type");
    }
    return this.raw.changes;
  }
  get reason() {
    return this.raw.reason;
  }
  get targetId() {
    return this.raw.targetId;
  }
  get user() {
    return this.raw.user;
  }
  get userId() {
    return this.user.id;
  }
  async getExecutor() {
    return (await this.clientGuild()).getMember(this.userId);
  }
  get id() {
    return this.raw.id;
  }
  get createdAt() {
    return new Date(this.createdAtUnix);
  }
  get createdAtUnix() {
    return Snowflake.timestamp(this.raw.id);
  }
}
