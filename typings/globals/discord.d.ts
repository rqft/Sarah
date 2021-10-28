/**
 * # Discord SDK
 *
 * The `discord` module is exposed on the global scope within the Pylon runtime.
 *
 * **See [the Discord SDK](https://pylon.bot/docs/discord-general) section of our Documentation site for an in-depth walk-through of our Discord SDK!**
 *
 * ### Event-Based Runtime
 * Events are executed as they are received from the [Discord Gateway](https://discordapp.com/developers/docs/topics/gateway#commands-and-events).
 * You can register event handlers within the Pylon runtime to act upon new messages, guild members, reactions, and much more.
 * Event handlers are expected to be Promises, which may kick off or await additional async tasks.
 *
 * See [[discord.on]] for a list of events and their respective payloads.
 *
 * ### Fetching Data
 * Pylon keeps an in-memory cache of Discord-related objects (guilds, members, channels, messages, etc) to reduce the amount of external calls made to the Discord API when requesting data.
 * As events are received from the gateway, this cache is updated to reflect the latest state-of-the-world at all times.
 *
 * Most data objects in the Discord SDK have a handful of async functions to fetch data on related objects.
 * If an object is not found, `null` is typically returned.
 *
 * #### Example: A simple `!test` command that fetches and returns miscellaneous data.
 * ```ts
 * const commands = new discord.command.CommandGroup({
 *   defaultPrefix: '!'
 * });
 *
 * commands.raw('test', async (message) => {
 * // Get the author of the message
 * const user = message.author;
 *
 * // Fetch the guild this message was sent in
 * const guild = await message.getGuild();
 *
 *  // Get the channel the message was sent in, note the 'await' keyword
 *  const channel = await message.getChannel();
 *
 *  // Fetch role data from the guild for all the roles the user has assigned
 *  const roles = await Promise.all(
 *    message.member.roles.map((roleId) => guild.getRole(roleId))
 *  );
 *
 *  // Construct a list of role names, separated by new lines
 *  const roleNames = roles
 *    .map((role) => {
 *      if (!role) return;
 *      return ` - ${role.name}`;
 *    })
 *    .join('\n');
 *
 *  // Reply with some data we found
 *  await message.reply(
 *    `You are ${user.toMention()} sending a message in ${channel.toMention()}. You have the following roles:\n${roleNames}`
 *  );
 *});
 *
 * ```
 *
 * ### Making Discord API requests
 * Pylon abstracts API requests into simple functions on data objects, you cannot make Discord API requests directly.
 * If a request is rate-limited, it will delay promise resolution until it is able to execute.
 *
 * ```ts
 * const COOL_ROLE_ID = '421726263504229715';
 * discord.on('MESSAGE_CREATE', async (message) => {
 *   // We only care about messages sent in a guild by users
 *   if (!(message instanceof discord.GuildMemberMessage)) {
 *     return;
 *   }
 *
 *   // A very !cool command.
 *   if (message.content !== "!cool") {
 *     return;
 *   }
 *
 *   // Do some things with the member
 *   await message.member.addRole(COOL_ROLE_ID);
 *   await message.member.edit({ nick: "Mr. Cool" });
 *
 *   // Respond
 *   await message.reply("You are now Mr. Cool!");
 * })
 * ```
 */

 declare module discord {
    /**
     * Unique identifiers assigned to most Discord objects. You can read more about Snowflakes and how Discord uses them on the [Discord docs](https://discordapp.com/developers/docs/reference#snowflakes).
     *
     * You can copy IDs directly from the Discord app if you have [Developer Mode enabled](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).
     *
     * Example: Fetching channel data with a Channel ID (snowflake) manually.
     * ```ts
     * const someChannel = await discord.getChannel("640648987937865738");
     * ```
     */
    type Snowflake = string;
  
    /**
     * Represents an error returned by the Discord API when making certain requests.
     */
    class ApiError extends Error {
      /**
       * The HTTP status code returned by the Discord API. Please see Discord's docs on [HTTP status codes](https://discordapp.com/developers/docs/topics/opcodes-and-status-codes#http) for more information.
       */
      httpStatus: number;
      /**
       * The HTTP status text returned by the Discord API.
       */
      httpStatusText: string;
      /**
       * The error code returned by the API. Please see Discord's docs on [JSON error codes](https://discordapp.com/developers/docs/topics/opcodes-and-status-codes#json) for more information.
       */
      code: number;
      /**
       * The URL suffix used when making the request to the Discord API.
       */
      endpoint: string;
      /**
       * The HTTP Method (GET, POST, etc) used when making the request to the Discord API.
       */
      httpMethod: string;
    }
  
    /**
     * To be implemented where an object can be represented by Discord mention string.
     *
     * To see how Discord encodes user, member, channel, role, and emojis see [Message Formatting](https://discordapp.com/developers/docs/reference#message-formatting) section of the Discord API docs.
     */
    interface IMentionable {
      /**
       * Returns a mention string or encoded message for the object this function is implemented on.
       *
       * To see how Discord encodes user, member, channel, role, and emojis see [Message Formatting](https://discordapp.com/developers/docs/reference#message-formatting) section of the Discord API docs.
       */
      toMention(): string;
    }
  
    class User implements IMentionable {
      /**
       * The user's unique Discord id. This field never changes.
       */
      readonly id: Snowflake;
      /**
       * The user's username. This can be changed by the user at any time.
       *
       * Example: Given the user "Somebody#0001", "Somebody" is the username.
       */
      readonly username: string;
      /**
       * The user's 4-digit user suffix. It appears after the username on a user's profile page and is needed to send friend requests.
       *
       * Example: Given the user "Somebody#0001", "Somebody" is the username.
       */
      readonly discriminator: string;
      /**
       * A hash of the user's current avatar.
       *
       * Note: Use [[discord.User.getAvatarUrl]] to retrieve a URL for the avatar.
       */
      readonly avatar: string | null;
      /**
       * Will be `true` if the user is a bot user.
       */
      readonly bot: boolean;
  
      /**
       * Used to return a URL to user's avatar image.
       *
       * For animated avatars, it will be a GIF. Otherwise, it will return a PNG.
       *
       * If a user's avatar hash is null, it returns a URL to the generic logo-style avatar.
       *
       * @param type Specifying the type will force the image to be returned as the specified format.
       */
      getAvatarUrl(type?: discord.ImageType): string;
  
      /**
       * Returns a string containing the username and discriminator.
       *
       * For example, `Someone#0001`
       */
      getTag(): string;
  
      /**
       * Returns a mention string in the format of `<@id>` where id is the id of this user.
       */
      toMention(): string;
    }
  
    /**
     * Used to specify image types for [[discord.User.getAvatarUrl]], and various images available on a [[discord.Guild]].
     */
    const enum ImageType {
      PNG = "png",
      JPEG = "jpeg",
      WEBP = "webp",
      GIF = "gif",
    }
  
    namespace Guild {
      /**
       * Options for [[discord.Guild.edit]], requires [[discord.Permission.MANAGE_GUILD]] to modify options.
       */
      interface IGuildOptions {
        /**
         * Sets the name of the guild.
         */
        name?: string;
        /**
         * Sets the voice region this guild should use for voice channels.
         *
         * See [[discord.Guild.Region]] for a list of possible options.
         */
        region?: Guild.Region;
        /**
         * Sets the verification level for this guild. Applies to members without any roles.
         *
         * See [[discord.Guild.VerificationLevel]] for a list of possible options.
         */
        verificationLevel?: discord.Guild.VerificationLevel;
        /**
         * Sets what new members' default notification settings should be.
         *
         * See [[discord.Guild.NotificationsLevel]] for a list of possible options.
         */
        defaultMessageNotifications?: discord.Guild.NotificationsLevel;
        /**
         * Sets the level of content scanning Discord should perform on images sent by members.
         *
         * See [[discord.Guild.ExplicitContentFilterLevel]] for a list of possible options.
         */
        explicitContentFilter?: discord.Guild.ExplicitContentFilterLevel;
        /**
         * Sets the id of a [[discord.GuildVoiceChannel]] to send users to after being idle for longer than [[discord.Guild.afkTimeout]].
         *
         * If null, the AFK timeout is disabled.
         */
        afkChannelId?: Snowflake | null;
        /**
         * Sets the amount of time (in seconds) until users idle in voice channels are moved to the AFK channel, if set.
         *
         * Note: To enable/disable AFK channel timeouts, set [[afkChannelId]] to a valid [[discord.GuildVoiceChannel]]'s id.
         */
        afkTimeout?: number;
        /**
         * Sets a new guild icon. Accepts image data in the format of JPEG, PNG, or GIF.
         *
         * If a string is passed, please pass a base64 encoded data URI.
         *
         * If null, the icon is removed.
         */
        icon?: ArrayBuffer | string | null;
        /**
         * The id of a user to transfer this guild to. Typically, bots will not be the owner of a guild.
         */
        ownerId?: Snowflake;
        /**
         * Sets a new guild invite page background/splash image. Requires the [[discord.Guild.Feature.INVITE_SPLASH]] feature on the guild.
         *
         * Accepts image data in the format of JPEG only.
         *
         * If a string is passed, please pass a base64 encoded data URI.
         *
         * If null, the invite background splash image is removed.
         */
        splash?: ArrayBuffer | string | null;
        /**
         * Sets a new guild invite page background. Requires the [[discord.Guild.Feature.BANNER]] feature on the guild.
         *
         * Accepts image data in the format of JPEG only.
         *
         * If a string is passed, please pass a base64 encoded data URI.
         *
         * If null, the banner is removed.
         */
        banner?: ArrayBuffer | string | null;
        /**
         * Sets the id of the [[discord.GuildTextChannel]] to send welcome messages and server boost messages to.
         *
         * If null, the feature is disabled.
         */
        systemChannelId?: Snowflake | null;
      }
  
      /**
       * A set of options to use when requesting members with [[discord.Guild.iterMembers]].
       */
      interface IIterMembersOptions {
        /**
         * The maximum amount of members to return.
         *
         * Setting this to a 0/undefined value will return all the members.
         */
        limit?: number;
        /**
         * The user id (or time, encoded as a snowflake) to start the scan from. Results from [[discord.Guild.iterMembers]] are returned by id in ascending order.
         */
        after?: Snowflake;
      }
  
      /**
       * A set of options to use when requesting audit log entries with [[discord.Guild.iterAuditLogs]].
       */
      interface IIterAuditLogsOptions {
        /**
         * The maximum amount of entries to return with this call.
         *
         * Note: If the requested limit is greater than 500, the function will throw an exception.
         */
        limit?: number;
        /**
         * The audit log entry id (or time, encoded as a snowflake) to start the scan from.
         *
         * Results from [[discord.Guild.iterAuditLogs]] are returned by id in descending order (by time).
         */
        before?: Snowflake;
        /**
         * The type of [[discord.AuditLogEntry.ActionType]] to filter the results by.
         *
         * If not specified, the request will return all action types.
         */
        actionType?: AuditLogEntry.ActionType;
        /**
         * The user id of a [[discord.User]] to filter by.
         *
         * Results will only be returned if they were performed by the user with the id set.
         */
        user?: Snowflake | discord.User | discord.GuildMember;
      }
  
      type IterAuditLogsOptionsWithActionType<
        T extends discord.AuditLogEntry.ActionType | undefined
      > = Guild.IIterAuditLogsOptions & {
        actionType: T;
      };
  
      /**
       * Options you can pass to [[discord.Guild.createChannel]].
       */
      type CreateChannelOptions =
        | (GuildCategory.IGuildCategoryOptions & {
            type: Channel.Type.GUILD_CATEGORY;
          })
        | (GuildTextChannel.IGuildTextChannelOptions & {
            type: Channel.Type.GUILD_TEXT;
          })
        | (GuildVoiceChannel.IGuildVoiceChannelOptions & {
            type: Channel.Type.GUILD_VOICE;
          })
        | (GuildNewsChannel.IGuildNewsChannelOptions & {
            type: Channel.Type.GUILD_NEWS;
          })
        | (GuildStoreChannel.IGuildStoreChannelOptions & {
            type: Channel.Type.GUILD_STORE;
          });
  
      /**
       * Options you can pass to [[discord.GuildMember.ban]].
       */
      interface IGuildBanOptions {
        /**
         * How many days of messages sent by this user to delete.
         *
         * Defaults to 0 (no messages deleted), but can go up to 7.
         */
        deleteMessageDays?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
        /**
         * A ban reason, displayed in the Audit Log.
         */
        reason?: string;
      }
  
      /**
       * An object used in an array in [[discord.Guild.editRolePositions]]
       */
      interface IRolePositionOptions {
        /**
         * The snowflake id of a [[discord.Role]] in the guild to modify.
         */
        id: discord.Snowflake;
        /**
         * The new position for the role in the guild.
         */
        position?: number;
      }
  
      /**
       * Feature flags conditionally set on a [[discord.Guild]]
       *
       * Flags are set when guilds have special features enabled, they cannot be changed.
       */
      const enum Feature {
        /**
         * A feature that enables the guild to set a invite background/splash image ([[discord.Guild.splash]]).
         */
        INVITE_SPLASH = "INVITE_SPLASH",
        /**
         * A feature that (used to) grant access to an extended set of [[discord.Guild.Region]] regions.
         *
         * Note: This flag is defunct, as VIP regions have been removed.
         */
        VIP_REGIONS = "VIP_REGIONS",
        /**
         * A feature that allows the guild to set a custom vanity invite code ([[discord.Guild.vanityUrlCode]]).
         */
        VANITY_URL = "VANITY_URL",
        /**
         * A feature flag set if the Discord server is [verified](https://discordapp.com/verification).
         */
        VERIFIED = "VERIFIED",
        /**
         * A feature flag set if the guild is owned by a [partner](https://discordapp.com/partners).
         */
        PARTNERED = "PARTNERED",
        /**
         * A feature flag set when the guild admins have set to a Community server.
         *
         * When this flag is enabled, the welcome screen, membership screening, discovery, and the ability to receive community updates are unlocked.
         */
        COMMUNITY = "COMMUNITY",
        /**
         * A feature flag set if the guild is considered a public guild. Public guilds can set the following properties on a guild:
         * - [[discord.Guild.preferredLocale]]
         * - [[discord.Guild.description]]
         */
        PUBLIC = "PUBLIC",
        /**
         * A feature flag that enables store channels on the guild.
         */
        COMMERCE = "COMMERCE",
        /**
         * A feature flag that enables announcements channels on the guild.
         */
        NEWS = "NEWS",
        /**
         * A feature flag that elects a guild to be shown on the "Server Discovery" page of Discord.
         */
        DISCOVERABLE = "DISCOVERABLE",
        /**
         * A feature flag that (presumably) allows the guild to be featured around the Discord client.
         */
        FEATURABLE = "FEATURABLE",
        /**
         * A feature flag that allows the [[discord.Guild.icon]] to be an animated gif.
         */
        ANIMATED_ICON = "ANIMATED_ICON",
        /**
         * A feature flag that enables a banner ([[discord.Guild.banner]]) to be displayed over the channel list in your guild.
         */
        BANNER = "BANNER",
        /**
         * A feature flag set when the guild admins have enabled the guild welcome screen.
         */
        WELCOME_SCREEN_ENABLED = "WELCOME_SCREEN_ENABLED",
        /**
         * A feature flag set when the guild admins have enabled membership screening.
         */
        MEMBER_VERIFICATION_GATE_ENABLED = "MEMBER_VERIFICATION_GATE_ENABLED",
        /**
         * A feature flag set when the guild may be previewed before joining via membership screening or the server directory.
         */
        PREVIEW_ENABLED = "PREVIEW_ENABLED",
      }
  
      /**
       * An enumeration of voice server regions. See [[discord.Guild.region]].
       */
      const enum Region {
        BRAZIL = "brazil",
        EU_CENTRAL = "eu-central",
        EU_WEST = "eu-west",
        EUROPE = "europe",
        HONGKONG = "hongkong",
        INDIA = "india",
        JAPAN = "japan",
        RUSSIA = "russia",
        SINGAPORE = "singapore",
        SOUTHAFRICA = "southafrica",
        SYDNEY = "sydney",
        SOUTH_KOREA = "south-korea",
        US_CENTRAL = "us-central",
        US_EAST = "us-east",
        US_SOUTH = "us-south",
        US_WEST = "us-west",
      }
  
      /**
       * The level of notifications new guild members will receive by default.
       */
      const enum NotificationsLevel {
        /**
         * The user will receive a desktop/mobile notification when any message is sent in channels this user has access to.
         */
        ALL_MESSAGES = 0,
        /**
         * The user will only receive desktop/mobile notifications when they are mentioned.
         */
        ONLY_MENTIONS = 1,
      }
  
      /**
       * A setting that determines the level of explicit content scanning that occurs on this guild.
       *
       * Content filtering only applies to images sent in a guild.
       */
      const enum ExplicitContentFilterLevel {
        /**
         * No explicit content scanning will take place in this guild.
         */
        DISABLED = 0,
        /**
         * Media sent by members without roles will be scanned for explicit content.
         */
        MEMBERS_WITHOUT_ROLES = 1,
        /**
         * Media sent by all members of this guild will be scanned for explicit content.
         */
        ALL_MEMBERS = 2,
      }
  
      /**
       * An enumeration of possible multi-factor-authentication levels required to use elevated [[discord.Permissions]].
       */
      const enum MFALevel {
        /**
         * 2FA/MFA is NOT required to perform administrative/moderator actions.
         */
        NONE = 0,
        /**
         * 2FA/MFA is required to perform administrative/moderator actions.
         */
        ELEVATED = 1,
      }
  
      /**
       * An enumeration of possible verification  levels a guild can set.
       */
      const enum VerificationLevel {
        /**
         * Unrestricted
         */
        NONE = 0,
        /**
         * Guild members must have a verified email on their Discord account.
         */
        LOW = 1,
        /**
         * Guild members must have a verified email, AND be registered on Discord for longer than 5 minutes.
         */
        MEDIUM = 2,
        /**
         * Guild members must have a verified email, AND be registered on Discord for longer than 10 minutes.
         */
        HIGH = 3,
        /**
         * Guild members must have a verified email, AND be registered on Discord for longer than 10 minutes, AND have a verified phone number associated with their account.
         */
        VERY_HIGH = 4,
      }
  
      /**
       * An enumeration of server boost tiers guilds can achieve via server boosting.
       */
      const enum PremiumTier {
        /**
         * The guild hasn't reached Level 1 yet.
         */
        NONE = 0,
        /**
         * The guild is boosted to Level 1.
         */
        TIER_1 = 1,
        /**
         * The guild is boosted to Level 2.
         */
        TIER_2 = 2,
        /**
         * The guild is boosted to Level 3.
         */
        TIER_3 = 3,
      }
  
      /**
       * A bot's guild-based voice state can be updated with the following options. Used with [[discord.Guild.setOwnVoiceState]].
       */
      interface ISetVoiceStateOptions {
        /**
         * This field determines the channel id for the current user's voice connection.
         *
         * If set to a valid channel id within the guild, the bot will connect to it.
         * If a new voice session was created, a VOICE_SERVER_UPDATE event will be received with the voice server's connection details.
         *
         * If set to null, the bot user will disconnect it's voice session.
         */
        channelId: Snowflake | null;
        /**
         * Set to `true` if the bot user should be self-muted upon joining the channel.
         *
         * Muted means the bot user will not be able to broadcast audio.
         *
         * Default: `false`
         */
        selfMute?: boolean;
        /**
         * Set to `true` if the bot user should be self-deafened upon joining the channel.
         *
         * Deafened means the bot user will not receive any audio.
         *
         * Default: `false`
         */
        selfDeaf?: boolean;
      }
  
      /**
       * Options for iterating over voice states in a guild with [[discord.Guild.iterVoiceStates]].
       */
      interface IIterVoiceStatesOptions {
        /**
         * If supplied, voice states will only be returned if they match the channel id.
         */
        channelId?: Snowflake;
      }
  
      /**
       * Options to specify during the creation of a guild emoji with [[discord.Guild.createEmoji]].
       */
      interface ICreateEmojiOptions {
        /**
         * The name of the emoji, can only contain alpha-numeric characters including dashes and underscores.
         */
        name: string;
        /**
         * The image data for this emoji, can be an ArrayBuffer containing JPEG, PNG, or GIF image data, or a "Data URI scheme" string (see https://discord.com/developers/docs/reference#image-data).
         *
         * The 'animated' flag will be interpreted by Discord based on the uploaded image data.
         *
         * Note: Emojis must be no more than 256kb.
         */
        image: ArrayBuffer | string;
        /**
         * An optional list of role ids that this emoji will be exclusive to.
         */
        roles?: Array<discord.Snowflake>;
      }
  
      /**
       * Options to pass when requesting a guild prune preview with [[discord.Guild.previewPrune]].
       */
      interface IPreviewPruneOptions {
        /**
         * The maximum number of days a member must be inactive for them to be considered for pruning.
         *
         * Acceptable values are 1 thru 30, and the default is 7 days.
         *
         * For example, if you choose 30, members who were active within the past 30 days will not be considered for pruning.
         */
        days?: number;
        /**
         * A list of roles to be included in the pruning process. By default, members with roles are ignored.
         * Specifying a role here will include members with only the roles specified for pruning.
         */
        includeRoles?: Array<discord.Snowflake>;
      }
  
      /**
       * Options to pass when executing a guild prune operation with [[discord.Guild.beginPrune]].
       */
      interface IPruneOptions {
        /**
         * The maximum number of days a member must be inactive for them to be considered for pruning.
         *
         * Acceptable values are 1 thru 30, and the default is 7 days.
         *
         * For example, if you choose 30, members who were active within the past 30 days will not be considered for pruning.
         */
        days?: number;
        /**
         * If set to false, the guild prune action will be scheduled and the call will return immediately.
         *
         * If true (default), the call will wait for the completion of the prune operation and return the total number of users pruned.
         */
        computePruneCount?: boolean;
        /**
         * A list of roles to be included in the pruning process. By default, members with roles are ignored.
         * Specifying a role here will include members with only the roles specified for pruning.
         */
        includeRoles?: Array<discord.Snowflake>;
      }
    }
  
    /**
     * A Guild (aka Discord Server) contains basic guild identifiers, basic guild settings, and accessors to objects related to this guild.
     *
     * A guild can be found by id with [[discord.getGuild]], but you can usually access it from most objects related to a guild.
     *
     * For example, [[discord.Message.getGuild]], [[discord.GuildChannel.getGuild]], and [[discord.GuildMember.getGuild]] are ways you can access a guild from related objects.
     */
    class Guild {
      /**
       * The guild's unique Discord id. This field never changes.
       */
      readonly id: Snowflake;
      /**
       * The name of the guild.
       */
      readonly name: string;
      /**
       * The voice region this server is set to use.
       */
      readonly region: discord.Guild.Region;
      /**
       * The level of verification this guild requires to send messages.
       */
      readonly verificationLevel: discord.Guild.VerificationLevel;
      /**
       * The default level of notifications new guild members will receive.
       *
       * Guild members can override this setting individually.
       */
      readonly defaultMessageNotifications: discord.Guild.NotificationsLevel;
      /**
       * The level of explicit image filtering that will occur on this guild.
       */
      readonly explicitContentFilter: discord.Guild.ExplicitContentFilterLevel;
      /**
       * The [[discord.GuildVoiceChannel]]'s that determines what channel to send idle guild members to after the specified [[discord.Guild.afkTimeout]].
       */
      readonly afkChannelId: Snowflake | null;
      /**
       * After a guild member in a voice channel is idle for this amount of time (in seconds), they will be moved to the [[discord.GuildVoiceChannel]] determined in [[discord.Guild.afkChannelId]] (if set).
       */
      readonly afkTimeout: number;
      /**
       * If not null, holds a hash of the guild icon image.
       *
       * Use [[discord.Guild.getIconUrl]] to build a full URL for the guild icon.
       */
      readonly icon: string | null;
      /**
       * The user id that owns this guild.
       */
      readonly ownerId: Snowflake;
      /**
       * If not null, holds a hash of the guild splash image hash.
       *
       * The splash image appears as the background of guild invite pages for this guild.
       *
       * Use [[discord.Guild.getSplashUrl]] to build a full URL for the guild splash image.
       *
       * Note: Requires the [[discord.Guild.Feature.INVITE_SPLASH]] flag in [[discord.Guild.features]] to be set.
       */
      readonly splash: string | null;
      /**
       * If not null, holds a hash of the guild banner image.
       *
       * The banner typically image appears above the guild channel list.
       *
       * Use [[discord.Guild.getBannerUrl]] to build a full URL for the guild banner image.
       *
       * Note: Requires the [[discord.Guild.Feature.BANNER]] flag in [[discord.Guild.features]] to be set.
       */
      readonly banner: string | null;
      /**
       * If not null, determines the channel in which receives guild member join and server boot announcements.
       */
      readonly systemChannelId: Snowflake | null;
      /**
       * The permissions the bot has on the guild.
       */
      readonly permissions?: number;
      /**
       * A list of [[discord.Guild.Feature]]s available to this guild.
       */
      readonly features: Array<Guild.Feature>;
      /**
       * The MFA level required to perform actions guarded by elevated [[discord.Permissions]].
       */
      readonly mfaLevel: number;
      /**
       * The application id tied to this guild. Typically set on Discord guilds with commerce features enabled.
       */
      readonly applicationId: Snowflake | null;
      /**
       * `true` if the guild widget is enabled.
       */
      readonly widgetEnabled: boolean;
      /**
       * If [[discord.Guild.widgetEnabled]] is `true`, defines the channel users invited by the widget will see on join.
       */
      readonly widgetChannelId: Snowflake | null;
      /**
       * The maximum amount of concurrent online users before this guild goes unavailable.
       *
       * Generally increases as [[discord.Guild.memberCount]] increases.
       */
      readonly maxPresences: number;
      /**
       * The number of guild members who joined the guild.
       */
      readonly memberCount: number;
      /**
       * If set, the vanity invite code set on this guild. Requires the [[discord.Guild.Feature.VANITY_URL]] feature flag.
       */
      readonly vanityUrlCode: string | null;
      /**
       * If set, a user-submitted description of the guild. Requires the [[discord.Guild.Feature.PUBLIC]] feature flag.
       */
      readonly description: string | null;
      /**
       * The current tier this guild has. Dependent on the amount of [[discord.Guild.premiumSubscriptionCount]].
       */
      readonly premiumTier: Guild.PremiumTier | null;
      /**
       * The number of boosts this server has.
       */
      readonly premiumSubscriptionCount: number;
      /**
       * The preferred locale of the guild.
       */
      readonly preferredLocale: string;
  
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.GUILD_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.GuildUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_OVERWRITE_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelPermissionOverwriteCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_OVERWRITE_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelPermissionOverwritesUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.CHANNEL_OVERWRITE_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.ChannelPermissionOverwriteDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_KICK>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberKick>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_PRUNE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberPrune>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_BAN_ADD>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberBanAdd>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_BAN_REMOVE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberBanRemove>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_ROLE_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberRoleUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_MOVE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberMove>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MEMBER_DISCONNECT>
      ): AsyncIterableIterator<discord.AuditLogEntry.MemberDisconnect>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.BOT_ADD>
      ): AsyncIterableIterator<discord.AuditLogEntry.BotAdd>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.ROLE_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.RoleCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.ROLE_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.RoleUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.ROLE_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.RoleDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INVITE_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.InviteCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INVITE_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.InviteUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INVITE_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.InviteDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.WEBHOOK_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.WebhookCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.WEBHOOK_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.WebhookUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.WEBHOOK_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.WebhookDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.EMOJI_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.EmojiCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.EMOJI_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.EmojiUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.EMOJI_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.EmojiDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MESSAGE_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MessageDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MESSAGE_BULK_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.MessageBulkDelete>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MESSAGE_PIN>
      ): AsyncIterableIterator<discord.AuditLogEntry.MessagePin>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.MESSAGE_UNPIN>
      ): AsyncIterableIterator<discord.AuditLogEntry.MessageUnpin>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INTEGRATION_CREATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.IntegrationCreate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INTEGRATION_UPDATE>
      ): AsyncIterableIterator<discord.AuditLogEntry.IntegrationUpdate>;
      iterAuditLogs(
        options: Guild.IterAuditLogsOptionsWithActionType<AuditLogEntry.ActionType.INTEGRATION_DELETE>
      ): AsyncIterableIterator<discord.AuditLogEntry.IntegrationDelete>;
      iterAuditLogs(
        options?: Guild.IIterAuditLogsOptions
      ): AsyncIterableIterator<discord.AuditLogEntry.AnyAction>;
  
      /**
       * @deprecated Use [[discord.Guild.iterAuditLogs]]
       */
      getAuditLogs(
        options?: Guild.IIterAuditLogsOptions
      ): AsyncIterableIterator<discord.AuditLogEntry.AnyAction>;
  
      /*
        end audit-log bonanza
      */
  
      /**
       * Modifies guild settings. Requires the [[discord.Permissions.MANAGE_GUILD]] permission.
       *
       * #### Example: Set the guild's name to "New Guild Name".
       * ```ts
       * await guild.edit({
       *   name: "New Guild Name"
       * });
       * ```
       *
       * @param updateData The settings to change for this guild.
       * @returns A promise that resolves as the updated guild if successful.
       */
      edit(updateData: Guild.IGuildOptions): Promise<Guild>;
  
      /**
       * Fetches a list of all channels on this guild.
       */
      getChannels(): Promise<Channel.AnyGuildChannel[]>;
  
      /**
       * Fetches a single channel from the guild, by id.
       *
       * @param channelId The channel id of the channel you want to fetch
       * @returns An instance of the channel if available, otherwise `null`.
       */
      getChannel(channelId: Snowflake): Promise<Channel.AnyGuildChannel | null>;
  
      /**
       * Creates a channel on the guild. Requires the [[discord.Permissions.MANAGE_CHANNELS]] permissions.
       *
       * @param options Options for the new channel. Some are optional.
       */
      createChannel(options: Guild.CreateChannelOptions): Promise<Channel.AnyGuildChannel>;
  
      /**
       * Fetches an array of all [[discord.GuildInvite]] objects associated with this guild.
       */
      getInvites(): Promise<discord.GuildInvite[]>;
  
      /**
       * Bans a specific user from the guild.
       *
       * Note: The user does not have to be a member of the guild to ban them.
       *
       * @param user The user id or user-like object to ban.
       * @param options Options for the ban. All values are optional.
       */
      createBan(
        user: Snowflake | User | GuildMember,
        options?: discord.Guild.IGuildBanOptions
      ): Promise<void>;
  
      /**
       * Fetches an array of [[discord.GuildBan]] objects that exist on the guild.
       */
      getBans(): Promise<GuildBan[]>;
  
      /**
       * Fetches a [[discord.GuildBan]] given a user id.
       *
       * @returns Resolves with a [[discord.GuildBan]] if found, otherwise `null`.
       */
      getBan(user: Snowflake | User): Promise<GuildBan | null>;
  
      /**
       * Un-bans or otherwise removes a ban for a specific user from the guild.
       *
       * @param user The user id or user-like object to un-ban.
       */
      deleteBan(user: Snowflake | User | GuildMember): Promise<void>;
  
      /**
       * Creates a role on the guild.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       *
       * @param options Settings for the new guild role. All fields are optional.
       */
      createRole(options: discord.Role.IRoleOptions): Promise<discord.Role>;
  
      /**
       * Modifies the role positioning for the set of roles sent in the `options` param.
       *
       * Role positions are important for role hoisting and permission inheritance.
       *
       * On success, the Promise resolves an array of all guild role objects.
       */
      editRolePositions(rolePositions: Array<discord.Guild.IRolePositionOptions>): Promise<Role[]>;
  
      /**
       * Fetches an array of all the roles on this guild.
       */
      getRoles(): Promise<Role[]>;
  
      /**
       * Fetches a single role from the guild, by id.
       *
       * @param roleId The id of the role you wish to fetch.
       */
      getRole(roleId: Snowflake): Promise<Role | null>;
  
      /**
       * Returns an async iterable for the list of members on this guild.
       *
       * The runtime will stream members in chunks and yield individual [[discord.GuildMember]] instances as they become available. Iteration happens on an ascending basis, sorted by user id.
       *
       * Keep in mind this can be a particularly expensive operation to call depending on the amount of guild members are in the guild.
       *
       * ES2015 introduced the `for..await..of` statement, allowing you to loop asynchronously over the async generators and functions.
       *
       * #### Example: Removing a role from every member in a guild.
       * ```ts
       * for await (const member of guild.iterMembers()) {
       *   await member.removeRole(SOME_ROLE_ID);
       * }
       * ```
       *
       * @param options Options for the request. All values are optional.
       */
      iterMembers(options?: Guild.IIterMembersOptions): AsyncIterableIterator<GuildMember>;
  
      /**
       * @deprecated Use [[discord.Guild.iterMembers]]
       */
      getMembers(options?: Guild.IIterMembersOptions): AsyncIterableIterator<GuildMember>;
  
      /**
       * Fetches a single member from the guild, by user id.
       *
       * If the user is not a member of the guild, or the user is not found, the Promise will resolve as `null`.
       *
       * @param userId The id of the member you wish to fetch.
       */
      getMember(userId: Snowflake): Promise<GuildMember | null>;
  
      /**
       * Fetches an array containing the emojis uploaded to this guild.
       */
      getEmojis(): Promise<Emoji[]>;
  
      /**
       * Fetches a single emoji from the guild, by id.
       *
       * @param emojiId The id of the emoji you wish to fetch.
       */
      getEmoji(emojiId: Snowflake): Promise<Emoji | null>;
  
      /**
       * Attempts to create a new emoji with the values provided. Returns the new emoji upon success.
       *
       * Note: Emojis may be a maximum size of 256kb.
       *
       * @param options The options to use when creating the new guild emoji.
       */
      createEmoji(options: discord.Guild.ICreateEmojiOptions): Promise<discord.Emoji>;
  
      /**
       * Builds a URL for the guild's icon, if set.
       *
       * See [[discord.Guild.icon]] for more info.
       *
       * @param type the preferred image type. Defaults to [[discord.ImageType.WEBP]].
       */
      getIconUrl(type?: discord.ImageType): string | null;
  
      /**
       * Builds a URL for the guild's splash image, if set.
       *
       * See [[discord.Guild.splash]] for more info.
       *
       * @param type the preferred image type. Defaults to [[discord.ImageType.PNG]].
       */
      getSplashUrl(
        type?: discord.ImageType.PNG | discord.ImageType.JPEG | discord.ImageType.WEBP
      ): string | null;
  
      /**
       * Builds a URL for the guild's banner image, if set.
       *
       * See [[discord.Guild.banner]] for more info.
       *
       * @param type the preferred image type. Defaults to [[discord.ImageType.PNG]].
       */
      getBannerUrl(
        type?: discord.ImageType.PNG | discord.ImageType.JPEG | discord.ImageType.WEBP
      ): string | null;
  
      /**
       * Sets and overwrites the bot's voice state within the guild.
       *
       * Using the required `channelId` option, you may connect to a voice or disconnect from a voice channel.
       * If you want to move channels, specify a new channel id.
       *
       * Disconnect the bot from it's voice session by setting `channelId` to `null`.
       *
       * This usually triggers a VOICE_SERVER_UPDATE and/or VOICE_STATE_UPDATE events.
       * Information from these events can be used to externally orchestrate voice protocol sockets.
       *
       * @param options the new voice state data. overriding any previously-set data.
       */
      setOwnVoiceState(options: discord.Guild.ISetVoiceStateOptions): Promise<void>;
  
      /**
       * A convenience method to get the bot's voice state for the guild.
       *
       * Returns null if the bot doesn't have a voice state set.
       */
      getOwnVoiceState(): Promise<discord.VoiceState | null>;
  
      /**
       * Get a member's voice state. Resolves as `null` if the member is not connected to a voice channel.
       *
       * @param userId the user to look up
       */
      getVoiceState(userId: discord.Snowflake): Promise<discord.VoiceState | null>;
  
      /**
       * Returns an async iterator over users connected to voice channels in this guild.
       *
       * You may optionally filter the results by channel, if a channelId is provided with the options object.
       *
       * @param options options for this query
       */
      iterVoiceStates(
        options?: discord.Guild.IIterVoiceStatesOptions
      ): AsyncIterableIterator<discord.VoiceState>;
  
      /**
       * Returns the number of users that **would be** removed/kicked from the guild in a prune operation.
       *
       * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the `includeRoles` option.
       * Any inactive user that has a subset of the provided role(s) will be counted in the prune and users with additional roles will not.
       *
       * Note: This is a costly operation, and should not be run too frequently.
       */
      previewPrune(options?: discord.Guild.IPreviewPruneOptions): Promise<number>;
  
      /**
       * Begins a prune operation with the given settings.
       * It is *highly recommend* to verify the number of users being pruned is accurate using [[discord.Guild.previewPrune]].
       *
       * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the includeRoles option.
       * Any inactive user that has a subset of the provided role(s) will be counted in the prune and users with additional roles will not.
       *
       * If the `computePruneCount` option is set to true (default), the returned value will be the number of users pruned.
       * In large guilds, it is recommended to set this to false as it may time out the operation on Discord's end.
       *
       * Note: This is a costly operation, and should not be run too frequently.
       */
      beginPrune(options?: discord.Guild.IPruneOptions): Promise<number>;
      beginPrune(options: discord.Guild.IPruneOptions & { computePruneCount: false }): Promise<void>;
    }
  
    /**
     * A class that wraps information on a guild's individual audit log entry.
     */
    class AuditLogEntry {
      /**
       * The unique identifier for this audit log entry. Encodes the timestamp this event occurred at.
       */
      readonly id: Snowflake;
      /**
       * The id of the [[discord.User]] that performed this action.
       */
      readonly userId: Snowflake;
      /**
       * An instance of the [[discord.User]] that performed this action.
       */
      readonly user: discord.User;
      /**
       * The type of action the user performed.
       */
      readonly actionType: AuditLogEntry.ActionType;
      /**
       * An optional reason the user or bot provided when performing this action.
       */
      readonly reason: string;
      /**
       * If applicable, the id of the user, channel, or other Discord entity that this action applied to.
       */
      readonly targetId: Snowflake | null;
    }
  
    namespace AuditLogEntry {
      /**
       * An enumeration of all possible audit log entry types.
       */
      const enum ActionType {
        GUILD_UPDATE = 1,
        CHANNEL_CREATE = 10,
        CHANNEL_UPDATE = 11,
        CHANNEL_DELETE = 12,
        CHANNEL_OVERWRITE_CREATE = 13,
        CHANNEL_OVERWRITE_UPDATE = 14,
        CHANNEL_OVERWRITE_DELETE = 15,
        MEMBER_KICK = 20,
        MEMBER_PRUNE = 21,
        MEMBER_BAN_ADD = 22,
        MEMBER_BAN_REMOVE = 23,
        MEMBER_UPDATE = 24,
        MEMBER_ROLE_UPDATE = 25,
        MEMBER_MOVE = 26,
        MEMBER_DISCONNECT = 27,
        BOT_ADD = 28,
        ROLE_CREATE = 30,
        ROLE_UPDATE = 31,
        ROLE_DELETE = 32,
        INVITE_CREATE = 40,
        INVITE_UPDATE = 41,
        INVITE_DELETE = 42,
        WEBHOOK_CREATE = 50,
        WEBHOOK_UPDATE = 51,
        WEBHOOK_DELETE = 52,
        EMOJI_CREATE = 60,
        EMOJI_UPDATE = 61,
        EMOJI_DELETE = 62,
        MESSAGE_DELETE = 72,
        MESSAGE_BULK_DELETE = 73,
        MESSAGE_PIN = 74,
        MESSAGE_UNPIN = 75,
        INTEGRATION_CREATE = 80,
        INTEGRATION_UPDATE = 81,
        INTEGRATION_DELETE = 82,
      }
  
      /**
       * A type alias representing a union of all possible audit log entry types.
       */
      type AnyAction =
        | AuditLogEntry.GuildUpdate
        | AuditLogEntry.ChannelCreate
        | AuditLogEntry.ChannelUpdate
        | AuditLogEntry.ChannelDelete
        | AuditLogEntry.ChannelPermissionOverwriteCreate
        | AuditLogEntry.ChannelPermissionOverwritesUpdate
        | AuditLogEntry.ChannelPermissionOverwriteDelete
        | AuditLogEntry.MemberKick
        | AuditLogEntry.MemberPrune
        | AuditLogEntry.MemberBanAdd
        | AuditLogEntry.MemberBanRemove
        | AuditLogEntry.MemberUpdate
        | AuditLogEntry.MemberRoleUpdate
        | AuditLogEntry.MemberMove
        | AuditLogEntry.MemberDisconnect
        | AuditLogEntry.BotAdd
        | AuditLogEntry.RoleCreate
        | AuditLogEntry.RoleUpdate
        | AuditLogEntry.RoleDelete
        | AuditLogEntry.InviteCreate
        | AuditLogEntry.InviteUpdate
        | AuditLogEntry.InviteDelete
        | AuditLogEntry.WebhookCreate
        | AuditLogEntry.WebhookUpdate
        | AuditLogEntry.WebhookDelete
        | AuditLogEntry.EmojiCreate
        | AuditLogEntry.EmojiUpdate
        | AuditLogEntry.EmojiDelete
        | AuditLogEntry.MessageDelete
        | AuditLogEntry.MessageBulkDelete
        | AuditLogEntry.MessagePin
        | AuditLogEntry.MessageUnpin
        | AuditLogEntry.IntegrationCreate
        | AuditLogEntry.IntegrationUpdate
        | AuditLogEntry.IntegrationDelete;
  
      /**
       * Actions that have a new value and a potentially old value.
       *
       * These change types are typically included in actions that update objects.
       */
      interface IActionChange<T> {
        /**
         * The state of the value before the audit log action occurred. May be undefined.
         */
        oldValue?: T;
        /**
         * The state of the value after the audit log action occurred.
         */
        newValue: T;
      }
  
      /**
       * Actions that have a new value.
       *
       * These change types are typically included in actions that create entities.
       */
      interface IActionChangeNewValue<T> {
        /**
         * The state of the value after the audit log action occurred.
         */
        newValue: T;
      }
  
      /**
       * Actions that have an old value.
       *
       * These change types are typically included in actions that remove or delete entities.
       */
      interface IActionChangeOldValue<T> {
        /**
         * The state of the value before the audit log action occurred.
         */
        oldValue: T;
      }
  
      class GuildUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.GUILD_UPDATE;
        readonly changes: {
          readonly name?: IActionChange<string>;
          readonly iconHash?: IActionChange<string>;
          readonly splashHash?: IActionChange<string>;
          readonly ownerId?: IActionChange<Snowflake>;
          readonly region?: IActionChange<Guild.Region>;
          readonly afkChannelId?: IActionChange<Snowflake>;
          readonly afkTimeout?: IActionChange<number>;
          readonly mfaLevel?: IActionChange<Guild.MFALevel>;
          readonly verificationLevel?: IActionChange<Guild.VerificationLevel>;
          readonly explicitContentFilter?: IActionChange<Guild.ExplicitContentFilterLevel>;
          readonly defaultMessageNotification?: IActionChange<Guild.NotificationsLevel>;
          readonly vanityUrlCode?: IActionChange<string>;
          readonly widgetEnabled?: IActionChange<boolean>;
          readonly widgetChannelId?: IActionChange<Snowflake>;
          readonly systemChannelId?: IActionChange<Snowflake>;
        };
      }
  
      class ChannelCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.CHANNEL_CREATE;
        readonly changes: {
          readonly name: IActionChangeNewValue<string>;
          readonly type: IActionChangeNewValue<Channel.Type>;
          readonly topic?: IActionChangeNewValue<string>;
          readonly rateLimitPerUser?: IActionChangeNewValue<number>;
          readonly nsfw?: IActionChangeNewValue<boolean>;
          readonly bitrate?: IActionChangeNewValue<number>;
        };
      }
  
      class ChannelUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.CHANNEL_UPDATE;
        readonly changes: {
          readonly name?: IActionChange<string>;
          readonly topic?: IActionChange<string>;
          readonly rateLimitPerUser?: IActionChange<number>;
          readonly nsfw?: IActionChange<boolean>;
          readonly bitrate?: IActionChange<number>;
        };
      }
  
      class ChannelDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.CHANNEL_DELETE;
        readonly changes: {
          readonly name: IActionChangeOldValue<string>;
          readonly type: IActionChangeOldValue<Channel.Type>;
          readonly topic?: IActionChangeOldValue<string>;
          readonly rateLimitPerUser?: IActionChangeOldValue<number>;
          readonly nsfw?: IActionChangeOldValue<boolean>;
          readonly bitrate?: IActionChangeOldValue<number>;
        };
      }
  
      type ActionChannelPermissionOverwriteUpdateOptions =
        | {
            readonly id: Snowflake;
            readonly type: Channel.PermissionOverwriteType.MEMBER;
          }
        | {
            readonly id: Snowflake;
            readonly type: Channel.PermissionOverwriteType.ROLE;
            readonly roleName: string;
          };
  
      class ChannelPermissionOverwriteCreate extends AuditLogEntry {
        readonly actionType: ActionType.CHANNEL_OVERWRITE_CREATE;
        readonly changes: {
          readonly id: IActionChangeNewValue<Snowflake>;
          readonly type: IActionChangeNewValue<Channel.PermissionOverwriteType>;
          readonly allow: IActionChangeNewValue<number>;
          readonly deny: IActionChangeNewValue<number>;
        };
        readonly options: ActionChannelPermissionOverwriteUpdateOptions;
      }
  
      class ChannelPermissionOverwritesUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.CHANNEL_OVERWRITE_UPDATE;
        readonly changes: {
          readonly allow?: IActionChange<number>;
          readonly deny?: IActionChange<number>;
        };
        readonly options: ActionChannelPermissionOverwriteUpdateOptions;
      }
  
      class ChannelPermissionOverwriteDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.CHANNEL_OVERWRITE_DELETE;
        readonly changes: {
          readonly id: IActionChangeOldValue<Snowflake>;
          readonly type: IActionChangeOldValue<Channel.PermissionOverwriteType>;
          readonly allow: IActionChangeOldValue<number>;
          readonly deny: IActionChangeOldValue<number>;
        };
        readonly options: ActionChannelPermissionOverwriteUpdateOptions;
      }
  
      class MemberKick extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MEMBER_KICK;
        readonly changes: {};
      }
  
      class MemberPrune extends AuditLogEntry {
        readonly actionType: ActionType.MEMBER_PRUNE;
        readonly changes: {};
        readonly options: {
          readonly deleteMemberDays: string;
          readonly membersRemoved: string;
        };
      }
  
      class MemberBanAdd extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MEMBER_BAN_ADD;
        readonly changes: {};
      }
  
      class MemberBanRemove extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MEMBER_BAN_REMOVE;
        readonly changes: {};
      }
  
      class MemberUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MEMBER_UPDATE;
        readonly changes: {
          readonly deaf?: IActionChange<boolean>;
          readonly mute?: IActionChange<boolean>;
          readonly nick?: IActionChange<string>;
        };
      }
  
      class MemberRoleUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MEMBER_ROLE_UPDATE;
        readonly changes: {
          readonly $add?: IActionChangeNewValue<{
            readonly name: string;
            readonly id: Snowflake;
          }>;
          readonly $remove?: IActionChangeNewValue<{
            readonly name: string;
            readonly id: Snowflake;
          }>;
        };
      }
  
      class MemberMove extends AuditLogEntry {
        readonly targetId: null;
        readonly actionType: ActionType.MEMBER_MOVE;
        readonly changes: {};
        readonly options: {
          readonly channelId: Snowflake;
          readonly count: string;
        };
      }
  
      class MemberDisconnect extends AuditLogEntry {
        readonly targetId: null;
        readonly actionType: ActionType.MEMBER_DISCONNECT;
        readonly changes: {};
        readonly options: {
          readonly count: string;
        };
      }
  
      class BotAdd extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.BOT_ADD;
        readonly changes: {};
      }
  
      class RoleCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.ROLE_CREATE;
        readonly changes: {
          readonly name: IActionChangeNewValue<string>;
          readonly color: IActionChangeNewValue<number>;
          readonly hoist: IActionChangeNewValue<boolean>;
          readonly mentionable: IActionChangeNewValue<boolean>;
          readonly permissions: IActionChangeNewValue<number>;
        };
      }
  
      class RoleUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.ROLE_UPDATE;
        readonly changes: {
          readonly name?: IActionChange<string>;
          readonly color?: IActionChange<number>;
          readonly hoist?: IActionChange<boolean>;
          readonly mentionable?: IActionChange<boolean>;
          readonly permissions?: IActionChange<number>;
        };
      }
  
      class RoleDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.ROLE_DELETE;
        readonly changes: {
          readonly name: IActionChangeOldValue<string>;
          readonly color: IActionChangeOldValue<number>;
          readonly hoist: IActionChangeOldValue<boolean>;
          readonly mentionable: IActionChangeOldValue<boolean>;
          readonly permissions: IActionChangeOldValue<number>;
        };
      }
  
      class InviteCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INVITE_CREATE;
        readonly changes: {
          readonly code: IActionChangeNewValue<string>;
          readonly channelId: IActionChangeNewValue<Snowflake>;
          readonly inviterId: IActionChangeNewValue<Snowflake>;
          readonly uses: IActionChangeNewValue<number>;
          readonly maxUses: IActionChangeNewValue<number>;
          readonly maxAge: IActionChangeNewValue<number>;
          readonly temporary: IActionChangeNewValue<boolean>;
        };
      }
  
      class InviteUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INVITE_UPDATE;
        readonly changes: {
          readonly code?: IActionChange<string>;
          readonly channelId?: IActionChange<Snowflake>;
          readonly inviterId?: IActionChange<Snowflake>;
          readonly uses?: IActionChange<number>;
          readonly maxUses?: IActionChange<number>;
          readonly maxAge?: IActionChange<number>;
          readonly temporary?: IActionChange<boolean>;
        };
      }
  
      class InviteDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INVITE_DELETE;
        readonly changes: {
          readonly code: IActionChangeOldValue<string>;
          readonly channelId: IActionChangeOldValue<Snowflake>;
          readonly inviterId: IActionChangeOldValue<Snowflake>;
          readonly uses: IActionChangeOldValue<number>;
          readonly maxUses: IActionChangeOldValue<number>;
          readonly maxAge: IActionChangeOldValue<number>;
          readonly temporary: IActionChangeOldValue<boolean>;
        };
      }
  
      class WebhookCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.WEBHOOK_CREATE;
        readonly changes: {
          readonly channelId: IActionChangeNewValue<Snowflake>;
          readonly name: IActionChangeNewValue<string>;
          readonly type: IActionChangeNewValue<number>;
          readonly avatarHash?: IActionChangeNewValue<string>;
        };
      }
  
      class WebhookUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.WEBHOOK_UPDATE;
        readonly changes: {
          readonly channelId?: IActionChange<Snowflake>;
          readonly name?: IActionChange<string>;
          readonly type?: IActionChange<number>;
          readonly avatarHash?: IActionChange<string>;
        };
      }
  
      class WebhookDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.WEBHOOK_DELETE;
        readonly changes: {
          readonly channelId: IActionChangeOldValue<Snowflake>;
          readonly name: IActionChangeOldValue<string>;
          readonly type: IActionChangeOldValue<number>;
          readonly avatarHash?: IActionChangeOldValue<string>;
        };
      }
  
      class EmojiCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.EMOJI_CREATE;
        readonly changes: {
          readonly name: IActionChangeNewValue<string>;
        };
      }
  
      class EmojiUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.EMOJI_UPDATE;
        readonly changes: {
          readonly name?: IActionChange<string>;
        };
      }
  
      class EmojiDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.EMOJI_DELETE;
        readonly changes: {
          readonly name?: IActionChangeOldValue<string>;
        };
      }
  
      class MessageDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MESSAGE_DELETE;
        readonly changes: {};
        readonly options: {
          readonly channelId: string;
          readonly count: string;
        };
      }
  
      class MessageBulkDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MESSAGE_BULK_DELETE;
        readonly changes: {};
        readonly options: {
          readonly count: string;
        };
      }
  
      class MessagePin extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MESSAGE_PIN;
        readonly changes: {};
        readonly options: {
          readonly channelId: Snowflake;
          readonly messageId: Snowflake;
        };
      }
  
      class MessageUnpin extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.MESSAGE_UNPIN;
        readonly changes: {};
        readonly options: {
          readonly channelId: Snowflake;
          readonly messageId: Snowflake;
        };
      }
  
      class IntegrationCreate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INTEGRATION_CREATE;
        readonly changes: {
          readonly name: IActionChangeNewValue<string>;
          readonly type: IActionChangeNewValue<"twitch" | "youtube">;
          readonly expireBehavior: IActionChangeNewValue<number>;
          readonly expireGracePeriod: IActionChangeNewValue<number>;
          readonly enableEmoticons?: IActionChangeNewValue<boolean>;
        };
      }
  
      class IntegrationUpdate extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INTEGRATION_UPDATE;
        readonly changes: {
          readonly name?: IActionChange<string>;
          readonly type?: IActionChange<"twitch" | "youtube">;
          readonly expireBehavior?: IActionChange<number>;
          readonly expireGracePeriod?: IActionChange<number>;
          readonly enableEmoticons?: IActionChange<boolean>;
        };
      }
  
      class IntegrationDelete extends AuditLogEntry {
        readonly targetId: Snowflake;
        readonly actionType: ActionType.INTEGRATION_DELETE;
        readonly changes: {
          readonly name: IActionChangeOldValue<string>;
          readonly type: IActionChangeOldValue<"twitch" | "youtube">;
          readonly expireBehavior: IActionChangeOldValue<number>;
          readonly expireGracePeriod: IActionChangeOldValue<number>;
          readonly enableEmoticons?: IActionChangeOldValue<boolean>;
        };
      }
    }
  
    namespace GuildMember {
      /**
       * Options passed to [[discord.GuildMember.edit]]. All properties are optional.
       */
      interface IGuildMemberOptions {
        /**
         * If specified, sets the nickname.
         *
         * Note: Sending an empty string will clear their username.
         */
        nick?: string;
        /**
         * If specified, replaces the member's roles with the list of role ids provided.
         */
        roles?: Snowflake[];
        /**
         * If specified, server-wide mutes or un-mutes a user's voice state
         */
        mute?: boolean;
        /**
         * If specified, server-wide deafens or un-deafens this member's voice state.
         */
        deaf?: boolean;
        /**
         * If the user is in a voice channel and this property is specified, it moves the member to the specified channel, by id.
         */
        channelId?: Snowflake | null;
      }
    }
  
    /**
     * A GuildMember is a wrapper around a [[discord.User]] containing information on their guild membership.
     *
     * Stores the member's nickname, list of roles, the time they joined, the time they started boosting the server, and a guild id.
     *
     * The class also contains a handful of utility methods, such as permission helpers, kick/ban functions, and role utilities. See the Functions below for more info.
     *
     * You can access the underlying user object via [[discord.GuildMember.user]].
     */
    class GuildMember implements IMentionable {
      /**
       * A reference to the underling [[discord.User]] object.
       */
      readonly user: discord.User;
      /**
       * The member's nickname, if set.
       */
      readonly nick: string | null;
      /**
       * An array of role ids this user has assigned to them.
       */
      readonly roles: Array<Snowflake>;
      /**
       * The date and time the member joined in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss`).
       */
      readonly joinedAt: string;
      /**
       * The date and time the member started boosting (otherwise, `null`) in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss`).
       */
      readonly premiumSince: string | null;
      /**
       * The guild id of the guild this member instance belongs to.
       */
      readonly guildId: Snowflake;
      /**
       * Calculated permissions for the member based on the currently assigned roles.
       *
       * Note: See [[GuildChannel.getMemberPermissions]] if you need channel-specific permissions.
       */
      readonly permissions: number;
  
      /**
       * Fetches an instance of the user for this guild member.
       *
       * @deprecated Simply use the [[discord.GuildMember.user]] property.
       */
      getUser(): Promise<User>;
  
      /**
       * Fetches an instance of the guild this member belongs to.
       */
      getGuild(): Promise<Guild>;
  
      /**
       * Updates the guild member.
       *
       * All properties of the `options` parameter are optional, but you must send at least one modification.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       *
       * @param updateData Properties to modify on this member.
       */
      edit(updateData: GuildMember.IGuildMemberOptions): Promise<void>;
  
      /**
       * Returns `true` if the member can perform actions that require the specified permission. Otherwise, `false` is returned.
       *
       * @param permission The permission to check for.
       */
      can(permission: Permissions): boolean;
  
      /**
       * Attempts to add a role (by id) to the member.
       *
       * Requires the [[discord.Permissions.MANAGE_ROLES]] permission.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       *
       * @param roleId
       */
      addRole(roleId: Snowflake): Promise<void>;
  
      /**
       * Attempts to remove a role (by id) to the member.
       *
       * Requires the [[discord.Permissions.MANAGE_ROLES]] permission.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       *
       * @param roleId
       */
      removeRole(roleId: Snowflake): Promise<void>;
  
      /**
       * Attempts to kick the member from the guild.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       */
      kick(): Promise<void>;
  
      /**
       * Attempts to ban the member from the guild.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       */
      ban(options?: Guild.IGuildBanOptions): Promise<void>;
  
      /**
       * Returns the latest [[discord.Presence]] data for this member.
       *
       * The presence object contains their online/offline status, custom status, and other real-time activity data.
       */
      getPresence(): Promise<discord.Presence>;
  
      /**
       * Returns a mention string in the format of `<@!id>` where id is the id of this user.
       */
      toMention(): string;
    }
  
    /**
     * An object containing data about a user's presence in a guild.
     */
    namespace Presence {
      /**
       * An enumeration of possible statuses a user can be in.
       *
       * The default state for a presence (if unknown) is `OFFLINE`.
       */
      const enum Status {
        /**
         * Online (green)
         */
        ONLINE = "online",
        /**
         * Idle, or Away (yellow)
         */
        IDLE = "idle",
        /**
         * Do not Disturb (red)
         */
        DND = "dnd",
        /**
         * Offline/Invisible (grey)
         */
        OFFLINE = "offline",
      }
  
      /**
       * An enumeration of possible activity types.
       *
       * The type denotes what will show under the username in the member list and other UI elements on the Discord client.
       */
      const enum ActivityType {
        /**
         * Example: `Playing {name}`
         */
        GAME = 0,
        /**
         * Example: `Streaming {name}`
         */
        STREAMING = 1,
        /**
         * Example: `Listening to {name}`
         */
        LISTENING = 2,
        /**
         * Example: `Watching {name}`
         */
        WATCHING = 3,
        /**
         * Custom Status
         *
         * Example: `{emoji} {name}`
         */
        CUSTOM = 4,
      }
  
      /**
       * An object containing start and end time for this activity.
       */
      interface IActivityTimestamps {
        /**
         * The unix-epoch timestamp (in milliseconds) when this activity started (if any).
         */
        start: Date | null;
        /**
         * The unix-epoch timestamp (in milliseconds) when this activity ends (if any).
         */
        end: Date | null;
      }
  
      /**
       * An object describing an emoji attached to an activity. Used for Custom Statuses.
       */
      interface IActivityEmoji {
        /**
         * The name of the emoji.
         *
         * If the emoji is a custom guild emoji, the name will be the text name set by the guild managers.
         *
         * Otherwise, the emoji will be the literal unicode surrogate for the emoji.
         */
        name: string;
        /**
         * If the emoji is a custom guild emoji, the id of the emoji.
         *
         * If the emoji is a unicode emoji, this property is null.
         */
        id: discord.Snowflake | null;
        /**
         * `true` if this emoji is animated. Only possible for custom guild emojis.
         */
        animated: boolean;
      }
  
      /**
       * Information describing an activity party.
       *
       * Parties cannot be joined by bots.
       */
      interface IActivityParty {
        /**
         * A unique identifier for this party. It is not necessarily snowflake.
         */
        id: string | null;
        /**
         * The current number of users in the party.
         */
        currentSize: number;
        /**
         * The maximum number of users that can join the party.
         */
        maxSize: number;
      }
  
      /**
       * An object containing any relevant image urls used for Rich Presence popups.
       */
      interface IActivityAssets {
        largeImage: string | null;
        largeText: string | null;
        smallImage: string | null;
        smallText: string | null;
      }
  
      /**
       * An object containing secrets for Rich Presence joining and spectating.
       */
      interface IActivitySecrets {
        join: string | null;
        spectate: string | null;
        match: string | null;
      }
  
      /**
       * A bit set of flags that describe what Rich Presence actions can be performed on an activity.
       */
      const enum ActivityFlags {
        NONE = 0,
        INSTANCE = 1,
        JOIN = 1 << 1,
        SPECTATE = 1 << 2,
        JOIN_REQUEST = 1 << 3,
        SYNC = 1 << 4,
        PLAY = 1 << 5,
      }
  
      /**
       * An object describing an ongoing activity.
       *
       * This data is usually used to display the "Currently Playing" data on the user card in the Discord client.
       *
       * It also contains any other relevant Rich Presence data, if any exists.
       *
       * All fields are nullable except the name and type.
       */
      interface IActivity {
        /**
         * The name of the game or activity.
         */
        readonly name: string;
        /**
         * The type of activity this is.
         */
        readonly type: Presence.ActivityType;
        /**
         * A url for this activity, typically a url to a stream if the activity is a STREAMING.
         */
        readonly url: string | null;
        /**
         * The date this activity started.
         */
        readonly createdAt: Date | null;
        /**
         * An object containing start and end time for this activity.
         */
        readonly timestamps: Presence.IActivityTimestamps | null;
        /**
         * The application id (game id) this activity is associated with.
         */
        readonly applicationId: Snowflake | null;
        /**
         * What the player is currently doing.
         */
        readonly details: string | null;
        /**
         * The user's current party status.
         */
        readonly state: string | null;
        /**
         * The data for the Emoji used for the user's custom status, if set.
         */
        readonly emoji: Presence.IActivityEmoji | null;
        /**
         * The activity's party information.
         */
        readonly party: Presence.IActivityParty | null;
        /**
         * An object containing any relevant image urls used for Rich Presence popups.
         */
        readonly assets: Presence.IActivityAssets | null;
        /**
         * An object containing secrets for Rich Presence joining and spectating.
         */
        readonly secrets: Presence.IActivitySecrets | null;
        /**
         * `true` if the activity is an instanced game session.
         */
        readonly instance: boolean;
        /**
         * A bit set of flags that describe what Rich Presence actions can be performed on this activity.
         */
        readonly flags: Presence.ActivityFlags | null;
      }
  
      /**
       * An object containing a potential status set for each device type a user may be using.
       */
      interface IClientStatus {
        desktop: discord.Presence.ActivityType | null;
        mobile: discord.Presence.ActivityType | null;
        web: discord.Presence.ActivityType | null;
      }
    }
  
    /**
     * An object containing data about a user's presence in a guild.
     */
    class Presence {
      /**
       * The id of the user for the presence data
       */
      readonly userId: Snowflake;
      /**
       * The id of the guild this presence data exists for.
       */
      readonly guildId: Snowflake;
      /**
       * The current online/idle/dnd/offline status for the user.
       */
      readonly status: Presence.Status;
      /**
       * An array of activities included in the presence, if any.
       *
       * Activities describe games being played, custom statuses, rich-presence, and other integrations like listen-along.
       */
      readonly activities: Array<Presence.IActivity>;
      /**
       * An object containing a potential status set for each device type a user may be using.
       */
      readonly clientStatus: Presence.IClientStatus;
    }
  
    /**
     * An object that represents a ban on a guild.
     *
     * Note: If you need to ban a member or create a new ban, use [[discord.Guild.createBan]].
     */
    class GuildBan {
      /**
       * The id of the guild this ban belongs to.
       */
      readonly guildId: discord.Snowflake;
      /**
       * The user banned from the guild.
       */
      readonly user: discord.User;
      /**
       * A user-provided reason for the ban. If no reason was provided, the value will be `""`, an empty string.
       */
      readonly reason: string;
  
      /**
       * Retrieves the [[discord.Guild]] associated with this ban.
       *
       * If you only need the guild id, it's provided via the `guildId` property.
       */
      getGuild(): Promise<discord.Guild>;
  
      /**
       * Deletes the guild ban and un-bans the associated user from the guild.
       */
      delete(): Promise<void>;
    }
  
    namespace Role {
      /**
       * Options to use when calling [[discord.Role.edit]], all properties are optional.
       */
      interface IRoleOptions {
        /**
         * The name of the role.
         */
        name?: string;
        /**
         * The permission bits users extend when this role is assigned.
         */
        permissions?: number;
        /**
         * The color of this role. An integer representation of a hexadecimal color code.
         *
         * The default color for roles (no color) is `0`.
         *
         * Note: You can set this to a hex color code using an integer represented in hex format.
         *
         * Example: `0xFF0000` (or `16711680`) is red.
         */
        color?: number;
        /**
         * `true` if this role should be hoisted in the member list (displayed separately).
         */
        hoist?: boolean;
        /**
         * `true` if users should be able to mention and ping this role.
         */
        mentionable?: boolean;
      }
    }
  
    /**
     * A role belongs to a [[discord.Guild]] and can be assigned to groups of [[discord.GuildMember]]s to change the color of their name and apply permission changes.
     *
     * Multiple roles can be assigned to a single user.
     *
     * Roles can be hoisted in the member list (displayed separately), and ordered.
     */
    class Role implements IMentionable {
      /**
       * The role's unique Discord id. This field never changes.
       */
      readonly id: Snowflake;
      /**
       * The display name for the role.
       */
      readonly name: string;
      /**
       * The color for this role. It is a hexadecimal color code represented in integer format.
       *
       * The default color for roles (no color) is `0`.
       */
      readonly color: number;
      /**
       * `true` if this role is hoisted in the member list (displayed separately).
       *
       * Members are grouped into their highest positioned role in the member list if a role is hoisted.
       */
      readonly hoist: boolean;
      /**
       * The position of this role.
       *
       * Hoisted roles are displayed in this order.
       *
       * Role permissions are applied to members in the order of the permission set on roles.
       */
      readonly position: number;
      /**
       * The permission bit set assigned to this role. Members receive permissions in the order roles are positioned.
       */
      readonly permissions: number;
      /**
       * `true` if this role was created by an integration or bot application.
       *
       * Managed roles have restrictions around what can be edited, depending on the application.
       */
      readonly managed: boolean;
      /**
       * `true` if this role can be mentioned in messages by members of the guild.
       *
       * When a role is mentioned, they receive a ping/notification if they have notifications enabled for mentions on the guild.
       */
      readonly mentionable: boolean;
      /**
       * The id of the [[discord.Guild]] this role belongs to.
       */
      readonly guildId: Snowflake;
  
      /**
       * Updates the guild role.
       *
       * All properties of the `options` parameter are optional, but you must send at least one modification.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       *
       * @param options Properties to modify on this role.
       */
      edit(options: Role.IRoleOptions): Promise<Role>;
  
      /**
       * Deletes the role and removes it from all the members who had it assigned.
       *
       * If an error occurs, a [[discord.ApiError]] is thrown.
       */
      delete(): Promise<void>;
  
      /**
       * Returns a mention string in the format of `<@!id>` where id is the id of this user.
       *
       * Can be used in a message to mention/ping the role.
       */
      toMention(): string;
    }
  
    namespace Channel {
      /**
       * Represents any channel type on Discord that exists within a [[discord.Guild]].
       */
      type AnyGuildChannel =
        | GuildTextChannel
        | GuildVoiceChannel
        | GuildCategory
        | GuildNewsChannel
        | GuildStoreChannel
        | GuildStageVoiceChannel;
  
      /**
       * Represents any channel type on Discord.
       */
      type AnyChannel = DmChannel | AnyGuildChannel;
  
      /**
       * Describes what permissions are allowed and denied per role or user.
       */
      interface IPermissionOverwrite {
        /**
         * The unique identifier of this permission overwrite.
         *
         * If the type is "member", it is a user id from [[discord.User.id]].
         * If the type is "role", it is a role id from [[discord.Role.id]].
         */
        id: Snowflake;
        /**
         * Either "role" or "member" depending on the entity this permission overwrite applies to.
         *
         * "member" overwrites take precedent over role overwrites.
         */
        type: Channel.PermissionOverwriteType;
        /**
         * The permission bit set allowed.
         */
        allow: number;
        /**
         * The permission bit set denied.
         */
        deny: number;
      }
  
      /**
       * Used in [[discord.Channel.IPermissionOverwrite]] to describe what entity the overwrite applies to.
       */
      const enum PermissionOverwriteType {
        ROLE = 0,
        MEMBER = 1,
      }
  
      /**
       * An enumeration of channel types.
       *
       * This is used on the [[discord.Channel.type]] property.
       */
      const enum Type {
        /**
         * A text chat channel within a [[discord.Guild]].
         *
         * Note: See [[discord.GuildTextChannel]].
         */
        GUILD_TEXT = 0,
        /**
         * A private 1-1 channel between the bot user and another [[discord.User]].
         *
         * Note: See [[discord.DMChannel]].
         */
        DM = 1,
        /**
         * A voice channel within a [[discord.Guild]].
         *
         * Note: See [[discord.GuildVoiceChannel]].
         */
        GUILD_VOICE = 2,
        /**
         * A text channel containing up to 10 unrelated [[discord.Users]].
         *
         * Note: Bots may not interact/view these channel types. This entry exists for reference purposes.
         */
        GROUP_DM = 3,
        /**
         * A category within a guild. Can be used to separate groups of channels under a single parent.
         *
         * Guild Channels within categories will have a channel id specified on [[discord.GuildChannel.parentId]].
         *
         * Note: See [[discord.GuildCategory]].
         */
        GUILD_CATEGORY = 4,
        /**
         * A special text channel that enables the use of the announcements system on Discord.
         *
         * Note: See [[discord.GuildNewsChannel]].
         */
        GUILD_NEWS = 5,
        /**
         * A special guild channel that enables commerce features. Typically used by studios utilizing Discord to distribute their game.
         *
         * Note: See [[discord.GuildStoreChannel]].
         */
        GUILD_STORE = 6,
        /**
         * A special guild voice channel for Community servers.
         *
         * In these channels, audience members can listen to users elected to the stage by moderators.
         *
         * Note: See [[discord.GuildStageVoiceChannel]].
         */
        GUILD_STAGE_VOICE = 13,
      }
    }
  
    /**
     * Base channel class.
     *
     * All channels have an `id` and `type`.
     *
     * Note: Pylon should never provide an instance of [[discord.Channel]] directly. You will always be given a more specific child class.
     *
     * A channel can be type-refined by checking its [[discord.Channel.type]] type against [[discord.Channel.Type]].
     */
    class Channel {
      /**
       * Discord's unique identifier for this channel. This value never changes.
       */
      readonly id: Snowflake;
      /**
       * The type of channel this is. See [[discord.Channel.AnyChannel]] for a complete list of channel types.
       */
      readonly type: Channel.Type;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
    }
  
    /**
     * A text channel represents any channel on Discord that store messages.
     *
     * The base methods available on this class are also available for all child classes.
     */
    interface ITextChannel {
      readonly type: Channel.Type;
  
      /**
       * Attempts to fetch a single [[discord.Message]] (by id) from this channel.
       *
       * If no message is found, the Promise resolves as `null`.
       *
       * @param messageId The id of the message you wish to fetch data for.
       */
      getMessage(messageId: string): Promise<Message | null>;
  
      /**
       * Attempts to send a message with additional options (embed, tts, allowedMentions) to this channel.
       *
       * Note: `content` OR `embed` **must** be set on the options properties.
       *
       * See [[discord.Message.OutgoingMessageOptions]] for descriptions on possible options.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      sendMessage(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
  
      /**
       * Attempts to send a simple message from a string to this channel.
       *
       * Note: If you'd like to send an embed or pass additional options, see [[discord.Message.OutgoingMessageOptions]]
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param content Content to use for the outgoing message.
       */
      sendMessage(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
  
      /**
       * Attempts to send a message with only a [[discord.Embed]] attached.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      sendMessage(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Triggers the `*Username* is typing...` message to appear near the text input box for users focused on the channel.
       *
       * The typing indicator will last up to 15 seconds, or until the bot user sends a message in the channel. Whatever comes first.
       *
       * Typically unused by bots, but can be used to indicate a command response is "loading" or "processing."
       */
      triggerTypingIndicator(): Promise<void>;
    }
  
    /**
     * A private 1-1 channel between the bot user and another [[discord.User]].
     */
    class DmChannel extends Channel implements ITextChannel {
      /**
       * The type of this channel. Always [[discord.Channel.Type.DM]].
       */
      readonly type: Channel.Type.DM;
  
      /**
       * Attempts to fetch a single [[discord.Message]] (by id) from this channel.
       *
       * If no message is found, the Promise resolves as `null`.
       *
       * @param messageId The id of the message you wish to fetch data for.
       */
      getMessage(messageId: string): Promise<Message | null>;
  
      /**
       * Attempts to send a message with additional options (embed, tts, allowedMentions) to this channel.
       *
       * Note: `content` OR `embed` **must** be set on the options properties.
       *
       * See [[discord.Message.OutgoingMessageOptions]] for descriptions on possible options.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      sendMessage(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
  
      /**
       * Attempts to send a simple message from a string to this channel.
       *
       * Note: If you'd like to send an embed or pass additional options, see [[discord.Message.OutgoingMessageOptions]]
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param content Content to use for the outgoing message.
       */
      sendMessage(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
  
      /**
       * Attempts to send a message with only a [[discord.Embed]] attached.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      sendMessage(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Triggers the `*Username* is typing...` message to appear near the text input box for users focused on the channel.
       *
       * The typing indicator will last up to 15 seconds, or until the bot user sends a message in the channel. Whatever comes first.
       *
       * Typically unused by bots, but can be used to indicate a command response is "loading" or "processing."
       */
      triggerTypingIndicator(): Promise<void>;
    }
  
    namespace GuildChannel {
      interface IGuildChannelOptions {
        /**
         * The name of this channel.
         */
        name?: string;
        /**
         * The position in the channel list this channel should be displayed at.
         */
        position?: number;
        /**
         * An array of permission overwrites to apply to this channel.
         *
         * Note: If set, this will overwrite existing permission overwrites.
         */
        permissionOverwrites?: Array<Channel.IPermissionOverwrite>;
        /**
         * The id of a [[discord.GuildCategory]] that this channel should be displayed under.
         */
        parentId?: Snowflake | null;
      }
    }
  
    /**
     * A base class containing properties and methods available for all channels that reside in a guild.
     *
     * You should never create/receive an instance of this class directly.
     */
    class GuildChannel extends Channel implements IMentionable {
      /**
       * The id of the [[discord.Guild]] this channel resides in.
       */
      readonly guildId: Snowflake;
      /**
       * The position in the channel list this channel should be displayed at.
       */
      readonly position: number;
      /**
       * Any member or role-specific permission overwrite settings for this channel.
       *
       * Note: You should use [[discord.GuildChannel.getMemberPermissions]] or the easier [[discord.GuildChannel.canMember]] function to test member permissions for a given channel.
       */
      readonly permissionOverwrites: Channel.IPermissionOverwrite[];
      /**
       * If the channel resides within a [[discord.GuildCategory]], its id is set on this property.
       */
      readonly parentId: Snowflake | null;
      /**
       * The name of this channel.
       */
      readonly name: string;
      /**
       * The type of this channel. See [[discord.Channel.AnyGuildChannel]] for a complete list of guild channel types.
       */
      readonly type:
        | Channel.Type.GUILD_CATEGORY
        | Channel.Type.GUILD_TEXT
        | Channel.Type.GUILD_NEWS
        | Channel.Type.GUILD_STORE
        | Channel.Type.GUILD_VOICE
        | Channel.Type.GUILD_STAGE_VOICE;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildChannel.IGuildChannelOptions): Promise<Channel.AnyGuildChannel>;
  
      /**
       * Attempts to fetch an instance of the [[discord.GuildCategory]] this channel resides in.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @returns If the channel does not reside in a cateogry, the Promise resolves as `null`.
       */
      getParent(): Promise<GuildCategory | null>;
  
      /**
       * Creates an invite for the channel. All properties of the `options` parameter are optional.
       *
       * @param options The settings to use for this invite. All parameters are optional.
       */
      createInvite(options?: discord.Invite.ICreateInviteOptions): Promise<discord.GuildInvite>;
  
      /**
       * Fetches an array of [[discord.GuildInvite]] objects associated with this channel.
       */
      getInvites(): Promise<discord.GuildInvite[]>;
  
      /**
       * Fetches the data for the guild this channel belongs to.
       */
      getGuild(): Promise<discord.Guild>;
  
      /**
       * Returns the calculated member permissions for this channel.
       *
       * It is calculated off the base member permissions via [[discord.GuildMember.permissions]] and the member and role-specific permission overwrites from [[discord.GuildChannel.permissionOverwrites]].
       *
       * Note: If you just want to see if a member has a permission, use [[discord.GuildChannel.canMember]].
       *
       * @param member The GuildMember you want to calculate channel-specific permissions for.
       * @returns The permission bit set calculated for the given member.
       */
      getMemberPermissions(member: GuildMember): number;
  
      /**
       * Determines if a member can perform actions that require the permission specified in this channel.
       *
       * Permissions are calculated off the base member permissions via [[discord.GuildMember.permissions]] and the member and role-specific permission overwrites from [[discord.GuildChannel.permissionOverwrites]].
       *
       * @param member The GuildMember you want to calculate channel-specific permissions for.
       * @param permission The permission you are checking for. Check [[discord.Permissions]] for an exhaustive list of all permissions.
       * @returns `true` if the permission is granted, otherwise `false`.
       */
      canMember(member: GuildMember, permission: Permissions): boolean;
  
      /**
       * Returns the calculated role permissions for this channel.
       *
       * The permissions are calculated by finding the role in [[discord.GuildChannel.permissionOverwrites]] and applying on top of the everyone role permissions for the channel.
       *
       * Note: If you just want to see if a role has a permission, use [[discord.GuildChannel.canRole]].
       *
       * @param role The Role you want to calculate channel-specific permissions for.
       * @returns The permission bit set calculated for the given role.
       */
      getRolePermissions(role: Role): number;
  
      /**
       * Determines if a role can perform actions that require the permission specified in this channel.
       *
       * The permissions are calculated by finding the role in [[discord.GuildChannel.permissionOverwrites]] and applying on top of the everyone role permissions for the channel.
       *
       * @param role The Role you want to calculate channel-specific permissions for.
       * @param permission The permission you are checking for. Check [[discord.Permissions]] for an exhaustive list of all permissions.
       * @returns `true` if the permission is granted, otherwise `false`.
       */
      canRole(role: Role, permission: Permissions): boolean;
  
      /**
       * Returns a mention string in the format of `<#id>` where id is the id of this channel.
       *
       * Can be used in a message to render a link to this channel.
       */
      toMention(): string;
    }
  
    /* GuildCategory */
  
    namespace GuildCategory {
      interface IGuildCategoryOptions extends GuildChannel.IGuildChannelOptions {
        /**
         * Must not be modified for GuildCategory, it is always null.
         */
        parent?: null;
      }
    }
  
    /**
     * A category within a guild. Can be used to separate groups of channels under a single parent.
     *
     * Guild channels within categories will have a channel id specified on [[discord.GuildChannel.parentId]].
     */
    class GuildCategory extends GuildChannel {
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_CATEGORY]].
       */
      readonly type: Channel.Type.GUILD_CATEGORY;
  
      /**
       * Categories may not be nested, they will always have a null parentId.
       */
      readonly parentId: null;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildCategory.IGuildCategoryOptions): Promise<GuildCategory>;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
    }
  
    namespace GuildVoiceChannel {
      interface IGuildVoiceChannelOptions extends GuildChannel.IGuildChannelOptions {
        /**
         * The bitrate for this voice channel. Voice quality increases as this value is raised at the expense of bandwidth usage.
         *
         * The default is `64000`. Servers without boosts may raise this up to `96000`. Servers with boosts may raise higher depending on the [[discord.Guild.PremiumTier]].
         */
        bitrate?: number;
  
        /**
         * Limits the number of users that can connect to the voice channel.
         *
         * Members with the [[discord.Permissions.VOICE_MOVE_MEMBERS]] may override this limit.
         */
        userLimit?: number;
      }
    }
  
    /**
     * A voice channel within a [[discord.Guild]].
     */
    class GuildVoiceChannel extends GuildChannel {
      /**
       * The bitrate for this voice channel. Voice quality increases as this value is raised at the expense of bandwidth usage.
       *
       * The default is `64000`. Servers without boosts may raise this up to `96000`. Servers with boosts may raise higher depending on the [[discord.Guild.PremiumTier]].
       */
      readonly bitrate: number;
  
      /**
       * Limits the number of users that can connect to the voice channel.
       *
       * Members with the [[discord.Permissions.VOICE_MOVE_MEMBERS]] may override this limit.
       */
      readonly userLimit: number;
  
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_VOICE]].
       */
      readonly type: Channel.Type.GUILD_VOICE;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildVoiceChannel.IGuildVoiceChannelOptions): Promise<GuildVoiceChannel>;
  
      /**
       * Creates an invite for the channel. All properties of the `options` parameter are optional.
       *
       * @param options The settings to use for this invite. All parameters are optional.
       */
      createInvite(
        options?: discord.Invite.ICreateVoiceChannelInviteOptions
      ): Promise<discord.GuildInvite>;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
    }
  
    namespace GuildStageVoiceChannel {
      interface IGuildStageVoiceChannelOptions extends GuildChannel.IGuildChannelOptions {}
    }
  
    /**
     * A special [[discord.Guild]] voice channel for Community servers.
     *
     * In these channels, audience members can listen to users elected to the stage by moderators.
     */
    class GuildStageVoiceChannel extends GuildChannel {
      /**
       * The current topic set by Stage moderators for the session.
       *
       * May be changed by anyone with MANAGE_CHANNEL permissions.
       */
      readonly topic: string | null;
  
      /**
       * The bitrate of voice data for this channel.
       *
       * Stage Voice channels currently default to 40kbps (40000 bytes per second).
       */
      readonly bitrate: number;
  
      /**
       * Limits the number of users that can be active in the voice channel at once.
       *
       * Stage Voice channels currently default to 1000 maximum mebers.
       */
      readonly userLimit: number;
  
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_STAGE_VOICE]].
       */
      readonly type: Channel.Type.GUILD_STAGE_VOICE;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(
        updateData: GuildStageVoiceChannel.IGuildStageVoiceChannelOptions
      ): Promise<GuildStageVoiceChannel>;
  
      /**
       * Requests a voice session for this channel. Listen for [[discord.Event.VOICE_SERVER_UPDATE]] events for voice server connection information.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      voiceConnect(): Promise<void>;
    }
  
    namespace GuildTextChannel {
      interface IGuildTextChannelOptions extends GuildChannel.IGuildChannelOptions {
        /**
         * The topic displayed above this channel.
         */
        topic?: string;
        /**
         * If `true`, sets the NSFW setting to enabled for this channel.
         */
        nsfw?: boolean;
        /**
         * How often (in seconds) users are able to send messages.
         *
         * Note: Discord calls this "slow-mode".
         *
         * Setting to `null` or `0` will disable slow-mode.
         */
        rateLimitPerUser?: number | null;
      }
    }
  
    /**
     * A text chat channel within a [[discord.Guild]].
     */
    class GuildTextChannel extends GuildChannel implements ITextChannel {
      /**
       * The topic displayed above this channel.
       */
      readonly topic: string | null;
      /**
       * If `true`, sets the NSFW setting to enabled for this channel.
       */
      readonly nsfw: boolean;
      /**
       * How often (in seconds) users are able to send messages.
       *
       * The default value of `0` means the feature is disabled for this channel.
       *
       * Note: Discord calls this "slow-mode".
       */
      readonly rateLimitPerUser: number | null;
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_TEXT]].
       */
      readonly type: Channel.Type.GUILD_TEXT;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildTextChannel.IGuildTextChannelOptions): Promise<GuildTextChannel>;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
  
      /**
       * Attempts to fetch a single [[discord.Message]] (by id) from this channel.
       *
       * If no message is found, the Promise resolves as `null`.
       *
       * @param messageId The id of the message you wish to fetch data for.
       */
      getMessage(messageId: string): Promise<Message | null>;
  
      /**
       * Attempts to send a message with additional options (embed, tts, allowedMentions) to this channel.
       *
       * Note: `content` OR `embed` **must** be set on the options properties.
       *
       * See [[discord.Message.OutgoingMessageOptions]] for descriptions on possible options.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      sendMessage(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
  
      /**
       * Attempts to send a simple message from a string to this channel.
       *
       * Note: If you'd like to send an embed or pass additional options, see [[discord.Message.OutgoingMessageOptions]]
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param content Content to use for the outgoing message.
       */
      sendMessage(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
  
      /**
       * Attempts to send a message with only a [[discord.Embed]] attached.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      sendMessage(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Triggers the `*Username* is typing...` message to appear near the text input box for users focused on the channel.
       *
       * The typing indicator will last up to 15 seconds, or until the bot user sends a message in the channel. Whatever comes first.
       *
       * Typically unused by bots, but can be used to indicate a command response is "loading" or "processing."
       */
      triggerTypingIndicator(): Promise<void>;
  
      /**
       * Bulk-deletes messages from the channel. The bot must have `MANAGE_MESSAGES` permission in the channel to perform this action.
       *
       * You must supply no less than 2 and no greater than 100 messages to be deleted.
       *
       * If any supplied message is older than 2 weeks, the request will fail.
       *
       * Note: This action, when completed, will fire a [[discord.Event.MESSAGE_DELETE_BULK]] event.
       *
       * If an error occurs, a [[discord.ApiError]] exception will be thrown.
       *
       * @param messages An iterable (Array, Set, etc) of message ids to delete.
       *
       */
      bulkDeleteMessages(messages: Iterable<Snowflake>): Promise<void>;
    }
  
    namespace GuildNewsChannel {
      interface IGuildNewsChannelOptions extends GuildChannel.IGuildChannelOptions {
        /**
         * The topic displayed above this channel.
         */
        readonly topic?: string | null;
        /**
         * If `true`, sets the NSFW setting to enabled for this channel.
         */
        readonly nsfw?: boolean;
      }
    }
  
    /**
     * A special text channel that enables the use of the announcements system on Discord.
     */
    class GuildNewsChannel extends GuildChannel implements ITextChannel {
      /**
       * The topic displayed above this channel.
       */
      readonly topic: string | null;
      /**
       * If `true`, sets the NSFW setting to enabled for this channel.
       */
      readonly nsfw: boolean;
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_NEWS]].
       */
      readonly type: Channel.Type.GUILD_NEWS;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildNewsChannel.IGuildNewsChannelOptions): Promise<GuildNewsChannel>;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
  
      /**
       * Attempts to fetch a single [[discord.Message]] (by id) from this channel.
       *
       * If no message is found, the Promise resolves as `null`.
       *
       * @param messageId The id of the message you wish to fetch data for.
       */
      getMessage(messageId: string): Promise<Message | null>;
  
      /**
       * Attempts to send a message with additional options (embed, tts, allowedMentions) to this channel.
       *
       * Note: `content` OR `embed` **must** be set on the options properties.
       *
       * See [[discord.Message.OutgoingMessageOptions]] for descriptions on possible options.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      sendMessage(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
  
      /**
       * Attempts to send a simple message from a string to this channel.
       *
       * Note: If you'd like to send an embed or pass additional options, see [[discord.Message.OutgoingMessageOptions]]
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param content Content to use for the outgoing message.
       */
      sendMessage(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
  
      /**
       * Attempts to send a message with only a [[discord.Embed]] attached.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      sendMessage(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Triggers the `*Username* is typing...` message to appear near the text input box for users focused on the channel.
       *
       * The typing indicator will last up to 15 seconds, or until the bot user sends a message in the channel. Whatever comes first.
       *
       * Typically unused by bots, but can be used to indicate a command response is "loading" or "processing."
       */
      triggerTypingIndicator(): Promise<void>;
  
      /**
       * Bulk-deletes messages from the channel. The bot must have `MANAGE_MESSAGES` permission in the channel to perform this action.
       *
       * You must supply no less than 2 and no greater than 100 messages to be deleted.
       *
       * If any supplied message is older than 2 weeks, the request will fail.
       *
       * Note: This action, when completed, will fire a [[discord.Event.MESSAGE_DELETE_BULK]] event.
       *
       * If an error occurs, a [[discord.ApiError]] exception will be thrown.
       *
       * @param messages An iterable (array, set, etc) of message ids to delete.
       *
       */
      bulkDeleteMessages(messages: Iterable<Snowflake>): Promise<void>;
  
      /**
       * Attempts to publish a message in the announcements channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception will be thrown.
       */
      publishMessage(messageId: discord.Snowflake | discord.Message): Promise<discord.Message>;
    }
  
    namespace GuildStoreChannel {
      interface IGuildStoreChannelOptions extends GuildChannel.IGuildChannelOptions {}
    }
  
    /**
     * A special guild channel that enables commerce features. Typically used by studios utilizing Discord to distribute their game.
     */
    class GuildStoreChannel extends GuildChannel {
      /**
       * The type of this channel. Always [[Channel.Type.GUILD_STORE]].
       */
      readonly type: Channel.Type.GUILD_STORE;
  
      /**
       * Attempts to update the given options for this channel.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       *
       * @param updateData The settings to update for this channel.
       */
      edit(updateData: GuildStoreChannel.IGuildStoreChannelOptions): Promise<GuildStoreChannel>;
  
      /**
       * Attempts to delete the channel.
       *
       * If an error occurs, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
    }
  
    namespace Embed {
      // interface IDimensions {
      //   height?: number;
      //   width?: number;
      // }
  
      // interface IUrl {
  
      // }
  
      // interface IProxyUrl {
      //   proxyUrl?: string;
      // }
  
      interface IEmbedImage {
        /**
         * The external url of the embed image.
         *
         * Note: This property should only be set for outgoing embeds created by the bot.
         */
        url?: string;
        /**
         * The proxied embed image url.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly proxyUrl?: string;
        /**
         * The height of the embed image.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly height?: number;
        /**
         * The width of the embed image.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly width?: number;
      }
  
      interface IEmbedThumbnail {
        /**
         * The external url of the embed thumbnail image.
         *
         * Note: This property should only be set for outgoing embeds created by the bot.
         */
        url?: string;
        /**
         * The proxied thumbnail url.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly proxyUrl?: string;
        /**
         * The height of the thumbnail image.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly height?: number;
        /**
         * The width of the thumbnail image.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly width?: number;
      }
  
      interface IEmbedVideo {
        /**
         * The external source url pointing to the embed video.
         *
         * Note: This property should only be set for outgoing embeds created by the bot.
         */
        url?: string;
        /**
         * The height of the video.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly height?: number;
        /**
         * The width of the video.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly width?: number;
      }
  
      interface IEmbedProvider {
        /**
         * An external url that links from the provider's name.
         *
         */
        url?: string;
        /**
         * The name of the embed provider.
         */
        name?: string;
      }
  
      interface IEmbedAuthor {
        /**
         * An external url that links from the author's name.
         */
        url?: string;
        /**
         * The name of the author.
         */
        name?: string;
        /**
         * An external url that points to an image icon for the author. Renders next to the name.
         */
        iconUrl?: string;
        /**
         * Contains the Discord-proxied icon url.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly proxyIconUrl?: string;
      }
  
      interface IEmbedFooter {
        /**
         * Footer text for this embed.
         */
        text: string;
        /**
         * An external url that points to an image icon for the footer. Renders next to the text.
         *
         * Note: This property should only be set for outgoing embeds created by the bot.
         */
        iconUrl?: string;
        /**
         * Contains the Discord-proxied footer icon url.
         *
         * Note: Only appears on embeds returned from Discord's API
         */
        readonly proxyIconUrl?: string;
      }
  
      interface IEmbedField {
        /**
         * The name or heading of this field. Up to 256 characters.
         */
        name: string;
        /**
         * The value or body of this field. Up to 1024 characters.
         *
         * Supports partial markdown.
         */
        value: string;
        /**
         * `true` if this field should be rendered in-line.
         *
         * `false` (default) will always render fields on new lines.
         */
        inline?: boolean;
      }
  
      interface IEmbed {
        /**
         * The title of the embed.
         */
        title?: string;
        /**
         * The type of the embed.
         */
        type?: string;
        /**
         * The description text for the embed. Up to 2048 characters.
         */
        description?: string;
        /**
         * The url of the embed. It renders as a link on the name, if provided.
         */
        url?: string;
        /**
         * The ISO-8601 UTC timestamp for this embed.
         */
        timestamp?: string;
        /**
         * The numerically encoded RGB color code for this embed.
         */
        color?: number;
        /**
         * The footer for this embed. The text may be up to 2048 characters.
         */
        footer?: Embed.IEmbedFooter;
        /**
         * The image data for this embed.
         */
        image?: Embed.IEmbedImage;
        /**
         * The thumbnail data for this embed.
         */
        thumbnail?: Embed.IEmbedThumbnail;
        /**
         * The video data for this embed.
         */
        video?: Embed.IEmbedVideo;
        /**
         * The provider data for this embed.
         */
        provider?: Embed.IEmbedProvider;
        /**
         * The author data for this embed. The name field may be up to 256 characters.
         */
        author?: Embed.IEmbedAuthor;
        /**
         * An array of fields to be rendered on this embed.
         *
         * Field names may be up to 256 characters. Field values may be up to 1024 characters, and support markdown.
         */
        fields?: Array<Embed.IEmbedField>;
      }
    }
  
    /**
     * Discord allows us to send Rich Embed objects attached to messages that render as nice info boxes in chat.
     *
     * #### Example: Send an embed with some customization in response to an !info command.
     * ```ts
     * const commands = new discord.command.CommandGroup({
     *  defaultPrefix: '!'
     * });
     *
     * commands.registerCommand(
     *  "info",
     *  args => ({
     *    user: args.user()
     *  }),
     *  async ({ message }, { user }) => {
     *    // build the rich embed
     *    const richEmbed = new discord.Embed();
     *    richEmbed.setTitle(user.getTag()).setColor(0x00ff00);
     *    richEmbed.setDescription("User Information Example");
     *    richEmbed.setThumbnail({ url: user.getAvatarUrl() });
     *    richEmbed.addField({
     *      name: "User ID",
     *      value: user.id,
     *      inline: false
     *    });
     *    richEmbed.setTimestamp(new Date().toISOString());
     *    // reply to the command with our embed
     *    await message.reply({ content: "", embed: richEmbed });
     *  }
     *);
     *```
     */
    class Embed {
      /**
       * The title of the embed.
       */
      readonly title: string | null;
      /**
       * The type of the embed.
       */
      readonly type: string | null;
      /**
       * The description text for the embed. Up to 2048 characters.
       */
      readonly description: string | null;
      /**
       * The url of the embed. It renders as a link on the name, if provided.
       */
      readonly url: string | null;
      /**
       * The ISO-8601 UTC timestamp for this embed.
       */
      readonly timestamp: string | null;
      /**
       * The numerically encoded RGB color code for this embed.
       */
      readonly color: number | null;
      /**
       * The footer for this embed. The text may be up to 2048 characters.
       */
      readonly footer: Embed.IEmbedFooter | null;
      /**
       * The image data for this embed.
       */
      readonly image: Embed.IEmbedImage | null;
      /**
       * The thumbnail data for this embed.
       */
      readonly thumbnail: Embed.IEmbedThumbnail | null;
      /**
       * The video data for this embed.
       */
      readonly video: Embed.IEmbedVideo | null;
      /**
       * The provider data for this embed.
       */
      readonly provider: Embed.IEmbedProvider | null;
      /**
       * The author data for this embed. The name field may be up to 256 characters.
       */
      readonly author: Embed.IEmbedAuthor | null;
      /**
       * An array of fields to be rendered on this embed.
       *
       * Field names may be up to 256 characters. Field values may be up to 1024 characters, and support markdown.
       */
      readonly fields: Array<Embed.IEmbedField>;
  
      /**
       * Constructs an Embed instance with the data provided.
       *
       * @param init The options for this embed.
       */
      constructor(init?: Embed.IEmbed);
  
      /**
       * Sets the title of this embed.
       * @param title A new title for the embed. Must be no more than 256 characters.
       */
      setTitle(title: string | null): Embed;
      /**
       * Sets the type of this embed. Always `rich` for webhook embeds.
       * @param type The type of this embed.
       */
      setType(type: string | null): Embed;
      /**
       * Sets the description for this embed.
       *
       * May contain markdown-formatted text, including links.
       *
       * @param description The description for this embed. Up to 2048 characters.
       */
      setDescription(description: string | null): Embed;
      /**
       * Adds a link to the specified URL to the title of this embed.
       *
       * Note: Requires a title to be set.
       * @param url The url of this embed.
       * */
      setUrl(url: string | null): Embed;
      /**
       * A localized timestamp to render at the bottom of the embed.
       *
       * Should be set to a UTC time string in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss`)
       *
       * For example, `new Date().toISOString()` returns the current date and time in this format.
       * @param timestamp The ISO-8601 formatted timestamp string to set the embed timestamp to.
       */
      setTimestamp(timestamp: string | null): Embed;
      /**
       * Sets the color for this embed. An integer representation of a hexadecimal color code.
       *
       * The default color for roles (no color) is `0`.
       *
       * Note: You can set this to a hex color code using an integer represented in hex format.
       *
       * Example: `0xFF0000` (or `16711680`) is red.
       * @param color The integer representation of a color.
       */
      setColor(color: number | null): Embed;
      /**
       * Sets the footer for this embed. Rendered at the bottom of an embed.
       *
       * @param footer The footer for this embed. The text property may be up to 2048 characters.
       */
      setFooter(footer: Embed.IEmbedFooter | null): Embed;
      /**
       * Sets an image for this embed. If set, the image is typically rendered below the description and fields.
       *
       * You must only set the `url` property of the options sent to this function.
       *
       * @param image Embed image options.
       */
      setImage(image: Embed.IEmbedImage | null): Embed;
      /**
       * Sets a thumbnail for this embed. If set, the thumbnail is typically rendered to the right of the description and fields.
       *
       * You must only set the `url` property of the options sent to this function.
       * @param thumbnail Embed thumbnail options.
       */
      setThumbnail(thumbnail: Embed.IEmbedThumbnail | null): Embed;
      /**
       * Sets an video for this embed. If set, the video is typically rendered below the description and fields.
       *
       * You must only set the `url` property of the options sent to this function.
       * @param video Embed thumbnail options.
       */
      setVideo(video: Embed.IEmbedVideo | null): Embed;
      /**
       * Sets a provider for this embed. Contains a name and url.
       *
       * @param provider Embed provider options.
       */
      setProvider(provider: Embed.IEmbedProvider | null): Embed;
      /**
       * Sets the author options for this embed.
       *
       * You may set an author name, url and icon image url.
       *
       * @param author Embed author options.
       */
      setAuthor(author: Embed.IEmbedAuthor | null): Embed;
      /**
       * Replaces the array of [[discord.Embed.IEmbedField]] objects with the one provided.
       *
       * Note: You can add individual fields easily using [[discord.Embed.addField]].
       *
       * @param fields Array of field objects. Provide an empty array to clear the fields.
       */
      setFields(fields: Array<Embed.IEmbedField>): Embed;
  
      /**
       * Adds a field to the embed.
       *
       * Fields appear under the description. Inline fields may be rendered side-by-side depending on the screen width.
       *
       * @param field A field object.
       */
      addField(field: Embed.IEmbedField): Embed;
    }
  
    namespace Emoji {
      /**
       * A basic emoji descriptor.
       *
       * Guild emojis contain an id and custom name.
       *
       * Standard unicode emojis will have a null id with the name being the literal emoji characters.
       */
      interface IEmoji {
        /**
         * The id of the emoji, if set.
         */
        id: Snowflake | null;
        /**
         * The custom name of the emoji, or a literal unicode emoji.
         */
        name: string;
      }
  
      /**
       * Represents a custom emoji added to the guild.
       *
       * Custom emojis can be animated.
       *
       * Some rare custom emoji may be global, or may not require the use of colons if linked from twitch.
       */
      interface IGuildEmoji extends IEmoji {
        /**
         * The type of emoji this is. Always [[discord.Emoji.Type.GUILD]].
         */
        type: Emoji.Type.GUILD;
        /**
         * Discord's unique identifier for this emoji.
         */
        id: Snowflake;
        /**
         * The custom name of this emoji, example: `:name:`.
         */
        name: string;
        /**
         * If not empty, the roles in this array have access to the emoji.
         */
        roles?: Array<Snowflake>;
        /**
         * The user who uploaded the emoji.
         */
        user?: User;
        /**
         * If `true` (default), the emoji requires colons. You cannot change this field.
         */
        requireColons?: boolean;
        /**
         * If `true`, this emoji is managed by an integration and you cannot modify it.
         */
        managed?: boolean;
        /**
         * If `true`, this emoji is animated.
         */
        animated?: boolean;
      }
  
      /**
       * Represents a standard unicode emoji included with Discord.
       */
      interface IUnicodeEmoji extends IEmoji {
        /**
         * The type of this emoji. Always [[discord.Emoji.Type.UNICODE]].
         */
        type: Emoji.Type.UNICODE;
        /**
         * The unique identifier for this emoji. Always `null` for unicode emojis.
         */
        id: null;
        /**
         * The unicode representation of this emoji. Example: `ðŸŽ‰`
         */
        name: string;
      }
  
      /**
       * An enumeration of the possible types of emojis seen on Discord.
       */
      const enum Type {
        /**
         * See [[discord.Emoji.IGuildEmoji]].
         */
        GUILD = "GUILD",
        /**
         * See [[discord.Emoji.IUnicodeEmoji]].
         */
        UNICODE = "UNICODE",
      }
  
      /**
       * A type union of all possible emoji types.
       */
      type AnyEmoji = Emoji.IGuildEmoji | Emoji.IUnicodeEmoji;
  
      /**
       * Valid options to pass when modifying an existing guild emoji.
       */
      interface IEditEmojiOptions {
        /**
         * If included, will update the name of this emoji. Emoji names must be alpha-numeric (including dashes and underscores).
         */
        name?: string;
        /**
         * If included, updates the role access list for this emoji.
         *
         * If set to null, the access list will be removed and the emoji will be available to everyone in the guild.
         */
        roles?: Array<Snowflake> | null;
      }
    }
  
    /**
     * A class wrapper around emoji data. Can represent a unicode or custom emoji.
     */
    class Emoji implements Emoji.IEmoji, IMentionable {
      /**
       * Discord's unique identifier for this emoji.
       *
       * If null, the emoji is a unicode emoji and will only have the `name` and `type` property set.
       */
      readonly id: Snowflake | null;
      /**
       * The custom name for this emoji, if it's a guild emoji.
       *
       * Otherwise, the name is the literal emoji character(s). Example: `ðŸŽ‰`
       */
      readonly name: string;
      /**
       * The type of emoji this is.
       */
      readonly type: Emoji.Type;
      /**
       * If not empty, the roles in this array have access to the emoji.
       */
      readonly roles: Array<Snowflake>;
      /**
       * The user who uploaded the emoji.
       */
      readonly user: User | null;
      /**
       * If `true` (default), the emoji requires colons. You cannot change this field.
       */
      readonly requireColons: boolean;
      /**
       * If `true`, this emoji is managed by an integration and you cannot modify it.
       */
  
      readonly managed: boolean;
      /**
       * If `true`, this emoji is animated.
       */
      readonly animated: boolean;
  
      /**
       * @returns A message-ready string representation of the emoji.
       */
      toMention(): string;
  
      /**
       * Deletes the emoji from this guild.
       */
      delete(): Promise<void>;
  
      /**
       * Edits the emoji's options. You can't change the emoji's image, but the name and role list may be updated.
       *
       * Returns the new emoji data on success.
       */
      edit(options: discord.Emoji.IEditEmojiOptions): Promise<Emoji>;
    }
  
    /* Message */
  
    namespace Message {
      /**
       * An enumeration of possible message types.
       */
      const enum Type {
        /**
         * A default message. Contains text and/or embeds sent by a user, bot, or webhook.
         */
        DEFAULT = 0,
        /**
         * A message in a channel that denotes a message was pinned.
         */
        CHANNEL_PINNED_MESSAGE = 6,
        /**
         * A special message that appears in the system channel that a guild member has joined the server.
         */
        GUILD_MEMBER_JOIN = 7,
        /**
         * A special message that appears in the system channel when a member boosts a server.
         */
        USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
        /**
         * A special message that appears in the system channel when a guild is boosted to tier 1.
         */
        USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
        /**
         * A special message that appears in the system channel when a guild is boosted to tier 2.
         */
        USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
        /**
         * A special message that appears in the system channel when a guild is boosted to tier 3.
         */
        USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
        /**
         * A special message that appears in a channel when it begins following an announcements channel.
         */
        CHANNEL_FOLLOW_ADD = 12,
        /**
         * A default message that includes a reference to a message.
         */
        REPLY = 19,
      }
  
      /**
       * A bit flag set for messages, defines special properties or behavior.
       */
      const enum Flags {
        /**
         * Set if the message was published. Only valid for messages sent in [[discord.GuildNewsChannel]] channels.
         */
        CROSSPOSTED = 1 << 0,
        /**
         * Set if the message is a news message cross-posted from another server's [[discord.GuildNewsChannel]] channel.
         */
        IS_CROSSPOST = 1 << 1,
        /**
         * Set if the embed has been suppressed.
         */
        SUPPRESS_EMBEDS = 1 << 2,
      }
  
      /**
       * An enumeration of possible activity types associated with a [[discord.Message]].
       */
      const enum ActivityType {
        JOIN = 1,
        SPECTATE = 2,
        LISTEN = 3,
        JOIN_REQUEST = 5,
      }
  
      /**
       * An object that represents a unique emoji reaction on a [[discord.Message]].
       */
      interface IMessageReaction {
        /**
         * The number of times this emoji has been reacted with.
         */
        count: number;
        /**
         * `true` if the count includes a reaction from the current bot user.
         */
        me: boolean;
        /**
         * A reference to an emoji object used for this reaction.
         */
        emoji: Emoji;
      }
  
      /**
       * An object that represents channel data for a channel mentioned in a message.
       */
      interface IMessageChannelMention {
        /**
         * The id of the channel mentioned.
         */
        id: Snowflake;
        /**
         * The id of the guild this mentioned channel belongs to.
         */
        guildId: Snowflake;
        /**
         * The type of channel mentioned.
         */
        type: Channel.Type;
        /**
         * The name of the channel mentinoed.
         */
        name: string;
      }
  
      /**
       * An object that represents an attachment included with a message.
       */
      interface IMessageAttachment {
        /**
         * The unique identifier for this attachment.
         */
        id: Snowflake;
        /**
         * The attachment's file name.
         */
        filename: string;
        /**
         * The size of the attachment in bytes.
         */
        size: number;
        /**
         * The url where this attachment can be retrieved from.
         */
        url: string;
        /**
         * The proxied url for this attachment.
         */
        readonly proxyUrl: string;
        /**
         * If the attachment is a media file, the width of the image or video.
         */
        readonly height?: number;
        /**
         * If the attachment is a media file, the height of the image or video.
         */
        readonly width?: number;
      }
  
      /**
       * An object that represents an activity included with a message.
       */
      interface IMessageActivity {
        /**
         * The type of activity.
         */
        type: Message.ActivityType;
        /**
         * The party id others may use to join this activity, if provided.
         */
        partyId?: string;
      }
  
      /**
       * An object that represents an application included a message.
       */
      interface IMessageApplication {
        /**
         * The application's unique identifier.
         */
        id: Snowflake;
        /**
         * A cover image for activity embeds.
         */
        coverImage?: string;
        /**
         * The description for this application.
         */
        description: string;
        /**
         * The icon hash for this application.
         */
        icon: string | null;
        /**
         * The name of this application.
         */
        name: string;
      }
  
      /**
       * An object that represents a cross-link message reference. Used for announcement messages.
       */
      interface IMessageReference {
        /**
         * The message id of the cross-posted message.
         */
        messageId?: Snowflake;
        /**
         * The channel id of the cross-posted message.
         */
        channelId?: Snowflake;
        /**
         * The id of the guild where this cross-posted message originated.
         */
        guildId?: Snowflake;
      }
  
      /**
       * Describes outgoing attachment data.
       */
      interface IOutgoingMessageAttachment {
        /**
         * The name of the file, this is required.
         *
         * Example: `image.png`
         */
        name: string;
        /**
         * The contents of the file, in binary format.
         */
        data: ArrayBuffer;
      }
  
      /**
       * Options available for outgoing messages.
       *
       * Note: If an embed is not included, `content` must be included and greater than 0 characters long.
       *
       * See [[discord.Message.IAllowedMentions]] for more information on the `allowedMentions` property.
       */
      interface IOutgoingMessageOptions {
        /**
         * The message's text content.
         *
         * If the message has no embed, the content must be greater than 0 characters in length.
         */
        content?: string;
        /**
         * If `true`, clients with tts enabled and are focused on the channel will hear the message via text-to-speech.
         */
        tts?: boolean;
        /**
         * An optional [[discord.Embed]] to include with this message.
         *
         * If `null`, the embed will be removed. If removing the embed, you must send the content property.
         */
        embed?: Embed | null;
        /**
         * If set, will restrict the notifications sent with this message if mention strings are included.
         *
         * By default (undefined), the message will be allowed to ping all mentioned entities.
         *
         * It is highly recommended you specify this property when sending messages that include user input.
         *
         * Setting this property to an empty object (ex: `{}`) will prevent any messages from being sent. See [[discord.Message.IAllowedMentions]] for more details on the possible configurations for this property.
         */
        allowedMentions?: IAllowedMentions;
        /**
         * If set, will attempt to upload entries as file attachments to the message.
         */
        attachments?: Array<IOutgoingMessageAttachment>;
        /**
         * When this is set, the message will attempt to become an inline reply of the provided message reference.
         *
         * The message or snowflake set here must reference a message inside the channel being sent to, otherwise an error will be thrown.
         *
         * You can configure wether the author of the message referenced here gets pinged by setting allowedMentions with repliedMessage set to false.
         *
         * Setting this on a [[discord.Message.inlineReply]] call overrides it. Conversely, setting it to `null` suppresses it.
         */
        reply?: Message | Snowflake | Message.IMessageReference;
      }
  
      /**
       * A type-alias used to describe the possible options for message content. See [[discord.Message.IOutgoingMessageOptions]] for a full list of options.
       */
      type OutgoingMessageOptions = IOutgoingMessageOptions &
        (
          | { content: string }
          | { embed: Embed }
          | { embed?: null; content: string }
          | { attachments: Array<IOutgoingMessageAttachment> }
        );
  
      /**
       * Allowed mentions lets you fine-tune what mentions are notified in outgoing messages. It is highly recommended you include this option when sending message content containing user input.
       *
       * Setting this option to `{}` will block all mentions from notifying their targets.
       */
      interface IAllowedMentions {
        /**
         * If set to true, this message will be allowed to ping at-everyone.
         */
        everyone?: boolean;
        /**
         * If set to true, this message will be allowed to ping all role mentions.
         *
         * You may pass an array of role ids or role objects to whitelist a set of roles you'd like to restrict notifications to.
         */
        roles?: true | Array<Snowflake | Role>;
        /**
         * If set to true, this message will be allowed to ping all users mentioned.
         *
         * You may pass an array of user ids or user/guildMember objects to whitelist a set of users you'd like to restrict notifications to.
         */
        users?: true | Array<Snowflake | User | GuildMember>;
        /**
         * If set to true, this message will be allowed to ping the author of the referenced message for inline replies.
         *
         * If this isn't set, this is inferred to be true.
         */
        reply?: boolean;
      }
  
      /**
       * Options specified when calling [[discord.Message.iterReactions]].
       */
      interface IIterReactionsOptions {
        /**
         * If specified, will fetch users with ids numerically greater than than the one specified.
         */
        after?: Snowflake;
        /**
         * Limits the number of total requests the iterator will generate.
         *
         * Defaults to `100`.
         */
        limit?: number;
      }
  
      /**
       * A type alias to describe any message class type.
       */
      type AnyMessage = discord.Message | discord.GuildMemberMessage;
  
      /**
       * A type alias to describe possible outgoing message types.
       */
      type OutgoingMessage = string | OutgoingMessageOptions | Embed;
  
      /**
       * A type alias to describe the possible configurations to use when sending a message.
       *
       * If a Promise-like type is used, the bot will send a typing indicator for the channel before resolving the Promise and sending its content.
       */
      type OutgoingMessageArgument<T extends OutgoingMessage> = T | Promise<T> | (() => Promise<T>);
    }
  
    class Message {
      /**
       * The unique id for this message. The id can be used to find the time the message was created.
       */
      readonly id: Snowflake;
      /**
       * The id of the text channel this message was sent in.
       *
       * Note: You can fetch the full channel data with [[discord.Message.getChannel]].
       */
      readonly channelId: Snowflake;
      /**
       * The id of the guild this message was sent in. Will be `null` for messages sent in [[discord.DMChannel]] DM channels.
       *
       * Note: You can fetch the full guild data with [[discord.Message.getGuild]].
       */
      readonly guildId: Snowflake | null;
      /**
       * The text content of this message.
       *
       * May contain up to 2000 characters.
       */
      readonly content: string;
      /**
       * An array of embeds included with this message.
       */
      readonly embeds: Array<discord.Embed>;
      /**
       * The author of this message, if any.
       */
      readonly author: User;
      /**
       * If the message was sent in a guild, the [[discord.GuildMember]] who sent this message.
       */
      readonly member: GuildMember | null;
      /**
       * The timestamp at which this message was sent at, in ISO-8601 format.
       */
      readonly timestamp: string;
      /**
       * The timestamp at which the message was last edited at, in ISO-8601 format.
       */
      readonly editedTimestamp: string | null;
      /**
       * `true` if this message mentions everyone.
       */
      readonly mentionEveryone: boolean;
      /**
       * An array of user objects, containing partial member objects, of users mentioned in this message.
       */
      readonly mentions: Array<User & { member: Omit<GuildMember, "user"> }>;
      /**
       * An array of role ids mentioned in this channel.
       */
      readonly mentionRoles: Array<Snowflake>;
      /**
       * An array of partial channel objects mentioned in this channel.
       */
      readonly mentionChannels: Array<Message.IMessageChannelMention>;
      /**
       * An array of attachments sent with this message.
       */
      readonly attachments: Array<Message.IMessageAttachment>;
      /**
       * An array of emoji reactions added to this message.
       */
      readonly reactions: Array<Message.IMessageReaction>;
      /**
       * `true` if this message is pinned to the channel.
       */
      readonly pinned: boolean;
      /**
       * The id of the webhook that sent this message. `null` if this message was not sent by a webhook.
       */
      readonly webhookId: Snowflake | null;
      /**
       * The type of message this is. See [[discord.Message.Type]] for a list of possible values.
       */
      readonly type: Message.Type;
      /**
       * The activity object included with this message, if set.
       */
      readonly activity: Message.IMessageActivity | null;
      /**
       * The application metadata used to render activity data for a message, if set.
       */
      readonly application: Message.IMessageApplication | null;
      /**
       * The original message reference for cross-posted announcement messages.
       */
      readonly messageReference: Message.IMessageReference | null;
      /**
       * A bit set of flags containing more information for this message.
       */
      readonly flags: Message.Flags | null;
  
      /**
       * Fetches data for the channel this message was sent in.
       */
      getChannel(): Promise<
        discord.DmChannel | (discord.GuildTextChannel | discord.GuildNewsChannel)
      >;
  
      /**
       * Fetches the data for the guild this message was sent in.
       *
       * If the message was not sent in a guild, the Promise resolves as `null`.
       */
      getGuild(): Promise<Guild | null>;
  
      /**
       * Attempts to send a message with additional options (embed, tts, allowedMentions) to the channel this message was sent in.
       *
       * Note: `content` OR `embed` **must** be set on the options properties.
       *
       * See [[discord.Message.OutgoingMessageOptions]] for descriptions on possible options.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      reply(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
      /**
       * Attempts to send a simple text message to the channel this message was sent in.
       *
       * Note: If you'd like to send an embed or pass additional options, see [[discord.Message.OutgoingMessageOptions]]
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param content Content to use for the outgoing message.
       */
      reply(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
      /**
       * Attempts to send an [[discord.Embed]] to the channel this message was sent in.
       *
       * If an error occurs sending this message, a [[discord.ApiError]] exception will be thrown.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      reply(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Does the same thing as .reply, but adds an inline reply referencing this message.
       *
       * If reply is set on the settings resolved by outgoingMessageOptions, then that will override the inline reply set by this function.
       *
       * @param outgoingMessageOptions Outgoing message options.
       */
      inlineReply(
        outgoingMessageOptions: Message.OutgoingMessageArgument<Message.OutgoingMessageOptions>
      ): Promise<Message>;
      /**
       * Does the same thing as .reply, but adds an inline reply referencing this message.
       *
       * @param content Content to use for the outgoing message.
       */
      inlineReply(content: Message.OutgoingMessageArgument<string>): Promise<Message>;
      /**
       * Does the same thing as .reply, but adds an inline reply referencing this message.
       *
       * @param embed The embed object you'd like to send to the channel.
       */
      inlineReply(embed: Message.OutgoingMessageArgument<Embed>): Promise<Message>;
  
      /**
       * Attempts to permanently delete this message.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       */
      delete(): Promise<void>;
  
      /**
       * Provides an async iterator over a list of users that reacted to the message with the given emoji.
       */
      iterReactions(
        emoji: string,
        options?: Message.IIterReactionsOptions
      ): AsyncIterableIterator<User>;
  
      /**
       * Reacts to this message with the specified emoji.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param emoji If passing a string, use a raw unicode emoji like âœ…, or a custom emoji in the format of `name:id`.
       */
      addReaction(emoji: string | discord.Emoji.IEmoji): Promise<void>;
  
      /**
       * Deletes the bot user's own reaction to this message of the specified emoji.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param emoji If passing a string, use a raw unicode emoji like âœ…, or a custom emoji in the format of `name:id`.
       */
      deleteOwnReaction(emoji: string | discord.Emoji.IEmoji): Promise<void>;
  
      /**
       * Deletes a user's reaction to the message.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param emoji If passing a string, use a raw unicode emoji like âœ…, or a custom emoji in the format of `name:id`.
       * @param user A user id or reference to a user object.
       */
      deleteReaction(
        emoji: string | discord.Emoji.IEmoji,
        user: discord.Snowflake | discord.User
      ): Promise<void>;
  
      /**
       * Deletes all the reactions on this message.
       *
       * Note: Will fire a [[Event.MESSAGE_REACTION_REMOVE_ALL]] event, if registered.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       */
      deleteAllReactions(): Promise<void>;
  
      /**
       * Deletes all reactions for the emoji specified on this message.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param emoji If passing a string, use a raw unicode emoji like âœ…, or a custom emoji in the format of `name:id`.
       */
      deleteAllReactionsForEmoji(emoji: string | discord.Emoji.IEmoji): Promise<void>;
  
      /**
       * Attempts to edit a message. Messages may only be edited by their author.
       *
       * If you wish to remove an embed from the message, set the `embed` property to null.
       * The message content may be set to an empty string only if the message has or is receiving an embed with the edit.
       *
       * Note: You may not modify `allowedMentions` or `tts` when editing a message, these only apply when a message is initially received.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param messageOptions New message options for this message.
       * @returns On success, the Promise resolves as the new message object.
       */
      edit(
        messageOptions: Pick<Message.OutgoingMessageOptions, "content" | "embed"> & { flags?: number }
      ): Promise<Message>;
  
      /**
       * Attempts to edit a message. Replaces the content with the new provided content.
       *
       * Messages may only be edited if authored by the bot.
       *
       * Note: If you'd like more options (embeds, allowed mentions, etc) see [[discord.Message.OutgoingMessageOptions]].
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param content New content for this message.
       * @returns On success, the Promise resolves as the new message object.
       */
      edit(content: string): Promise<Message>;
  
      /**
       * Attempts to edit a message. Sets the content to an empty string and adds or updates the embed associated with this message.
       *
       * Messages may only be edited if authored by the bot.
       *
       * If an error occurred, a [[discord.ApiError]] exception is thrown.
       *
       * @param embed A new [[discord.Embed]] for this message.
       * @returns On success, the Promise resolves as the new message object.
       */
      edit(embed: Embed): Promise<Message>;
  
      /**
       * Changes the pinned status of this message.
       *
       * @param pinned `true` if the message should be pinned, otherwise `false`.
       */
      setPinned(pinned: boolean): Promise<void>;
    }
  
    class GuildMemberMessage extends Message {
      /**
       * The id of the guild this message was sent in. Always set for messages of this type.
       *
       * Note: You can fetch the full guild data with [[discord.Message.getGuild]].
       */
      readonly guildId: Snowflake;
      /**
       * The author of this message. Always set for messages of this type.
       */
      readonly author: User;
      /**
       * The guild member who authored this message. Always set for messages of this type.
       */
      readonly member: GuildMember;
      /**
       * The webhook id that created this message. Always `null` for messages of this type.
       */
      readonly webhookId: null;
  
      /**
       * Messages of this type are always [[Message.Type.DEFAULT]] or [[Message.Type.REPLY]].
       */
      readonly type: Message.Type.DEFAULT | Message.Type.REPLY;
  
      /**
       * Fetches the data for the guild this message was sent in.
       *
       * If the message was not sent in a guild, the Promise resolves as `null`.
       */
      getGuild(): Promise<discord.Guild>;
  
      /**
       * Fetches data for the channel this message was sent in.
       */
      getChannel(): Promise<discord.GuildTextChannel | discord.GuildNewsChannel>;
    }
  
    /**
     * An object representing an invite on Discord.
     *
     * Invites typically appear as links (ex: discord.gg/hC6Bbtj) where the code is a unique and random string of alpha-numeric characters.
     *
     * Since Group DMs may create invites, some properties on the invite object are nullable.
     */
    class Invite {
      /**
       * The unique identifier for this invite. May be used by user accounts to join a guild or group dm.
       */
      readonly code: Snowflake;
      /**
       * Partial guild data for this invite, if relevant.
       */
      readonly guild: Invite.GuildData | null;
      /**
       * Partial channel data for this invite.
       *
       * Users who use this invite will be redirected to the channel id.
       */
      readonly channel: Invite.ChannelData;
      /**
       * The user object who created this invite, if relevant.
       */
      readonly inviter: discord.User | null;
      /**
       * A user that the invite targets.
       *
       * Right now, this only indiicates if the invite is for a specific user's go-live stream in a guild's voice channel.
       */
      readonly targetUser: discord.User | null;
      /**
       * If `targetUser` is set, this property specifies the type of invite and user this targets.
       *
       * Right now, the only possible option is [[discord.Invite.TargetUserType.STREAM]].
       */
      readonly targetUserType: discord.Invite.TargetUserType.STREAM | null;
      /**
       * If the invite is for a guild, this includes an approximate count of members online in the guild.
       *
       * Requires that the invite was retrieved with [[discord.Invite.IGetGuildOptions.withCounts]] set to `true`.
       */
      readonly approximatePresenceCount: number | null;
      /**
       * If the invite is for a guild channel, this number is the approximate total member count for the guild.
       *
       * Requires that the invite was retrieved with [[discord.Invite.IGetGuildOptions.withCounts]] set to `true`.
       */
      readonly approximateMemberCount: number | null;
  
      /**
       * Returns a url for the invite, in the format: `https://discord.gg/<code>`.
       */
      getUrl(): string;
  
      /**
       * Attempts to retrieve the full Guild object for this invite, if set.
       *
       * This function will also return `null` if the channel does not belong to the guild the script is running in.
       */
      getGuild(): Promise<discord.Guild | null>;
  
      /**
       * Attempts to retrieve the full Channel object for this invite.
       *
       * This function will return `null` if the channel does not belong to the guild the script is running in.
       */
      getChannel(): Promise<discord.Channel.AnyGuildChannel | null>;
  
      /**
       * Tries to delete this invite. The bot user must be able to manage the channel or guild the invite belongs.
       *
       * If an error occurs, a [[discord.ApiError]] will be thrown.
       */
      delete(): Promise<void>;
    }
  
    /**
     * An object representing an invite on Discord for a channel in a [[discord.Guild]]. Extends [[discord.Invite]]
     */
    class GuildInvite extends Invite {
      /**
       * Partial data about the guild the invite originated from.
       */
      readonly guild: discord.Invite.GuildData;
  
      /**
       * Never set for a GuildInvite
       */
      readonly approximatePresenceCount: null;
  
      /**
       * Never set for a GuildInvite
       */
      readonly approximateMemberCount: null;
  
      /**
       * The number of times this invite has been used.
       */
      readonly uses: number;
      /**
       * The configured maximum amount of times the invite is used before the invite expires. `0` for no limit.
       */
      readonly maxUses: number;
      /**
       * The maximum duration (in seconds) after which the invite expires. `0` for never.
       */
      readonly maxAge: number;
      /**
       * If `true`, the invite only grants temporary membership to the guild. Default is `false`.
       */
      readonly temporary: boolean;
      /**
       * An ISO-8601 formatted timestamp string of when the invite was created.
       */
      readonly createdAt: string;
  
      /**
       * Attempts to retrieve the full Guild object for this invite.
       */
      getGuild(): Promise<discord.Guild>;
  
      /**
       * Attempts to retrieve the full Channel object for this invite.
       */
      getChannel(): Promise<discord.Channel.AnyGuildChannel>;
    }
  
    namespace Invite {
      /**
       * Possible options for [[discord.getInvite]].
       */
      interface IGetInviteOptions {
        /**
         * If `true`, the invite will be returned with additional information on the number of members total and online.
         */
        withCounts?: boolean;
      }
  
      /**
       * Options used when creating an invite, typically with [[discord.GuildChannel.createInvite]].
       */
      interface ICreateInviteOptions {
        /**
         * The lifetime of this invite, in seconds. `0` for never.
         *
         * Default: `86400` (24 hours)
         */
        maxAge?: number;
        /**
         * The maximum number of times this invite can be used before deleting itself.
         *
         * Default: `0` (unlimited)
         */
        maxUses?: number;
        /**
         * If `true`, this invite will allow for temporary membership to the guild.
         *
         * The user will be kicked from the guild if they go offline and haven't been given a role.
         *
         * Default: `false`
         */
        temporary?: boolean;
        /**
         * If `true`, the invite is guaranteed to be new and unique.
         *
         * Otherwise, a recently created similar invite may be returned.
         *
         * Default: `false`
         */
        unique?: boolean;
      }
  
      /**
       * Options used when creating an invite, typically with [[discord.GuildChannel.createInvite]].
       */
      interface ICreateVoiceChannelInviteOptions extends ICreateInviteOptions {
        /**
         * The target user id for this invite. The target user must be streaming video in a channel.
         *
         * The invite created will resolved specifically to the broadcast rather than just the voice channel.
         */
        targetUser?: discord.Snowflake;
        /**
         * Specifies the type of invite and user this targets.
         *
         *  Right now, the only possible option is [[discord.Invite.TargetUserType.STREAM]].
         */
        targetUserType?: discord.Invite.TargetUserType;
      }
  
      /**
       * An enumeration of possible sub-types the invite can specify. These invites will usually have a [[discord.Invite.targetUser]] set.
       */
      enum TargetUserType {
        /**
         * Used to indicate the invite is targetting a go-live or live video broadcast in a [[discord.GuildVoiceChannel]].
         *
         * The [[discord.Invite.targetUser]] will identify the user streaming.
         */
        STREAM = 1,
      }
  
      /**
       * Partial guild data present on some invite data.
       */
      type GuildData = {
        /**
         * The id of the [[discord.Guild]].
         */
        readonly id: Snowflake;
        /**
         * The name of the guild.
         */
        readonly name: string;
        /**
         * The splash image hash of the guild, if set.
         */
        readonly splash: string | null;
        /**
         * The icon of the guild, if set. See [[discord.Guild.icon]] for more info.
         */
        readonly icon: string | null;
        /**
         * A list of features available for this guild. See [[discord.Guild.features]] for more info.
         */
        readonly features: Array<discord.Guild.Feature>;
        /**
         * The level of user account verification required to send messages in this guild without a role.
         */
        readonly verificationLevel: discord.Guild.MFALevel;
        /**
         * The vanity url invite code for this guild, if set.
         */
        readonly vanityUrlCode: string | null;
      };
  
      /**
       * Partial channel data present on channel data.
       */
      type ChannelData = {
        /**
         * The id of the [[discord.Channel]] this data represents.
         */
        readonly id: Snowflake;
        /**
         * The name of the channel.
         */
        readonly name: string;
        /**
         * The type of channel the invite resolves to.
         */
        readonly type: Channel.Type;
      };
    }
  
    namespace VoiceState {
      /**
       * The options for a voice state.
       *
       * These are currently used for Guild Stage Voice channels. Behavior is *subject to change* as the new channel type evolves.
       */
      interface IVoiceStateEditOptions {
        /**
         * Set if the user is suppressed.
         */
        suppress?: boolean;
        /**
         * Set's the voice state's request to speak timestamp.
         *
         * If set to null, the request is removed.
         *
         * Note: Only valid for Guild Stage Voice channels.
         */
        requestToSpeakTimestamp?: string | null;
      }
    }
  
    /**
     * A class representing a user's voice state.
     */
    class VoiceState {
      /**
       * The guild id this voice state is targeting.
       */
      readonly guildId: Snowflake;
      /**
       * The id of the [[discord.GuildVoiceChannel]]. If `null`, it indicates the user has disconnected from voice.
       */
      readonly channelId: Snowflake | null;
      /**
       * The id of the [[discord.User]] this voice state applies to.
       */
      readonly userId: Snowflake;
      /**
       * A reference to the [[discord.GuildMember]] this voice state applies to.
       */
      readonly member: GuildMember;
      /**
       * The session id associated with this user's voice connection.
       */
      readonly sessionId?: string;
      /**
       * `true` if the user has been server-deafened.
       *
       * They will not be sent any voice data from other users if deafened.
       */
      readonly deaf: boolean;
      /**
       * `true` if the user has been server-muted.
       *
       * They will not transmit voice data if muted.
       */
      readonly mute: boolean;
      /**
       * `true if the user has opted to deafen themselves via the client.
       *
       * They will not receive or be sent any voice data from other users if deafened.
       */
      readonly selfDeaf: boolean;
      /**
       * `true` if the user has opted to mute their microphone via the client.
       *
       * They will not transmit voice audio if they are self-muted.
       */
      readonly selfMute: boolean;
      /**
       * `true` if the user is currently streaming to the channel using Go Live.
       */
      readonly selfStream: boolean;
      /**
       * `true` if the user's camera is enabled.
       */
      readonly selfVideo: boolean;
      /**
       * `true` if the user is muted by the current user.
       */
      readonly suppress: boolean;
      /**
       * The time at which the user requested to speak (used for GUILD_STAGE_VOICE channel hand-raising).
       *
       * Note: The timestamp is in ISO-8601 UTC format (`YYYY-MM-DDTHH:mm:ss`).
       */
      readonly requestToSpeakTimestamp: string | null;
      /**
       * Fetches data for the guild associated with this voice state.
       */
      getGuild(): Promise<discord.Guild>;
      /**
       * If `channelId` is not null, will fetch the channel data associated with this voice state.
       */
      getChannel(): Promise<discord.GuildVoiceChannel | discord.GuildStageVoiceChannel | null>;
      /**
       * Updates a voice state with the options provided. Only valid for voice states in Guild Stage Voice channels.
       */
      edit(options: discord.VoiceState.IVoiceStateEditOptions): Promise<void>;
    }
  
    /**
     * An enumeration of possible Discord events and generic event data interfaces.
     *
     * See [[discord.on]] for more information on registering event handlers.
     */
    namespace Event {
      /**
       * Common event data for [[Event.MESSAGE_DELETE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IMessageDelete {
        /**
         * The id of the deleted message
         */
        id: Snowflake;
        /**
         * The id of the [[discord.ITextChannel]] the messages were deleted from.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         *
         * Note: will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
      }
  
      /**
       * Common event data for [[Event.MESSAGE_DELETE_BULK]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IMessageDeleteBulk {
        /**
         * The ids of the deleted messages
         */
        ids: Array<Snowflake>;
        /**
         * The id of the [[discord.ITextChannel]] the messages were deleted from.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in, if any.
         *
         * Note: will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
      }
  
      /**
       * Common event data for [[Event.MESSAGE_REACTION_ADD]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IMessageReactionAdd {
        /**
         * The id of the [[discord.User]] that reacted on the message.
         */
        userId: Snowflake;
        /**
         * The id of the [[discord.ITextChannel]] the message resides in.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Message]] this event was fired on.
         */
        messageId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in, if any.
         *
         * Note: will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
        /**
         * An instance of [[discord.GuildMember]] for the user. Requires [[guildId]] to present.
         *
         * Note: will be undefined if the event occurred in a [[discord.DMChannel]].
         */
        member?: GuildMember;
        /**
         * A partial [[discord.Emoji]] instance containing data about the emoji the user reacted with.
         */
        emoji: Partial<Emoji>;
      }
  
      /**
       * Common event data for [[Event.MESSAGE_REACTION_REMOVE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IMessageReactionRemove {
        /**
         * The id of the [[discord.User]] that removed a reaction on the message.
         */
        userId: Snowflake;
        /**
         * The id of the [[discord.ITextChannel]] the message resides in.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Message]] this event was fired on.
         */
        messageId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in, if any.
         *
         * Note: will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
        /**
         * An instance of [[discord.GuildMember]] for the user. Requires [[guildId]] to present.
         *
         * Note: will be undefined if the event occurred in a [[discord.DMChannel]].
         */
        member?: GuildMember;
        /**
         * A partial [[discord.Emoji]] instance containing data about the emoji the user reacted with.
         */
        emoji: Partial<Emoji>;
      }
  
      /**
       * Common event data for [[Event.MESSAGE_REACTION_REMOVE_ALL]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IMessageReactionRemoveAll {
        /**
         * The id of the [[discord.ITextChannel]] the message resides in.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Message]] this event was fired on.
         */
        messageId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in, if any.
         *
         * Note: will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
      }
  
      /**
       * Common event data for [[Event.GUILD_MEMBER_REMOVE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildMemberRemove {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * A [[discord.User]] instance containing data about the user that left the guild.
         */
        user: User;
      }
  
      /**
       * Common event data for [[Event.GUILD_EMOJIS_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildEmojisUpdate {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * An array of all the [[discord.Emoji]]s this guild contains.
         */
        emojis: Array<Emoji>;
      }
  
      /**
       * Common event data for [[Event.GUILD_INTEGRATIONS_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildIntegrationsUpdate {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
      }
  
      /**
       * Common event data for [[Event.GUILD_ROLE_CREATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildRoleCreate {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * An instance of [[discord.Role]] containing data on the created role.
         */
        role: Role;
      }
  
      /**
       * Common event data for [[Event.GUILD_ROLE_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildRoleUpdate {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * An instance of [[discord.Role]] containing updated role data.
         */
        role: Role;
      }
  
      /**
       * Common event data for [[Event.GUILD_ROLE_DELETE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IGuildRoleDelete {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * The id of the deleted role.
         */
        roleId: Snowflake;
      }
  
      /**
       * Common event data for [[Event.TYPING_START]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface ITypingStart {
        /**
         * The id of the [[discord.ITextChannel]] this event occurred in.
         */
        channelId: Snowflake;
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         *
         * Note: Will be undefined if the event occurred in a [[discord.DMChannel]].
         */
        guildId?: Snowflake;
        /**
         * The id of the [[discord.User]] that started typing.
         */
        userId: Snowflake;
        /**
         * The unix-epoch timestamp of the time the user started typing.
         */
        timestamp: number;
        /**
         * A [[discord.GuildMember]] instance of the user who started typing.
         *
         * Note: Requires [[guildId]] to be set.
         */
        member?: GuildMember;
      }
  
      /**
       * Common event data for [[Event.WEBHOOKS_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IWebhooksUpdate {
        /**
         * The id of the [[discord.Guild]] this event occurred in.
         */
        guildId: Snowflake;
        /**
         * The id of the [[discord.ITextChannel]] this event occurred in.
         */
        channelId: Snowflake;
      }
  
      /**
       * Common event data for [[Event.CHANNEL_PINS_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IChannelPinsUpdate {
        /**
         * The id of the [[discord.Guild]] this event occurred in, if any.
         *
         * Note: Will be undefined if the event occurred in a DM channel.
         */
        guildId?: Snowflake;
        /**
         * The id of the [[discord.ITextChannel]] this event occurred in.
         */
        channelId: Snowflake;
        /**
         * The date and time a message was last pinned in ISO-8601 UTC format (`YYYY-MM-DDTHH:mm:ss`).
         */
        lastPinTimestamp?: string;
      }
  
      /**
       * Common event data for [[Event.VOICE_SERVER_UPDATE]]. Passed as a parameter when you register an associated event with [[discord.on]].
       */
      interface IVoiceServerUpdate {
        /**
         * Voice connection token.
         */
        token: string;
        /**
         * The id of the [[discord.Guild]] this voice server update is for.
         */
        guildId: Snowflake;
        /**
         * The voice server host.
         */
        endpoint: string;
      }
    }
  
    /**
     * A enumeration of events to register event handlers for with [[discord.on]].
     */
    const enum Event {
      /**
       * See [[discord.on]] for information on how to register a CHANNEL_CREATE event handler.
       */
      CHANNEL_CREATE = "CHANNEL_CREATE",
      /**
       * See [[discord.on]] for information on how to register a CHANNEL_UPDATE event handler.
       */
      CHANNEL_UPDATE = "CHANNEL_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a CHANNEL_DELETE event handler.
       */
      CHANNEL_DELETE = "CHANNEL_DELETE",
      /**
       * See [[discord.on]] for information on how to register a CHANNEL_PINS_UPDATE event handler.
       */
      CHANNEL_PINS_UPDATE = "CHANNEL_PINS_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_CREATE event handler.
       */
      GUILD_CREATE = "GUILD_CREATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_UPDATE event handler.
       */
      GUILD_UPDATE = "GUILD_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_BAN_ADD event handler.
       */
      GUILD_BAN_ADD = "GUILD_BAN_ADD",
      /**
       * See [[discord.on]] for information on how to register a GUILD_BAN_REMOVE event handler.
       */
      GUILD_BAN_REMOVE = "GUILD_BAN_REMOVE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_EMOJIS_UPDATE event handler.
       */
      GUILD_EMOJIS_UPDATE = "GUILD_EMOJIS_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_INTEGRATIONS_UPDATE event handler.
       */
      GUILD_INTEGRATIONS_UPDATE = "GUILD_INTEGRATIONS_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_MEMBER_ADD event handler.
       */
      GUILD_MEMBER_ADD = "GUILD_MEMBER_ADD",
      /**
       * See [[discord.on]] for information on how to register a GUILD_MEMBER_UPDATE event handler.
       */
      GUILD_MEMBER_UPDATE = "GUILD_MEMBER_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_MEMBER_REMOVE event handler.
       */
      GUILD_MEMBER_REMOVE = "GUILD_MEMBER_REMOVE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_ROLE_CREATE event handler.
       */
      GUILD_ROLE_CREATE = "GUILD_ROLE_CREATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_ROLE_UPDATE event handler.
       */
      GUILD_ROLE_UPDATE = "GUILD_ROLE_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a GUILD_ROLE_DELETE event handler.
       */
      GUILD_ROLE_DELETE = "GUILD_ROLE_DELETE",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_CREATE event handler.
       */
      MESSAGE_CREATE = "MESSAGE_CREATE",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_UPDATE event handler.
       */
      MESSAGE_UPDATE = "MESSAGE_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_DELETE event handler.
       */
      MESSAGE_DELETE = "MESSAGE_DELETE",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_DELETE_BULK event handler.
       */
      MESSAGE_DELETE_BULK = "MESSAGE_DELETE_BULK",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_REACTION_ADD event handler.
       */
      MESSAGE_REACTION_ADD = "MESSAGE_REACTION_ADD",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_REACTION_REMOVE event handler.
       */
      MESSAGE_REACTION_REMOVE = "MESSAGE_REACTION_REMOVE",
      /**
       * See [[discord.on]] for information on how to register a MESSAGE_REACTION_REMOVE_ALL event handler.
       */
      MESSAGE_REACTION_REMOVE_ALL = "MESSAGE_REACTION_REMOVE_ALL",
      /**
       * See [[discord.on]] for information on how to register a TYPING_START event handler.
       */
      TYPING_START = "TYPING_START",
      /**
       * See [[discord.on]] for information on how to register a USER_UPDATE event handler.
       */
      USER_UPDATE = "USER_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a VOICE_STATE_UPDATE event handler.
       */
      VOICE_STATE_UPDATE = "VOICE_STATE_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a VOICE_SERVER_UPDATE event handler.
       */
      VOICE_SERVER_UPDATE = "VOICE_SERVER_UPDATE",
      /**
       * See [[discord.on]] for information on how to register a WEBHOOKS_UPDATE event handler.
       */
      WEBHOOKS_UPDATE = "WEBHOOKS_UPDATE",
    }
  
    /**
     * Fired when new messages are sent in any channel the current bot can read.
     *
     * #### Example: Log all messages to the developer console, and respond to "foo" with "bar".
     * ```ts
     * discord.on("MESSAGE_CREATE", async (message) => {
     *   console.log(message);
     *
     *   if (message.content === "foo") {
     *     await message.reply("bar");
     *   }
     * });
     * ```
     *
     * Note: If you want to create commands, please make use of the command handlers found in [[discord.command]].
     *
     * Note: MESSAGE_CREATE events will not be fired for messages sent by the bot itself.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_CREATE | "MESSAGE_CREATE",
      handler: (message: Message.AnyMessage) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a message is edited or otherwise updated.
     *
     * Note: This event is fired for messages containing embedded links when the unfurl is complete. In this case, the new message object contains the unfurled embed.
     * If you want to see if a user edited a message's content, diff the [[Message.content]] property.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_UPDATE | "MESSAGE_UPDATE",
      handler: (
        message: Message.AnyMessage,
        oldMessage: Message.AnyMessage | null
      ) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a message is deleted from a channel.
     *
     * If the message data pre-deletion was cached, it will be returned as the second parameter to the handler.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_DELETE | "MESSAGE_DELETE",
      handler: (
        event: Event.IMessageDelete,
        oldMessage: Message.AnyMessage | null
      ) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a message is deleted from a channel.
     *
     * If the message data pre-deletion was cached, it will be returned as the second parameter to the handler.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_DELETE_BULK | "MESSAGE_DELETE_BULK",
      handler: (event: Event.IMessageDeleteBulk) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a reaction is added to a message.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_REACTION_ADD | "MESSAGE_REACTION_ADD",
      handler: (event: Event.IMessageReactionAdd) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a user's reaction is removed from a message
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_REACTION_REMOVE | "MESSAGE_REACTION_REMOVE",
      handler: (event: Event.IMessageReactionRemove) => Promise<unknown>
    ): void;
  
    /**
     * Fired when all reactions on a message are removed at once.
     *
     * @event
     */
    function on(
      event: Event.MESSAGE_REACTION_REMOVE_ALL | "MESSAGE_REACTION_REMOVE_ALL",
      handler: (event: Event.IMessageReactionRemoveAll) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a bot is invited to a guild, or after the shard serving this guild reconnects to the Discord gateway.
     *
     * @event
     */
    function on(
      event: Event.GUILD_CREATE | "GUILD_CREATE",
      handler: (guild: Guild) => Promise<unknown>
    ): void;
  
    /**
     * Fired when [[discord.Guild]] settings are updated, or when a guild's availability changes.
     *
     * @event
     */
    function on(
      event: Event.GUILD_UPDATE | "GUILD_UPDATE",
      handler: (guild: Guild, oldGuild: Guild) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a new [[discord.GuildMember]] is added to a [[discord.Guild]].
     *
     * @event
     */
    function on(
      event: Event.GUILD_MEMBER_ADD | "GUILD_MEMBER_ADD",
      handler: (member: GuildMember) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.GuildMember]] leaves a [[discord.Guild]].
     *
     * @event
     */
    function on(
      event: Event.GUILD_MEMBER_REMOVE | "GUILD_MEMBER_REMOVE",
      handler: (member: Event.IGuildMemberRemove, oldMember: GuildMember) => Promise<unknown>
    ): void;
  
    /**
     * Fired when one of the following events regarding a [[discord.GuildMember]] occur:
     * - A guild member changes their username, avatar, or discriminator
     * - A guild member updates their guild nickname
     * - A role is added or removed from a GuildMember
     * - The user starts boosting the guild
     *
     * @event
     */
    function on(
      event: Event.GUILD_MEMBER_UPDATE | "GUILD_MEMBER_UPDATE",
      handler: (member: GuildMember, oldMember: GuildMember) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.GuildMember]] is banned from a [[discord.Guild]].
     *
     * The [[discord.GuildBan]] event parameter will never contain a `reason` when received via the gateway.
     *
     * @event
     */
    function on(
      event: Event.GUILD_BAN_ADD | "GUILD_BAN_ADD",
      handler: (guildBan: Omit<GuildBan, "reason">) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.GuildMember]] is unbanned from a [[discord.Guild]].
     *
     * The [[discord.GuildBan]] event parameter will never contain a `reason` when received via the gateway.
     *
     * @event
     */
    function on(
      event: Event.GUILD_BAN_REMOVE | "GUILD_BAN_REMOVE",
      handler: (guildBan: Omit<GuildBan, "reason">) => Promise<unknown>
    ): void;
  
    /**
     * Fired when the list of [[discord.Emoji]]s on a guild is updated.
     *
     * The second parameter in the event contains a structure with the list of emojis previously assigned to this guild.
     *
     * @event
     */
    function on(
      event: Event.GUILD_EMOJIS_UPDATE | "GUILD_EMOJIS_UPDATE",
      handler: (
        event: Event.IGuildEmojisUpdate,
        oldEvent: Event.IGuildEmojisUpdate
      ) => Promise<unknown>
    ): void;
  
    /**
     * Fired when integrations (twitch/youtube subscription sync) are updated for a [[discord.Guild]]
     *
     * @event
     */
    function on(
      event: Event.GUILD_INTEGRATIONS_UPDATE | "GUILD_INTEGRATIONS_UPDATE",
      handler: (event: Event.IGuildIntegrationsUpdate) => Promise<unknown>
    ): void;
    /**
     * Fired when a [[discord.Role]] is created.
     *
     * @event
     */
    function on(
      event: Event.GUILD_ROLE_CREATE | "GUILD_ROLE_CREATE",
      handler: (event: Event.IGuildRoleCreate) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.Role]] is created.
     *
     * @event
     */
    function on(
      event: Event.GUILD_ROLE_UPDATE | "GUILD_ROLE_UPDATE",
      handler: (event: Event.IGuildRoleUpdate, oldRole: discord.Role) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.Role]] is deleted.
     *
     * @event
     */
    function on(
      event: Event.GUILD_ROLE_DELETE | "GUILD_ROLE_DELETE",
      handler: (event: Event.IGuildRoleDelete, oldRole: discord.Role) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.GuildChannel]] is created, or a new [[discord.DMChannel]] is opened.
     *
     * @event
     */
    function on(
      event: Event.CHANNEL_CREATE | "CHANNEL_CREATE",
      handler: (channel: Channel.AnyChannel) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.Channel]] is updated.
     *
     * @event
     */
    function on(
      event: Event.CHANNEL_UPDATE | "CHANNEL_UPDATE",
      handler: (
        channel: discord.Channel.AnyChannel,
        oldChannel: discord.Channel.AnyChannel
      ) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a [[discord.Channel]] channel is deleted.
     *
     * @event
     */
    function on(
      event: Event.CHANNEL_DELETE | "CHANNEL_DELETE",
      handler: (channel: discord.Channel.AnyChannel) => Promise<unknown>
    ): void;
  
    /**
     * Fired when a Message Pin is added or removed from a [[discord.Channel]].
     *
     * @event
     */
    function on(
      event: Event.CHANNEL_PINS_UPDATE | "CHANNEL_PINS_UPDATE",
      handler: (event: Event.IChannelPinsUpdate) => Promise<unknown>
    ): void;
  
    /**
     * Fired when the [[discord.VoiceState]] of a [[discord.GuildMember]] is updated.
     *
     * This event is fired when a user connects to voice, switches voice channels, or disconnects from voice.
     * Additionally, this event is fired when a user mutes or deafens, or when server muted/deafened.
     *
     * @event
     */
    function on(
      event: Event.VOICE_STATE_UPDATE | "VOICE_STATE_UPDATE",
      handler: (voiceState: VoiceState, oldVoiceState: VoiceState) => Promise<unknown>
    ): void;
  
    /**
     * Fired when Discord finishes preparing a voice server session for the current bot user.
     *
     * Note: This SDK currently offers no utilities to send or receive voice data.
     * You can use the token and server address to negotiate the connection yourself.
     *
     * @event
     */
    function on(
      event: Event.VOICE_SERVER_UPDATE | "VOICE_SERVER_UPDATE",
      handler: (event: Event.IVoiceServerUpdate) => Promise<unknown>
    ): void;
  
    /**
     * Fired when Discord finishes preparing a voice server session for the current bot user.
     *
     * Note: This SDK currently offers no utilities to send or receive voice data.
     * You can use the token and server address to negotiate the connection yourself.
     *
     * @event
     */
    function on(
      event: Event.TYPING_START | "TYPING_START",
      handler: (event: Event.ITypingStart) => Promise<unknown>
    ): void;
  
    /**
     * Fired when Discord finishes preparing a voice server session for the current bot user.
     *
     * Note: This SDK currently offers no utilities to send or receive voice data.
     * You can use the token and server address to negotiate the connection yourself.
     *
     * @event
     */
    function on(
      event: Event.WEBHOOKS_UPDATE | "WEBHOOKS_UPDATE",
      handler: (event: Event.IWebhooksUpdate) => Promise<unknown>
    ): void;
  
    /**
     * Fired when the current bot's [[discord.User]] object changes
     *
     * @event
     */
    function on(
      event: Event.USER_UPDATE | "USER_UPDATE",
      handler: (event: User) => Promise<unknown>
    ): void;
  
    /**
     * Registers a Promise to be resolved when an event of the given [[discord.Event]] type is received.
     *
     * Alias of [[discord.on]].
     *
     * Note: Event handlers must be statically registered at the start of the script.
     *
     * Note: Some event handlers pass two parameters to the handlers, usually with a snapshot of the event object before updating the cache.
     * This is useful for finding what changed within objects after on and delete events.
     *
     * @deprecated Use [[discord.on]] instead
     * @event
     */
    const registerEventHandler: typeof discord.on;
  
    /**
     * Fetches a [[discord.User]] object containing information about a user on Discord.
     *
     * @param userId The user id (snowflake) you want to fetch data for.
     */
    function getUser(userId: discord.Snowflake): Promise<discord.User | null>;
  
    /**
     * Fetches a [[discord.Invite]] object containing information about an invite on Discord.
     *
     * @param code The invite's code (example: `hC6Bbtj` from https://discord.gg/hC6Bbtj)
     */
    function getInvite(
      code: string,
      options?: Invite.IGetInviteOptions
    ): Promise<discord.Invite | null>;
  
    /**
     * Returns the [[discord.Snowflake]] ID for the [[discord.Guild]] this script is active for.
     */
    function getGuildId(): discord.Snowflake;
  
    /**
     * Returns the [[discord.Snowflake]] ID for the current bot user the deployment is running for.
     */
    function getBotId(): discord.Snowflake;
  
    /**
     * Fetches a [[discord.User]] object containing information about the bot user the deployment is running for.
     */
    function getBotUser(): Promise<discord.User>;
  
    /**
     * Fetches a [[discord.Guild]] object for a given Discord server/guild id.
     *
     * Note: You can only fetch data for the Guild the bot is currently active on.
     *
     * @param guildId The guild id (snowflake) you want to fetch guild data for.
     */
    function getGuild(guildId: discord.Snowflake): Promise<discord.Guild | null>;
  
    /**
     * Fetches a [[discord.Guild]] object for the active deployment's guild.
     *
     * @param guildId The guild id (snowflake) you want to fetch guild data for.
     */
    function getGuild(guildId?: undefined): Promise<discord.Guild>;
  
    /**
     * Fetches a [[discord.Channel]] (or more specific child) object for a given Discord channel id.
     *
     * Note: You can only fetch channels for the guild your deployment is associated with.
     *
     * @param channelId The channel id (snowflake) you want to fetch channel data for.
     */
    function getChannel(channelId: discord.Snowflake): Promise<discord.Channel.AnyChannel | null>;
  
    /**
     * Fetches a [[discord.ITextChannel]] for a given Discord channel id.
     *
     * If the channel exists, but is not a text channel, function will return null.
     */
    function getTextChannel(channelId: discord.Snowflake): Promise<discord.ITextChannel | null>;
  
    /**
     * Fetches a [[discord.GuildTextChannel]] for a given Discord channel id.
     *
     * If the channel exists, but is not a guild text text channel, function will return null.
     */
    function getGuildTextChannel(
      channelId: discord.Snowflake
    ): Promise<discord.GuildTextChannel | null>;
  
    /**
     * Fetches a [[discord.GuildVoiceChannel]] for a given Discord channel id.
     *
     * If the channel exists, but is not a guild voice channel, function will return null.
     */
    function getGuildVoiceChannel(
      channelId: discord.Snowflake
    ): Promise<discord.GuildVoiceChannel | null>;
  
    /**
     * Fetches a [[discord.GuildStageVoiceChannel]] for a given Discord channel id.
     *
     * If the channel exists, but is not a guild stage voice channel, function will return null.
     */
    function getGuildStageVoiceChannel(
      channelId: discord.Snowflake
    ): Promise<discord.GuildStageVoiceChannel | null>;
  
    /**
     * Fetches a [[discord.GuildCategory]] for a given Discord channel id.
     *
     * If the channel exists, but is not a category channel, function will return null.
     */
    function getGuildCategory(channelId: discord.Snowflake): Promise<discord.GuildCategory | null>;
  
    /**
     * Fetches a [[discord.GuildNewsChannel]] for a given Discord channel id.
     *
     * If the channel exists, but is not a text channel, function will return null.
     */
    function getGuildNewsChannel(
      channelId: discord.Snowflake
    ): Promise<discord.GuildNewsChannel | null>;
  
    /**
     * ## Discord Interactions SDK
     *
     * This module contains sub-modules for each interaction type.
     *
     * Currently, you may only register slash commands.
     *
     * See [[discord.interactions.commands]] for  more information on slash commands.
     */
    namespace interactions {
      /**
       * ### Discord Slash Commands
       *
       * Slash commands offer a way to register commands with full auto-completion of options and discovery via the `/` menu.
       *
       * It's easy to register a slash command. Here's a quick example:
       *
       * ```ts
       * discord.interactions.commands.register({
       *   name: 'ping',
       *   description: 'Replies with Pong!'
       * }, async (interaction) => {
       *   await interaction.respond('Pong!');
       * });
       * ```
       *
       * Capturing command options, or arguments, is easy too. Here's an echo command example:
       *
       * ```ts
       * discord.interactions.commands.register({
       *   name: 'echo',
       *   description: 'Replies and echos the original input.',
       *   options: (opt) => ({
       *     input: opt.string('The text to echo.')
       *   })
       * }, async (interaction, { input }) => {
       *   await interaction.respond(`You said: ${input}`);
       * });
       * ```
       *
       * Commands options have some configuration options. You can choose to make them optional, and even provide a list of pre-defined choices to some types!
       *
       * See [[discord.interactions.commands.IOptionProviders]] for a list of option types and their configs.
       */
      namespace commands {
        /**
         * Information contained in a Slash Command interaction request from Discord.
         */
        class SlashCommandInteraction {
          /**
           * The unique ID for this interaction event.
           */
          readonly id: discord.Snowflake;
          /**
           * The ID of the guild this command occurred in.
           */
          readonly guildId: discord.Snowflake;
          /**
           * The ID of the channel this command occurred in.
           */
          readonly channelId: discord.Snowflake;
          /**
           * A reference to the member that performed the command.
           */
          readonly member: discord.GuildMember;
  
          readonly commandId: discord.Snowflake;
          readonly commandName: discord.Snowflake;
  
          /**
           * Retrieves the guild object for the guild this command was ran on.
           */
          getGuild(): Promise<discord.Guild>;
  
          /**
           * Retrieves the channel object for the channel this command was ran in.
           */
          getChannel(): Promise<discord.GuildChannel>;
  
          /**
           * Manually acknowledges an interaction, using the options passed in the first argument.
           *
           * Usually used in combination with [[ICommandConfig.ackBehavior]] set to MANUAL.
           *
           * @param options Options for this acknowledgement.
           */
          acknowledge(options: IAcknowledgeOptions): Promise<void>;
          /**
           * @deprecated Since the end of Discord's Slash Command Developer Beta (3/25/2021), source messages always show. Switch to passing [[IAcknowledgeOptions]] instead.
           */
          acknowledge(showSourceMessage: boolean): Promise<void>;
  
          /**
           * Responds with the given message contents/options.
           *
           * When successful this returns a `SlashCommandResponse` that you may edit or delete later.
           *
           * Note: You may respond to an interaction more than once.
           *
           * @param response A string or object with outgoing response data.
           */
          respond(response: string | IResponseMessageOptions): Promise<SlashCommandResponse>;
  
          /**
           * Responds with a message seen only by the invoker of the command.
           *
           * As a limitation of the Discord API, you may only send string-based content.
           *
           * Once sent, ephemeral replies may not be edited or deleted. As such, this function's return type is void.
           *
           * This is useful for instances where you don't need to announce the reply to all users in the channel.
           *
           * @param response A string or object with outgoing response data.
           */
          respondEphemeral(response: string | IResponseMessageOptions): Promise<void>;
  
          /**
           * Edits the original response message, if sent.
           *
           * This function will error if called before acknowledging the command interaction.
           *
           * @param response A string or object with outgoing response data.
           */
          editOriginal(response: string | IResponseMessageOptions): Promise<void>;
  
          /**
           * Deletes the original response message, if sent.
           *
           * This function will error if called before acknowledging the command interaction.
           *
           * @param response A string or object with outgoing response data.
           */
          deleteOriginal(): Promise<void>;
        }
  
        /**
         * Possible options for a manual command interaction acknowledgement.
         */
        interface IAcknowledgeOptions {
          /**
           * If set to true, the bot will only show the command source and "thinking" animation to the user who executed the command.
           */
          ephemeral: boolean;
        }
  
        type OptionType =
          | string
          | number
          | boolean
          | discord.GuildMember
          | discord.GuildChannel
          | discord.Role
          | null;
  
        interface IOptionConfig {
          /**
           * 3-32 character command name. By default, the name is the key name in the arguments factory object.
           * If you want, you can override the name shown to the client with this.
           */
          name?: string;
          /**
           * A 1-100 character description.
           */
          description: string;
          /**
           * If `true`, this option will be the first option prompted by the client when filling out this command.
           *
           * Default: `false`.
           *
           * Only one option can be marked as the default.
           */
          default?: boolean;
          /**
           * If `false`, the option is optional and becomes nullable.
           *
           * Default: `true`.
           */
          required?: boolean;
        }
  
        interface IOptionChoice<T> {
          name: string;
          value: T;
        }
  
        interface IStringOptionConfig extends IOptionConfig {
          /**
           * An array of string choices, or choice objects with separate name and values.
           */
          choices?: Array<string | IOptionChoice<string>>;
        }
  
        interface IIntegerOptionConfig extends IOptionConfig {
          /**
           * An array of integer choices, or choice objects with separate name and values.
           */
          choices?: Array<number | IOptionChoice<number>>;
        }
  
        interface IOptionProviders {
          string(config: IStringOptionConfig & { required: false }): string | null;
          string(config: IStringOptionConfig): string;
          string(description: string): string;
  
          integer(config: IIntegerOptionConfig & { required: false }): number | null;
          integer(config: IIntegerOptionConfig): number;
          integer(description: string): number;
  
          boolean(config: IOptionConfig & { required: false }): boolean | null;
          boolean(config: IOptionConfig): boolean;
          boolean(description: string): boolean;
  
          guildMember(config: IOptionConfig & { required: false }): discord.GuildMember | null;
          guildMember(config: IOptionConfig): discord.GuildMember;
          guildMember(description: string): discord.GuildMember;
  
          guildChannel(config: IOptionConfig & { required: false }): discord.GuildChannel | null;
          guildChannel(config: IOptionConfig): discord.GuildChannel;
          guildChannel(description: string): discord.GuildChannel;
  
          guildRole(description: string): discord.Role;
          guildRole(config: IOptionConfig): discord.Role;
          guildRole(config: IOptionConfig & { required: false }): discord.Role | null;
        }
  
        interface ICommandConfig<T extends ResolvedOptions> {
          /**
           * The name of the command. Must not contain spaces and must be at least 2 characters in length.
           *
           * The name is used to execute the command from the client. For example, a command with the name `ping` may be executed with /ping.
           * Command names must be unique per bot/application.
           */
          name: string;
          /**
           * A short description of the command. Must not be empty.
           *
           * This description is displayed on Discord's command UI, under the command name.
           */
          description: string;
          /**
           * @deprecated After the Discord Slash Commands developer beta, source messages are always shown.
           * You can toggle the public visibility of source messages with the `ackBehavior` option.
           */
          showSourceMessage?: boolean;
          /**
           * Defines the acknowledgement behavior for this command. See the docs on [[discord.interactions.commands.AckBehavior]] for more information.
           *
           * Default: [[discord.interactions.commands.AckBehavior.AUTO_DEFAULT]]
           */
          ackBehavior?: discord.interactions.commands.AckBehavior;
          /**
           * Used to define options (or arguments) for the user to pass to the command. Must be a function that returns an object of key-value pairs.
           * The key is used as the option name, unless specified in the option constructor's config object.
           *
           * See [[discord.interactions.commands.IOptionProviders]] for a list of option types and their configs.
           *
           * Example (for a "kick" command's options):
           * ```ts
           * (opts) => ({
           *   user: opts.guildMember('The user to kick'),
           *   reason: opts.string({
           *     description: 'The reason for kicking them.',
           *     required: false
           *   })
           * })
           * ```
           */
          options?: OptionsFactory<T>;
        }
  
        const enum AckBehavior {
          /**
           * In this mode, Pylon will automatically acknowledge the command with a deferred response type if no response was sent within the acknowledge timeout window.
           *
           * If a response is not sent within ~250ms, the "<Bot> is thinking..." animation will be shown to all users in the channel.
           */
          AUTO_DEFAULT = 0,
          /**
           * In this mode, Pylon will automatically acknowledge the command with an deferred ephemeral response type if no response was sent within the acknowledge timeout window.
           *
           * If a response is not sent within ~250ms, the "<Bot> is thinking..." animation will be shown ephemerally to the user who ran the command.
           */
          AUTO_EPHEMERAL = 1,
          /**
           * In this mode, it will be up to the command handler to acknowledge the interaction.
           *
           * This mode is the most flexible, but may lead to interaction failures if interactions are not acknowledged within ~3 seconds.
           */
          MANUAL = 2,
        }
  
        interface ICommandGroupConfig {
          name: string;
          description: string;
        }
  
        type ResolvedOptions = { [key: string]: OptionType };
        type OptionsFactory<T extends ResolvedOptions> = (args: IOptionProviders) => T;
        type HandlerFunction<T> = (interaction: SlashCommandInteraction, args: T) => Promise<unknown>;
  
        class SlashCommand<T extends ResolvedOptions> {}
  
        class SlashCommandGroup extends SlashCommand<any> {
          /**
           * Registers a new sub-command within the command group.
           *
           * See [[discord.interactions.command.register]] for more information.
           *
           * @param config The configuration for this command. `name` and `description` must be specified.
           * @param handler The function to be ran when this sub-command is executed.
           */
          register<T extends ResolvedOptions>(
            config: ICommandConfig<T>,
            handler: HandlerFunction<T>
          ): SlashCommand<T>;
  
          /**
           * Registers a new nested sub-command group within the command group.
           *
           * Keep in mind the max sub-command group depth is 2.
           * This means you can create a root command group and apply command groups on it.
           *
           * @param config The config for the new command group. `name` and `description` must be specified.
           */
          registerGroup(config: ICommandGroupConfig): SlashCommandGroup;
  
          /**
           * A convince function to apply subcommands to a subcommand group in an isolated closure's scope.
           * @param fn
           */
          apply(fn: (commandGroup: this) => unknown): this;
        }
  
        /**
         * Options for an outgoing message response to a command invocation.
         *
         * `content` is required unless embeds are specified.
         */
        interface IResponseMessageOptions {
          /**
           * The string content of the message. Must be set if embeds are empty.
           */
          content?: string;
          /**
           * An array of Embed objects to attach to this response.
           */
          embeds?: Array<discord.Embed>;
          /**
           * The allowed mentions for this response. By default, 'everyone' and 'roles' are false.
           */
          allowedMentions?: discord.Message.IAllowedMentions;
          /**
           * If true, the message will be spoken via text-to-speech audio on the client (if enabled).
           */
          tts?: boolean;
          /**
           * (WIP) The components for this message.
           */
          components?: any;
        }
  
        interface IResponseMessageEditOptions {
          /**
           * The string contents of the message.
           */
          content?: string;
          /**
           * The embeds for this message.
           */
          embeds?: Array<discord.Embed>;
          /**
           * (WIP) The components for this message.
           */
          components?: any;
        }
  
        type ResponseMessageOptions =
          | (IResponseMessageOptions & { content: string })
          | (IResponseMessageOptions & { embeds: Array<discord.Embed>; content: undefined });
  
        class SlashCommandResponse {
          /**
           * Edits the slash command response.
           *
           * @param editedResponse A string or object describing the new message content.
           */
          edit(editedResponse: string | IResponseMessageEditOptions): Promise<void>;
  
          /**
           * Deletes the slash command response.
           */
          delete(): Promise<void>;
        }
  
        /**
         * Registers a new slash command. You may pass options and argument-type options to the `config` paramter.
         *
         * You must specify a handler to act on incoming command invocations.
         *
         * @param config Configuration for the command. Properties `name` and `description` must be present and valid.
         * @param handler An async function that takes two arguments, SlashCommandInteraction and a populated OptionsContainer. Called when the slash command is ran by a user.
         */
        function register<T extends ResolvedOptions>(
          config: ICommandConfig<T>,
          handler: HandlerFunction<T>
        ): SlashCommand<T>;
  
        /**
         * Registers a new slash command with the intent to add sub-command and/or sub-command groups.
         * You must pass a name and description in the first config object argument.
         *
         * You must register sub-commands or sub-command groups with the appropriate methods on SlashCommandGroup.
         *
         * @param config Configuration for the command. Properties `name` and `description` must be present and valid.
         */
        function registerGroup(config: ICommandGroupConfig): SlashCommandGroup;
      }
    }
  
    /**
     * The built-in Pylon command handler. Provides utilities for building a bot that handles commands.
     *
     * You can of course roll your own if you want, using the [[discord.Event.MESSAGE_CREATE]] event handler.
     */
    namespace command {
      /**
       * Filters allow you to constrain who is able to run a given [[discord.command.CommandGroup]] or [[discord.command.Command]].
       */
      namespace filters {
        type CommandFilterCriteria =
          | string
          | { name: string; children: Array<CommandFilterCriteria> };
        interface ICommandFilter {
          filter(message: discord.GuildMemberMessage): Promise<boolean>;
          getCriteria(): Promise<CommandFilterCriteria | null>;
        }
  
        /**
         * Only allow the command to be run if the user has the [[discord.Permissions.ADMINISTRATOR]] permission.
         */
        function isAdministrator(): ICommandFilter;
  
        /**
         * Only allow the command to be run by the current guild owner.
         */
        function isOwner(): ICommandFilter;
  
        /**
         * Only allows the command to be run by a specified `userId`.
         */
        function isUserId(userId: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run by the specified `userIds`.
         */
        function userIdIn(userIds: Array<discord.Snowflake>): ICommandFilter;
  
        /**
         * Only allows the command to be run in a specified `channelId`.
         */
        function isChannelId(channelId: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run in the specified `channelIds`.
         */
        function channelIdIn(channelIds: Array<discord.Snowflake>): ICommandFilter;
  
        /**
         * Only allows the command to be run in a channel which has the specified `parentId`.
         */
        function hasParentId(parentId: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run in a channel which has the specified `parentIds`.
         */
        function parentIdIn(parentIds: Array<discord.Snowflake>): ICommandFilter;
  
        /**
         * Only allows the command to be run in a channel which is marked nsfw.
         */
        function isChannelNsfw(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.CREATE_INSTANT_INVITE]] permission.
         */
        function canCreateInstantInvite(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.KICK_MEMBERS]] permission.
         */
        function canKickMembers(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.BAN_MEMBERS]] permission.
         */
        function canBanMembers(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_CHANNELS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canManageChannels(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_GUILD]] permission.
         */
        function canManageGuild(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.ADD_REACTIONS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canAddReactions(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VIEW_AUDIT_LOGS]] permission.
         */
        function canViewAuditLog(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.SEND_TTS_MESSAGES]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canSendTtsMessages(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_MESSAGES]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canManageMessages(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.EMBED_LINKS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canEmbedLinks(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.ATTACH_FILES]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canAttachFiles(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MENTION_EVERYONE]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canMentionEveryone(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.EXTERNAL_EMOJIS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canUseExternalEmojis(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VIEW_GUILD_ANALYTICS]] permission.
         */
        function canViewGuildInsights(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_MUTE_MEMBERS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canMuteMembers(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_DEAFEN_MEMBERS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canDeafenMembers(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_MOVE_MEMBERS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canMoveMembers(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.STREAM]] permission. Streaming is also known
         * as the "go live" feature inside of Discord.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canStream(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.CHANGE_NICKNAME]] permission.
         *
         * This differs from [[discord.command.filters.canManageNicknames]] in that the [[discord.Permissions.CHANGE_NICKNAME]] permission only
         * allows the user to change their own username, and not the username of others. This means that this filter checks if the user
         * can change their own nickname.
         */
        function canChangeNickname(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_NICKNAMES]] permission.
         */
        function canManageNicknames(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_ROLES]] permission.
         */
        function canManageRoles(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_WEBHOOKS]] permission.
         *
         * This differs from [[discord.command.filters.canManageChannelWebhooks]] in that, this permission checks if they
         * can manage all webhooks on the guild, rather than webhooks within a specific channel.
         */
        function canManageGuildWebhooks(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_WEBHOOKS]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canManageChannelWebhooks(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.MANAGE_EMOJIS]] permission.
         */
        function canManageEmojis(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_CONNECT]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         *
         * Note: Since commands are generally executed in text channels, without a `channelId` provided, this checks to see
         * if the user is able to connect to channels without any specific permission overrides.
         */
        function canConnect(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_SPEAK]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         *
         * Note: Since commands are generally executed in text channels, without a `channelId` provided, this checks to see
         * if the user is able to speak in channels without any specific permission overrides.
         */
        function canSpeak(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_PRIORITY_SPEAKER]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         *
         * Note: Since commands are generally executed in text channels, without a `channelId` provided, this checks to see
         * if the user is able to speak with priority in channels without any specific permission overrides.
         */
        function canPrioritySpeaker(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.VOICE_USE_VAD]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         *
         * Note: Since commands are generally executed in text channels, without a `channelId` provided, this checks to see
         * if the user is able to speak using voice activity detection in channels without any specific permission overrides.
         */
        function canUseVoiceActivity(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.READ_MESSAGES]] permission in a given channel.
         *
         * Note: This filter always takes a `channelId`, as it's implied that the user has the read message permission in the current channel
         * if they're able to execute a command in that channel. This allows you to check if the user is able to read messages in another
         * channel.
         */
        function canReadMessages(channelId: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.READ_MESSAGE_HISTORY]] permission.
         *
         * By default, will check for the permission in the current channel that the command is being invoked in. However,
         * you can specify a specific `channelId` as an optional argument, that will override the channel that the permission
         * will be checked in.
         */
        function canReadMessageHistory(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the [[discord.Permissions.SEND_MESSAGES]] permission in a given channel.
         *
         * Note: This filter always takes a `channelId`, as it's implied that the user has the send message permission in the current channel
         * if they're able to execute a command in that channel. This allows you to check if the user is able to send messages in another
         * channel.
         */
        function canSendMessages(channelId: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the given `permission` in the guild.
         *
         * This is a lower level function of the `can...` functions located in this module. For example, the following
         * are equivalent:
         *  - `discord.command.filters.canManageGuild()`
         *  - `discord.command.filters.hasGuildPermission(discord.Permissions.MANAGE_GUILD)`
         */
        function hasGuildPermission(permission: discord.Permissions): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has the given `permission` in the given `channelId`. If the `channelId`
         * is not provided, will check to see if they have the given permission in the current channel.
         *
         * This is a lower level function of the `can...` functions located in this module. For example, the following
         * are equivalent:
         *  - `discord.command.filters.hasChannelPermission()`
         *  - `discord.command.filters.hasChannelPermission(discord.Permissions.MANAGE_MESSAGES)`
         */
        function hasChannelPermission(
          permission: discord.Permissions,
          channelId?: discord.Snowflake
        ): ICommandFilter;
  
        /**
         * Only allows the command to run if the user has one of the specified `roles`.
         *
         * Note: Providing an empty `roles` array will cause the script to fail validation.
         */
        function hasSomeRole(roles: Array<discord.Snowflake>): ICommandFilter;
  
        /**
         * Only allows the command to run if the user has all of the specified `roles`.
         *
         * Note: Providing an empty `roles` array will cause the script to fail validation.
         */
        function hasEveryRole(roles: Array<discord.Snowflake>): ICommandFilter;
  
        /**
         * Only allows the command to run if the user has a given `role`.
         *
         * Note: This is basically equivalent to `discord.command.filters.hasSomeRole([role])`. But with a more
         * specialized error message. Internally, if `hasSomeRole` or `hasEveryRole` is called with a single
         * role id, it will use this function instead.
         */
        function hasRole(role: discord.Snowflake): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has a role that is mentionable by everyone.
         */
        function hasMentionableRole(): ICommandFilter;
  
        /**
         * Only allows the command to be run if the user has a nickname in the guild.
         */
        function hasNickname(): ICommandFilter;
  
        /**
         * Combines multiple filters into a single filter, only allowing the command to be run if all the
         * filters provided allow the command to be run.
         *
         * #### Example:
         *
         * Only allow the command to be ran in a specific channel by administrators.
         *
         * ```ts
         * const F = discord.command.filters;
         * const ADMIN_CHANNEL_ID = '628887548604841984';
         *
         * const commands = new discord.command.CommandGroup();
         * commands.raw(
         *   {
         *     name: 'admin',
         *     filters: F.and(F.isChannelId(ADMIN_CHANNEL_ID), F.isAdministrator())
         *   },
         *   (message) => message.reply('hey!')
         * );
         * ```
         */
        function and(...filters: ICommandFilter[]): ICommandFilter;
  
        /**
         * Combines multiple filters into a single filter, only allowing the command to be run if one of the
         * filters provided allow the command to be run.
         *
         * #### Example:
         *
         * Only allow the command to be ran in a specific channel, or if the user is an administrator.
         * ```ts
         * const F = discord.command.filters;
         *
         * const commands = new discord.command.CommandGroup();
         * commands.raw(
         *   {
         *     name: 'hey',
         *     filters: F.or(F.isChannelId(CHANNEL_ID), F.isAdministrator())
         *   },
         *   (message) => message.reply('hey!')
         * );
         * ```
         */
        function or(...filters: ICommandFilter[]): ICommandFilter;
  
        /**
         * Creates a filter that is the inverse of a given filter.
         *
         * #### Example:
         *
         * Only allows the command to be ran if the user is NOT an administrator.
         * ```ts
         * const F = discord.command.filters;
         *
         * const commands = new discord.command.CommandGroup();
         * commands.raw(
         *   {
         *     name: 'hey',
         *     filters: F.not(F.isAdministrator())
         *   },
         *   (message) => message.reply('hey!')
         * );
         * ```
         */
        function not(filter: ICommandFilter): ICommandFilter;
  
        /**
         * Suppresses the error message returned by a given filter if the user does not meet
         * its criteria.
         *
         * This is really useful in combination with the [[discord.command.filters.isChannelId]] filter (see below).
         *
         * #### Example:
         *
         * Limits a command group to only be usable in a given channel. If the user is not in that channel, and tries
         * to use a command, don't allow it to be used, but also don't tell them which channel they need to be in. For
         * example, if you had an game channel that you wanted to run game commands in:
         *
         * ```ts
         * const F = discord.command.filters;
         * const GAME_CHANNEL_ID = '628887548604841984';
         * const gameCommands = new discord.command.CommandGroup({
         *   filters: F.silent(F.isChannelId(GAME_CHANNEL_ID))
         * });
         * gameCommands.raw('d6', (message) =>
         *   message.reply(`Your roll is ${(Math.random() * 6) | 0}`)
         * );
         * gameCommands.raw('flip', (message) =>
         *   message.reply(`Coin flip is ${Math.random() < 0.5 ? 'heads' : 'tails'}!`)
         * );
         * ```
         */
        function silent(filter: ICommandFilter): ICommandFilter;
  
        // TODO: when guild.getVoiceState(userId) exists.
        // function connectedToVoiceChannel(): ICommandFilter;
        // function connectedToSomeVoiceChannel(...channelIds: discord.Snowflake[]): ICommandFilter;
        // function isLive(channelId?: discord.Snowflake): ICommandFilter;
  
        /**
         * Wraps a given `filter`, making it return a custom criteria message instead of the one provided. This can
         * add some flavor to your bot by letting you override the built in Pylon filter criteria message.
         *
         * #### Example:
         *
         * Wrap the [[discord.command.filter.isAdministrator]] filter, providing a custom criteria message if the
         * user is not an administrator.
         *
         * ```ts
         * const F = discord.command.filters;
         * // You can now use `coolerAdminFilter` with your commands. You of course don't need to assign this
         * // to a variable. But if you've gone through the effort of making a cool criteria message, you
         * // might want to reuse it.
         * const coolerAdminFilter = F.withCustomMessage(F.isAdministrator, "be an incredibly cool person");
         * ```
         */
        function withCustomMessage(
          filter: ICommandFilter,
          filterCriteria: string | (() => Promise<string> | string)
        ): ICommandFilter;
  
        /**
         * Creates a custom filter, based upon whatever criteria you wish. Additionally, you can provide a custom criteria
         * message.
         *
         * #### Example:
         *
         * Checks to see if the user's discriminator is #0001.
         * ```ts
         * const is0001Discriminator = discord.command.filters.custom(
         *  (message) => message.author.discriminator === '0001',
         *  'discriminator must be #0001'
         * );
         * ```
         * */
        function custom(
          filter: (message: discord.GuildMemberMessage) => Promise<boolean> | boolean,
          filterCriteria?: string | (() => Promise<string> | string)
        ): ICommandFilter;
      }
  
      class ArgumentError<T> extends Error {
        public argumentConfig: IArgumentConfig<T>;
      }
  
      class Command {
        // getHelpString(): string;
        // getCommandPrefix(): string;
      }
  
      /**
       * A type union of the string representations available as an argument type.
       */
      type ArgumentType =
        | "string"
        | "stringOptional"
        | "integer"
        | "integerOptional"
        | "number"
        | "numberOptional"
        | "text"
        | "textOptional"
        | "stringList"
        | "stringListOptional"
        | "user"
        | "userOptional"
        | "guildMember"
        | "guildMemberOptional"
        | "guildChannel"
        | "guildChannelOptional"
        | "guildTextChannel"
        | "guildTextChannelOptional"
        | "guildVoiceChannel"
        | "guildVoiceChannelOptional";
  
      /**
       * A type union containing possible resolved argument types.
       */
      type ArgumentTypeTypes =
        | string
        | number
        | string[]
        | discord.User
        | discord.GuildMember
        | discord.GuildChannel
        | discord.GuildTextChannel
        | discord.GuildVoiceChannel;
  
      /**
       * A type union containing possible options passed to an argument.
       */
      type ArgumentOptions<T> =
        | discord.command.IArgumentOptions
        | discord.command.IOptionalArgumentOptions<T>
        | undefined;
  
      interface IArgumentConfig<T> {
        /**
         * The type definition of the JS value this argument will represent.
         */
        type: ArgumentType;
        /**
         * Options for this argument.
         */
        options: ArgumentOptions<T>;
      }
  
      interface IArgumentOptions {
        /**
         * A human-readable custom name for this argument.
         */
        name?: string;
        /**
         * A human-readable description for this argument.
         */
        description?: string;
      }
  
      interface IStringArgumentOptions {
        /**
         * For a string argument, the valid options the string can be. Choices are case sensitive.
         */
        choices?: string[];
      }
  
      interface INumericArgumentOptions {
        /**
         * For a numeric argument, the valid options the number can be.
         */
        choices?: number[];
        /**
         * For a numeric argument (`integer` or `number`), the minimum value that will be accepted (inclusive of the value.)
         */
        minValue?: number;
        /**
         * For a numeric argument (`integer` or `number`), the maximum value that will be accepted (inclusive of the value.)
         */
        maxValue?: number;
      }
  
      interface IOptionalArgumentOptions<T> extends IArgumentOptions {
        /**
         * Optional arguments allow you to specify a default.
         * Otherwise, a missing optional argument will resolve as null.
         */
        default: T;
      }
  
      interface ICommandArgs {
        /**
         * Parses a single space-delimited argument as a string.
         * @param options argument config
         */
        string(options?: IArgumentOptions & IStringArgumentOptions): string;
  
        /**
         * Optionally parses a single space-delimited argument as a string.
         * @param options argument config
         */
        stringOptional(options: IOptionalArgumentOptions<string> & IStringArgumentOptions): string;
        stringOptional(options?: IArgumentOptions & IStringArgumentOptions): string | null;
  
        /**
         * Parses a single space-delimited argument with parseInt()
         * Non-numeric inputs will cause the command to error. Floating point inputs are truncated.
         * @param options argument config
         */
        integer(options?: IArgumentOptions & INumericArgumentOptions): number;
        /**
         * Optionally parses a single space-delimited argument with parseInt()
         * Non-numeric inputs will cause the command to error. Floating point inputs are truncated.
         * @param options argument config
         */
        integerOptional(options: IOptionalArgumentOptions<number> & INumericArgumentOptions): number;
        integerOptional(options?: IArgumentOptions & INumericArgumentOptions): number | null;
  
        /**
         * Parses a single space-delimited argument with parseFloat()
         * Non-numeric inputs will cause the command to error.
         * @param options argument config
         */
        number(options?: IArgumentOptions & INumericArgumentOptions): number;
        /**
         * Optionally parses a single space-delimited argument with parseFloat()
         * Non-numeric inputs will cause the command to error.
         * @param options argument config
         */
        numberOptional(options: IOptionalArgumentOptions<number> & INumericArgumentOptions): number;
        numberOptional(options?: IArgumentOptions & INumericArgumentOptions): number | null;
  
        /**
         * Parses the rest of the command's input as a string, leaving no more content for any future arguments.
         * If used, this argument must appear as the last argument in your command handler.
         * @param options argument config
         */
        text(options?: IArgumentOptions): string;
        /**
         * Optionally parses the rest of the command's input as a string, leaving no more content for any future arguments.
         * If used, this argument must appear as the last argument in your command handler.
         * @param options argument config
         */
        textOptional(options: IOptionalArgumentOptions<string>): string;
        textOptional(options?: IArgumentOptions): string | null;
  
        /**
         * Parses the rest of the command's input as space-delimited string values.
         * If used, this argument must appear as the last argument in your command handler.
         * @param options argument config
         */
        stringList(options?: IArgumentOptions): string[];
        /**
         * Optionally parses the rest of the command's input as space-delimited string values.
         * If used, this argument must appear as the last argument in your command handler.
         * @param options argument config
         */
        stringListOptional(options: IOptionalArgumentOptions<string[]>): string[];
        stringListOptional(options?: IArgumentOptions): string[] | null;
  
        /**
         * Parses a mention string or user id and resolves a [[discord.User]] object reference.
         * If the user was not found, the command will error.
         * @param options argument config
         */
        user(options?: IArgumentOptions): Promise<discord.User>;
  
        /**
         * Optionally parses a mention string or user id and resolves a [[discord.User]] object reference.
         * If the argument is present but the user was not found, the command will error.
         * Like all optional arguments, if the argument is not present the value will be resolved as null.
         * @param options argument config
         */
        userOptional(options?: IArgumentOptions): Promise<discord.User | null>;
  
        /**
         * Parses a mention string or user id and resolves a [[discord.GuildMember]] object reference.
         * If the member was not found, the command will error.
         * The command will error if it was not used in a guild.
         * @param options argument config
         */
        guildMember(options?: IArgumentOptions): Promise<discord.GuildMember>;
        /**
         * Optionally parses a mention string or user id and resolves a [[discord.GuildMember]] object reference.
         * If the argument is present but the member was not found, the command will error.
         * Like all optional arguments, if the argument is not present the value will be resolved as null.
         * @param options argument config
         */
        guildMemberOptional(options?: IArgumentOptions): Promise<discord.GuildMember | null>;
  
        /**
         * Parses a mention string or channel id that resolves a [[discord.GuildChannel]] object reference.
         * If the channel was not found, the command will error.
         * The command will error if not used in a guild.
         */
        guildChannel(options?: IArgumentOptions): Promise<discord.GuildChannel>;
  
        /**
         * Optionally parses a mention string or channel id that resolves a [[discord.GuildChannel]] object reference.
         * If the channel was not found, the command will error.
         * The command will error if not used in a guild.
         */
        guildChannelOptional(options?: IArgumentOptions): Promise<discord.GuildChannel | null>;
  
        /**
         * Parses a mention string or channel id that resolves a [[discord.GuildTextChannel]] object reference.
         * If the channel was not found, or not a voice channel, the command will error.
         * The command will error if not used in a guild.
         */
        guildTextChannel(options?: IArgumentOptions): Promise<discord.GuildTextChannel>;
  
        /**
         * Optionally parses a mention string or channel id that resolves a [[discord.GuildTextChannel]] object reference.
         * If the channel was not found, or not a text channel, the command will error.
         * The command will error if not used in a guild.
         */
        guildTextChannelOptional(
          options?: IArgumentOptions
        ): Promise<discord.GuildTextChannel | null>;
  
        /**
         * Parses a mention string or channel id that resolves a [[discord.GuildVoiceChannel]] object reference.
         * If the channel was not found, or not a voice channel, the command will error.
         * The command will error if not used in a guild.
         */
        guildVoiceChannel(options?: IArgumentOptions): Promise<discord.GuildVoiceChannel>;
  
        /**
         * Optionally parses a mention string or channel id that resolves a [[discord.GuildVoiceChannel]] object reference.
         * If the channel was not found, or not a voice channel, the command will error.
         * The command will error if not used in a guild.
         */
        guildVoiceChannelOptional(
          options?: IArgumentOptions
        ): Promise<discord.GuildVoiceChannel | null>;
      }
  
      /**
       * Options specified when registering commands.
       */
      interface ICommandOptions {
        /**
         * The name of the command. Users will use this name to execute the command.
         */
        name: string;
        /**
         * Any additional aliases that can be used to invoke this command.
         */
        aliases?: string[];
        /**
         * A human-readable description for this command.
         */
        description?: string;
        /**
         * A composition of filters that determine if the command can be executed.
         *
         * For a complete list of filters and their descriptions, see [[discord.command.filters]].
         */
        filters?: Array<filters.ICommandFilter> | filters.ICommandFilter;
        /**
         * Fired when an error occurs during the execution or validation of this command.
         */
        onError?: (ctx: ICommandContextDeprecated, e: Error) => void | Promise<void>;
      }
  
      interface ICommandContext {
        /**
         * The command being run.
         */
        command: Command;
  
        /**
         * The raw arguments, before they were parsed.
         */
        rawArguments: string;
      }
  
      interface ICommandContextDeprecated {
        /**
         * The command being run.
         */
        command: Command;
  
        /**
         * The message sent that triggered this command.
         */
        message: discord.GuildMemberMessage;
  
        /**
         * The command being run.
         * @deprecated Use the "command" property instead!
         */
        cmd: Command;
  
        /**
         * The message sent that triggered this command.
         * @deprecated Use the "message" property instead!
         */
        msg: discord.GuildMemberMessage;
      }
  
      /**
       * A type alias containing a union of possible command argument types.
       */
      type CommandArgumentTypes =
        | string
        | string[]
        | number
        | Promise<discord.User>
        | Promise<discord.User | null>
        | Promise<discord.GuildMember>
        | Promise<discord.GuildMember | null>
        | Promise<discord.GuildChannel>
        | Promise<discord.GuildChannel | null>
        | Promise<discord.GuildTextChannel>
        | Promise<discord.GuildTextChannel | null>
        | Promise<discord.GuildVoiceChannel>
        | Promise<discord.GuildVoiceChannel | null>
        | null;
  
      /**
       * A type alias describing the way to define arguments for a command. To be returned by [[discord.command.ArgumentsParser]].
       */
      type CommandArgumentsContainer = { [key: string]: CommandArgumentTypes } | null;
  
      /**
       * A type alias for a function called by the command handler to construct the argument requirements for a command.
       *
       * @param T A user-defined type (object) matching argument names (property names) to value types.
       * @param args A class containing possible command arguments, use return value from functions in this class as values for properties of T.
       */
      type ArgumentsParser<T extends CommandArgumentsContainer> = (args: ICommandArgs) => T;
      type CommandHandlerDeprecated<T> = (
        ctx: ICommandContextDeprecated,
        args: T
      ) => Promise<unknown>;
  
      /**
       * A function called when a command is executed.
       *
       * @param message A reference to the [[discord.GuildMemberMessage]] that triggered this command.
       * @param args An object containing entries for the command arguments parsed for this command.
       * @param ctx An object containing additional command context information.
       */
      type CommandHandler<T> = (
        message: discord.GuildMemberMessage,
        args: T,
        ctx: ICommandContext
      ) => Promise<unknown>;
  
      /**
       * Options used when creating a new [[discord.command.CommandGroup]].
       */
      interface ICommandGroupOptions {
        /**
         * A human-readable label for this command group.
         */
        label?: string;
        /**
         * A human-readable description for this command group.
         */
        description?: string;
        /**
         * The default prefix used to execute commands within this command group.
         *
         * If not specified, the default prefix is `!`.
         */
        defaultPrefix?: string;
        /**
         * An array of additional prefixes that may be used to trigger commands within this group.
         */
        additionalPrefixes?: string[];
        /**
         * If `true`, users will be able to run this command via a mention/ping, followed by a space, and the command name/arguments.
         */
        mentionPrefix?: boolean;
        /**
         * If `false`, the command group will not auto-register MESSAGE_CREATE events upon creation.
         */
        register?: false;
        /**
         * A composition of filters that determine if the command can be executed.
         *
         * For a complete list of filters and their descriptions, see [[discord.command.filters]].
         */
        filters?: Array<filters.ICommandFilter> | filters.ICommandFilter;
      }
  
      /**
       * An object containing parsed arguments for a command.
       */
      type ResolvedArgs<T extends CommandArgumentsContainer> = {
        [P in keyof T]: T[P] extends Promise<infer R> ? R : T[P];
      };
  
      interface ICommandExecutor {
        execute(
          message: discord.GuildMemberMessage,
          commandPrefix: string,
          rawArguments: string,
          isRootExecutor: boolean
        ): Promise<void>;
  
        getAliases(): Set<string>;
      }
  
      type Named<T> = { name: string } & T;
  
      /**
       * Command groups contain categories of logically separated groups of commands.
       *
       * Command Groups may specify filters that apply to all commands added to the group.
       *
       * Commands must be added to command groups via one of the registration methods available.
       */
      class CommandGroup implements ICommandExecutor {
        /**
         * Constructs a new command group. By default, this constructor will register message events and listen for messages that match commands added to the command group.
         *
         * @param options The options for this command group.
         */
        constructor(options?: ICommandGroupOptions);
  
        /**
         * Attaches the command executors provided.
         *
         * For more examples, see [[discord.command.handler]].
         *
         * Generally it is preferred to use [[discord.command.CommandGroup.on on]], [[discord.command.CommandGroup.raw raw]] and [[discord.command.CommandGroup.subcommand subcommand]] depending on how you wish
         * to structure your module. Attach is generally more useful when you are importing un-attached commands from various modules, whereas [[discord.command.CommandGroup.on on]] & company are useful if you
         * want to define your command handlers in-line.
         *
         * @param executors An object, keyed by the name that the command executor will use.
         */
        attach(executors: { [name: string]: discord.command.ICommandExecutor }): this;
  
        /**
         * Sets the filter(s) to be used for this command group. All child commands will use these filters.
         *
         * Note: Replaces any filters set previously.
         *
         * @param filter The filter composition to use for this command group.
         */
        setFilter(filter?: filters.ICommandFilter | null): this;
  
        /**
         * Registers a command that expects arguments.
         *
         * If argument parsing/validation fails, an error will be returned to the user and the handler will not run.
         *
         * #### Example
         *
         * Creates a script that will have a command that returns a number that has been multiplied by 2, as `!double N`, where `!double 4` would output `8`
         *
         * ```ts
         * const commandGroup = new discord.command.CommandGroup();
         * commandGroup.on(
         *   'double',
         *   (ctx) => ({ n: ctx.integer() }),
         *   (message, { n }) => message.reply(`${n * 2}`)
         * );
         * ```
         *
         * @param options A string containing the name of the command, or an object with more options (including filters, description, etc).
         * @param parser A function that collects the argument types this command expects.
         * @param handler A function to be ran when command validation succeeds and the command should be executed.
         */
        on<T extends CommandArgumentsContainer>(
          options: string | ICommandOptions,
          parser: ArgumentsParser<T>,
          handler: CommandHandler<ResolvedArgs<T>>
        ): this;
  
        /**
         * Registers a command that accepts any or no arguments.
         *
         * All text proceeding the command name is passed to the handler in the "args" parameter as a string.
         *
         * #### Example
         *
         * Creates a script that will reply with `pong!` when `!ping` is said in chat.
         *
         * ```ts
         * const commandGroup = new discord.command.CommandGroup();
         * commandGroup.raw("ping", message => message.reply("pong!"));
         * ```
         *
         * @param options A string containing the name of the command, or an object with more options (including filters, description, etc).
         * @param handler A function to be ran when command validation succeeds and the command should be executed.
         */
        raw(options: string | ICommandOptions, handler: CommandHandler<string>): this;
  
        /**
         *
         * Creates, registers and returns a sub-command group.
         *
         * This command is an alternate form of [[discord.command.CommandGroup.subcommand subcommand]], that lets capture the sub-command's [[discord.command.CommandGroup CommandGroup]]. For more on sub-commands, see the [[discord.command.CommandGroup.subcommand subcommand]] docs.
         *
         * #### Example:
         *
         * Creates a script that will have the following commands:
         *  - `!lights on`
         *  - `!lights off`
         *
         * ```ts
         * const commandGroup = new discord.command.CommandGroup();
         * const subCommandGroup = commandGroup.subcommandGroup("lights");
         * subCommandGroup.raw("on", m => m.reply("lights on turned on!"));
         * subCommandGroup.raw("off", m => m.reply("lights turned off!"));
         * ```
         *
         * @param options An object containing the command group's options. Register is not able to be set, as the command group is implicitly registered as a sub-command for this command group.
         */
        subcommandGroup(
          options: string | Named<Omit<ICommandGroupOptions, "register">>
        ): CommandGroup;
  
        /**
         * Registers a command that may be followed by additional nested command groups.
         *
         * This is useful to further organize and group commands within a single parent command group.
         *
         * Sub-command groups are just like Command Groups, and will require filters of all parent sub-commands to be passed before executing any sub-commands.
         *
         * #### Example:
         *
         * Creates a script that will have the following commands:
         *  - `!lights on`
         *  - `!lights off`
         *
         * ```ts
         * const commandGroup = new discord.command.CommandGroup();
         * commandGroup.subcommand("lights", subCommandGroup => {
         *  subCommandGroup.raw("on", m => m.reply("lights on turned on!"));
         *  subCommandGroup.raw("off", m => m.reply("lights turned off!"));
         * });
         * ```
         *
         * @param options A string containing the name of the command, or an object with more options. See [[discord.command.ICommandGroupOptions]]. The `name` property must be present, specifying the name of the subcommand-group. Sub-command groups may not be automatically registered, so the `register` property must not be set.
         * @param commandGroup A CommandGroup instance (must not be previously registered) or a function which passes a nested CommandGroup as the first parameter.
         */
        subcommand(
          options: string | Named<Omit<ICommandGroupOptions, "register">>,
          commandGroup: (subCommandGroup: CommandGroup) => void
        ): this;
  
        /**
         * Deprecated - attach the subcommand group using [[discord.command.CommandGroup.attach attach]] instead.
         *
         * @deprecated
         */
        subcommand(
          options: string | Named<Omit<ICommandGroupOptions, "filters" | "register">>,
          commandGroup: CommandGroup
        ): this;
  
        /**
         * Registers a command that will run for any un-matched commands that match the command group's prefix(es) and the arguments specified.
         *
         * @param parser A function that collects the argument types this command expects.
         * @param handler A function to be ran when command validation succeeds and the command should be executed.
         * @param options Options for this default handler.
         */
        default<T extends CommandArgumentsContainer>(
          parser: ArgumentsParser<T>,
          handler: CommandHandler<ResolvedArgs<T>>,
          options?: Omit<ICommandOptions, "name">
        ): this;
  
        /**
         * Registers a command that will run for any un-matched commands that match the command group's prefix(es).
         *
         * All text proceeding the command name is passed to the handler in the "args" parameter as a string.
         *
         * @param handler A function to be ran when command validation succeeds and the command should be executed.
         * @param options Options for this default handler.
         */
        defaultRaw(handler: CommandHandler<string>, options?: Omit<ICommandOptions, "name">): this;
  
        /**
         * Registers a command that expects arguments.
         *
         * @deprecated Replaced by [[discord.command.CommandGroup.on]].
         */
        registerCommand<T extends CommandArgumentsContainer>(
          options: string | ICommandOptions,
          parser: ArgumentsParser<T>,
          handler: CommandHandlerDeprecated<ResolvedArgs<T>>
        ): this;
  
        /**
         * Registers a command that expects no arguments.
         *
         * @deprecated Replaced by [[discord.command.CommandGroup.raw]].
         */
        registerCommand(
          options: string | ICommandOptions,
          handler: CommandHandlerDeprecated<null>
        ): this;
  
        /**
         * Manually executes the command group given a [[discord.Message]]. Useful if you specify `{ register: false }` when instantiating a new CommandGroup.
         *
         * If the message is not to be handled by this command group (given the command prefix and command name) the Promise will resolve as `false`.
         *
         * If the message was otherwise handled and executed, it will otherwise resolve `true`.
         *
         * Note: Use [[discord.command.CommandGroup.checkMessage]] to check (without executing) if the CommandGroup will execute for the given message.
         *
         * @returns `true` if a command was handled and executed successfully. The function will throw if the command handler errors.
         *
         */
        handleMessage(message: discord.Message): Promise<boolean>;
  
        /**
         * Determines if the command group will execute given the supplied message, without executing the command.
         *
         * Note: Use [[discord.command.CommandGroup.handleMessage]] to execute a command within the CommandGroup.
         *
         * @param message
         */
        checkMessage(message: discord.Message): Promise<boolean>;
  
        /**
         * Executes the command group as an ICommandExecutor. This is an Internal API, and is subject to breakage.
         *
         * @private - Internal API, do not use. Use [[discord.command.CommandGroup.handleMessage]] to execute command groups manually.
         */
        execute(
          message: discord.GuildMemberMessage,
          commandPrefix: string,
          rawArguments: string,
          isRootExecutor: boolean
        ): Promise<void>;
  
        /**
         *
         * @private - Internal API, do not use.
         */
        getAliases(): Set<string>;
      }
  
      /**
       * Creates an un-attached command handler that can be attached to a [[discord.command.CommandGroup CommandGroup]] using the [[discord.command.CommandGroup.attach attach]] method.
       *
       * If you have no need to split your handlers across modules, it's generally more preferred to use [[discord.command.CommandGroup.on CommandGroup.on]]!
       *
       * #### Example:
       * ```ts
       * const commandGroup = new discord.command.CommandGroup();
       * const hello = discord.command.handler(
       *  ctx => ({name: ctx.text()}),
       *  (msg, {name}) => msg.reply(`Hello ${name}`)
       * );
       *
       * commandGroup.attach({hello});
       * ```
       *
       * This allows you to export commands directly from modules.
       *
       * In `main.ts`:
       *
       * ```ts
       * import * as EconomyCommands from './economy-commands';
       * const commandGroup = new discord.command.CommandGroup();
       * commandGroup.attach(EconomyCommands);
       * ```
       *
       * In `economy-commands.ts`:
       * ```ts
       * export const balance = discord.command.rawHandler((m) =>
       *   m.reply('your balance is $50')
       * );
       * export const buy = discord.command.handler(
       *   (ctx) => ({ item: ctx.string() }),
       *   (m, { item }) => m.reply(`You bought **${item}**, your balance is now $0`)
       * );
       * ```
       *
       * @param parser A function that collects the argument types this command expects.
       * @param handler A function to be ran when command validation succeeds and the command should be executed.
       * @param options A object containing the command options (filters, description, etc). It is not possible to specify a name here.
       */
      function handler<T extends CommandArgumentsContainer>(
        parser: ArgumentsParser<T>,
        handler: CommandHandler<ResolvedArgs<T>>,
        options?: Omit<ICommandOptions, "name">
      ): ICommandExecutor;
  
      /**
       * Creates an un-attached command handler which processes no arguments that can be attached to a [[discord.command.CommandGroup]] using the [[discord.command.CommandGroup.attach]] method.
       *
       * If you have no need to split your handlers across modules, it's generally more preferred to use [[discord.command.CommandGroup.raw]]!
       *
       * #### Examples
       *
       * ```ts
       * const commandGroup = new discord.command.CommandGroup();
       * const ping = discord.command.rawHandler(m => m.reply(`pong!`));
       * commandGroup.attach({pong});
       * ```
       *
       * For more examples, see the [[discord.command.handler]].
       *
       * @param handler A function to be ran when command validation succeeds and the command should be executed.
       * @param options A object containing the command options (filters, description, etc). It is not possible to specify a name here.
       */
      function rawHandler(
        handler: CommandHandler<string>,
        options?: Omit<ICommandOptions, "name">
      ): ICommandExecutor;
    }
  
    /**
     * An enumeration of permission bits that indicate an action users may or may not perform.
     *
     * For more information on Discord permissions, please see their docs on permissions.
     *
     * https://discordapp.com/developers/docs/topics/permissions
     */
    const enum Permissions {
      CREATE_INSTANT_INVITE = 1,
      KICK_MEMBERS = 1 << 1,
      BAN_MEMBERS = 1 << 2,
      ADMINISTRATOR = 1 << 3,
      MANAGE_CHANNELS = 1 << 4,
      MANAGE_GUILD = 1 << 5,
      ADD_REACTIONS = 1 << 6,
      VIEW_AUDIT_LOGS = 1 << 7,
      VOICE_PRIORITY_SPEAKER = 1 << 8,
      STREAM = 1 << 9,
      READ_MESSAGES = 1 << 10,
      SEND_MESSAGES = 1 << 11,
      SEND_TTS_MESSAGES = 1 << 12,
      MANAGE_MESSAGES = 1 << 13,
      EMBED_LINKS = 1 << 14,
      ATTACH_FILES = 1 << 15,
      READ_MESSAGE_HISTORY = 1 << 16,
      MENTION_EVERYONE = 1 << 17,
      EXTERNAL_EMOJIS = 1 << 18,
      VIEW_GUILD_ANALYTICS = 1 << 19,
      VOICE_CONNECT = 1 << 20,
      VOICE_SPEAK = 1 << 21,
      VOICE_MUTE_MEMBERS = 1 << 22,
      VOICE_DEAFEN_MEMBERS = 1 << 23,
      VOICE_MOVE_MEMBERS = 1 << 24,
      VOICE_USE_VAD = 1 << 25,
      CHANGE_NICKNAME = 1 << 26,
      MANAGE_NICKNAMES = 1 << 27,
      MANAGE_ROLES = 1 << 28,
      MANAGE_WEBHOOKS = 1 << 29,
      MANAGE_EMOJIS = 1 << 30,
      REQUEST_TO_SPEAK = 1 << 32,
      NONE = 0,
  
      /**
       * A utility combining all permissions.
       */
      ALL = CREATE_INSTANT_INVITE |
        KICK_MEMBERS |
        BAN_MEMBERS |
        ADMINISTRATOR |
        MANAGE_CHANNELS |
        MANAGE_GUILD |
        ADD_REACTIONS |
        VIEW_AUDIT_LOGS |
        VOICE_PRIORITY_SPEAKER |
        STREAM |
        READ_MESSAGES |
        SEND_MESSAGES |
        SEND_TTS_MESSAGES |
        MANAGE_MESSAGES |
        EMBED_LINKS |
        ATTACH_FILES |
        READ_MESSAGE_HISTORY |
        MENTION_EVERYONE |
        EXTERNAL_EMOJIS |
        VIEW_GUILD_ANALYTICS |
        VOICE_CONNECT |
        VOICE_SPEAK |
        VOICE_MUTE_MEMBERS |
        VOICE_DEAFEN_MEMBERS |
        VOICE_MOVE_MEMBERS |
        VOICE_USE_VAD |
        CHANGE_NICKNAME |
        MANAGE_NICKNAMES |
        MANAGE_ROLES |
        MANAGE_WEBHOOKS |
        MANAGE_EMOJIS |
        REQUEST_TO_SPEAK,
    }
  
    /**
     * The `decor` (decorations) module aims to provide constants for decorative items such as emojis and colors.
     */
    module decor {
      /**
       * An enumeration of numerical representations of default role color-picker options, as shown in the Discord client app.
       */
      const enum RoleColors {
        /**
         * Hex `#99AAB5` RGB: `rgb(153, 170, 181)`
         */
        DEFAULT = 0x99aab5,
  
        /**
         * Hex: `#1ABC9C` RGB: `rgb(26, 188, 156)`
         */
        CYAN = 0x1abc9c,
  
        /**
         * Hex: `#11806A` RGB: `rgb(17, 128, 106)`
         */
        DARK_CYAN = 0x11806a,
  
        /**
         * Hex: `#2ECC71` RGB: `rgb(46, 204, 113)`
         */
        GREEN = 0x2ecc71,
  
        /**
         * Hex: `#1F8B4C` RGB: `rgb(31, 139, 76)`
         */
        DARK_GREEN = 0x1f8b4c,
  
        /**
         * Hex: `#3498DB` RGB: `rgb(52, 152, 219)`
         */
        BLUE = 0x3498db,
  
        /**
         * Hex: `#206694` RGB: `rgb(32, 102, 148)`
         */
        DARK_BLUE = 0x206694,
  
        /**
         * Hex: `#9B59B6` RGB: `rgb(155, 89, 182)`
         */
        PURPLE = 0x9b59b6,
  
        /**
         * Hex: `#71368A` RGB: `rgb(113, 54, 138)`
         */
        DARK_PURPLE = 0x71368a,
  
        /**
         * Hex: `#E91E63` RGB: `rgb(233, 30, 99)`
         */
        PINK = 0xe91e63,
  
        /**
         * Hex: `#AD1457` RGB: `rgb(173, 20, 87)`
         */
        DARK_PINK = 0xad1457,
  
        /**
         * Hex: `#F1C40F` RGB: `rgb(241, 196, 15)`
         */
        YELLOW = 0xf1c40f,
  
        /**
         * Hex: `#C27C0E` RGB: `rgb(194, 124, 14)`
         */
        DARK_YELLOW = 0xc27c0e,
  
        /**
         * Hex: `#E67E22` RGB: `rgb(230, 126, 34)`
         */
        ORANGE = 0xe67e22,
  
        /**
         * Hex: `#A84300` RGB: `rgb(168, 67, 0)`
         */
        DARK_ORANGE = 0xa84300,
  
        /**
         * Hex: `#E74C3C` RGB: `rgb(231, 76, 60)`
         */
        RED = 0xe74c3c,
  
        /**
         * Hex: `#992D22` RGB: `rgb(153, 45, 34)`
         */
        DARK_RED = 0x992d22,
  
        /**
         * Hex: `#95A5A6` RGB: `rgb(149, 165, 166)`
         */
        GRAY = 0x95a5a6,
  
        /**
         * Hex: `#979C9F` RGB: `rgb(151, 156, 159)`
         */
        DARK_GRAY = 0x979c9f,
  
        /**
         * Hex: `#607D8B` RGB: `rgb(96, 125, 139)`
         */
        SLATE = 0x607d8b,
  
        /**
         * Hex: `#546E7A` RGB: `rgb(84, 110, 122)`
         */
        DARK_SLATE = 0x546e7a,
      }
  
      /**
       * An enumeration mapping Discord emoji names to their unicode literal.
       *
       * For simplicity, the keys represent the same names you may use when sending messages with the Discord client.
       * Some emojis may be represented more than once, in which case their aliases are listed in the documentation header.
       */
  
      const enum Emojis {
        /**
         * Emoji: ðŸŽ±
         */
        "8BALL" = "ðŸŽ±",
        /**
         * Emoji: ðŸ…°ï¸
         */
        "A" = "ðŸ…°ï¸",
        /**
         * Emoji: ðŸ†Ž
         */
        "AB" = "ðŸ†Ž",
        /**
         * Emoji: ðŸ§®
         */
        "ABACUS" = "ðŸ§®",
        /**
         * Emoji: ðŸ”¤
         */
        "ABC" = "ðŸ”¤",
        /**
         * Emoji: ðŸ”¡
         */
        "ABCD" = "ðŸ”¡",
        /**
         * Emoji: ðŸ‰‘
         */
        "ACCEPT" = "ðŸ‰‘",
        /**
         * Emoji: ðŸª—
         */
        "ACCORDION" = "ðŸª—",
        /**
         * Emoji: ðŸ©¹
         */
        "ADHESIVE_BANDAGE" = "ðŸ©¹",
        /**
         * Emoji: ðŸŽŸï¸
         *
         * Aliases: `TICKETS`
         */
        "ADMISSION_TICKETS" = "ðŸŽŸï¸",
        /**
         * Emoji: ðŸ§‘
         */
        "ADULT" = "ðŸ§‘",
        /**
         * Emoji: ðŸš¡
         */
        "AERIAL_TRAMWAY" = "ðŸš¡",
        /**
         * Emoji: âœˆï¸
         */
        "AIRPLANE" = "âœˆï¸",
        /**
         * Emoji: ðŸ›¬
         */
        "AIRPLANE_ARRIVING" = "ðŸ›¬",
        /**
         * Emoji: ðŸ›«
         */
        "AIRPLANE_DEPARTURE" = "ðŸ›«",
        /**
         * Emoji: ðŸ›©ï¸
         *
         * Aliases: `SMALL_AIRPLANE`
         */
        "AIRPLANE_SMALL" = "ðŸ›©ï¸",
        /**
         * Emoji: â°
         */
        "ALARM_CLOCK" = "â°",
        /**
         * Emoji: âš—ï¸
         */
        "ALEMBIC" = "âš—ï¸",
        /**
         * Emoji: ðŸ‘½
         */
        "ALIEN" = "ðŸ‘½",
        /**
         * Emoji: ðŸš‘
         */
        "AMBULANCE" = "ðŸš‘",
        /**
         * Emoji: ðŸº
         */
        "AMPHORA" = "ðŸº",
        /**
         * Emoji: ðŸ«€
         */
        "ANATOMICAL_HEART" = "ðŸ«€",
        /**
         * Emoji: âš“
         */
        "ANCHOR" = "âš“",
        /**
         * Emoji: ðŸ‘¼
         */
        "ANGEL" = "ðŸ‘¼",
        /**
         * Emoji: ðŸ’¢
         */
        "ANGER" = "ðŸ’¢",
        /**
         * Emoji: ðŸ—¯ï¸
         *
         * Aliases: `RIGHT_ANGER_BUBBLE`
         */
        "ANGER_RIGHT" = "ðŸ—¯ï¸",
        /**
         * Emoji: ðŸ˜ 
         */
        "ANGRY" = "ðŸ˜ ",
        /**
         * Emoji: ðŸ˜§
         */
        "ANGUISHED" = "ðŸ˜§",
        /**
         * Emoji: ðŸœ
         */
        "ANT" = "ðŸœ",
        /**
         * Emoji: ðŸŽ
         */
        "APPLE" = "ðŸŽ",
        /**
         * Emoji: â™’
         */
        "AQUARIUS" = "â™’",
        /**
         * Emoji: ðŸ¹
         *
         * Aliases: `BOW_AND_ARROW`
         */
        "ARCHERY" = "ðŸ¹",
        /**
         * Emoji: â™ˆ
         */
        "ARIES" = "â™ˆ",
        /**
         * Emoji: ðŸ”ƒ
         */
        "ARROWS_CLOCKWISE" = "ðŸ”ƒ",
        /**
         * Emoji: ðŸ”„
         */
        "ARROWS_COUNTERCLOCKWISE" = "ðŸ”„",
        /**
         * Emoji: â—€ï¸
         */
        "ARROW_BACKWARD" = "â—€ï¸",
        /**
         * Emoji: â¬
         */
        "ARROW_DOUBLE_DOWN" = "â¬",
        /**
         * Emoji: â«
         */
        "ARROW_DOUBLE_UP" = "â«",
        /**
         * Emoji: â¬‡ï¸
         */
        "ARROW_DOWN" = "â¬‡ï¸",
        /**
         * Emoji: ðŸ”½
         */
        "ARROW_DOWN_SMALL" = "ðŸ”½",
        /**
         * Emoji: â–¶ï¸
         */
        "ARROW_FORWARD" = "â–¶ï¸",
        /**
         * Emoji: â¤µï¸
         */
        "ARROW_HEADING_DOWN" = "â¤µï¸",
        /**
         * Emoji: â¤´ï¸
         */
        "ARROW_HEADING_UP" = "â¤´ï¸",
        /**
         * Emoji: â¬…ï¸
         */
        "ARROW_LEFT" = "â¬…ï¸",
        /**
         * Emoji: â†™ï¸
         */
        "ARROW_LOWER_LEFT" = "â†™ï¸",
        /**
         * Emoji: â†˜ï¸
         */
        "ARROW_LOWER_RIGHT" = "â†˜ï¸",
        /**
         * Emoji: âž¡ï¸
         */
        "ARROW_RIGHT" = "âž¡ï¸",
        /**
         * Emoji: â†ªï¸
         */
        "ARROW_RIGHT_HOOK" = "â†ªï¸",
        /**
         * Emoji: â¬†ï¸
         */
        "ARROW_UP" = "â¬†ï¸",
        /**
         * Emoji: â†–ï¸
         */
        "ARROW_UPPER_LEFT" = "â†–ï¸",
        /**
         * Emoji: â†—ï¸
         */
        "ARROW_UPPER_RIGHT" = "â†—ï¸",
        /**
         * Emoji: â†•ï¸
         */
        "ARROW_UP_DOWN" = "â†•ï¸",
        /**
         * Emoji: ðŸ”¼
         */
        "ARROW_UP_SMALL" = "ðŸ”¼",
        /**
         * Emoji: ðŸŽ¨
         */
        "ART" = "ðŸŽ¨",
        /**
         * Emoji: ðŸš›
         */
        "ARTICULATED_LORRY" = "ðŸš›",
        /**
         * Emoji: ðŸ§‘â€ðŸŽ¨
         */
        "ARTIST" = "ðŸ§‘â€ðŸŽ¨",
        /**
         * Emoji: *ï¸âƒ£
         *
         * Aliases: `KEYCAP_ASTERISK`
         */
        "ASTERISK" = "*ï¸âƒ£",
        /**
         * Emoji: ðŸ˜²
         */
        "ASTONISHED" = "ðŸ˜²",
        /**
         * Emoji: ðŸ§‘â€ðŸš€
         */
        "ASTRONAUT" = "ðŸ§‘â€ðŸš€",
        /**
         * Emoji: ðŸ‘Ÿ
         */
        "ATHLETIC_SHOE" = "ðŸ‘Ÿ",
        /**
         * Emoji: ðŸ§
         */
        "ATM" = "ðŸ§",
        /**
         * Emoji: âš›ï¸
         *
         * Aliases: `ATOM_SYMBOL`
         */
        "ATOM" = "âš›ï¸",
        /**
         * Emoji: âš›ï¸
         *
         * Aliases: `ATOM`
         */
        "ATOM_SYMBOL" = "âš›ï¸",
        /**
         * Emoji: ðŸ›º
         */
        "AUTO_RICKSHAW" = "ðŸ›º",
        /**
         * Emoji: ðŸ¥‘
         */
        "AVOCADO" = "ðŸ¥‘",
        /**
         * Emoji: ðŸª“
         */
        "AXE" = "ðŸª“",
        /**
         * Emoji: ðŸ…±ï¸
         */
        "B" = "ðŸ…±ï¸",
        /**
         * Emoji: ðŸ‘¶
         */
        "BABY" = "ðŸ‘¶",
        /**
         * Emoji: ðŸ¼
         */
        "BABY_BOTTLE" = "ðŸ¼",
        /**
         * Emoji: ðŸ¤
         */
        "BABY_CHICK" = "ðŸ¤",
        /**
         * Emoji: ðŸš¼
         */
        "BABY_SYMBOL" = "ðŸš¼",
        /**
         * Emoji: ðŸ”™
         */
        "BACK" = "ðŸ”™",
        /**
         * Emoji: ðŸ¤š
         *
         * Aliases: `RAISED_BACK_OF_HAND`
         */
        "BACK_OF_HAND" = "ðŸ¤š",
        /**
         * Emoji: ðŸ¥“
         */
        "BACON" = "ðŸ¥“",
        /**
         * Emoji: ðŸ¦¡
         */
        "BADGER" = "ðŸ¦¡",
        /**
         * Emoji: ðŸ¸
         */
        "BADMINTON" = "ðŸ¸",
        /**
         * Emoji: ðŸ¥¯
         */
        "BAGEL" = "ðŸ¥¯",
        /**
         * Emoji: ðŸ›„
         */
        "BAGGAGE_CLAIM" = "ðŸ›„",
        /**
         * Emoji: ðŸ¥–
         *
         * Aliases: `FRENCH_BREAD`
         */
        "BAGUETTE_BREAD" = "ðŸ¥–",
        /**
         * Emoji: ðŸ©°
         */
        "BALLET_SHOES" = "ðŸ©°",
        /**
         * Emoji: ðŸŽˆ
         */
        "BALLOON" = "ðŸŽˆ",
        /**
         * Emoji: ðŸ—³ï¸
         *
         * Aliases: `BALLOT_BOX_WITH_BALLOT`
         */
        "BALLOT_BOX" = "ðŸ—³ï¸",
        /**
         * Emoji: ðŸ—³ï¸
         *
         * Aliases: `BALLOT_BOX`
         */
        "BALLOT_BOX_WITH_BALLOT" = "ðŸ—³ï¸",
        /**
         * Emoji: â˜‘ï¸
         */
        "BALLOT_BOX_WITH_CHECK" = "â˜‘ï¸",
        /**
         * Emoji: ðŸŽ
         */
        "BAMBOO" = "ðŸŽ",
        /**
         * Emoji: ðŸŒ
         */
        "BANANA" = "ðŸŒ",
        /**
         * Emoji: â€¼ï¸
         */
        "BANGBANG" = "â€¼ï¸",
        /**
         * Emoji: ðŸª•
         */
        "BANJO" = "ðŸª•",
        /**
         * Emoji: ðŸ¦
         */
        "BANK" = "ðŸ¦",
        /**
         * Emoji: ðŸ’ˆ
         */
        "BARBER" = "ðŸ’ˆ",
        /**
         * Emoji: ðŸ“Š
         */
        "BAR_CHART" = "ðŸ“Š",
        /**
         * Emoji: âš¾
         */
        "BASEBALL" = "âš¾",
        /**
         * Emoji: ðŸ§º
         */
        "BASKET" = "ðŸ§º",
        /**
         * Emoji: ðŸ€
         */
        "BASKETBALL" = "ðŸ€",
        /**
         * Emoji: â›¹ï¸
         *
         * Aliases: `PERSON_BOUNCING_BALL`,`PERSON_WITH_BALL`
         */
        "BASKETBALL_PLAYER" = "â›¹ï¸",
        /**
         * Emoji: ðŸ¦‡
         */
        "BAT" = "ðŸ¦‡",
        /**
         * Emoji: ðŸ›€
         */
        "BATH" = "ðŸ›€",
        /**
         * Emoji: ðŸ›
         */
        "BATHTUB" = "ðŸ›",
        /**
         * Emoji: ðŸ”‹
         */
        "BATTERY" = "ðŸ”‹",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `BEACH_WITH_UMBRELLA`
         */
        "BEACH" = "ðŸ–ï¸",
        /**
         * Emoji: â›±ï¸
         *
         * Aliases: `UMBRELLA_ON_GROUND`
         */
        "BEACH_UMBRELLA" = "â›±ï¸",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `BEACH`
         */
        "BEACH_WITH_UMBRELLA" = "ðŸ–ï¸",
        /**
         * Emoji: ðŸ»
         */
        "BEAR" = "ðŸ»",
        /**
         * Emoji: ðŸ§”
         */
        "BEARDED_PERSON" = "ðŸ§”",
        /**
         * Emoji: ðŸ¦«
         */
        "BEAVER" = "ðŸ¦«",
        /**
         * Emoji: ðŸ›ï¸
         */
        "BED" = "ðŸ›ï¸",
        /**
         * Emoji: ðŸ
         */
        "BEE" = "ðŸ",
        /**
         * Emoji: ðŸº
         */
        "BEER" = "ðŸº",
        /**
         * Emoji: ðŸ»
         */
        "BEERS" = "ðŸ»",
        /**
         * Emoji: ðŸª²
         */
        "BEETLE" = "ðŸª²",
        /**
         * Emoji: ðŸ”°
         */
        "BEGINNER" = "ðŸ”°",
        /**
         * Emoji: ðŸ””
         */
        "BELL" = "ðŸ””",
        /**
         * Emoji: ðŸ›Žï¸
         *
         * Aliases: `BELLHOP_BELL`
         */
        "BELLHOP" = "ðŸ›Žï¸",
        /**
         * Emoji: ðŸ›Žï¸
         *
         * Aliases: `BELLHOP`
         */
        "BELLHOP_BELL" = "ðŸ›Žï¸",
        /**
         * Emoji: ðŸ«‘
         */
        "BELL_PEPPER" = "ðŸ«‘",
        /**
         * Emoji: ðŸ±
         */
        "BENTO" = "ðŸ±",
        /**
         * Emoji: ðŸ§ƒ
         */
        "BEVERAGE_BOX" = "ðŸ§ƒ",
        /**
         * Emoji: ðŸš´
         *
         * Aliases: `PERSON_BIKING`
         */
        "BICYCLIST" = "ðŸš´",
        /**
         * Emoji: ðŸš²
         */
        "BIKE" = "ðŸš²",
        /**
         * Emoji: ðŸ‘™
         */
        "BIKINI" = "ðŸ‘™",
        /**
         * Emoji: ðŸ§¢
         */
        "BILLED_CAP" = "ðŸ§¢",
        /**
         * Emoji: â˜£ï¸
         *
         * Aliases: `BIOHAZARD_SIGN`
         */
        "BIOHAZARD" = "â˜£ï¸",
        /**
         * Emoji: â˜£ï¸
         *
         * Aliases: `BIOHAZARD`
         */
        "BIOHAZARD_SIGN" = "â˜£ï¸",
        /**
         * Emoji: ðŸ¦
         */
        "BIRD" = "ðŸ¦",
        /**
         * Emoji: ðŸŽ‚
         */
        "BIRTHDAY" = "ðŸŽ‚",
        /**
         * Emoji: ðŸ¦¬
         */
        "BISON" = "ðŸ¦¬",
        /**
         * Emoji: ðŸˆâ€â¬›
         */
        "BLACK_CAT" = "ðŸˆâ€â¬›",
        /**
         * Emoji: âš«
         */
        "BLACK_CIRCLE" = "âš«",
        /**
         * Emoji: ðŸ–¤
         */
        "BLACK_HEART" = "ðŸ–¤",
        /**
         * Emoji: ðŸƒ
         */
        "BLACK_JOKER" = "ðŸƒ",
        /**
         * Emoji: â¬›
         */
        "BLACK_LARGE_SQUARE" = "â¬›",
        /**
         * Emoji: â—¾
         */
        "BLACK_MEDIUM_SMALL_SQUARE" = "â—¾",
        /**
         * Emoji: â—¼ï¸
         */
        "BLACK_MEDIUM_SQUARE" = "â—¼ï¸",
        /**
         * Emoji: âœ’ï¸
         */
        "BLACK_NIB" = "âœ’ï¸",
        /**
         * Emoji: â–ªï¸
         */
        "BLACK_SMALL_SQUARE" = "â–ªï¸",
        /**
         * Emoji: ðŸ”²
         */
        "BLACK_SQUARE_BUTTON" = "ðŸ”²",
        /**
         * Emoji: ðŸ‘±â€â™‚ï¸
         */
        "BLOND_HAIRED_MAN" = "ðŸ‘±â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘±
         *
         * Aliases: `PERSON_WITH_BLOND_HAIR`
         */
        "BLOND_HAIRED_PERSON" = "ðŸ‘±",
        /**
         * Emoji: ðŸ‘±â€â™€ï¸
         */
        "BLOND_HAIRED_WOMAN" = "ðŸ‘±â€â™€ï¸",
        /**
         * Emoji: ðŸŒ¼
         */
        "BLOSSOM" = "ðŸŒ¼",
        /**
         * Emoji: ðŸ¡
         */
        "BLOWFISH" = "ðŸ¡",
        /**
         * Emoji: ðŸ«
         */
        "BLUEBERRIES" = "ðŸ«",
        /**
         * Emoji: ðŸ“˜
         */
        "BLUE_BOOK" = "ðŸ“˜",
        /**
         * Emoji: ðŸš™
         */
        "BLUE_CAR" = "ðŸš™",
        /**
         * Emoji: ðŸ”µ
         */
        "BLUE_CIRCLE" = "ðŸ”µ",
        /**
         * Emoji: ðŸ’™
         */
        "BLUE_HEART" = "ðŸ’™",
        /**
         * Emoji: ðŸŸ¦
         */
        "BLUE_SQUARE" = "ðŸŸ¦",
        /**
         * Emoji: ðŸ˜Š
         */
        "BLUSH" = "ðŸ˜Š",
        /**
         * Emoji: ðŸ—
         */
        "BOAR" = "ðŸ—",
        /**
         * Emoji: ðŸ’£
         */
        "BOMB" = "ðŸ’£",
        /**
         * Emoji: ðŸ¦´
         */
        "BONE" = "ðŸ¦´",
        /**
         * Emoji: ðŸ“–
         */
        "BOOK" = "ðŸ“–",
        /**
         * Emoji: ðŸ”–
         */
        "BOOKMARK" = "ðŸ”–",
        /**
         * Emoji: ðŸ“‘
         */
        "BOOKMARK_TABS" = "ðŸ“‘",
        /**
         * Emoji: ðŸ“š
         */
        "BOOKS" = "ðŸ“š",
        /**
         * Emoji: ðŸ’¥
         */
        "BOOM" = "ðŸ’¥",
        /**
         * Emoji: ðŸªƒ
         */
        "BOOMERANG" = "ðŸªƒ",
        /**
         * Emoji: ðŸ‘¢
         */
        "BOOT" = "ðŸ‘¢",
        /**
         * Emoji: ðŸ¾
         *
         * Aliases: `CHAMPAGNE`
         */
        "BOTTLE_WITH_POPPING_CORK" = "ðŸ¾",
        /**
         * Emoji: ðŸ’
         */
        "BOUQUET" = "ðŸ’",
        /**
         * Emoji: ðŸ™‡
         *
         * Aliases: `PERSON_BOWING`
         */
        "BOW" = "ðŸ™‡",
        /**
         * Emoji: ðŸŽ³
         */
        "BOWLING" = "ðŸŽ³",
        /**
         * Emoji: ðŸ¥£
         */
        "BOWL_WITH_SPOON" = "ðŸ¥£",
        /**
         * Emoji: ðŸ¹
         *
         * Aliases: `ARCHERY`
         */
        "BOW_AND_ARROW" = "ðŸ¹",
        /**
         * Emoji: ðŸ¥Š
         *
         * Aliases: `BOXING_GLOVES`
         */
        "BOXING_GLOVE" = "ðŸ¥Š",
        /**
         * Emoji: ðŸ¥Š
         *
         * Aliases: `BOXING_GLOVE`
         */
        "BOXING_GLOVES" = "ðŸ¥Š",
        /**
         * Emoji: ðŸ‘¦
         */
        "BOY" = "ðŸ‘¦",
        /**
         * Emoji: ðŸ§ 
         */
        "BRAIN" = "ðŸ§ ",
        /**
         * Emoji: ðŸž
         */
        "BREAD" = "ðŸž",
        /**
         * Emoji: ðŸ¤±
         */
        "BREAST_FEEDING" = "ðŸ¤±",
        /**
         * Emoji: ðŸ§±
         */
        "BRICKS" = "ðŸ§±",
        /**
         * Emoji: ðŸ‘°â€â™€ï¸
         *
         * Aliases: `WOMAN_WITH_VEIL`
         */
        "BRIDE_WITH_VEIL" = "ðŸ‘°â€â™€ï¸",
        /**
         * Emoji: ðŸŒ‰
         */
        "BRIDGE_AT_NIGHT" = "ðŸŒ‰",
        /**
         * Emoji: ðŸ’¼
         */
        "BRIEFCASE" = "ðŸ’¼",
        /**
         * Emoji: ðŸ©²
         */
        "BRIEFS" = "ðŸ©²",
        /**
         * Emoji: ðŸ¥¦
         */
        "BROCCOLI" = "ðŸ¥¦",
        /**
         * Emoji: ðŸ’”
         */
        "BROKEN_HEART" = "ðŸ’”",
        /**
         * Emoji: ðŸ§¹
         */
        "BROOM" = "ðŸ§¹",
        /**
         * Emoji: ðŸŸ¤
         */
        "BROWN_CIRCLE" = "ðŸŸ¤",
        /**
         * Emoji: ðŸ¤Ž
         */
        "BROWN_HEART" = "ðŸ¤Ž",
        /**
         * Emoji: ðŸŸ«
         */
        "BROWN_SQUARE" = "ðŸŸ«",
        /**
         * Emoji: ðŸ§‹
         */
        "BUBBLE_TEA" = "ðŸ§‹",
        /**
         * Emoji: ðŸª£
         */
        "BUCKET" = "ðŸª£",
        /**
         * Emoji: ðŸ›
         */
        "BUG" = "ðŸ›",
        /**
         * Emoji: ðŸ—ï¸
         *
         * Aliases: `CONSTRUCTION_SITE`
         */
        "BUILDING_CONSTRUCTION" = "ðŸ—ï¸",
        /**
         * Emoji: ðŸ’¡
         */
        "BULB" = "ðŸ’¡",
        /**
         * Emoji: ðŸš…
         */
        "BULLETTRAIN_FRONT" = "ðŸš…",
        /**
         * Emoji: ðŸš„
         */
        "BULLETTRAIN_SIDE" = "ðŸš„",
        /**
         * Emoji: ðŸŒ¯
         */
        "BURRITO" = "ðŸŒ¯",
        /**
         * Emoji: ðŸšŒ
         */
        "BUS" = "ðŸšŒ",
        /**
         * Emoji: ðŸš
         */
        "BUSSTOP" = "ðŸš",
        /**
         * Emoji: ðŸ‘¥
         */
        "BUSTS_IN_SILHOUETTE" = "ðŸ‘¥",
        /**
         * Emoji: ðŸ‘¤
         */
        "BUST_IN_SILHOUETTE" = "ðŸ‘¤",
        /**
         * Emoji: ðŸ§ˆ
         */
        "BUTTER" = "ðŸ§ˆ",
        /**
         * Emoji: ðŸ¦‹
         */
        "BUTTERFLY" = "ðŸ¦‹",
        /**
         * Emoji: ðŸŒµ
         */
        "CACTUS" = "ðŸŒµ",
        /**
         * Emoji: ðŸ°
         */
        "CAKE" = "ðŸ°",
        /**
         * Emoji: ðŸ“†
         */
        "CALENDAR" = "ðŸ“†",
        /**
         * Emoji: ðŸ—“ï¸
         *
         * Aliases: `SPIRAL_CALENDAR_PAD`
         */
        "CALENDAR_SPIRAL" = "ðŸ—“ï¸",
        /**
         * Emoji: ðŸ“²
         */
        "CALLING" = "ðŸ“²",
        /**
         * Emoji: ðŸ¤™
         *
         * Aliases: `CALL_ME_HAND`
         */
        "CALL_ME" = "ðŸ¤™",
        /**
         * Emoji: ðŸ¤™
         *
         * Aliases: `CALL_ME`
         */
        "CALL_ME_HAND" = "ðŸ¤™",
        /**
         * Emoji: ðŸ«
         */
        "CAMEL" = "ðŸ«",
        /**
         * Emoji: ðŸ“·
         */
        "CAMERA" = "ðŸ“·",
        /**
         * Emoji: ðŸ“¸
         */
        "CAMERA_WITH_FLASH" = "ðŸ“¸",
        /**
         * Emoji: ðŸ•ï¸
         */
        "CAMPING" = "ðŸ•ï¸",
        /**
         * Emoji: â™‹
         */
        "CANCER" = "â™‹",
        /**
         * Emoji: ðŸ•¯ï¸
         */
        "CANDLE" = "ðŸ•¯ï¸",
        /**
         * Emoji: ðŸ¬
         */
        "CANDY" = "ðŸ¬",
        /**
         * Emoji: ðŸ¥«
         */
        "CANNED_FOOD" = "ðŸ¥«",
        /**
         * Emoji: ðŸ›¶
         *
         * Aliases: `KAYAK`
         */
        "CANOE" = "ðŸ›¶",
        /**
         * Emoji: ðŸ” 
         */
        "CAPITAL_ABCD" = "ðŸ” ",
        /**
         * Emoji: â™‘
         */
        "CAPRICORN" = "â™‘",
        /**
         * Emoji: ðŸ—ƒï¸
         *
         * Aliases: `CARD_FILE_BOX`
         */
        "CARD_BOX" = "ðŸ—ƒï¸",
        /**
         * Emoji: ðŸ—ƒï¸
         *
         * Aliases: `CARD_BOX`
         */
        "CARD_FILE_BOX" = "ðŸ—ƒï¸",
        /**
         * Emoji: ðŸ“‡
         */
        "CARD_INDEX" = "ðŸ“‡",
        /**
         * Emoji: ðŸ—‚ï¸
         *
         * Aliases: `DIVIDERS`
         */
        "CARD_INDEX_DIVIDERS" = "ðŸ—‚ï¸",
        /**
         * Emoji: ðŸŽ 
         */
        "CAROUSEL_HORSE" = "ðŸŽ ",
        /**
         * Emoji: ðŸªš
         */
        "CARPENTRY_SAW" = "ðŸªš",
        /**
         * Emoji: ðŸ¥•
         */
        "CARROT" = "ðŸ¥•",
        /**
         * Emoji: ðŸ¤¸
         *
         * Aliases: `PERSON_DOING_CARTWHEEL`
         */
        "CARTWHEEL" = "ðŸ¤¸",
        /**
         * Emoji: ðŸ±
         */
        "CAT" = "ðŸ±",
        /**
         * Emoji: ðŸˆ
         */
        "CAT2" = "ðŸˆ",
        /**
         * Emoji: ðŸ’¿
         */
        "CD" = "ðŸ’¿",
        /**
         * Emoji: â›“ï¸
         */
        "CHAINS" = "â›“ï¸",
        /**
         * Emoji: ðŸª‘
         */
        "CHAIR" = "ðŸª‘",
        /**
         * Emoji: ðŸ¾
         *
         * Aliases: `BOTTLE_WITH_POPPING_CORK`
         */
        "CHAMPAGNE" = "ðŸ¾",
        /**
         * Emoji: ðŸ¥‚
         *
         * Aliases: `CLINKING_GLASS`
         */
        "CHAMPAGNE_GLASS" = "ðŸ¥‚",
        /**
         * Emoji: ðŸ’¹
         */
        "CHART" = "ðŸ’¹",
        /**
         * Emoji: ðŸ“‰
         */
        "CHART_WITH_DOWNWARDS_TREND" = "ðŸ“‰",
        /**
         * Emoji: ðŸ“ˆ
         */
        "CHART_WITH_UPWARDS_TREND" = "ðŸ“ˆ",
        /**
         * Emoji: ðŸ
         */
        "CHECKERED_FLAG" = "ðŸ",
        /**
         * Emoji: ðŸ§€
         *
         * Aliases: `CHEESE_WEDGE`
         */
        "CHEESE" = "ðŸ§€",
        /**
         * Emoji: ðŸ§€
         *
         * Aliases: `CHEESE`
         */
        "CHEESE_WEDGE" = "ðŸ§€",
        /**
         * Emoji: ðŸ’
         */
        "CHERRIES" = "ðŸ’",
        /**
         * Emoji: ðŸŒ¸
         */
        "CHERRY_BLOSSOM" = "ðŸŒ¸",
        /**
         * Emoji: â™Ÿï¸
         */
        "CHESS_PAWN" = "â™Ÿï¸",
        /**
         * Emoji: ðŸŒ°
         */
        "CHESTNUT" = "ðŸŒ°",
        /**
         * Emoji: ðŸ”
         */
        "CHICKEN" = "ðŸ”",
        /**
         * Emoji: ðŸ§’
         */
        "CHILD" = "ðŸ§’",
        /**
         * Emoji: ðŸš¸
         */
        "CHILDREN_CROSSING" = "ðŸš¸",
        /**
         * Emoji: ðŸ¿ï¸
         */
        "CHIPMUNK" = "ðŸ¿ï¸",
        /**
         * Emoji: ðŸ«
         */
        "CHOCOLATE_BAR" = "ðŸ«",
        /**
         * Emoji: ðŸ¥¢
         */
        "CHOPSTICKS" = "ðŸ¥¢",
        /**
         * Emoji: ðŸŽ„
         */
        "CHRISTMAS_TREE" = "ðŸŽ„",
        /**
         * Emoji: â›ª
         */
        "CHURCH" = "â›ª",
        /**
         * Emoji: ðŸŽ¦
         */
        "CINEMA" = "ðŸŽ¦",
        /**
         * Emoji: ðŸŽª
         */
        "CIRCUS_TENT" = "ðŸŽª",
        /**
         * Emoji: ðŸ™ï¸
         */
        "CITYSCAPE" = "ðŸ™ï¸",
        /**
         * Emoji: ðŸŒ†
         */
        "CITY_DUSK" = "ðŸŒ†",
        /**
         * Emoji: ðŸŒ‡
         *
         * Aliases: `CITY_SUNSET`
         */
        "CITY_SUNRISE" = "ðŸŒ‡",
        /**
         * Emoji: ðŸŒ‡
         *
         * Aliases: `CITY_SUNRISE`
         */
        "CITY_SUNSET" = "ðŸŒ‡",
        /**
         * Emoji: ðŸ†‘
         */
        "CL" = "ðŸ†‘",
        /**
         * Emoji: ðŸ‘
         */
        "CLAP" = "ðŸ‘",
        /**
         * Emoji: ðŸŽ¬
         */
        "CLAPPER" = "ðŸŽ¬",
        /**
         * Emoji: ðŸ›ï¸
         */
        "CLASSICAL_BUILDING" = "ðŸ›ï¸",
        /**
         * Emoji: ðŸ¥‚
         *
         * Aliases: `CHAMPAGNE_GLASS`
         */
        "CLINKING_GLASS" = "ðŸ¥‚",
        /**
         * Emoji: ðŸ“‹
         */
        "CLIPBOARD" = "ðŸ“‹",
        /**
         * Emoji: ðŸ•°ï¸
         *
         * Aliases: `MANTLEPIECE_CLOCK`
         */
        "CLOCK" = "ðŸ•°ï¸",
        /**
         * Emoji: ðŸ•
         */
        "CLOCK1" = "ðŸ•",
        /**
         * Emoji: ðŸ•™
         */
        "CLOCK10" = "ðŸ•™",
        /**
         * Emoji: ðŸ•¥
         */
        "CLOCK1030" = "ðŸ•¥",
        /**
         * Emoji: ðŸ•š
         */
        "CLOCK11" = "ðŸ•š",
        /**
         * Emoji: ðŸ•¦
         */
        "CLOCK1130" = "ðŸ•¦",
        /**
         * Emoji: ðŸ•›
         */
        "CLOCK12" = "ðŸ•›",
        /**
         * Emoji: ðŸ•§
         */
        "CLOCK1230" = "ðŸ•§",
        /**
         * Emoji: ðŸ•œ
         */
        "CLOCK130" = "ðŸ•œ",
        /**
         * Emoji: ðŸ•‘
         */
        "CLOCK2" = "ðŸ•‘",
        /**
         * Emoji: ðŸ•
         */
        "CLOCK230" = "ðŸ•",
        /**
         * Emoji: ðŸ•’
         */
        "CLOCK3" = "ðŸ•’",
        /**
         * Emoji: ðŸ•ž
         */
        "CLOCK330" = "ðŸ•ž",
        /**
         * Emoji: ðŸ•“
         */
        "CLOCK4" = "ðŸ•“",
        /**
         * Emoji: ðŸ•Ÿ
         */
        "CLOCK430" = "ðŸ•Ÿ",
        /**
         * Emoji: ðŸ•”
         */
        "CLOCK5" = "ðŸ•”",
        /**
         * Emoji: ðŸ• 
         */
        "CLOCK530" = "ðŸ• ",
        /**
         * Emoji: ðŸ••
         */
        "CLOCK6" = "ðŸ••",
        /**
         * Emoji: ðŸ•¡
         */
        "CLOCK630" = "ðŸ•¡",
        /**
         * Emoji: ðŸ•–
         */
        "CLOCK7" = "ðŸ•–",
        /**
         * Emoji: ðŸ•¢
         */
        "CLOCK730" = "ðŸ•¢",
        /**
         * Emoji: ðŸ•—
         */
        "CLOCK8" = "ðŸ•—",
        /**
         * Emoji: ðŸ•£
         */
        "CLOCK830" = "ðŸ•£",
        /**
         * Emoji: ðŸ•˜
         */
        "CLOCK9" = "ðŸ•˜",
        /**
         * Emoji: ðŸ•¤
         */
        "CLOCK930" = "ðŸ•¤",
        /**
         * Emoji: ðŸ“•
         */
        "CLOSED_BOOK" = "ðŸ“•",
        /**
         * Emoji: ðŸ”
         */
        "CLOSED_LOCK_WITH_KEY" = "ðŸ”",
        /**
         * Emoji: ðŸŒ‚
         */
        "CLOSED_UMBRELLA" = "ðŸŒ‚",
        /**
         * Emoji: â˜ï¸
         */
        "CLOUD" = "â˜ï¸",
        /**
         * Emoji: ðŸŒ©ï¸
         *
         * Aliases: `CLOUD_WITH_LIGHTNING`
         */
        "CLOUD_LIGHTNING" = "ðŸŒ©ï¸",
        /**
         * Emoji: ðŸŒ§ï¸
         *
         * Aliases: `CLOUD_WITH_RAIN`
         */
        "CLOUD_RAIN" = "ðŸŒ§ï¸",
        /**
         * Emoji: ðŸŒ¨ï¸
         *
         * Aliases: `CLOUD_WITH_SNOW`
         */
        "CLOUD_SNOW" = "ðŸŒ¨ï¸",
        /**
         * Emoji: ðŸŒªï¸
         *
         * Aliases: `CLOUD_WITH_TORNADO`
         */
        "CLOUD_TORNADO" = "ðŸŒªï¸",
        /**
         * Emoji: ðŸŒ©ï¸
         *
         * Aliases: `CLOUD_LIGHTNING`
         */
        "CLOUD_WITH_LIGHTNING" = "ðŸŒ©ï¸",
        /**
         * Emoji: ðŸŒ§ï¸
         *
         * Aliases: `CLOUD_RAIN`
         */
        "CLOUD_WITH_RAIN" = "ðŸŒ§ï¸",
        /**
         * Emoji: ðŸŒ¨ï¸
         *
         * Aliases: `CLOUD_SNOW`
         */
        "CLOUD_WITH_SNOW" = "ðŸŒ¨ï¸",
        /**
         * Emoji: ðŸŒªï¸
         *
         * Aliases: `CLOUD_TORNADO`
         */
        "CLOUD_WITH_TORNADO" = "ðŸŒªï¸",
        /**
         * Emoji: ðŸ¤¡
         *
         * Aliases: `CLOWN_FACE`
         */
        "CLOWN" = "ðŸ¤¡",
        /**
         * Emoji: ðŸ¤¡
         *
         * Aliases: `CLOWN`
         */
        "CLOWN_FACE" = "ðŸ¤¡",
        /**
         * Emoji: â™£ï¸
         */
        "CLUBS" = "â™£ï¸",
        /**
         * Emoji: ðŸ§¥
         */
        "COAT" = "ðŸ§¥",
        /**
         * Emoji: ðŸª³
         */
        "COCKROACH" = "ðŸª³",
        /**
         * Emoji: ðŸ¸
         */
        "COCKTAIL" = "ðŸ¸",
        /**
         * Emoji: ðŸ¥¥
         */
        "COCONUT" = "ðŸ¥¥",
        /**
         * Emoji: â˜•
         */
        "COFFEE" = "â˜•",
        /**
         * Emoji: âš°ï¸
         */
        "COFFIN" = "âš°ï¸",
        /**
         * Emoji: ðŸª™
         */
        "COIN" = "ðŸª™",
        /**
         * Emoji: ðŸ¥¶
         */
        "COLD_FACE" = "ðŸ¥¶",
        /**
         * Emoji: ðŸ˜°
         */
        "COLD_SWEAT" = "ðŸ˜°",
        /**
         * Emoji: â˜„ï¸
         */
        "COMET" = "â˜„ï¸",
        /**
         * Emoji: ðŸ§­
         */
        "COMPASS" = "ðŸ§­",
        /**
         * Emoji: ðŸ—œï¸
         */
        "COMPRESSION" = "ðŸ—œï¸",
        /**
         * Emoji: ðŸ’»
         */
        "COMPUTER" = "ðŸ’»",
        /**
         * Emoji: ðŸŽŠ
         */
        "CONFETTI_BALL" = "ðŸŽŠ",
        /**
         * Emoji: ðŸ˜–
         */
        "CONFOUNDED" = "ðŸ˜–",
        /**
         * Emoji: ðŸ˜•
         */
        "CONFUSED" = "ðŸ˜•",
        /**
         * Emoji: ãŠ—ï¸
         */
        "CONGRATULATIONS" = "ãŠ—ï¸",
        /**
         * Emoji: ðŸš§
         */
        "CONSTRUCTION" = "ðŸš§",
        /**
         * Emoji: ðŸ—ï¸
         *
         * Aliases: `BUILDING_CONSTRUCTION`
         */
        "CONSTRUCTION_SITE" = "ðŸ—ï¸",
        /**
         * Emoji: ðŸ‘·
         */
        "CONSTRUCTION_WORKER" = "ðŸ‘·",
        /**
         * Emoji: ðŸŽ›ï¸
         */
        "CONTROL_KNOBS" = "ðŸŽ›ï¸",
        /**
         * Emoji: ðŸª
         */
        "CONVENIENCE_STORE" = "ðŸª",
        /**
         * Emoji: ðŸ§‘â€ðŸ³
         */
        "COOK" = "ðŸ§‘â€ðŸ³",
        /**
         * Emoji: ðŸª
         */
        "COOKIE" = "ðŸª",
        /**
         * Emoji: ðŸ³
         */
        "COOKING" = "ðŸ³",
        /**
         * Emoji: ðŸ†’
         */
        "COOL" = "ðŸ†’",
        /**
         * Emoji: ðŸ‘®
         *
         * Aliases: `POLICE_OFFICER`
         */
        "COP" = "ðŸ‘®",
        /**
         * Emoji: Â©ï¸
         */
        "COPYRIGHT" = "Â©ï¸",
        /**
         * Emoji: ðŸŒ½
         */
        "CORN" = "ðŸŒ½",
        /**
         * Emoji: ðŸ›‹ï¸
         *
         * Aliases: `COUCH_AND_LAMP`
         */
        "COUCH" = "ðŸ›‹ï¸",
        /**
         * Emoji: ðŸ›‹ï¸
         *
         * Aliases: `COUCH`
         */
        "COUCH_AND_LAMP" = "ðŸ›‹ï¸",
        /**
         * Emoji: ðŸ‘«
         */
        "COUPLE" = "ðŸ‘«",
        /**
         * Emoji: ðŸ’
         */
        "COUPLEKISS" = "ðŸ’",
        /**
         * Emoji: ðŸ‘¨â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨
         *
         * Aliases: `KISS_MM`
         */
        "COUPLEKISS_MM" = "ðŸ‘¨â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘©
         *
         * Aliases: `KISS_WW`
         */
        "COUPLEKISS_WW" = "ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘©",
        /**
         * Emoji: ðŸ‘¨â€â¤ï¸â€ðŸ‘¨
         *
         * Aliases: `COUPLE_WITH_HEART_MM`
         */
        "COUPLE_MM" = "ðŸ‘¨â€â¤ï¸â€ðŸ‘¨",
        /**
         * Emoji: ðŸ’‘
         */
        "COUPLE_WITH_HEART" = "ðŸ’‘",
        /**
         * Emoji: ðŸ‘¨â€â¤ï¸â€ðŸ‘¨
         *
         * Aliases: `COUPLE_MM`
         */
        "COUPLE_WITH_HEART_MM" = "ðŸ‘¨â€â¤ï¸â€ðŸ‘¨",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ‘¨
         */
        "COUPLE_WITH_HEART_WOMAN_MAN" = "ðŸ‘©â€â¤ï¸â€ðŸ‘¨",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ‘©
         *
         * Aliases: `COUPLE_WW`
         */
        "COUPLE_WITH_HEART_WW" = "ðŸ‘©â€â¤ï¸â€ðŸ‘©",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ‘©
         *
         * Aliases: `COUPLE_WITH_HEART_WW`
         */
        "COUPLE_WW" = "ðŸ‘©â€â¤ï¸â€ðŸ‘©",
        /**
         * Emoji: ðŸ®
         */
        "COW" = "ðŸ®",
        /**
         * Emoji: ðŸ„
         */
        "COW2" = "ðŸ„",
        /**
         * Emoji: ðŸ¤ 
         *
         * Aliases: `FACE_WITH_COWBOY_HAT`
         */
        "COWBOY" = "ðŸ¤ ",
        /**
         * Emoji: ðŸ¦€
         */
        "CRAB" = "ï¿½ï¿½ï¿½",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `LOWER_LEFT_CRAYON`
         */
        "CRAYON" = "ðŸ–ï¸",
        /**
         * Emoji: ðŸ’³
         */
        "CREDIT_CARD" = "ðŸ’³",
        /**
         * Emoji: ðŸŒ™
         */
        "CRESCENT_MOON" = "ðŸŒ™",
        /**
         * Emoji: ðŸ¦—
         */
        "CRICKET" = "ðŸ¦—",
        /**
         * Emoji: ðŸ
         *
         * Aliases: `CRICKET_GAME`
         */
        "CRICKET_BAT_BALL" = "ðŸ",
        /**
         * Emoji: ðŸ
         *
         * Aliases: `CRICKET_BAT_BALL`
         */
        "CRICKET_GAME" = "ðŸ",
        /**
         * Emoji: ðŸŠ
         */
        "CROCODILE" = "ðŸŠ",
        /**
         * Emoji: ðŸ¥
         */
        "CROISSANT" = "ðŸ¥",
        /**
         * Emoji: âœï¸
         *
         * Aliases: `LATIN_CROSS`
         */
        "CROSS" = "âœï¸",
        /**
         * Emoji: ðŸŽŒ
         */
        "CROSSED_FLAGS" = "ðŸŽŒ",
        /**
         * Emoji: âš”ï¸
         */
        "CROSSED_SWORDS" = "âš”ï¸",
        /**
         * Emoji: ðŸ‘‘
         */
        "CROWN" = "ðŸ‘‘",
        /**
         * Emoji: ðŸ›³ï¸
         *
         * Aliases: `PASSENGER_SHIP`
         */
        "CRUISE_SHIP" = "ðŸ›³ï¸",
        /**
         * Emoji: ðŸ˜¢
         */
        "CRY" = "ðŸ˜¢",
        /**
         * Emoji: ðŸ˜¿
         */
        "CRYING_CAT_FACE" = "ðŸ˜¿",
        /**
         * Emoji: ðŸ”®
         */
        "CRYSTAL_BALL" = "ðŸ”®",
        /**
         * Emoji: ðŸ¥’
         */
        "CUCUMBER" = "ðŸ¥’",
        /**
         * Emoji: ðŸ§
         */
        "CUPCAKE" = "ðŸ§",
        /**
         * Emoji: ðŸ’˜
         */
        "CUPID" = "ðŸ’˜",
        /**
         * Emoji: ðŸ¥¤
         */
        "CUP_WITH_STRAW" = "ðŸ¥¤",
        /**
         * Emoji: ðŸ¥Œ
         */
        "CURLING_STONE" = "ðŸ¥Œ",
        /**
         * Emoji: âž°
         */
        "CURLY_LOOP" = "âž°",
        /**
         * Emoji: ðŸ’±
         */
        "CURRENCY_EXCHANGE" = "ðŸ’±",
        /**
         * Emoji: ðŸ›
         */
        "CURRY" = "ðŸ›",
        /**
         * Emoji: ðŸ®
         *
         * Aliases: `PUDDING`,`FLAN`
         */
        "CUSTARD" = "ðŸ®",
        /**
         * Emoji: ðŸ›ƒ
         */
        "CUSTOMS" = "ðŸ›ƒ",
        /**
         * Emoji: ðŸ¥©
         */
        "CUT_OF_MEAT" = "ðŸ¥©",
        /**
         * Emoji: ðŸŒ€
         */
        "CYCLONE" = "ðŸŒ€",
        /**
         * Emoji: ðŸ—¡ï¸
         *
         * Aliases: `DAGGER_KNIFE`
         */
        "DAGGER" = "ðŸ—¡ï¸",
        /**
         * Emoji: ðŸ—¡ï¸
         *
         * Aliases: `DAGGER`
         */
        "DAGGER_KNIFE" = "ðŸ—¡ï¸",
        /**
         * Emoji: ðŸ’ƒ
         */
        "DANCER" = "ðŸ’ƒ",
        /**
         * Emoji: ðŸ‘¯
         *
         * Aliases: `PEOPLE_WITH_BUNNY_EARS_PARTYING`
         */
        "DANCERS" = "ðŸ‘¯",
        /**
         * Emoji: ðŸ¡
         */
        "DANGO" = "ðŸ¡",
        /**
         * Emoji: ðŸ•¶ï¸
         */
        "DARK_SUNGLASSES" = "ðŸ•¶ï¸",
        /**
         * Emoji: ðŸŽ¯
         */
        "DART" = "ðŸŽ¯",
        /**
         * Emoji: ðŸ’¨
         */
        "DASH" = "ðŸ’¨",
        /**
         * Emoji: ðŸ“…
         */
        "DATE" = "ðŸ“…",
        /**
         * Emoji: ðŸ§â€â™‚ï¸
         */
        "DEAF_MAN" = "ðŸ§â€â™‚ï¸",
        /**
         * Emoji: ðŸ§
         */
        "DEAF_PERSON" = "ðŸ§",
        /**
         * Emoji: ðŸ§â€â™€ï¸
         */
        "DEAF_WOMAN" = "ðŸ§â€â™€ï¸",
        /**
         * Emoji: ðŸŒ³
         */
        "DECIDUOUS_TREE" = "ðŸŒ³",
        /**
         * Emoji: ðŸ¦Œ
         */
        "DEER" = "ðŸ¦Œ",
        /**
         * Emoji: ðŸ¬
         */
        "DEPARTMENT_STORE" = "ðŸ¬",
        /**
         * Emoji: ðŸšï¸
         *
         * Aliases: `HOUSE_ABANDONED`
         */
        "DERELICT_HOUSE_BUILDING" = "ðŸšï¸",
        /**
         * Emoji: ðŸœï¸
         */
        "DESERT" = "ðŸœï¸",
        /**
         * Emoji: ðŸï¸
         *
         * Aliases: `ISLAND`
         */
        "DESERT_ISLAND" = "ðŸï¸",
        /**
         * Emoji: ðŸ–¥ï¸
         *
         * Aliases: `DESKTOP_COMPUTER`
         */
        "DESKTOP" = "ðŸ–¥ï¸",
        /**
         * Emoji: ðŸ–¥ï¸
         *
         * Aliases: `DESKTOP`
         */
        "DESKTOP_COMPUTER" = "ðŸ–¥ï¸",
        /**
         * Emoji: ðŸ•µï¸
         *
         * Aliases: `SPY`,`SLEUTH_OR_SPY`
         */
        "DETECTIVE" = "ðŸ•µï¸",
        /**
         * Emoji: â™¦ï¸
         */
        "DIAMONDS" = "â™¦ï¸",
        /**
         * Emoji: ðŸ’ 
         */
        "DIAMOND_SHAPE_WITH_A_DOT_INSIDE" = "ðŸ’ ",
        /**
         * Emoji: ðŸ˜ž
         */
        "DISAPPOINTED" = "ðŸ˜ž",
        /**
         * Emoji: ðŸ˜¥
         */
        "DISAPPOINTED_RELIEVED" = "ðŸ˜¥",
        /**
         * Emoji: ðŸ¥¸
         */
        "DISGUISED_FACE" = "ðŸ¥¸",
        /**
         * Emoji: ðŸ—‚ï¸
         *
         * Aliases: `CARD_INDEX_DIVIDERS`
         */
        "DIVIDERS" = "ðŸ—‚ï¸",
        /**
         * Emoji: ðŸ¤¿
         */
        "DIVING_MASK" = "ðŸ¤¿",
        /**
         * Emoji: ðŸª”
         */
        "DIYA_LAMP" = "ðŸª”",
        /**
         * Emoji: ðŸ’«
         */
        "DIZZY" = "ðŸ’«",
        /**
         * Emoji: ðŸ˜µ
         */
        "DIZZY_FACE" = "ðŸ˜µ",
        /**
         * Emoji: ðŸ§¬
         */
        "DNA" = "ðŸ§¬",
        /**
         * Emoji: ðŸ¦¤
         */
        "DODO" = "ðŸ¦¤",
        /**
         * Emoji: ðŸ¶
         */
        "DOG" = "ðŸ¶",
        /**
         * Emoji: ðŸ•
         */
        "DOG2" = "ðŸ•",
        /**
         * Emoji: ðŸ’µ
         */
        "DOLLAR" = "ðŸ’µ",
        /**
         * Emoji: ðŸŽŽ
         */
        "DOLLS" = "ðŸŽŽ",
        /**
         * Emoji: ðŸ¬
         */
        "DOLPHIN" = "ðŸ¬",
        /**
         * Emoji: ðŸšª
         */
        "DOOR" = "ðŸšª",
        /**
         * Emoji: â¸ï¸
         *
         * Aliases: `PAUSE_BUTTON`
         */
        "DOUBLE_VERTICAL_BAR" = "â¸ï¸",
        /**
         * Emoji: ðŸ©
         */
        "DOUGHNUT" = "ðŸ©",
        /**
         * Emoji: ðŸ•Šï¸
         *
         * Aliases: `DOVE_OF_PEACE`
         */
        "DOVE" = "ðŸ•Šï¸",
        /**
         * Emoji: ðŸ•Šï¸
         *
         * Aliases: `DOVE`
         */
        "DOVE_OF_PEACE" = "ðŸ•Šï¸",
        /**
         * Emoji: ðŸš¯
         */
        "DO_NOT_LITTER" = "ðŸš¯",
        /**
         * Emoji: ðŸ‰
         */
        "DRAGON" = "ðŸ‰",
        /**
         * Emoji: ðŸ²
         */
        "DRAGON_FACE" = "ðŸ²",
        /**
         * Emoji: ðŸ‘—
         */
        "DRESS" = "ðŸ‘—",
        /**
         * Emoji: ðŸª
         */
        "DROMEDARY_CAMEL" = "ðŸª",
        /**
         * Emoji: ðŸ¤¤
         *
         * Aliases: `DROOLING_FACE`
         */
        "DROOL" = "ðŸ¤¤",
        /**
         * Emoji: ðŸ¤¤
         *
         * Aliases: `DROOL`
         */
        "DROOLING_FACE" = "ðŸ¤¤",
        /**
         * Emoji: ðŸ’§
         */
        "DROPLET" = "ðŸ’§",
        /**
         * Emoji: ðŸ©¸
         */
        "DROP_OF_BLOOD" = "ðŸ©¸",
        /**
         * Emoji: ðŸ¥
         *
         * Aliases: `DRUM_WITH_DRUMSTICKS`
         */
        "DRUM" = "ðŸ¥",
        /**
         * Emoji: ðŸ¥
         *
         * Aliases: `DRUM`
         */
        "DRUM_WITH_DRUMSTICKS" = "ðŸ¥",
        /**
         * Emoji: ðŸ¦†
         */
        "DUCK" = "ðŸ¦†",
        /**
         * Emoji: ðŸ¥Ÿ
         */
        "DUMPLING" = "ðŸ¥Ÿ",
        /**
         * Emoji: ðŸ“€
         */
        "DVD" = "ðŸ“€",
        /**
         * Emoji: ðŸ¦…
         */
        "EAGLE" = "ðŸ¦…",
        /**
         * Emoji: ðŸ‘‚
         */
        "EAR" = "ðŸ‘‚",
        /**
         * Emoji: ðŸŒ
         */
        "EARTH_AFRICA" = "ðŸŒ",
        /**
         * Emoji: ðŸŒŽ
         */
        "EARTH_AMERICAS" = "ðŸŒŽ",
        /**
         * Emoji: ðŸŒ
         */
        "EARTH_ASIA" = "ðŸŒ",
        /**
         * Emoji: ðŸŒ¾
         */
        "EAR_OF_RICE" = "ðŸŒ¾",
        /**
         * Emoji: ðŸ¦»
         */
        "EAR_WITH_HEARING_AID" = "ðŸ¦»",
        /**
         * Emoji: ðŸ¥š
         */
        "EGG" = "ðŸ¥š",
        /**
         * Emoji: ðŸ†
         */
        "EGGPLANT" = "ðŸ†",
        /**
         * Emoji: 8ï¸âƒ£
         */
        "EIGHT" = "8ï¸âƒ£",
        /**
         * Emoji: âœ´ï¸
         */
        "EIGHT_POINTED_BLACK_STAR" = "âœ´ï¸",
        /**
         * Emoji: âœ³ï¸
         */
        "EIGHT_SPOKED_ASTERISK" = "âœ³ï¸",
        /**
         * Emoji: âï¸
         *
         * Aliases: `EJECT_SYMBOL`
         */
        "EJECT" = "âï¸",
        /**
         * Emoji: âï¸
         *
         * Aliases: `EJECT`
         */
        "EJECT_SYMBOL" = "âï¸",
        /**
         * Emoji: ðŸ”Œ
         */
        "ELECTRIC_PLUG" = "ðŸ”Œ",
        /**
         * Emoji: ðŸ˜
         */
        "ELEPHANT" = "ðŸ˜",
        /**
         * Emoji: ðŸ›—
         */
        "ELEVATOR" = "ðŸ›—",
        /**
         * Emoji: ðŸ§
         */
        "ELF" = "ðŸ§",
        /**
         * Emoji: ðŸ“§
         *
         * Aliases: `E_MAIL`
         */
        "EMAIL" = "ðŸ“§",
        /**
         * Emoji: ðŸ”š
         */
        "END" = "ðŸ”š",
        /**
         * Emoji: ðŸ´ó §ó ¢ó ¥ó ®ó §ó ¿
         */
        "ENGLAND" = "ðŸ´ó §ó ¢ó ¥ó ®ó §ó ¿",
        /**
         * Emoji: âœ‰ï¸
         */
        "ENVELOPE" = "âœ‰ï¸",
        /**
         * Emoji: ðŸ“©
         */
        "ENVELOPE_WITH_ARROW" = "ðŸ“©",
        /**
         * Emoji: ðŸ’¶
         */
        "EURO" = "ðŸ’¶",
        /**
         * Emoji: ðŸ°
         */
        "EUROPEAN_CASTLE" = "ðŸ°",
        /**
         * Emoji: ðŸ¤
         */
        "EUROPEAN_POST_OFFICE" = "ðŸ¤",
        /**
         * Emoji: ðŸŒ²
         */
        "EVERGREEN_TREE" = "ðŸŒ²",
        /**
         * Emoji: â—
         */
        "EXCLAMATION" = "â—",
        /**
         * Emoji: ðŸ¤°
         *
         * Aliases: `PREGNANT_WOMAN`
         */
        "EXPECTING_WOMAN" = "ðŸ¤°",
        /**
         * Emoji: ðŸ¤¯
         */
        "EXPLODING_HEAD" = "ðŸ¤¯",
        /**
         * Emoji: ðŸ˜‘
         */
        "EXPRESSIONLESS" = "ðŸ˜‘",
        /**
         * Emoji: ðŸ‘ï¸
         */
        "EYE" = "ðŸ‘ï¸",
        /**
         * Emoji: ðŸ‘“
         */
        "EYEGLASSES" = "ðŸ‘“",
        /**
         * Emoji: ðŸ‘€
         */
        "EYES" = "ðŸ‘€",
        /**
         * Emoji: ðŸ‘â€ðŸ—¨
         */
        "EYE_IN_SPEECH_BUBBLE" = "ðŸ‘â€ðŸ—¨",
        /**
         * Emoji: ðŸ“§
         *
         * Aliases: `EMAIL`
         */
        "E_MAIL" = "ðŸ“§",
        /**
         * Emoji: ðŸ¤¦
         *
         * Aliases: `PERSON_FACEPALMING`,`FACE_PALM`
         */
        "FACEPALM" = "ðŸ¤¦",
        /**
         * Emoji: ðŸ¤¦
         *
         * Aliases: `PERSON_FACEPALMING`,`FACEPALM`
         */
        "FACE_PALM" = "ðŸ¤¦",
        /**
         * Emoji: ðŸ¤®
         */
        "FACE_VOMITING" = "ðŸ¤®",
        /**
         * Emoji: ðŸ¤ 
         *
         * Aliases: `COWBOY`
         */
        "FACE_WITH_COWBOY_HAT" = "ðŸ¤ ",
        /**
         * Emoji: ðŸ¤­
         */
        "FACE_WITH_HAND_OVER_MOUTH" = "ðŸ¤­",
        /**
         * Emoji: ðŸ¤•
         *
         * Aliases: `HEAD_BANDAGE`
         */
        "FACE_WITH_HEAD_BANDAGE" = "ðŸ¤•",
        /**
         * Emoji: ðŸ§
         */
        "FACE_WITH_MONOCLE" = "ðŸ§",
        /**
         * Emoji: ðŸ¤¨
         */
        "FACE_WITH_RAISED_EYEBROW" = "ðŸ¤¨",
        /**
         * Emoji: ðŸ™„
         *
         * Aliases: `ROLLING_EYES`
         */
        "FACE_WITH_ROLLING_EYES" = "ðŸ™„",
        /**
         * Emoji: ðŸ¤¬
         */
        "FACE_WITH_SYMBOLS_OVER_MOUTH" = "ðŸ¤¬",
        /**
         * Emoji: ðŸ¤’
         *
         * Aliases: `THERMOMETER_FACE`
         */
        "FACE_WITH_THERMOMETER" = "ðŸ¤’",
        /**
         * Emoji: ðŸ­
         */
        "FACTORY" = "ðŸ­",
        /**
         * Emoji: ðŸ§‘â€ðŸ­
         */
        "FACTORY_WORKER" = "ðŸ§‘â€ðŸ­",
        /**
         * Emoji: ðŸ§š
         */
        "FAIRY" = "ðŸ§š",
        /**
         * Emoji: ðŸ§†
         */
        "FALAFEL" = "ðŸ§†",
        /**
         * Emoji: ðŸ‚
         */
        "FALLEN_LEAF" = "ðŸ‚",
        /**
         * Emoji: ðŸ‘ª
         */
        "FAMILY" = "ðŸ‘ª",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¦
         */
        "FAMILY_MAN_BOY" = "ðŸ‘¨â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¦â€ðŸ‘¦
         */
        "FAMILY_MAN_BOY_BOY" = "ðŸ‘¨â€ðŸ‘¦â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘§
         */
        "FAMILY_MAN_GIRL" = "ðŸ‘¨â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘§â€ðŸ‘¦
         */
        "FAMILY_MAN_GIRL_BOY" = "ðŸ‘¨â€ðŸ‘§â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘§â€ðŸ‘§
         */
        "FAMILY_MAN_GIRL_GIRL" = "ðŸ‘¨â€ðŸ‘§â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘©â€ðŸ‘¦
         */
        "FAMILY_MAN_WOMAN_BOY" = "ðŸ‘¨â€ðŸ‘©â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¨â€ðŸ‘¦
         */
        "FAMILY_MMB" = "ðŸ‘¨â€ðŸ‘¨â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¨â€ðŸ‘¦â€ðŸ‘¦
         */
        "FAMILY_MMBB" = "ðŸ‘¨â€ðŸ‘¨â€ðŸ‘¦â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§
         */
        "FAMILY_MMG" = "ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§â€ðŸ‘¦
         */
        "FAMILY_MMGB" = "ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§â€ðŸ‘§
         */
        "FAMILY_MMGG" = "ðŸ‘¨â€ðŸ‘¨â€ðŸ‘§â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦
         */
        "FAMILY_MWBB" = "ðŸ‘¨â€ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘©â€ðŸ‘§
         */
        "FAMILY_MWG" = "ðŸ‘¨â€ðŸ‘©â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦
         */
        "FAMILY_MWGB" = "ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘§
         */
        "FAMILY_MWGG" = "ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘¦
         */
        "FAMILY_WOMAN_BOY" = "ðŸ‘©â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦
         */
        "FAMILY_WOMAN_BOY_BOY" = "ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘§
         */
        "FAMILY_WOMAN_GIRL" = "ðŸ‘©â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘§â€ðŸ‘¦
         */
        "FAMILY_WOMAN_GIRL_BOY" = "ðŸ‘©â€ðŸ‘§â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘§â€ðŸ‘§
         */
        "FAMILY_WOMAN_GIRL_GIRL" = "ðŸ‘©â€ðŸ‘§â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘©â€ðŸ‘¦
         */
        "FAMILY_WWB" = "ðŸ‘©â€ðŸ‘©â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦
         */
        "FAMILY_WWBB" = "ðŸ‘©â€ðŸ‘©â€ðŸ‘¦â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘©â€ðŸ‘§
         */
        "FAMILY_WWG" = "ðŸ‘©â€ðŸ‘©â€ðŸ‘§",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦
         */
        "FAMILY_WWGB" = "ðŸ‘©â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦",
        /**
         * Emoji: ðŸ‘©â€ðŸ‘©â€ðŸ‘§â€ðŸ‘§
         */
        "FAMILY_WWGG" = "ðŸ‘©â€ðŸ‘©â€ðŸ‘§â€ðŸ‘§",
        /**
         * Emoji: ðŸ§‘â€ðŸŒ¾
         */
        "FARMER" = "ðŸ§‘â€ðŸŒ¾",
        /**
         * Emoji: â©
         */
        "FAST_FORWARD" = "â©",
        /**
         * Emoji: ðŸ“ 
         */
        "FAX" = "ðŸ“ ",
        /**
         * Emoji: ðŸ˜¨
         */
        "FEARFUL" = "ðŸ˜¨",
        /**
         * Emoji: ðŸª¶
         */
        "FEATHER" = "ðŸª¶",
        /**
         * Emoji: ðŸ¾
         *
         * Aliases: `PAW_PRINTS`
         */
        "FEET" = "ðŸ¾",
        /**
         * Emoji: â™€ï¸
         */
        "FEMALE_SIGN" = "â™€ï¸",
        /**
         * Emoji: ðŸ¤º
         *
         * Aliases: `PERSON_FENCING`,`FENCING`
         */
        "FENCER" = "ðŸ¤º",
        /**
         * Emoji: ðŸ¤º
         *
         * Aliases: `PERSON_FENCING`,`FENCER`
         */
        "FENCING" = "ðŸ¤º",
        /**
         * Emoji: ðŸŽ¡
         */
        "FERRIS_WHEEL" = "ðŸŽ¡",
        /**
         * Emoji: â›´ï¸
         */
        "FERRY" = "â›´ï¸",
        /**
         * Emoji: ðŸ‘
         */
        "FIELD_HOCKEY" = "ðŸ‘",
        /**
         * Emoji: ðŸ—„ï¸
         */
        "FILE_CABINET" = "ðŸ—„ï¸",
        /**
         * Emoji: ðŸ“
         */
        "FILE_FOLDER" = "ðŸ“",
        /**
         * Emoji: ðŸŽžï¸
         */
        "FILM_FRAMES" = "ðŸŽžï¸",
        /**
         * Emoji: ðŸ“½ï¸
         *
         * Aliases: `PROJECTOR`
         */
        "FILM_PROJECTOR" = "ðŸ“½ï¸",
        /**
         * Emoji: ðŸ¤ž
         *
         * Aliases: `HAND_WITH_INDEX_AND_MIDDLE_FINGER_CROSSED`
         */
        "FINGERS_CROSSED" = "ðŸ¤ž",
        /**
         * Emoji: ðŸ”¥
         *
         * Aliases: `FLAME`
         */
        "FIRE" = "ðŸ”¥",
        /**
         * Emoji: ðŸ§¨
         */
        "FIRECRACKER" = "ðŸ§¨",
        /**
         * Emoji: ðŸ§‘â€ðŸš’
         */
        "FIREFIGHTER" = "ðŸ§‘â€ðŸš’",
        /**
         * Emoji: ðŸŽ†
         */
        "FIREWORKS" = "ðŸŽ†",
        /**
         * Emoji: ðŸš’
         */
        "FIRE_ENGINE" = "ðŸš’",
        /**
         * Emoji: ðŸ§¯
         */
        "FIRE_EXTINGUISHER" = "ðŸ§¯",
        /**
         * Emoji: ðŸ¥‡
         *
         * Aliases: `FIRST_PLACE_MEDAL`
         */
        "FIRST_PLACE" = "ðŸ¥‡",
        /**
         * Emoji: ðŸ¥‡
         *
         * Aliases: `FIRST_PLACE`
         */
        "FIRST_PLACE_MEDAL" = "ðŸ¥‡",
        /**
         * Emoji: ðŸŒ“
         */
        "FIRST_QUARTER_MOON" = "ðŸŒ“",
        /**
         * Emoji: ðŸŒ›
         */
        "FIRST_QUARTER_MOON_WITH_FACE" = "ðŸŒ›",
        /**
         * Emoji: ðŸŸ
         */
        "FISH" = "ðŸŸ",
        /**
         * Emoji: ðŸŽ£
         */
        "FISHING_POLE_AND_FISH" = "ðŸŽ£",
        /**
         * Emoji: ðŸ¥
         */
        "FISH_CAKE" = "ðŸ¥",
        /**
         * Emoji: âœŠ
         */
        "FIST" = "âœŠ",
        /**
         * Emoji: 5ï¸âƒ£
         */
        "FIVE" = "5ï¸âƒ£",
        /**
         * Emoji: ðŸŽ
         */
        "FLAGS" = "ðŸŽ",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¨
         */
        "FLAG_AC" = "ðŸ‡¦ðŸ‡¨",
        /**
         * Emoji: ðŸ‡¦ðŸ‡©
         */
        "FLAG_AD" = "ðŸ‡¦ðŸ‡©",
        /**
         * Emoji: ðŸ‡¦ðŸ‡ª
         */
        "FLAG_AE" = "ðŸ‡¦ðŸ‡ª",
        /**
         * Emoji: ðŸ‡¦ðŸ‡«
         */
        "FLAG_AF" = "ðŸ‡¦ðŸ‡«",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¬
         */
        "FLAG_AG" = "ðŸ‡¦ðŸ‡¬",
        /**
         * Emoji: ðŸ‡¦ðŸ‡®
         */
        "FLAG_AI" = "ðŸ‡¦ðŸ‡®",
        /**
         * Emoji: ðŸ‡¦ðŸ‡±
         */
        "FLAG_AL" = "ðŸ‡¦ðŸ‡±",
        /**
         * Emoji: ðŸ‡¦ðŸ‡²
         */
        "FLAG_AM" = "ðŸ‡¦ðŸ‡²",
        /**
         * Emoji: ðŸ‡¦ðŸ‡´
         */
        "FLAG_AO" = "ðŸ‡¦ðŸ‡´",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¶
         */
        "FLAG_AQ" = "ðŸ‡¦ðŸ‡¶",
        /**
         * Emoji: ðŸ‡¦ðŸ‡·
         */
        "FLAG_AR" = "ðŸ‡¦ðŸ‡·",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¸
         */
        "FLAG_AS" = "ðŸ‡¦ðŸ‡¸",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¹
         */
        "FLAG_AT" = "ðŸ‡¦ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¦ðŸ‡º
         */
        "FLAG_AU" = "ðŸ‡¦ðŸ‡º",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¼
         */
        "FLAG_AW" = "ðŸ‡¦ðŸ‡¼",
        /**
         * Emoji: ðŸ‡¦ðŸ‡½
         */
        "FLAG_AX" = "ðŸ‡¦ðŸ‡½",
        /**
         * Emoji: ðŸ‡¦ðŸ‡¿
         */
        "FLAG_AZ" = "ðŸ‡¦ðŸ‡¿",
        /**
         * Emoji: ðŸ‡§ðŸ‡¦
         */
        "FLAG_BA" = "ðŸ‡§ðŸ‡¦",
        /**
         * Emoji: ðŸ‡§ðŸ‡§
         */
        "FLAG_BB" = "ðŸ‡§ðŸ‡§",
        /**
         * Emoji: ðŸ‡§ðŸ‡©
         */
        "FLAG_BD" = "ðŸ‡§ðŸ‡©",
        /**
         * Emoji: ðŸ‡§ðŸ‡ª
         */
        "FLAG_BE" = "ðŸ‡§ðŸ‡ª",
        /**
         * Emoji: ðŸ‡§ðŸ‡«
         */
        "FLAG_BF" = "ðŸ‡§ðŸ‡«",
        /**
         * Emoji: ðŸ‡§ðŸ‡¬
         */
        "FLAG_BG" = "ðŸ‡§ðŸ‡¬",
        /**
         * Emoji: ðŸ‡§ðŸ‡­
         */
        "FLAG_BH" = "ðŸ‡§ðŸ‡­",
        /**
         * Emoji: ðŸ‡§ðŸ‡®
         */
        "FLAG_BI" = "ðŸ‡§ðŸ‡®",
        /**
         * Emoji: ðŸ‡§ðŸ‡¯
         */
        "FLAG_BJ" = "ðŸ‡§ðŸ‡¯",
        /**
         * Emoji: ðŸ‡§ðŸ‡±
         */
        "FLAG_BL" = "ðŸ‡§ðŸ‡±",
        /**
         * Emoji: ðŸ´
         */
        "FLAG_BLACK" = "ðŸ´",
        /**
         * Emoji: ðŸ‡§ðŸ‡²
         */
        "FLAG_BM" = "ðŸ‡§ðŸ‡²",
        /**
         * Emoji: ðŸ‡§ðŸ‡³
         */
        "FLAG_BN" = "ðŸ‡§ðŸ‡³",
        /**
         * Emoji: ðŸ‡§ðŸ‡´
         */
        "FLAG_BO" = "ðŸ‡§ðŸ‡´",
        /**
         * Emoji: ðŸ‡§ðŸ‡¶
         */
        "FLAG_BQ" = "ðŸ‡§ðŸ‡¶",
        /**
         * Emoji: ðŸ‡§ðŸ‡·
         */
        "FLAG_BR" = "ðŸ‡§ðŸ‡·",
        /**
         * Emoji: ðŸ‡§ðŸ‡¸
         */
        "FLAG_BS" = "ðŸ‡§ðŸ‡¸",
        /**
         * Emoji: ðŸ‡§ðŸ‡¹
         */
        "FLAG_BT" = "ðŸ‡§ðŸ‡¹",
        /**
         * Emoji: ðŸ‡§ðŸ‡»
         */
        "FLAG_BV" = "ðŸ‡§ðŸ‡»",
        /**
         * Emoji: ðŸ‡§ðŸ‡¼
         */
        "FLAG_BW" = "ðŸ‡§ðŸ‡¼",
        /**
         * Emoji: ðŸ‡§ðŸ‡¾
         */
        "FLAG_BY" = "ðŸ‡§ðŸ‡¾",
        /**
         * Emoji: ðŸ‡§ðŸ‡¿
         */
        "FLAG_BZ" = "ðŸ‡§ðŸ‡¿",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¦
         */
        "FLAG_CA" = "ðŸ‡¨ðŸ‡¦",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¨
         */
        "FLAG_CC" = "ðŸ‡¨ðŸ‡¨",
        /**
         * Emoji: ðŸ‡¨ðŸ‡©
         */
        "FLAG_CD" = "ðŸ‡¨ðŸ‡©",
        /**
         * Emoji: ðŸ‡¨ðŸ‡«
         */
        "FLAG_CF" = "ðŸ‡¨ðŸ‡«",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¬
         */
        "FLAG_CG" = "ðŸ‡¨ðŸ‡¬",
        /**
         * Emoji: ðŸ‡¨ðŸ‡­
         */
        "FLAG_CH" = "ðŸ‡¨ðŸ‡­",
        /**
         * Emoji: ðŸ‡¨ðŸ‡®
         */
        "FLAG_CI" = "ðŸ‡¨ðŸ‡®",
        /**
         * Emoji: ðŸ‡¨ðŸ‡°
         */
        "FLAG_CK" = "ðŸ‡¨ðŸ‡°",
        /**
         * Emoji: ðŸ‡¨ðŸ‡±
         */
        "FLAG_CL" = "ðŸ‡¨ðŸ‡±",
        /**
         * Emoji: ðŸ‡¨ðŸ‡²
         */
        "FLAG_CM" = "ðŸ‡¨ðŸ‡²",
        /**
         * Emoji: ðŸ‡¨ðŸ‡³
         */
        "FLAG_CN" = "ðŸ‡¨ðŸ‡³",
        /**
         * Emoji: ðŸ‡¨ðŸ‡´
         */
        "FLAG_CO" = "ðŸ‡¨ðŸ‡´",
        /**
         * Emoji: ðŸ‡¨ðŸ‡µ
         */
        "FLAG_CP" = "ðŸ‡¨ðŸ‡µ",
        /**
         * Emoji: ðŸ‡¨ðŸ‡·
         */
        "FLAG_CR" = "ðŸ‡¨ðŸ‡·",
        /**
         * Emoji: ðŸ‡¨ðŸ‡º
         */
        "FLAG_CU" = "ðŸ‡¨ðŸ‡º",
        /**
         * Emoji: ðŸ‡¨ðŸ‡»
         */
        "FLAG_CV" = "ðŸ‡¨ðŸ‡»",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¼
         */
        "FLAG_CW" = "ðŸ‡¨ðŸ‡¼",
        /**
         * Emoji: ðŸ‡¨ðŸ‡½
         */
        "FLAG_CX" = "ðŸ‡¨ðŸ‡½",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¾
         */
        "FLAG_CY" = "ðŸ‡¨ðŸ‡¾",
        /**
         * Emoji: ðŸ‡¨ðŸ‡¿
         */
        "FLAG_CZ" = "ðŸ‡¨ðŸ‡¿",
        /**
         * Emoji: ðŸ‡©ðŸ‡ª
         */
        "FLAG_DE" = "ðŸ‡©ðŸ‡ª",
        /**
         * Emoji: ðŸ‡©ðŸ‡¬
         */
        "FLAG_DG" = "ðŸ‡©ðŸ‡¬",
        /**
         * Emoji: ðŸ‡©ðŸ‡¯
         */
        "FLAG_DJ" = "ðŸ‡©ðŸ‡¯",
        /**
         * Emoji: ðŸ‡©ðŸ‡°
         */
        "FLAG_DK" = "ðŸ‡©ðŸ‡°",
        /**
         * Emoji: ðŸ‡©ðŸ‡²
         */
        "FLAG_DM" = "ðŸ‡©ðŸ‡²",
        /**
         * Emoji: ðŸ‡©ðŸ‡´
         */
        "FLAG_DO" = "ðŸ‡©ðŸ‡´",
        /**
         * Emoji: ðŸ‡©ðŸ‡¿
         */
        "FLAG_DZ" = "ðŸ‡©ðŸ‡¿",
        /**
         * Emoji: ðŸ‡ªðŸ‡¦
         */
        "FLAG_EA" = "ðŸ‡ªðŸ‡¦",
        /**
         * Emoji: ðŸ‡ªðŸ‡¨
         */
        "FLAG_EC" = "ðŸ‡ªðŸ‡¨",
        /**
         * Emoji: ðŸ‡ªðŸ‡ª
         */
        "FLAG_EE" = "ðŸ‡ªðŸ‡ª",
        /**
         * Emoji: ðŸ‡ªðŸ‡¬
         */
        "FLAG_EG" = "ðŸ‡ªðŸ‡¬",
        /**
         * Emoji: ðŸ‡ªðŸ‡­
         */
        "FLAG_EH" = "ðŸ‡ªðŸ‡­",
        /**
         * Emoji: ðŸ‡ªðŸ‡·
         */
        "FLAG_ER" = "ðŸ‡ªðŸ‡·",
        /**
         * Emoji: ðŸ‡ªðŸ‡¸
         */
        "FLAG_ES" = "ðŸ‡ªðŸ‡¸",
        /**
         * Emoji: ðŸ‡ªðŸ‡¹
         */
        "FLAG_ET" = "ðŸ‡ªðŸ‡¹",
        /**
         * Emoji: ðŸ‡ªðŸ‡º
         */
        "FLAG_EU" = "ðŸ‡ªðŸ‡º",
        /**
         * Emoji: ðŸ‡«ðŸ‡®
         */
        "FLAG_FI" = "ðŸ‡«ðŸ‡®",
        /**
         * Emoji: ðŸ‡«ðŸ‡¯
         */
        "FLAG_FJ" = "ðŸ‡«ðŸ‡¯",
        /**
         * Emoji: ðŸ‡«ðŸ‡°
         */
        "FLAG_FK" = "ðŸ‡«ðŸ‡°",
        /**
         * Emoji: ðŸ‡«ðŸ‡²
         */
        "FLAG_FM" = "ðŸ‡«ðŸ‡²",
        /**
         * Emoji: ðŸ‡«ðŸ‡´
         */
        "FLAG_FO" = "ðŸ‡«ðŸ‡´",
        /**
         * Emoji: ðŸ‡«ðŸ‡·
         */
        "FLAG_FR" = "ðŸ‡«ðŸ‡·",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¦
         */
        "FLAG_GA" = "ðŸ‡¬ðŸ‡¦",
        /**
         * Emoji: ðŸ‡¬ðŸ‡§
         */
        "FLAG_GB" = "ðŸ‡¬ðŸ‡§",
        /**
         * Emoji: ðŸ‡¬ðŸ‡©
         */
        "FLAG_GD" = "ðŸ‡¬ðŸ‡©",
        /**
         * Emoji: ðŸ‡¬ðŸ‡ª
         */
        "FLAG_GE" = "ðŸ‡¬ðŸ‡ª",
        /**
         * Emoji: ðŸ‡¬ðŸ‡«
         */
        "FLAG_GF" = "ðŸ‡¬ðŸ‡«",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¬
         */
        "FLAG_GG" = "ðŸ‡¬ðŸ‡¬",
        /**
         * Emoji: ðŸ‡¬ðŸ‡­
         */
        "FLAG_GH" = "ðŸ‡¬ðŸ‡­",
        /**
         * Emoji: ðŸ‡¬ðŸ‡®
         */
        "FLAG_GI" = "ðŸ‡¬ðŸ‡®",
        /**
         * Emoji: ðŸ‡¬ðŸ‡±
         */
        "FLAG_GL" = "ðŸ‡¬ðŸ‡±",
        /**
         * Emoji: ðŸ‡¬ðŸ‡²
         */
        "FLAG_GM" = "ðŸ‡¬ðŸ‡²",
        /**
         * Emoji: ðŸ‡¬ðŸ‡³
         */
        "FLAG_GN" = "ðŸ‡¬ðŸ‡³",
        /**
         * Emoji: ðŸ‡¬ðŸ‡µ
         */
        "FLAG_GP" = "ðŸ‡¬ðŸ‡µ",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¶
         */
        "FLAG_GQ" = "ðŸ‡¬ðŸ‡¶",
        /**
         * Emoji: ðŸ‡¬ðŸ‡·
         */
        "FLAG_GR" = "ðŸ‡¬ðŸ‡·",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¸
         */
        "FLAG_GS" = "ðŸ‡¬ðŸ‡¸",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¹
         */
        "FLAG_GT" = "ðŸ‡¬ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¬ðŸ‡º
         */
        "FLAG_GU" = "ðŸ‡¬ðŸ‡º",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¼
         */
        "FLAG_GW" = "ðŸ‡¬ðŸ‡¼",
        /**
         * Emoji: ðŸ‡¬ðŸ‡¾
         */
        "FLAG_GY" = "ðŸ‡¬ðŸ‡¾",
        /**
         * Emoji: ðŸ‡­ðŸ‡°
         */
        "FLAG_HK" = "ðŸ‡­ðŸ‡°",
        /**
         * Emoji: ðŸ‡­ðŸ‡²
         */
        "FLAG_HM" = "ðŸ‡­ðŸ‡²",
        /**
         * Emoji: ðŸ‡­ðŸ‡³
         */
        "FLAG_HN" = "ðŸ‡­ðŸ‡³",
        /**
         * Emoji: ðŸ‡­ðŸ‡·
         */
        "FLAG_HR" = "ðŸ‡­ðŸ‡·",
        /**
         * Emoji: ðŸ‡­ðŸ‡¹
         */
        "FLAG_HT" = "ðŸ‡­ðŸ‡¹",
        /**
         * Emoji: ðŸ‡­ðŸ‡º
         */
        "FLAG_HU" = "ðŸ‡­ðŸ‡º",
        /**
         * Emoji: ðŸ‡®ðŸ‡¨
         */
        "FLAG_IC" = "ðŸ‡®ðŸ‡¨",
        /**
         * Emoji: ðŸ‡®ðŸ‡©
         */
        "FLAG_ID" = "ðŸ‡®ðŸ‡©",
        /**
         * Emoji: ðŸ‡®ðŸ‡ª
         */
        "FLAG_IE" = "ðŸ‡®ðŸ‡ª",
        /**
         * Emoji: ðŸ‡®ðŸ‡±
         */
        "FLAG_IL" = "ðŸ‡®ðŸ‡±",
        /**
         * Emoji: ðŸ‡®ðŸ‡²
         */
        "FLAG_IM" = "ðŸ‡®ðŸ‡²",
        /**
         * Emoji: ðŸ‡®ðŸ‡³
         */
        "FLAG_IN" = "ðŸ‡®ðŸ‡³",
        /**
         * Emoji: ðŸ‡®ðŸ‡´
         */
        "FLAG_IO" = "ðŸ‡®ðŸ‡´",
        /**
         * Emoji: ðŸ‡®ðŸ‡¶
         */
        "FLAG_IQ" = "ðŸ‡®ðŸ‡¶",
        /**
         * Emoji: ðŸ‡®ðŸ‡·
         */
        "FLAG_IR" = "ðŸ‡®ðŸ‡·",
        /**
         * Emoji: ðŸ‡®ðŸ‡¸
         */
        "FLAG_IS" = "ðŸ‡®ðŸ‡¸",
        /**
         * Emoji: ðŸ‡®ðŸ‡¹
         */
        "FLAG_IT" = "ðŸ‡®ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¯ðŸ‡ª
         */
        "FLAG_JE" = "ðŸ‡¯ðŸ‡ª",
        /**
         * Emoji: ðŸ‡¯ðŸ‡²
         */
        "FLAG_JM" = "ðŸ‡¯ðŸ‡²",
        /**
         * Emoji: ðŸ‡¯ðŸ‡´
         */
        "FLAG_JO" = "ðŸ‡¯ðŸ‡´",
        /**
         * Emoji: ðŸ‡¯ðŸ‡µ
         */
        "FLAG_JP" = "ðŸ‡¯ðŸ‡µ",
        /**
         * Emoji: ðŸ‡°ðŸ‡ª
         */
        "FLAG_KE" = "ðŸ‡°ðŸ‡ª",
        /**
         * Emoji: ðŸ‡°ðŸ‡¬
         */
        "FLAG_KG" = "ðŸ‡°ðŸ‡¬",
        /**
         * Emoji: ðŸ‡°ðŸ‡­
         */
        "FLAG_KH" = "ðŸ‡°ðŸ‡­",
        /**
         * Emoji: ðŸ‡°ðŸ‡®
         */
        "FLAG_KI" = "ðŸ‡°ðŸ‡®",
        /**
         * Emoji: ðŸ‡°ðŸ‡²
         */
        "FLAG_KM" = "ðŸ‡°ðŸ‡²",
        /**
         * Emoji: ðŸ‡°ðŸ‡³
         */
        "FLAG_KN" = "ðŸ‡°ðŸ‡³",
        /**
         * Emoji: ðŸ‡°ðŸ‡µ
         */
        "FLAG_KP" = "ðŸ‡°ðŸ‡µ",
        /**
         * Emoji: ðŸ‡°ðŸ‡·
         */
        "FLAG_KR" = "ðŸ‡°ðŸ‡·",
        /**
         * Emoji: ðŸ‡°ðŸ‡¼
         */
        "FLAG_KW" = "ðŸ‡°ðŸ‡¼",
        /**
         * Emoji: ðŸ‡°ðŸ‡¾
         */
        "FLAG_KY" = "ðŸ‡°ðŸ‡¾",
        /**
         * Emoji: ðŸ‡°ðŸ‡¿
         */
        "FLAG_KZ" = "ðŸ‡°ðŸ‡¿",
        /**
         * Emoji: ðŸ‡±ðŸ‡¦
         */
        "FLAG_LA" = "ðŸ‡±ðŸ‡¦",
        /**
         * Emoji: ðŸ‡±ðŸ‡§
         */
        "FLAG_LB" = "ðŸ‡±ðŸ‡§",
        /**
         * Emoji: ðŸ‡±ðŸ‡¨
         */
        "FLAG_LC" = "ðŸ‡±ðŸ‡¨",
        /**
         * Emoji: ðŸ‡±ðŸ‡®
         */
        "FLAG_LI" = "ðŸ‡±ðŸ‡®",
        /**
         * Emoji: ðŸ‡±ðŸ‡°
         */
        "FLAG_LK" = "ðŸ‡±ðŸ‡°",
        /**
         * Emoji: ðŸ‡±ðŸ‡·
         */
        "FLAG_LR" = "ðŸ‡±ðŸ‡·",
        /**
         * Emoji: ðŸ‡±ðŸ‡¸
         */
        "FLAG_LS" = "ðŸ‡±ðŸ‡¸",
        /**
         * Emoji: ðŸ‡±ðŸ‡¹
         */
        "FLAG_LT" = "ðŸ‡±ðŸ‡¹",
        /**
         * Emoji: ðŸ‡±ðŸ‡º
         */
        "FLAG_LU" = "ðŸ‡±ðŸ‡º",
        /**
         * Emoji: ðŸ‡±ðŸ‡»
         */
        "FLAG_LV" = "ðŸ‡±ðŸ‡»",
        /**
         * Emoji: ðŸ‡±ðŸ‡¾
         */
        "FLAG_LY" = "ðŸ‡±ðŸ‡¾",
        /**
         * Emoji: ðŸ‡²ðŸ‡¦
         */
        "FLAG_MA" = "ðŸ‡²ðŸ‡¦",
        /**
         * Emoji: ðŸ‡²ðŸ‡¨
         */
        "FLAG_MC" = "ðŸ‡²ðŸ‡¨",
        /**
         * Emoji: ðŸ‡²ðŸ‡©
         */
        "FLAG_MD" = "ðŸ‡²ðŸ‡©",
        /**
         * Emoji: ðŸ‡²ðŸ‡ª
         */
        "FLAG_ME" = "ðŸ‡²ðŸ‡ª",
        /**
         * Emoji: ðŸ‡²ðŸ‡«
         */
        "FLAG_MF" = "ðŸ‡²ðŸ‡«",
        /**
         * Emoji: ðŸ‡²ðŸ‡¬
         */
        "FLAG_MG" = "ðŸ‡²ðŸ‡¬",
        /**
         * Emoji: ðŸ‡²ðŸ‡­
         */
        "FLAG_MH" = "ðŸ‡²ðŸ‡­",
        /**
         * Emoji: ðŸ‡²ðŸ‡°
         */
        "FLAG_MK" = "ðŸ‡²ðŸ‡°",
        /**
         * Emoji: ðŸ‡²ðŸ‡±
         */
        "FLAG_ML" = "ðŸ‡²ðŸ‡±",
        /**
         * Emoji: ðŸ‡²ðŸ‡²
         */
        "FLAG_MM" = "ðŸ‡²ðŸ‡²",
        /**
         * Emoji: ðŸ‡²ðŸ‡³
         */
        "FLAG_MN" = "ðŸ‡²ðŸ‡³",
        /**
         * Emoji: ðŸ‡²ðŸ‡´
         */
        "FLAG_MO" = "ðŸ‡²ðŸ‡´",
        /**
         * Emoji: ðŸ‡²ðŸ‡µ
         */
        "FLAG_MP" = "ðŸ‡²ðŸ‡µ",
        /**
         * Emoji: ðŸ‡²ðŸ‡¶
         */
        "FLAG_MQ" = "ðŸ‡²ðŸ‡¶",
        /**
         * Emoji: ðŸ‡²ðŸ‡·
         */
        "FLAG_MR" = "ðŸ‡²ðŸ‡·",
        /**
         * Emoji: ðŸ‡²ðŸ‡¸
         */
        "FLAG_MS" = "ðŸ‡²ðŸ‡¸",
        /**
         * Emoji: ðŸ‡²ðŸ‡¹
         */
        "FLAG_MT" = "ðŸ‡²ðŸ‡¹",
        /**
         * Emoji: ðŸ‡²ðŸ‡º
         */
        "FLAG_MU" = "ðŸ‡²ðŸ‡º",
        /**
         * Emoji: ðŸ‡²ðŸ‡»
         */
        "FLAG_MV" = "ðŸ‡²ðŸ‡»",
        /**
         * Emoji: ðŸ‡²ðŸ‡¼
         */
        "FLAG_MW" = "ðŸ‡²ðŸ‡¼",
        /**
         * Emoji: ðŸ‡²ðŸ‡½
         */
        "FLAG_MX" = "ðŸ‡²ðŸ‡½",
        /**
         * Emoji: ðŸ‡²ðŸ‡¾
         */
        "FLAG_MY" = "ðŸ‡²ðŸ‡¾",
        /**
         * Emoji: ðŸ‡²ðŸ‡¿
         */
        "FLAG_MZ" = "ðŸ‡²ðŸ‡¿",
        /**
         * Emoji: ðŸ‡³ðŸ‡¦
         */
        "FLAG_NA" = "ðŸ‡³ðŸ‡¦",
        /**
         * Emoji: ðŸ‡³ðŸ‡¨
         */
        "FLAG_NC" = "ðŸ‡³ðŸ‡¨",
        /**
         * Emoji: ðŸ‡³ðŸ‡ª
         */
        "FLAG_NE" = "ðŸ‡³ðŸ‡ª",
        /**
         * Emoji: ðŸ‡³ðŸ‡«
         */
        "FLAG_NF" = "ðŸ‡³ðŸ‡«",
        /**
         * Emoji: ðŸ‡³ðŸ‡¬
         */
        "FLAG_NG" = "ðŸ‡³ðŸ‡¬",
        /**
         * Emoji: ðŸ‡³ðŸ‡®
         */
        "FLAG_NI" = "ðŸ‡³ðŸ‡®",
        /**
         * Emoji: ðŸ‡³ðŸ‡±
         */
        "FLAG_NL" = "ðŸ‡³ðŸ‡±",
        /**
         * Emoji: ðŸ‡³ðŸ‡´
         */
        "FLAG_NO" = "ðŸ‡³ðŸ‡´",
        /**
         * Emoji: ðŸ‡³ðŸ‡µ
         */
        "FLAG_NP" = "ðŸ‡³ðŸ‡µ",
        /**
         * Emoji: ðŸ‡³ðŸ‡·
         */
        "FLAG_NR" = "ðŸ‡³ðŸ‡·",
        /**
         * Emoji: ðŸ‡³ðŸ‡º
         */
        "FLAG_NU" = "ðŸ‡³ðŸ‡º",
        /**
         * Emoji: ðŸ‡³ðŸ‡¿
         */
        "FLAG_NZ" = "ðŸ‡³ðŸ‡¿",
        /**
         * Emoji: ðŸ‡´ðŸ‡²
         */
        "FLAG_OM" = "ðŸ‡´ðŸ‡²",
        /**
         * Emoji: ðŸ‡µðŸ‡¦
         */
        "FLAG_PA" = "ðŸ‡µðŸ‡¦",
        /**
         * Emoji: ðŸ‡µðŸ‡ª
         */
        "FLAG_PE" = "ðŸ‡µðŸ‡ª",
        /**
         * Emoji: ðŸ‡µðŸ‡«
         */
        "FLAG_PF" = "ðŸ‡µðŸ‡«",
        /**
         * Emoji: ðŸ‡µðŸ‡¬
         */
        "FLAG_PG" = "ðŸ‡µðŸ‡¬",
        /**
         * Emoji: ðŸ‡µðŸ‡­
         */
        "FLAG_PH" = "ðŸ‡µðŸ‡­",
        /**
         * Emoji: ðŸ‡µðŸ‡°
         */
        "FLAG_PK" = "ðŸ‡µðŸ‡°",
        /**
         * Emoji: ðŸ‡µðŸ‡±
         */
        "FLAG_PL" = "ðŸ‡µðŸ‡±",
        /**
         * Emoji: ðŸ‡µðŸ‡²
         */
        "FLAG_PM" = "ðŸ‡µðŸ‡²",
        /**
         * Emoji: ðŸ‡µðŸ‡³
         */
        "FLAG_PN" = "ðŸ‡µðŸ‡³",
        /**
         * Emoji: ðŸ‡µðŸ‡·
         */
        "FLAG_PR" = "ðŸ‡µðŸ‡·",
        /**
         * Emoji: ðŸ‡µðŸ‡¸
         */
        "FLAG_PS" = "ðŸ‡µðŸ‡¸",
        /**
         * Emoji: ðŸ‡µðŸ‡¹
         */
        "FLAG_PT" = "ðŸ‡µðŸ‡¹",
        /**
         * Emoji: ðŸ‡µðŸ‡¼
         */
        "FLAG_PW" = "ðŸ‡µðŸ‡¼",
        /**
         * Emoji: ðŸ‡µðŸ‡¾
         */
        "FLAG_PY" = "ðŸ‡µðŸ‡¾",
        /**
         * Emoji: ðŸ‡¶ðŸ‡¦
         */
        "FLAG_QA" = "ðŸ‡¶ðŸ‡¦",
        /**
         * Emoji: ðŸ‡·ðŸ‡ª
         */
        "FLAG_RE" = "ðŸ‡·ðŸ‡ª",
        /**
         * Emoji: ðŸ‡·ðŸ‡´
         */
        "FLAG_RO" = "ðŸ‡·ðŸ‡´",
        /**
         * Emoji: ðŸ‡·ðŸ‡¸
         */
        "FLAG_RS" = "ðŸ‡·ðŸ‡¸",
        /**
         * Emoji: ðŸ‡·ðŸ‡º
         */
        "FLAG_RU" = "ðŸ‡·ðŸ‡º",
        /**
         * Emoji: ðŸ‡·ðŸ‡¼
         */
        "FLAG_RW" = "ðŸ‡·ðŸ‡¼",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¦
         */
        "FLAG_SA" = "ðŸ‡¸ðŸ‡¦",
        /**
         * Emoji: ðŸ‡¸ðŸ‡§
         */
        "FLAG_SB" = "ðŸ‡¸ðŸ‡§",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¨
         */
        "FLAG_SC" = "ðŸ‡¸ðŸ‡¨",
        /**
         * Emoji: ðŸ‡¸ðŸ‡©
         */
        "FLAG_SD" = "ðŸ‡¸ðŸ‡©",
        /**
         * Emoji: ðŸ‡¸ðŸ‡ª
         */
        "FLAG_SE" = "ðŸ‡¸ðŸ‡ª",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¬
         */
        "FLAG_SG" = "ðŸ‡¸ðŸ‡¬",
        /**
         * Emoji: ðŸ‡¸ðŸ‡­
         */
        "FLAG_SH" = "ðŸ‡¸ðŸ‡­",
        /**
         * Emoji: ðŸ‡¸ðŸ‡®
         */
        "FLAG_SI" = "ðŸ‡¸ðŸ‡®",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¯
         */
        "FLAG_SJ" = "ðŸ‡¸ðŸ‡¯",
        /**
         * Emoji: ðŸ‡¸ðŸ‡°
         */
        "FLAG_SK" = "ðŸ‡¸ðŸ‡°",
        /**
         * Emoji: ðŸ‡¸ðŸ‡±
         */
        "FLAG_SL" = "ðŸ‡¸ðŸ‡±",
        /**
         * Emoji: ðŸ‡¸ðŸ‡²
         */
        "FLAG_SM" = "ðŸ‡¸ðŸ‡²",
        /**
         * Emoji: ðŸ‡¸ðŸ‡³
         */
        "FLAG_SN" = "ðŸ‡¸ðŸ‡³",
        /**
         * Emoji: ðŸ‡¸ðŸ‡´
         */
        "FLAG_SO" = "ðŸ‡¸ðŸ‡´",
        /**
         * Emoji: ðŸ‡¸ðŸ‡·
         */
        "FLAG_SR" = "ðŸ‡¸ðŸ‡·",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¸
         */
        "FLAG_SS" = "ðŸ‡¸ðŸ‡¸",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¹
         */
        "FLAG_ST" = "ðŸ‡¸ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¸ðŸ‡»
         */
        "FLAG_SV" = "ðŸ‡¸ðŸ‡»",
        /**
         * Emoji: ðŸ‡¸ðŸ‡½
         */
        "FLAG_SX" = "ðŸ‡¸ðŸ‡½",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¾
         */
        "FLAG_SY" = "ðŸ‡¸ðŸ‡¾",
        /**
         * Emoji: ðŸ‡¸ðŸ‡¿
         */
        "FLAG_SZ" = "ðŸ‡¸ðŸ‡¿",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¦
         */
        "FLAG_TA" = "ðŸ‡¹ðŸ‡¦",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¨
         */
        "FLAG_TC" = "ðŸ‡¹ðŸ‡¨",
        /**
         * Emoji: ðŸ‡¹ðŸ‡©
         */
        "FLAG_TD" = "ðŸ‡¹ðŸ‡©",
        /**
         * Emoji: ðŸ‡¹ðŸ‡«
         */
        "FLAG_TF" = "ðŸ‡¹ðŸ‡«",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¬
         */
        "FLAG_TG" = "ðŸ‡¹ðŸ‡¬",
        /**
         * Emoji: ðŸ‡¹ðŸ‡­
         */
        "FLAG_TH" = "ðŸ‡¹ðŸ‡­",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¯
         */
        "FLAG_TJ" = "ðŸ‡¹ðŸ‡¯",
        /**
         * Emoji: ðŸ‡¹ðŸ‡°
         */
        "FLAG_TK" = "ðŸ‡¹ðŸ‡°",
        /**
         * Emoji: ðŸ‡¹ðŸ‡±
         */
        "FLAG_TL" = "ðŸ‡¹ðŸ‡±",
        /**
         * Emoji: ðŸ‡¹ðŸ‡²
         */
        "FLAG_TM" = "ðŸ‡¹ðŸ‡²",
        /**
         * Emoji: ðŸ‡¹ðŸ‡³
         */
        "FLAG_TN" = "ðŸ‡¹ðŸ‡³",
        /**
         * Emoji: ðŸ‡¹ðŸ‡´
         */
        "FLAG_TO" = "ðŸ‡¹ðŸ‡´",
        /**
         * Emoji: ðŸ‡¹ðŸ‡·
         */
        "FLAG_TR" = "ðŸ‡¹ðŸ‡·",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¹
         */
        "FLAG_TT" = "ðŸ‡¹ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¹ðŸ‡»
         */
        "FLAG_TV" = "ðŸ‡¹ðŸ‡»",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¼
         */
        "FLAG_TW" = "ðŸ‡¹ðŸ‡¼",
        /**
         * Emoji: ðŸ‡¹ðŸ‡¿
         */
        "FLAG_TZ" = "ðŸ‡¹ðŸ‡¿",
        /**
         * Emoji: ðŸ‡ºðŸ‡¦
         */
        "FLAG_UA" = "ðŸ‡ºðŸ‡¦",
        /**
         * Emoji: ðŸ‡ºðŸ‡¬
         */
        "FLAG_UG" = "ðŸ‡ºðŸ‡¬",
        /**
         * Emoji: ðŸ‡ºðŸ‡²
         */
        "FLAG_UM" = "ðŸ‡ºðŸ‡²",
        /**
         * Emoji: ðŸ‡ºðŸ‡¸
         */
        "FLAG_US" = "ðŸ‡ºðŸ‡¸",
        /**
         * Emoji: ðŸ‡ºðŸ‡¾
         */
        "FLAG_UY" = "ðŸ‡ºðŸ‡¾",
        /**
         * Emoji: ðŸ‡ºðŸ‡¿
         */
        "FLAG_UZ" = "ðŸ‡ºðŸ‡¿",
        /**
         * Emoji: ðŸ‡»ðŸ‡¦
         */
        "FLAG_VA" = "ðŸ‡»ðŸ‡¦",
        /**
         * Emoji: ðŸ‡»ðŸ‡¨
         */
        "FLAG_VC" = "ðŸ‡»ðŸ‡¨",
        /**
         * Emoji: ðŸ‡»ðŸ‡ª
         */
        "FLAG_VE" = "ðŸ‡»ðŸ‡ª",
        /**
         * Emoji: ðŸ‡»ðŸ‡¬
         */
        "FLAG_VG" = "ðŸ‡»ðŸ‡¬",
        /**
         * Emoji: ðŸ‡»ðŸ‡®
         */
        "FLAG_VI" = "ðŸ‡»ðŸ‡®",
        /**
         * Emoji: ðŸ‡»ðŸ‡³
         */
        "FLAG_VN" = "ðŸ‡»ðŸ‡³",
        /**
         * Emoji: ðŸ‡»ðŸ‡º
         */
        "FLAG_VU" = "ðŸ‡»ðŸ‡º",
        /**
         * Emoji: ðŸ‡¼ðŸ‡«
         */
        "FLAG_WF" = "ðŸ‡¼ðŸ‡«",
        /**
         * Emoji: ðŸ³ï¸
         */
        "FLAG_WHITE" = "ðŸ³ï¸",
        /**
         * Emoji: ðŸ‡¼ðŸ‡¸
         */
        "FLAG_WS" = "ðŸ‡¼ðŸ‡¸",
        /**
         * Emoji: ðŸ‡½ðŸ‡°
         */
        "FLAG_XK" = "ðŸ‡½ðŸ‡°",
        /**
         * Emoji: ðŸ‡¾ðŸ‡ª
         */
        "FLAG_YE" = "ðŸ‡¾ðŸ‡ª",
        /**
         * Emoji: ðŸ‡¾ðŸ‡¹
         */
        "FLAG_YT" = "ðŸ‡¾ðŸ‡¹",
        /**
         * Emoji: ðŸ‡¿ðŸ‡¦
         */
        "FLAG_ZA" = "ðŸ‡¿ðŸ‡¦",
        /**
         * Emoji: ðŸ‡¿ðŸ‡²
         */
        "FLAG_ZM" = "ðŸ‡¿ðŸ‡²",
        /**
         * Emoji: ðŸ‡¿ðŸ‡¼
         */
        "FLAG_ZW" = "ðŸ‡¿ðŸ‡¼",
        /**
         * Emoji: ðŸ”¥
         *
         * Aliases: `FIRE`
         */
        "FLAME" = "ðŸ”¥",
        /**
         * Emoji: ðŸ¦©
         */
        "FLAMINGO" = "ðŸ¦©",
        /**
         * Emoji: ðŸ®
         *
         * Aliases: `CUSTARD`,`PUDDING`
         */
        "FLAN" = "ðŸ®",
        /**
         * Emoji: ðŸ”¦
         */
        "FLASHLIGHT" = "ðŸ”¦",
        /**
         * Emoji: ðŸ«“
         */
        "FLATBREAD" = "ðŸ«“",
        /**
         * Emoji: âšœï¸
         */
        "FLEUR_DE_LIS" = "âšœï¸",
        /**
         * Emoji: ðŸ’¾
         */
        "FLOPPY_DISK" = "ðŸ’¾",
        /**
         * Emoji: ðŸŽ´
         */
        "FLOWER_PLAYING_CARDS" = "ðŸŽ´",
        /**
         * Emoji: ðŸ˜³
         */
        "FLUSHED" = "ðŸ˜³",
        /**
         * Emoji: ðŸª°
         */
        "FLY" = "ðŸª°",
        /**
         * Emoji: ðŸ¥
         */
        "FLYING_DISC" = "ðŸ¥",
        /**
         * Emoji: ðŸ›¸
         */
        "FLYING_SAUCER" = "ðŸ›¸",
        /**
         * Emoji: ðŸŒ«ï¸
         */
        "FOG" = "ðŸŒ«ï¸",
        /**
         * Emoji: ðŸŒ
         */
        "FOGGY" = "ðŸŒ",
        /**
         * Emoji: ðŸ«•
         */
        "FONDUE" = "ðŸ«•",
        /**
         * Emoji: ðŸ¦¶
         */
        "FOOT" = "ðŸ¦¶",
        /**
         * Emoji: ðŸˆ
         */
        "FOOTBALL" = "ðŸˆ",
        /**
         * Emoji: ðŸ‘£
         */
        "FOOTPRINTS" = "ðŸ‘£",
        /**
         * Emoji: ðŸ´
         */
        "FORK_AND_KNIFE" = "ðŸ´",
        /**
         * Emoji: ðŸ½ï¸
         *
         * Aliases: `FORK_KNIFE_PLATE`
         */
        "FORK_AND_KNIFE_WITH_PLATE" = "ðŸ½ï¸",
        /**
         * Emoji: ðŸ½ï¸
         *
         * Aliases: `FORK_AND_KNIFE_WITH_PLATE`
         */
        "FORK_KNIFE_PLATE" = "ðŸ½ï¸",
        /**
         * Emoji: ðŸ¥ 
         */
        "FORTUNE_COOKIE" = "ðŸ¥ ",
        /**
         * Emoji: â›²
         */
        "FOUNTAIN" = "â›²",
        /**
         * Emoji: 4ï¸âƒ£
         */
        "FOUR" = "4ï¸âƒ£",
        /**
         * Emoji: ðŸ€
         */
        "FOUR_LEAF_CLOVER" = "ðŸ€",
        /**
         * Emoji: ðŸ¦Š
         *
         * Aliases: `FOX_FACE`
         */
        "FOX" = "ðŸ¦Š",
        /**
         * Emoji: ðŸ¦Š
         *
         * Aliases: `FOX`
         */
        "FOX_FACE" = "ðŸ¦Š",
        /**
         * Emoji: ðŸ–¼ï¸
         *
         * Aliases: `FRAME_WITH_PICTURE`
         */
        "FRAME_PHOTO" = "ðŸ–¼ï¸",
        /**
         * Emoji: ðŸ–¼ï¸
         *
         * Aliases: `FRAME_PHOTO`
         */
        "FRAME_WITH_PICTURE" = "ðŸ–¼ï¸",
        /**
         * Emoji: ðŸ†“
         */
        "FREE" = "ðŸ†“",
        /**
         * Emoji: ðŸ¥–
         *
         * Aliases: `BAGUETTE_BREAD`
         */
        "FRENCH_BREAD" = "ðŸ¥–",
        /**
         * Emoji: ðŸ¤
         */
        "FRIED_SHRIMP" = "ðŸ¤",
        /**
         * Emoji: ðŸŸ
         */
        "FRIES" = "ðŸŸ",
        /**
         * Emoji: ðŸ¸
         */
        "FROG" = "ðŸ¸",
        /**
         * Emoji: ðŸ˜¦
         */
        "FROWNING" = "ðŸ˜¦",
        /**
         * Emoji: â˜¹ï¸
         *
         * Aliases: `WHITE_FROWNING_FACE`
         */
        "FROWNING2" = "â˜¹ï¸",
        /**
         * Emoji: â›½
         */
        "FUELPUMP" = "â›½",
        /**
         * Emoji: ðŸŒ•
         */
        "FULL_MOON" = "ðŸŒ•",
        /**
         * Emoji: ðŸŒ
         */
        "FULL_MOON_WITH_FACE" = "ðŸŒ",
        /**
         * Emoji: âš±ï¸
         *
         * Aliases: `URN`
         */
        "FUNERAL_URN" = "âš±ï¸",
        /**
         * Emoji: ðŸŽ²
         */
        "GAME_DIE" = "ðŸŽ²",
        /**
         * Emoji: ðŸ§„
         */
        "GARLIC" = "ðŸ§„",
        /**
         * Emoji: ðŸ³ï¸â€ðŸŒˆ
         *
         * Aliases: `RAINBOW_FLAG`
         */
        "GAY_PRIDE_FLAG" = "ðŸ³ï¸â€ðŸŒˆ",
        /**
         * Emoji: âš™ï¸
         */
        "GEAR" = "âš™ï¸",
        /**
         * Emoji: ðŸ’Ž
         */
        "GEM" = "ðŸ’Ž",
        /**
         * Emoji: â™Š
         */
        "GEMINI" = "â™Š",
        /**
         * Emoji: ðŸ§ž
         */
        "GENIE" = "ðŸ§ž",
        /**
         * Emoji: ðŸ‘»
         */
        "GHOST" = "ðŸ‘»",
        /**
         * Emoji: ðŸŽ
         */
        "GIFT" = "ðŸŽ",
        /**
         * Emoji: ðŸ’
         */
        "GIFT_HEART" = "ðŸ’",
        /**
         * Emoji: ðŸ¦’
         */
        "GIRAFFE" = "ðŸ¦’",
        /**
         * Emoji: ðŸ‘§
         */
        "GIRL" = "ðŸ‘§",
        /**
         * Emoji: ðŸ¥›
         *
         * Aliases: `MILK`
         */
        "GLASS_OF_MILK" = "ðŸ¥›",
        /**
         * Emoji: ðŸŒ
         */
        "GLOBE_WITH_MERIDIANS" = "ðŸŒ",
        /**
         * Emoji: ðŸ§¤
         */
        "GLOVES" = "ðŸ§¤",
        /**
         * Emoji: ðŸ¥…
         *
         * Aliases: `GOAL_NET`
         */
        "GOAL" = "ðŸ¥…",
        /**
         * Emoji: ðŸ¥…
         *
         * Aliases: `GOAL`
         */
        "GOAL_NET" = "ðŸ¥…",
        /**
         * Emoji: ðŸ
         */
        "GOAT" = "ðŸ",
        /**
         * Emoji: ðŸ¥½
         */
        "GOGGLES" = "ðŸ¥½",
        /**
         * Emoji: â›³
         */
        "GOLF" = "â›³",
        /**
         * Emoji: ðŸŒï¸
         *
         * Aliases: `PERSON_GOLFING`
         */
        "GOLFER" = "ðŸŒï¸",
        /**
         * Emoji: ðŸ¦
         */
        "GORILLA" = "ðŸ¦",
        /**
         * Emoji: ðŸ‘µ
         *
         * Aliases: `OLDER_WOMAN`
         */
        "GRANDMA" = "ðŸ‘µ",
        /**
         * Emoji: ðŸ‡
         */
        "GRAPES" = "ðŸ‡",
        /**
         * Emoji: ðŸ
         */
        "GREEN_APPLE" = "ðŸ",
        /**
         * Emoji: ðŸ“—
         */
        "GREEN_BOOK" = "ðŸ“—",
        /**
         * Emoji: ðŸŸ¢
         */
        "GREEN_CIRCLE" = "ðŸŸ¢",
        /**
         * Emoji: ðŸ’š
         */
        "GREEN_HEART" = "ðŸ’š",
        /**
         * Emoji: ðŸ¥—
         *
         * Aliases: `SALAD`
         */
        "GREEN_SALAD" = "ðŸ¥—",
        /**
         * Emoji: ðŸŸ©
         */
        "GREEN_SQUARE" = "ðŸŸ©",
        /**
         * Emoji: â•
         */
        "GREY_EXCLAMATION" = "â•",
        /**
         * Emoji: â”
         */
        "GREY_QUESTION" = "â”",
        /**
         * Emoji: ðŸ˜¬
         */
        "GRIMACING" = "ðŸ˜¬",
        /**
         * Emoji: ðŸ˜
         */
        "GRIN" = "ðŸ˜",
        /**
         * Emoji: ðŸ˜€
         */
        "GRINNING" = "ðŸ˜€",
        /**
         * Emoji: ðŸ’‚
         *
         * Aliases: `GUARDSMAN`
         */
        "GUARD" = "ðŸ’‚",
        /**
         * Emoji: ðŸ’‚
         *
         * Aliases: `GUARD`
         */
        "GUARDSMAN" = "ðŸ’‚",
        /**
         * Emoji: ðŸ¦®
         */
        "GUIDE_DOG" = "ðŸ¦®",
        /**
         * Emoji: ðŸŽ¸
         */
        "GUITAR" = "ðŸŽ¸",
        /**
         * Emoji: ðŸ”«
         */
        "GUN" = "ðŸ”«",
        /**
         * Emoji: ðŸ’‡
         *
         * Aliases: `PERSON_GETTING_HAIRCUT`
         */
        "HAIRCUT" = "ðŸ’‡",
        /**
         * Emoji: ðŸ”
         */
        "HAMBURGER" = "ðŸ”",
        /**
         * Emoji: ðŸ”¨
         */
        "HAMMER" = "ðŸ”¨",
        /**
         * Emoji: âš’ï¸
         *
         * Aliases: `HAMMER_PICK`
         */
        "HAMMER_AND_PICK" = "âš’ï¸",
        /**
         * Emoji: ðŸ› ï¸
         *
         * Aliases: `TOOLS`
         */
        "HAMMER_AND_WRENCH" = "ðŸ› ï¸",
        /**
         * Emoji: âš’ï¸
         *
         * Aliases: `HAMMER_AND_PICK`
         */
        "HAMMER_PICK" = "âš’ï¸",
        /**
         * Emoji: ðŸ¹
         */
        "HAMSTER" = "ðŸ¹",
        /**
         * Emoji: ðŸ‘œ
         */
        "HANDBAG" = "ðŸ‘œ",
        /**
         * Emoji: ðŸ¤¾
         *
         * Aliases: `PERSON_PLAYING_HANDBALL`
         */
        "HANDBALL" = "ðŸ¤¾",
        /**
         * Emoji: ðŸ¤
         *
         * Aliases: `SHAKING_HANDS`
         */
        "HANDSHAKE" = "ðŸ¤",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `RAISED_HAND_WITH_FINGERS_SPLAYED`
         */
        "HAND_SPLAYED" = "ðŸ–ï¸",
        /**
         * Emoji: ðŸ¤ž
         *
         * Aliases: `FINGERS_CROSSED`
         */
        "HAND_WITH_INDEX_AND_MIDDLE_FINGER_CROSSED" = "ðŸ¤ž",
        /**
         * Emoji: ðŸ’©
         *
         * Aliases: `POOP`,`SHIT`,`POO`
         */
        "HANKEY" = "ðŸ’©",
        /**
         * Emoji: #ï¸âƒ£
         */
        "HASH" = "#ï¸âƒ£",
        /**
         * Emoji: ðŸ¥
         */
        "HATCHED_CHICK" = "ðŸ¥",
        /**
         * Emoji: ðŸ£
         */
        "HATCHING_CHICK" = "ðŸ£",
        /**
         * Emoji: ðŸŽ§
         */
        "HEADPHONES" = "ðŸŽ§",
        /**
         * Emoji: ðŸª¦
         */
        "HEADSTONE" = "ðŸª¦",
        /**
         * Emoji: ðŸ¤•
         *
         * Aliases: `FACE_WITH_HEAD_BANDAGE`
         */
        "HEAD_BANDAGE" = "ðŸ¤•",
        /**
         * Emoji: ðŸ§‘â€âš•ï¸
         */
        "HEALTH_WORKER" = "ðŸ§‘â€âš•ï¸",
        /**
         * Emoji: â¤ï¸
         */
        "HEART" = "â¤ï¸",
        /**
         * Emoji: ðŸ’“
         */
        "HEARTBEAT" = "ðŸ’“",
        /**
         * Emoji: ðŸ’—
         */
        "HEARTPULSE" = "ðŸ’—",
        /**
         * Emoji: â™¥ï¸
         */
        "HEARTS" = "â™¥ï¸",
        /**
         * Emoji: ðŸ’Ÿ
         */
        "HEART_DECORATION" = "ðŸ’Ÿ",
        /**
         * Emoji: â£ï¸
         *
         * Aliases: `HEAVY_HEART_EXCLAMATION_MARK_ORNAMENT`
         */
        "HEART_EXCLAMATION" = "â£ï¸",
        /**
         * Emoji: ðŸ˜
         */
        "HEART_EYES" = "ðŸ˜",
        /**
         * Emoji: ðŸ˜»
         */
        "HEART_EYES_CAT" = "ðŸ˜»",
        /**
         * Emoji: ðŸ™‰
         */
        "HEAR_NO_EVIL" = "ðŸ™‰",
        /**
         * Emoji: âœ”ï¸
         */
        "HEAVY_CHECK_MARK" = "âœ”ï¸",
        /**
         * Emoji: âž—
         */
        "HEAVY_DIVISION_SIGN" = "âž—",
        /**
         * Emoji: ðŸ’²
         */
        "HEAVY_DOLLAR_SIGN" = "ðŸ’²",
        /**
         * Emoji: â£ï¸
         *
         * Aliases: `HEART_EXCLAMATION`
         */
        "HEAVY_HEART_EXCLAMATION_MARK_ORNAMENT" = "â£ï¸",
        /**
         * Emoji: âž–
         */
        "HEAVY_MINUS_SIGN" = "âž–",
        /**
         * Emoji: âœ–ï¸
         */
        "HEAVY_MULTIPLICATION_X" = "âœ–ï¸",
        /**
         * Emoji: âž•
         */
        "HEAVY_PLUS_SIGN" = "âž•",
        /**
         * Emoji: ðŸ¦”
         */
        "HEDGEHOG" = "ðŸ¦”",
        /**
         * Emoji: ðŸš
         */
        "HELICOPTER" = "ðŸš",
        /**
         * Emoji: â›‘ï¸
         *
         * Aliases: `HELMET_WITH_WHITE_CROSS`
         */
        "HELMET_WITH_CROSS" = "â›‘ï¸",
        /**
         * Emoji: â›‘ï¸
         *
         * Aliases: `HELMET_WITH_CROSS`
         */
        "HELMET_WITH_WHITE_CROSS" = "â›‘ï¸",
        /**
         * Emoji: ðŸŒ¿
         */
        "HERB" = "ðŸŒ¿",
        /**
         * Emoji: ðŸŒº
         */
        "HIBISCUS" = "ðŸŒº",
        /**
         * Emoji: ðŸ”†
         */
        "HIGH_BRIGHTNESS" = "ðŸ”†",
        /**
         * Emoji: ðŸ‘ 
         */
        "HIGH_HEEL" = "ðŸ‘ ",
        /**
         * Emoji: ðŸ¥¾
         */
        "HIKING_BOOT" = "ðŸ¥¾",
        /**
         * Emoji: ðŸ›•
         */
        "HINDU_TEMPLE" = "ðŸ›•",
        /**
         * Emoji: ðŸ¦›
         */
        "HIPPOPOTAMUS" = "ðŸ¦›",
        /**
         * Emoji: ðŸ’
         */
        "HOCKEY" = "ðŸ’",
        /**
         * Emoji: ðŸ•³ï¸
         */
        "HOLE" = "ðŸ•³ï¸",
        /**
         * Emoji: ðŸ˜ï¸
         *
         * Aliases: `HOUSE_BUILDINGS`
         */
        "HOMES" = "ðŸ˜ï¸",
        /**
         * Emoji: ðŸ¯
         */
        "HONEY_POT" = "ðŸ¯",
        /**
         * Emoji: ðŸª
         */
        "HOOK" = "ðŸª",
        /**
         * Emoji: ðŸ´
         */
        "HORSE" = "ðŸ´",
        /**
         * Emoji: ðŸ‡
         */
        "HORSE_RACING" = "ðŸ‡",
        /**
         * Emoji: ðŸ¥
         */
        "HOSPITAL" = "ðŸ¥",
        /**
         * Emoji: ðŸŒ­
         *
         * Aliases: `HOT_DOG`
         */
        "HOTDOG" = "ðŸŒ­",
        /**
         * Emoji: ðŸ¨
         */
        "HOTEL" = "ðŸ¨",
        /**
         * Emoji: â™¨ï¸
         */
        "HOTSPRINGS" = "â™¨ï¸",
        /**
         * Emoji: ðŸŒ­
         *
         * Aliases: `HOTDOG`
         */
        "HOT_DOG" = "ðŸŒ­",
        /**
         * Emoji: ðŸ¥µ
         */
        "HOT_FACE" = "ðŸ¥µ",
        /**
         * Emoji: ðŸŒ¶ï¸
         */
        "HOT_PEPPER" = "ðŸŒ¶ï¸",
        /**
         * Emoji: âŒ›
         */
        "HOURGLASS" = "âŒ›",
        /**
         * Emoji: â³
         */
        "HOURGLASS_FLOWING_SAND" = "â³",
        /**
         * Emoji: ðŸ 
         */
        "HOUSE" = "ðŸ ",
        /**
         * Emoji: ðŸšï¸
         *
         * Aliases: `DERELICT_HOUSE_BUILDING`
         */
        "HOUSE_ABANDONED" = "ðŸšï¸",
        /**
         * Emoji: ðŸ˜ï¸
         *
         * Aliases: `HOMES`
         */
        "HOUSE_BUILDINGS" = "ðŸ˜ï¸",
        /**
         * Emoji: ðŸ¡
         */
        "HOUSE_WITH_GARDEN" = "ðŸ¡",
        /**
         * Emoji: ðŸ¤—
         *
         * Aliases: `HUGGING_FACE`
         */
        "HUGGING" = "ðŸ¤—",
        /**
         * Emoji: ðŸ¤—
         *
         * Aliases: `HUGGING`
         */
        "HUGGING_FACE" = "ðŸ¤—",
        /**
         * Emoji: ðŸ˜¯
         */
        "HUSHED" = "ðŸ˜¯",
        /**
         * Emoji: ðŸ›–
         */
        "HUT" = "ðŸ›–",
        /**
         * Emoji: ðŸ¦
         */
        "ICECREAM" = "ðŸ¦",
        /**
         * Emoji: ðŸ¨
         */
        "ICE_CREAM" = "ðŸ¨",
        /**
         * Emoji: ðŸ§Š
         */
        "ICE_CUBE" = "ðŸ§Š",
        /**
         * Emoji: â›¸ï¸
         */
        "ICE_SKATE" = "â›¸ï¸",
        /**
         * Emoji: ðŸ†”
         */
        "ID" = "ðŸ†”",
        /**
         * Emoji: ðŸ‰
         */
        "IDEOGRAPH_ADVANTAGE" = "ðŸ‰",
        /**
         * Emoji: ðŸ‘¿
         */
        "IMP" = "ðŸ‘¿",
        /**
         * Emoji: ðŸ“¥
         */
        "INBOX_TRAY" = "ðŸ“¥",
        /**
         * Emoji: ðŸ“¨
         */
        "INCOMING_ENVELOPE" = "ðŸ“¨",
        /**
         * Emoji: â™¾ï¸
         */
        "INFINITY" = "â™¾ï¸",
        /**
         * Emoji: ðŸ’
         *
         * Aliases: `PERSON_TIPPING_HAND`
         */
        "INFORMATION_DESK_PERSON" = "ðŸ’",
        /**
         * Emoji: â„¹ï¸
         */
        "INFORMATION_SOURCE" = "â„¹ï¸",
        /**
         * Emoji: ðŸ˜‡
         */
        "INNOCENT" = "ðŸ˜‡",
        /**
         * Emoji: â‰ï¸
         */
        "INTERROBANG" = "â‰ï¸",
        /**
         * Emoji: ðŸ“±
         *
         * Aliases: `MOBILE_PHONE`
         */
        "IPHONE" = "ðŸ“±",
        /**
         * Emoji: ðŸï¸
         *
         * Aliases: `DESERT_ISLAND`
         */
        "ISLAND" = "ðŸï¸",
        /**
         * Emoji: ðŸ®
         */
        "IZAKAYA_LANTERN" = "ðŸ®",
        /**
         * Emoji: ðŸŽƒ
         */
        "JACK_O_LANTERN" = "ðŸŽƒ",
        /**
         * Emoji: ðŸ—¾
         */
        "JAPAN" = "ðŸ—¾",
        /**
         * Emoji: ðŸ¯
         */
        "JAPANESE_CASTLE" = "ðŸ¯",
        /**
         * Emoji: ðŸ‘º
         */
        "JAPANESE_GOBLIN" = "ðŸ‘º",
        /**
         * Emoji: ðŸ‘¹
         */
        "JAPANESE_OGRE" = "ðŸ‘¹",
        /**
         * Emoji: ðŸ‘–
         */
        "JEANS" = "ðŸ‘–",
        /**
         * Emoji: ðŸ§©
         */
        "JIGSAW" = "ðŸ§©",
        /**
         * Emoji: ðŸ˜‚
         */
        "JOY" = "ðŸ˜‚",
        /**
         * Emoji: ðŸ•¹ï¸
         */
        "JOYSTICK" = "ðŸ•¹ï¸",
        /**
         * Emoji: ðŸ˜¹
         */
        "JOY_CAT" = "ðŸ˜¹",
        /**
         * Emoji: ðŸ§‘â€âš–ï¸
         */
        "JUDGE" = "ðŸ§‘â€âš–ï¸",
        /**
         * Emoji: ðŸ¤¹
         *
         * Aliases: `PERSON_JUGGLING`,`JUGGLING`
         */
        "JUGGLER" = "ðŸ¤¹",
        /**
         * Emoji: ðŸ¤¹
         *
         * Aliases: `PERSON_JUGGLING`,`JUGGLER`
         */
        "JUGGLING" = "ðŸ¤¹",
        /**
         * Emoji: ðŸ•‹
         */
        "KAABA" = "ðŸ•‹",
        /**
         * Emoji: ðŸ¦˜
         */
        "KANGAROO" = "ðŸ¦˜",
        /**
         * Emoji: ðŸ¥‹
         *
         * Aliases: `MARTIAL_ARTS_UNIFORM`
         */
        "KARATE_UNIFORM" = "ðŸ¥‹",
        /**
         * Emoji: ðŸ›¶
         *
         * Aliases: `CANOE`
         */
        "KAYAK" = "ðŸ›¶",
        /**
         * Emoji: ðŸ”‘
         */
        "KEY" = "ðŸ”‘",
        /**
         * Emoji: ðŸ—ï¸
         *
         * Aliases: `OLD_KEY`
         */
        "KEY2" = "ðŸ—ï¸",
        /**
         * Emoji: âŒ¨ï¸
         */
        "KEYBOARD" = "âŒ¨ï¸",
        /**
         * Emoji: *ï¸âƒ£
         *
         * Aliases: `ASTERISK`
         */
        "KEYCAP_ASTERISK" = "*ï¸âƒ£",
        /**
         * Emoji: ðŸ”Ÿ
         */
        "KEYCAP_TEN" = "ðŸ”Ÿ",
        /**
         * Emoji: ðŸ‘˜
         */
        "KIMONO" = "ðŸ‘˜",
        /**
         * Emoji: ðŸ’‹
         */
        "KISS" = "ðŸ’‹",
        /**
         * Emoji: ðŸ˜—
         */
        "KISSING" = "ðŸ˜—",
        /**
         * Emoji: ðŸ˜½
         */
        "KISSING_CAT" = "ðŸ˜½",
        /**
         * Emoji: ðŸ˜š
         */
        "KISSING_CLOSED_EYES" = "ðŸ˜š",
        /**
         * Emoji: ðŸ˜˜
         */
        "KISSING_HEART" = "ðŸ˜˜",
        /**
         * Emoji: ðŸ˜™
         */
        "KISSING_SMILING_EYES" = "ðŸ˜™",
        /**
         * Emoji: ðŸ‘¨â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨
         *
         * Aliases: `COUPLEKISS_MM`
         */
        "KISS_MM" = "ðŸ‘¨â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨
         */
        "KISS_WOMAN_MAN" = "ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘¨",
        /**
         * Emoji: ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘©
         *
         * Aliases: `COUPLEKISS_WW`
         */
        "KISS_WW" = "ðŸ‘©â€â¤ï¸â€ðŸ’‹â€ðŸ‘©",
        /**
         * Emoji: ðŸª
         */
        "KITE" = "ðŸª",
        /**
         * Emoji: ðŸ¥
         *
         * Aliases: `KIWIFRUIT`
         */
        "KIWI" = "ðŸ¥",
        /**
         * Emoji: ðŸ¥
         *
         * Aliases: `KIWI`
         */
        "KIWIFRUIT" = "ðŸ¥",
        /**
         * Emoji: ðŸ”ª
         */
        "KNIFE" = "ðŸ”ª",
        /**
         * Emoji: ðŸª¢
         */
        "KNOT" = "ðŸª¢",
        /**
         * Emoji: ðŸ¨
         */
        "KOALA" = "ðŸ¨",
        /**
         * Emoji: ðŸˆ
         */
        "KOKO" = "ðŸˆ",
        /**
         * Emoji: ðŸ·ï¸
         */
        "LABEL" = "ðŸ·ï¸",
        /**
         * Emoji: ðŸ¥¼
         */
        "LAB_COAT" = "ðŸ¥¼",
        /**
         * Emoji: ðŸ¥
         */
        "LACROSSE" = "ðŸ¥",
        /**
         * Emoji: ðŸªœ
         */
        "LADDER" = "ðŸªœ",
        /**
         * Emoji: ðŸž
         */
        "LADY_BEETLE" = "ðŸž",
        /**
         * Emoji: ðŸ”·
         */
        "LARGE_BLUE_DIAMOND" = "ðŸ”·",
        /**
         * Emoji: ðŸ”¶
         */
        "LARGE_ORANGE_DIAMOND" = "ðŸ”¶",
        /**
         * Emoji: ðŸŒ—
         */
        "LAST_QUARTER_MOON" = "ðŸŒ—",
        /**
         * Emoji: ðŸŒœ
         */
        "LAST_QUARTER_MOON_WITH_FACE" = "ðŸŒœ",
        /**
         * Emoji: âœï¸
         *
         * Aliases: `CROSS`
         */
        "LATIN_CROSS" = "âœï¸",
        /**
         * Emoji: ðŸ˜†
         *
         * Aliases: `SATISFIED`
         */
        "LAUGHING" = "ðŸ˜†",
        /**
         * Emoji: ðŸ¥¬
         */
        "LEAFY_GREEN" = "ðŸ¥¬",
        /**
         * Emoji: ðŸƒ
         */
        "LEAVES" = "ðŸƒ",
        /**
         * Emoji: ðŸ“’
         */
        "LEDGER" = "ðŸ“’",
        /**
         * Emoji: â†©ï¸
         */
        "LEFTWARDS_ARROW_WITH_HOOK" = "â†©ï¸",
        /**
         * Emoji: ðŸ¤›
         *
         * Aliases: `LEFT_FIST`
         */
        "LEFT_FACING_FIST" = "ðŸ¤›",
        /**
         * Emoji: ðŸ¤›
         *
         * Aliases: `LEFT_FACING_FIST`
         */
        "LEFT_FIST" = "ðŸ¤›",
        /**
         * Emoji: ðŸ›…
         */
        "LEFT_LUGGAGE" = "ðŸ›…",
        /**
         * Emoji: â†”ï¸
         */
        "LEFT_RIGHT_ARROW" = "â†”ï¸",
        /**
         * Emoji: ðŸ—¨ï¸
         *
         * Aliases: `SPEECH_LEFT`
         */
        "LEFT_SPEECH_BUBBLE" = "ðŸ—¨ï¸",
        /**
         * Emoji: ðŸ¦µ
         */
        "LEG" = "ðŸ¦µ",
        /**
         * Emoji: ðŸ‹
         */
        "LEMON" = "ðŸ‹",
        /**
         * Emoji: â™Œ
         */
        "LEO" = "â™Œ",
        /**
         * Emoji: ðŸ†
         */
        "LEOPARD" = "ðŸ†",
        /**
         * Emoji: ðŸŽšï¸
         */
        "LEVEL_SLIDER" = "ðŸŽšï¸",
        /**
         * Emoji: ðŸ•´ï¸
         *
         * Aliases: `MAN_IN_BUSINESS_SUIT_LEVITATING`
         */
        "LEVITATE" = "ðŸ•´ï¸",
        /**
         * Emoji: ðŸ¤¥
         *
         * Aliases: `LYING_FACE`
         */
        "LIAR" = "ðŸ¤¥",
        /**
         * Emoji: â™Ž
         */
        "LIBRA" = "â™Ž",
        /**
         * Emoji: ðŸ‹ï¸
         *
         * Aliases: `PERSON_LIFTING_WEIGHTS`,`WEIGHT_LIFTER`
         */
        "LIFTER" = "ðŸ‹ï¸",
        /**
         * Emoji: ðŸšˆ
         */
        "LIGHT_RAIL" = "ðŸšˆ",
        /**
         * Emoji: ðŸ”—
         */
        "LINK" = "ðŸ”—",
        /**
         * Emoji: ðŸ–‡ï¸
         *
         * Aliases: `PAPERCLIPS`
         */
        "LINKED_PAPERCLIPS" = "ðŸ–‡ï¸",
        /**
         * Emoji: ðŸ¦
         *
         * Aliases: `LION_FACE`
         */
        "LION" = "ðŸ¦",
        /**
         * Emoji: ðŸ¦
         *
         * Aliases: `LION`
         */
        "LION_FACE" = "ðŸ¦",
        /**
         * Emoji: ðŸ‘„
         */
        "LIPS" = "ðŸ‘„",
        /**
         * Emoji: ðŸ’„
         */
        "LIPSTICK" = "ðŸ’„",
        /**
         * Emoji: ðŸ¦Ž
         */
        "LIZARD" = "ðŸ¦Ž",
        /**
         * Emoji: ðŸ¦™
         */
        "LLAMA" = "ðŸ¦™",
        /**
         * Emoji: ðŸ¦ž
         */
        "LOBSTER" = "ðŸ¦ž",
        /**
         * Emoji: ðŸ”’
         */
        "LOCK" = "ðŸ”’",
        /**
         * Emoji: ðŸ”
         */
        "LOCK_WITH_INK_PEN" = "ðŸ”",
        /**
         * Emoji: ðŸ­
         */
        "LOLLIPOP" = "ðŸ­",
        /**
         * Emoji: ðŸª˜
         */
        "LONG_DRUM" = "ðŸª˜",
        /**
         * Emoji: âž¿
         */
        "LOOP" = "âž¿",
        /**
         * Emoji: ðŸ“¢
         */
        "LOUDSPEAKER" = "ðŸ“¢",
        /**
         * Emoji: ðŸ”Š
         */
        "LOUD_SOUND" = "ðŸ”Š",
        /**
         * Emoji: ðŸ©
         */
        "LOVE_HOTEL" = "ðŸ©",
        /**
         * Emoji: ðŸ’Œ
         */
        "LOVE_LETTER" = "ðŸ’Œ",
        /**
         * Emoji: ðŸ¤Ÿ
         */
        "LOVE_YOU_GESTURE" = "ðŸ¤Ÿ",
        /**
         * Emoji: ðŸ–Šï¸
         *
         * Aliases: `PEN_BALLPOINT`
         */
        "LOWER_LEFT_BALLPOINT_PEN" = "ðŸ–Šï¸",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `CRAYON`
         */
        "LOWER_LEFT_CRAYON" = "ðŸ–ï¸",
        /**
         * Emoji: ðŸ–‹ï¸
         *
         * Aliases: `PEN_FOUNTAIN`
         */
        "LOWER_LEFT_FOUNTAIN_PEN" = "ðŸ–‹ï¸",
        /**
         * Emoji: ðŸ–Œï¸
         *
         * Aliases: `PAINTBRUSH`
         */
        "LOWER_LEFT_PAINTBRUSH" = "ðŸ–Œï¸",
        /**
         * Emoji: ðŸ”…
         */
        "LOW_BRIGHTNESS" = "ðŸ”…",
        /**
         * Emoji: ðŸ§³
         */
        "LUGGAGE" = "ðŸ§³",
        /**
         * Emoji: ðŸ«
         */
        "LUNGS" = "ðŸ«",
        /**
         * Emoji: ðŸ¤¥
         *
         * Aliases: `LIAR`
         */
        "LYING_FACE" = "ðŸ¤¥",
        /**
         * Emoji: â“‚ï¸
         */
        "M" = "â“‚ï¸",
        /**
         * Emoji: ðŸ”
         */
        "MAG" = "ðŸ”",
        /**
         * Emoji: ðŸ§™
         */
        "MAGE" = "ðŸ§™",
        /**
         * Emoji: ðŸª„
         */
        "MAGIC_WAND" = "ðŸª„",
        /**
         * Emoji: ðŸ§²
         */
        "MAGNET" = "ðŸ§²",
        /**
         * Emoji: ðŸ”Ž
         */
        "MAG_RIGHT" = "ðŸ”Ž",
        /**
         * Emoji: ðŸ€„
         */
        "MAHJONG" = "ðŸ€„",
        /**
         * Emoji: ðŸ“«
         */
        "MAILBOX" = "ðŸ“«",
        /**
         * Emoji: ðŸ“ª
         */
        "MAILBOX_CLOSED" = "ðŸ“ª",
        /**
         * Emoji: ðŸ“¬
         */
        "MAILBOX_WITH_MAIL" = "ðŸ“¬",
        /**
         * Emoji: ðŸ“­
         */
        "MAILBOX_WITH_NO_MAIL" = "ðŸ“­",
        /**
         * Emoji: ðŸ•º
         *
         * Aliases: `MAN_DANCING`
         */
        "MALE_DANCER" = "ðŸ•º",
        /**
         * Emoji: â™‚ï¸
         */
        "MALE_SIGN" = "â™‚ï¸",
        /**
         * Emoji: ðŸ¦£
         */
        "MAMMOTH" = "ðŸ¦£",
        /**
         * Emoji: ðŸ‘¨
         */
        "MAN" = "ðŸ‘¨",
        /**
         * Emoji: ðŸ¥­
         */
        "MANGO" = "ðŸ¥­",
        /**
         * Emoji: ðŸ‘ž
         */
        "MANS_SHOE" = "ðŸ‘ž",
        /**
         * Emoji: ðŸ•°ï¸
         *
         * Aliases: `CLOCK`
         */
        "MANTLEPIECE_CLOCK" = "ðŸ•°ï¸",
        /**
         * Emoji: ðŸ¦½
         */
        "MANUAL_WHEELCHAIR" = "ðŸ¦½",
        /**
         * Emoji: ðŸ‘¨â€ðŸŽ¨
         */
        "MAN_ARTIST" = "ðŸ‘¨â€ðŸŽ¨",
        /**
         * Emoji: ðŸ‘¨â€ðŸš€
         */
        "MAN_ASTRONAUT" = "ðŸ‘¨â€ðŸš€",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦²
         */
        "MAN_BALD" = "ðŸ‘¨â€ðŸ¦²",
        /**
         * Emoji: ðŸš´â€â™‚ï¸
         */
        "MAN_BIKING" = "ðŸš´â€â™‚ï¸",
        /**
         * Emoji: â›¹ï¸â€â™‚ï¸
         */
        "MAN_BOUNCING_BALL" = "â›¹ï¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ™‡â€â™‚ï¸
         */
        "MAN_BOWING" = "ðŸ™‡â€â™‚ï¸",
        /**
         * Emoji: ðŸ¤¸â€â™‚ï¸
         */
        "MAN_CARTWHEELING" = "ðŸ¤¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ§—â€â™‚ï¸
         */
        "MAN_CLIMBING" = "ðŸ§—â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘·â€â™‚ï¸
         */
        "MAN_CONSTRUCTION_WORKER" = "ðŸ‘·â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ³
         */
        "MAN_COOK" = "ðŸ‘¨â€ðŸ³",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦±
         */
        "MAN_CURLY_HAIRED" = "ðŸ‘¨â€ðŸ¦±",
        /**
         * Emoji: ðŸ•º
         *
         * Aliases: `MALE_DANCER`
         */
        "MAN_DANCING" = "ðŸ•º",
        /**
         * Emoji: ðŸ•µï¸â€â™‚ï¸
         */
        "MAN_DETECTIVE" = "ðŸ•µï¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ§â€â™‚ï¸
         */
        "MAN_ELF" = "ðŸ§â€â™‚ï¸",
        /**
         * Emoji: ðŸ¤¦â€â™‚ï¸
         */
        "MAN_FACEPALMING" = "ðŸ¤¦â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ­
         */
        "MAN_FACTORY_WORKER" = "ðŸ‘¨â€ðŸ­",
        /**
         * Emoji: ðŸ§šâ€â™‚ï¸
         */
        "MAN_FAIRY" = "ðŸ§šâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸŒ¾
         */
        "MAN_FARMER" = "ðŸ‘¨â€ðŸŒ¾",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¼
         */
        "MAN_FEEDING_BABY" = "ðŸ‘¨â€ðŸ¼",
        /**
         * Emoji: ðŸ‘¨â€ðŸš’
         */
        "MAN_FIREFIGHTER" = "ðŸ‘¨â€ðŸš’",
        /**
         * Emoji: ðŸ™â€â™‚ï¸
         */
        "MAN_FROWNING" = "ðŸ™â€â™‚ï¸",
        /**
         * Emoji: ðŸ§žâ€â™‚ï¸
         */
        "MAN_GENIE" = "ðŸ§žâ€â™‚ï¸",
        /**
         * Emoji: ðŸ™…â€â™‚ï¸
         */
        "MAN_GESTURING_NO" = "ðŸ™…â€â™‚ï¸",
        /**
         * Emoji: ðŸ™†â€â™‚ï¸
         */
        "MAN_GESTURING_OK" = "ðŸ™†â€â™‚ï¸",
        /**
         * Emoji: ðŸ’†â€â™‚ï¸
         */
        "MAN_GETTING_FACE_MASSAGE" = "ðŸ’†â€â™‚ï¸",
        /**
         * Emoji: ðŸ’‡â€â™‚ï¸
         */
        "MAN_GETTING_HAIRCUT" = "ðŸ’‡â€â™‚ï¸",
        /**
         * Emoji: ðŸŒï¸â€â™‚ï¸
         */
        "MAN_GOLFING" = "ðŸŒï¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ’‚â€â™‚ï¸
         */
        "MAN_GUARD" = "ðŸ’‚â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€âš•ï¸
         */
        "MAN_HEALTH_WORKER" = "ðŸ‘¨â€âš•ï¸",
        /**
         * Emoji: ðŸ•´ï¸
         *
         * Aliases: `LEVITATE`
         */
        "MAN_IN_BUSINESS_SUIT_LEVITATING" = "ðŸ•´ï¸",
        /**
         * Emoji: ðŸ§˜â€â™‚ï¸
         */
        "MAN_IN_LOTUS_POSITION" = "ðŸ§˜â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦½
         */
        "MAN_IN_MANUAL_WHEELCHAIR" = "ðŸ‘¨â€ðŸ¦½",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦¼
         */
        "MAN_IN_MOTORIZED_WHEELCHAIR" = "ðŸ‘¨â€ðŸ¦¼",
        /**
         * Emoji: ðŸ§–â€â™‚ï¸
         */
        "MAN_IN_STEAMY_ROOM" = "ðŸ§–â€â™‚ï¸",
        /**
         * Emoji: ðŸ¤µâ€â™‚ï¸
         */
        "MAN_IN_TUXEDO" = "ðŸ¤µâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€âš–ï¸
         */
        "MAN_JUDGE" = "ðŸ‘¨â€âš–ï¸",
        /**
         * Emoji: ðŸ¤¹â€â™‚ï¸
         */
        "MAN_JUGGLING" = "ðŸ¤¹â€â™‚ï¸",
        /**
         * Emoji: ðŸ§Žâ€â™‚ï¸
         */
        "MAN_KNEELING" = "ðŸ§Žâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‹ï¸â€â™‚ï¸
         */
        "MAN_LIFTING_WEIGHTS" = "ðŸ‹ï¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ§™â€â™‚ï¸
         */
        "MAN_MAGE" = "ðŸ§™â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ”§
         */
        "MAN_MECHANIC" = "ðŸ‘¨â€ðŸ”§",
        /**
         * Emoji: ðŸšµâ€â™‚ï¸
         */
        "MAN_MOUNTAIN_BIKING" = "ðŸšµâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ’¼
         */
        "MAN_OFFICE_WORKER" = "ðŸ‘¨â€ðŸ’¼",
        /**
         * Emoji: ðŸ‘¨â€âœˆï¸
         */
        "MAN_PILOT" = "ðŸ‘¨â€âœˆï¸",
        /**
         * Emoji: ðŸ¤¾â€â™‚ï¸
         */
        "MAN_PLAYING_HANDBALL" = "ðŸ¤¾â€â™‚ï¸",
        /**
         * Emoji: ðŸ¤½â€â™‚ï¸
         */
        "MAN_PLAYING_WATER_POLO" = "ðŸ¤½â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘®â€â™‚ï¸
         */
        "MAN_POLICE_OFFICER" = "ðŸ‘®â€â™‚ï¸",
        /**
         * Emoji: ðŸ™Žâ€â™‚ï¸
         */
        "MAN_POUTING" = "ðŸ™Žâ€â™‚ï¸",
        /**
         * Emoji: ðŸ™‹â€â™‚ï¸
         */
        "MAN_RAISING_HAND" = "ðŸ™‹â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦°
         */
        "MAN_RED_HAIRED" = "ðŸ‘¨â€ðŸ¦°",
        /**
         * Emoji: ðŸš£â€â™‚ï¸
         */
        "MAN_ROWING_BOAT" = "ðŸš£â€â™‚ï¸",
        /**
         * Emoji: ðŸƒâ€â™‚ï¸
         */
        "MAN_RUNNING" = "ðŸƒâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ”¬
         */
        "MAN_SCIENTIST" = "ðŸ‘¨â€ðŸ”¬",
        /**
         * Emoji: ðŸ¤·â€â™‚ï¸
         */
        "MAN_SHRUGGING" = "ðŸ¤·â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸŽ¤
         */
        "MAN_SINGER" = "ðŸ‘¨â€ðŸŽ¤",
        /**
         * Emoji: ðŸ§â€â™‚ï¸
         */
        "MAN_STANDING" = "ðŸ§â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸŽ“
         */
        "MAN_STUDENT" = "ðŸ‘¨â€ðŸŽ“",
        /**
         * Emoji: ðŸ¦¸â€â™‚ï¸
         */
        "MAN_SUPERHERO" = "ðŸ¦¸â€â™‚ï¸",
        /**
         * Emoji: ðŸ¦¹â€â™‚ï¸
         */
        "MAN_SUPERVILLAIN" = "ðŸ¦¹â€â™‚ï¸",
        /**
         * Emoji: ðŸ„â€â™‚ï¸
         */
        "MAN_SURFING" = "ðŸ„â€â™‚ï¸",
        /**
         * Emoji: ðŸŠâ€â™‚ï¸
         */
        "MAN_SWIMMING" = "ðŸŠâ€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ«
         */
        "MAN_TEACHER" = "ðŸ‘¨â€ðŸ«",
        /**
         * Emoji: ðŸ‘¨â€ðŸ’»
         */
        "MAN_TECHNOLOGIST" = "ðŸ‘¨â€ðŸ’»",
        /**
         * Emoji: ðŸ’â€â™‚ï¸
         */
        "MAN_TIPPING_HAND" = "ðŸ’â€â™‚ï¸",
        /**
         * Emoji: ðŸ§›â€â™‚ï¸
         */
        "MAN_VAMPIRE" = "ðŸ§›â€â™‚ï¸",
        /**
         * Emoji: ðŸš¶â€â™‚ï¸
         */
        "MAN_WALKING" = "ðŸš¶â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘³â€â™‚ï¸
         */
        "MAN_WEARING_TURBAN" = "ðŸ‘³â€â™‚ï¸",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦³
         */
        "MAN_WHITE_HAIRED" = "ðŸ‘¨â€ðŸ¦³",
        /**
         * Emoji: ðŸ‘²
         *
         * Aliases: `MAN_WITH_GUA_PI_MAO`
         */
        "MAN_WITH_CHINESE_CAP" = "ðŸ‘²",
        /**
         * Emoji: ðŸ‘²
         *
         * Aliases: `MAN_WITH_CHINESE_CAP`
         */
        "MAN_WITH_GUA_PI_MAO" = "ðŸ‘²",
        /**
         * Emoji: ðŸ‘¨â€ðŸ¦¯
         */
        "MAN_WITH_PROBING_CANE" = "ðŸ‘¨â€ðŸ¦¯",
        /**
         * Emoji: ðŸ‘³
         *
         * Aliases: `PERSON_WEARING_TURBAN`
         */
        "MAN_WITH_TURBAN" = "ðŸ‘³",
        /**
         * Emoji: ðŸ‘°â€â™‚ï¸
         */
        "MAN_WITH_VEIL" = "ðŸ‘°â€â™‚ï¸",
        /**
         * Emoji: ðŸ§Ÿâ€â™‚ï¸
         */
        "MAN_ZOMBIE" = "ðŸ§Ÿâ€â™‚ï¸",
        /**
         * Emoji: ðŸ—ºï¸
         *
         * Aliases: `WORLD_MAP`
         */
        "MAP" = "ðŸ—ºï¸",
        /**
         * Emoji: ðŸ
         */
        "MAPLE_LEAF" = "ðŸ",
        /**
         * Emoji: ðŸ¥‹
         *
         * Aliases: `KARATE_UNIFORM`
         */
        "MARTIAL_ARTS_UNIFORM" = "ðŸ¥‹",
        /**
         * Emoji: ðŸ˜·
         */
        "MASK" = "ðŸ˜·",
        /**
         * Emoji: ðŸ’†
         *
         * Aliases: `PERSON_GETTING_MASSAGE`
         */
        "MASSAGE" = "ðŸ’†",
        /**
         * Emoji: ðŸ§‰
         */
        "MATE" = "ðŸ§‰",
        /**
         * Emoji: ðŸ–
         */
        "MEAT_ON_BONE" = "ðŸ–",
        /**
         * Emoji: ðŸ§‘â€ðŸ”§
         */
        "MECHANIC" = "ðŸ§‘â€ðŸ”§",
        /**
         * Emoji: ðŸ¦¾
         */
        "MECHANICAL_ARM" = "ðŸ¦¾",
        /**
         * Emoji: ðŸ¦¿
         */
        "MECHANICAL_LEG" = "ðŸ¦¿",
        /**
         * Emoji: ðŸ…
         *
         * Aliases: `SPORTS_MEDAL`
         */
        "MEDAL" = "ðŸ…",
        /**
         * Emoji: âš•ï¸
         */
        "MEDICAL_SYMBOL" = "âš•ï¸",
        /**
         * Emoji: ðŸ“£
         */
        "MEGA" = "ðŸ“£",
        /**
         * Emoji: ðŸˆ
         */
        "MELON" = "ðŸˆ",
        /**
         * Emoji: ðŸ“
         *
         * Aliases: `PENCIL`
         */
        "MEMO" = "ðŸ“",
        /**
         * Emoji: ðŸ•Ž
         */
        "MENORAH" = "ðŸ•Ž",
        /**
         * Emoji: ðŸš¹
         */
        "MENS" = "ðŸš¹",
        /**
         * Emoji: ðŸ‘¯â€â™‚ï¸
         */
        "MEN_WITH_BUNNY_EARS_PARTYING" = "ðŸ‘¯â€â™‚ï¸",
        /**
         * Emoji: ðŸ¤¼â€â™‚ï¸
         */
        "MEN_WRESTLING" = "ðŸ¤¼â€â™‚ï¸",
        /**
         * Emoji: ðŸ§œâ€â™€ï¸
         */
        "MERMAID" = "ðŸ§œâ€â™€ï¸",
        /**
         * Emoji: ðŸ§œâ€â™‚ï¸
         */
        "MERMAN" = "ðŸ§œâ€â™‚ï¸",
        /**
         * Emoji: ðŸ§œ
         */
        "MERPERSON" = "ðŸ§œ",
        /**
         * Emoji: ðŸ¤˜
         *
         * Aliases: `SIGN_OF_THE_HORNS`
         */
        "METAL" = "ðŸ¤˜",
        /**
         * Emoji: ðŸš‡
         */
        "METRO" = "ðŸš‡",
        /**
         * Emoji: ðŸ¦ 
         */
        "MICROBE" = "ðŸ¦ ",
        /**
         * Emoji: ðŸŽ¤
         */
        "MICROPHONE" = "ðŸŽ¤",
        /**
         * Emoji: ðŸŽ™ï¸
         *
         * Aliases: `STUDIO_MICROPHONE`
         */
        "MICROPHONE2" = "ðŸŽ™ï¸",
        /**
         * Emoji: ðŸ”¬
         */
        "MICROSCOPE" = "ðŸ”¬",
        /**
         * Emoji: ðŸ–•
         *
         * Aliases: `REVERSED_HAND_WITH_MIDDLE_FINGER_EXTENDED`
         */
        "MIDDLE_FINGER" = "ðŸ–•",
        /**
         * Emoji: ðŸª–
         */
        "MILITARY_HELMET" = "ðŸª–",
        /**
         * Emoji: ðŸŽ–ï¸
         */
        "MILITARY_MEDAL" = "ðŸŽ–ï¸",
        /**
         * Emoji: ðŸ¥›
         *
         * Aliases: `GLASS_OF_MILK`
         */
        "MILK" = "ðŸ¥›",
        /**
         * Emoji: ðŸŒŒ
         */
        "MILKY_WAY" = "ðŸŒŒ",
        /**
         * Emoji: ðŸš
         */
        "MINIBUS" = "ðŸš",
        /**
         * Emoji: ðŸ’½
         */
        "MINIDISC" = "ðŸ’½",
        /**
         * Emoji: ðŸªž
         */
        "MIRROR" = "ðŸªž",
        /**
         * Emoji: ðŸ“±
         *
         * Aliases: `IPHONE`
         */
        "MOBILE_PHONE" = "ðŸ“±",
        /**
         * Emoji: ðŸ“´
         */
        "MOBILE_PHONE_OFF" = "ðŸ“´",
        /**
         * Emoji: ðŸ’°
         */
        "MONEYBAG" = "ðŸ’°",
        /**
         * Emoji: ðŸ¤‘
         *
         * Aliases: `MONEY_MOUTH_FACE`
         */
        "MONEY_MOUTH" = "ðŸ¤‘",
        /**
         * Emoji: ðŸ¤‘
         *
         * Aliases: `MONEY_MOUTH`
         */
        "MONEY_MOUTH_FACE" = "ðŸ¤‘",
        /**
         * Emoji: ðŸ’¸
         */
        "MONEY_WITH_WINGS" = "ðŸ’¸",
        /**
         * Emoji: ðŸ’
         */
        "MONKEY" = "ðŸ’",
        /**
         * Emoji: ðŸµ
         */
        "MONKEY_FACE" = "ðŸµ",
        /**
         * Emoji: ðŸš
         */
        "MONORAIL" = "ðŸš",
        /**
         * Emoji: ðŸ¥®
         */
        "MOON_CAKE" = "ðŸ¥®",
        /**
         * Emoji: ðŸŽ“
         */
        "MORTAR_BOARD" = "ðŸŽ“",
        /**
         * Emoji: ðŸ•Œ
         */
        "MOSQUE" = "ðŸ•Œ",
        /**
         * Emoji: ðŸ¦Ÿ
         */
        "MOSQUITO" = "ðŸ¦Ÿ",
        /**
         * Emoji: ðŸ¤¶
         *
         * Aliases: `MRS_CLAUS`
         */
        "MOTHER_CHRISTMAS" = "ðŸ¤¶",
        /**
         * Emoji: ðŸ›µ
         *
         * Aliases: `MOTOR_SCOOTER`
         */
        "MOTORBIKE" = "ðŸ›µ",
        /**
         * Emoji: ðŸ›¥ï¸
         */
        "MOTORBOAT" = "ðŸ›¥ï¸",
        /**
         * Emoji: ðŸï¸
         *
         * Aliases: `RACING_MOTORCYCLE`
         */
        "MOTORCYCLE" = "ðŸï¸",
        /**
         * Emoji: ðŸ¦¼
         */
        "MOTORIZED_WHEELCHAIR" = "ðŸ¦¼",
        /**
         * Emoji: ðŸ›£ï¸
         */
        "MOTORWAY" = "ðŸ›£ï¸",
        /**
         * Emoji: ðŸ›µ
         *
         * Aliases: `MOTORBIKE`
         */
        "MOTOR_SCOOTER" = "ðŸ›µ",
        /**
         * Emoji: â›°ï¸
         */
        "MOUNTAIN" = "â›°ï¸",
        /**
         * Emoji: ðŸšµ
         *
         * Aliases: `PERSON_MOUNTAIN_BIKING`
         */
        "MOUNTAIN_BICYCLIST" = "ðŸšµ",
        /**
         * Emoji: ðŸš 
         */
        "MOUNTAIN_CABLEWAY" = "ðŸš ",
        /**
         * Emoji: ðŸšž
         */
        "MOUNTAIN_RAILWAY" = "ðŸšž",
        /**
         * Emoji: ðŸ”ï¸
         *
         * Aliases: `SNOW_CAPPED_MOUNTAIN`
         */
        "MOUNTAIN_SNOW" = "ðŸ”ï¸",
        /**
         * Emoji: ðŸ—»
         */
        "MOUNT_FUJI" = "ðŸ—»",
        /**
         * Emoji: ðŸ­
         */
        "MOUSE" = "ðŸ­",
        /**
         * Emoji: ðŸ
         */
        "MOUSE2" = "ðŸ",
        /**
         * Emoji: ðŸ–±ï¸
         *
         * Aliases: `THREE_BUTTON_MOUSE`
         */
        "MOUSE_THREE_BUTTON" = "ðŸ–±ï¸",
        /**
         * Emoji: ðŸª¤
         */
        "MOUSE_TRAP" = "ðŸª¤",
        /**
         * Emoji: ðŸŽ¥
         */
        "MOVIE_CAMERA" = "ðŸŽ¥",
        /**
         * Emoji: ðŸ—¿
         */
        "MOYAI" = "ðŸ—¿",
        /**
         * Emoji: ðŸ¤¶
         *
         * Aliases: `MOTHER_CHRISTMAS`
         */
        "MRS_CLAUS" = "ðŸ¤¶",
        /**
         * Emoji: ðŸ’ª
         */
        "MUSCLE" = "ðŸ’ª",
        /**
         * Emoji: ðŸ„
         */
        "MUSHROOM" = "ðŸ„",
        /**
         * Emoji: ðŸŽ¹
         */
        "MUSICAL_KEYBOARD" = "ðŸŽ¹",
        /**
         * Emoji: ðŸŽµ
         */
        "MUSICAL_NOTE" = "ðŸŽµ",
        /**
         * Emoji: ðŸŽ¼
         */
        "MUSICAL_SCORE" = "ðŸŽ¼",
        /**
         * Emoji: ðŸ”‡
         */
        "MUTE" = "ðŸ”‡",
        /**
         * Emoji: ðŸ§‘â€ðŸŽ„
         */
        "MX_CLAUS" = "ðŸ§‘â€ðŸŽ„",
        /**
         * Emoji: ðŸ’…
         */
        "NAIL_CARE" = "ðŸ’…",
        /**
         * Emoji: ðŸ“›
         */
        "NAME_BADGE" = "ðŸ“›",
        /**
         * Emoji: ðŸžï¸
         *
         * Aliases: `PARK`
         */
        "NATIONAL_PARK" = "ðŸžï¸",
        /**
         * Emoji: ðŸ¤¢
         *
         * Aliases: `SICK`
         */
        "NAUSEATED_FACE" = "ðŸ¤¢",
        /**
         * Emoji: ðŸ§¿
         */
        "NAZAR_AMULET" = "ðŸ§¿",
        /**
         * Emoji: ðŸ‘”
         */
        "NECKTIE" = "ðŸ‘”",
        /**
         * Emoji: âŽ
         */
        "NEGATIVE_SQUARED_CROSS_MARK" = "âŽ",
        /**
         * Emoji: ðŸ¤“
         *
         * Aliases: `NERD_FACE`
         */
        "NERD" = "ðŸ¤“",
        /**
         * Emoji: ðŸ¤“
         *
         * Aliases: `NERD`
         */
        "NERD_FACE" = "ðŸ¤“",
        /**
         * Emoji: ðŸª†
         */
        "NESTING_DOLLS" = "ðŸª†",
        /**
         * Emoji: ðŸ˜
         */
        "NEUTRAL_FACE" = "ðŸ˜",
        /**
         * Emoji: ðŸ†•
         */
        "NEW" = "ðŸ†•",
        /**
         * Emoji: ðŸ“°
         */
        "NEWSPAPER" = "ðŸ“°",
        /**
         * Emoji: ðŸ—žï¸
         *
         * Aliases: `ROLLED_UP_NEWSPAPER`
         */
        "NEWSPAPER2" = "ðŸ—žï¸",
        /**
         * Emoji: ðŸŒ‘
         */
        "NEW_MOON" = "ðŸŒ‘",
        /**
         * Emoji: ðŸŒš
         */
        "NEW_MOON_WITH_FACE" = "ðŸŒš",
        /**
         * Emoji: â­ï¸
         *
         * Aliases: `TRACK_NEXT`
         */
        "NEXT_TRACK" = "â­ï¸",
        /**
         * Emoji: ðŸ†–
         */
        "NG" = "ðŸ†–",
        /**
         * Emoji: ðŸŒƒ
         */
        "NIGHT_WITH_STARS" = "ðŸŒƒ",
        /**
         * Emoji: 9ï¸âƒ£
         */
        "NINE" = "9ï¸âƒ£",
        /**
         * Emoji: ðŸ¥·
         */
        "NINJA" = "ðŸ¥·",
        /**
         * Emoji: ðŸš±
         */
        "NON_POTABLE_WATER" = "ðŸš±",
        /**
         * Emoji: ðŸ‘ƒ
         */
        "NOSE" = "ðŸ‘ƒ",
        /**
         * Emoji: ðŸ““
         */
        "NOTEBOOK" = "ðŸ““",
        /**
         * Emoji: ðŸ“”
         */
        "NOTEBOOK_WITH_DECORATIVE_COVER" = "ðŸ“”",
        /**
         * Emoji: ðŸ—’ï¸
         *
         * Aliases: `SPIRAL_NOTE_PAD`
         */
        "NOTEPAD_SPIRAL" = "ðŸ—’ï¸",
        /**
         * Emoji: ðŸŽ¶
         */
        "NOTES" = "ðŸŽ¶",
        /**
         * Emoji: ðŸ”•
         */
        "NO_BELL" = "ðŸ”•",
        /**
         * Emoji: ðŸš³
         */
        "NO_BICYCLES" = "ðŸš³",
        /**
         * Emoji: â›”
         */
        "NO_ENTRY" = "â›”",
        /**
         * Emoji: ðŸš«
         */
        "NO_ENTRY_SIGN" = "ðŸš«",
        /**
         * Emoji: ðŸ™…
         *
         * Aliases: `PERSON_GESTURING_NO`
         */
        "NO_GOOD" = "ðŸ™…",
        /**
         * Emoji: ðŸ“µ
         */
        "NO_MOBILE_PHONES" = "ðŸ“µ",
        /**
         * Emoji: ðŸ˜¶
         */
        "NO_MOUTH" = "ðŸ˜¶",
        /**
         * Emoji: ðŸš·
         */
        "NO_PEDESTRIANS" = "ðŸš·",
        /**
         * Emoji: ðŸš­
         */
        "NO_SMOKING" = "ðŸš­",
        /**
         * Emoji: ðŸ”©
         */
        "NUT_AND_BOLT" = "ðŸ”©",
        /**
         * Emoji: â­•
         */
        "O" = "â­•",
        /**
         * Emoji: ðŸ…¾ï¸
         */
        "O2" = "ðŸ…¾ï¸",
        /**
         * Emoji: ðŸŒŠ
         */
        "OCEAN" = "ðŸŒŠ",
        /**
         * Emoji: ðŸ›‘
         *
         * Aliases: `STOP_SIGN`
         */
        "OCTAGONAL_SIGN" = "ðŸ›‘",
        /**
         * Emoji: ðŸ™
         */
        "OCTOPUS" = "ðŸ™",
        /**
         * Emoji: ðŸ¢
         */
        "ODEN" = "ðŸ¢",
        /**
         * Emoji: ðŸ¢
         */
        "OFFICE" = "ðŸ¢",
        /**
         * Emoji: ðŸ§‘â€ðŸ’¼
         */
        "OFFICE_WORKER" = "ðŸ§‘â€ðŸ’¼",
        /**
         * Emoji: ðŸ›¢ï¸
         *
         * Aliases: `OIL_DRUM`
         */
        "OIL" = "ðŸ›¢ï¸",
        /**
         * Emoji: ðŸ›¢ï¸
         *
         * Aliases: `OIL`
         */
        "OIL_DRUM" = "ðŸ›¢ï¸",
        /**
         * Emoji: ðŸ†—
         */
        "OK" = "ðŸ†—",
        /**
         * Emoji: ðŸ‘Œ
         */
        "OK_HAND" = "ðŸ‘Œ",
        /**
         * Emoji: ðŸ™†
         *
         * Aliases: `PERSON_GESTURING_OK`
         */
        "OK_WOMAN" = "ðŸ™†",
        /**
         * Emoji: ðŸ§“
         */
        "OLDER_ADULT" = "ðŸ§“",
        /**
         * Emoji: ðŸ‘´
         */
        "OLDER_MAN" = "ðŸ‘´",
        /**
         * Emoji: ðŸ‘µ
         *
         * Aliases: `GRANDMA`
         */
        "OLDER_WOMAN" = "ðŸ‘µ",
        /**
         * Emoji: ðŸ—ï¸
         *
         * Aliases: `KEY2`
         */
        "OLD_KEY" = "ðŸ—ï¸",
        /**
         * Emoji: ðŸ«’
         */
        "OLIVE" = "ðŸ«’",
        /**
         * Emoji: ðŸ•‰ï¸
         */
        "OM_SYMBOL" = "ðŸ•‰ï¸",
        /**
         * Emoji: ðŸ”›
         */
        "ON" = "ðŸ”›",
        /**
         * Emoji: ðŸš˜
         */
        "ONCOMING_AUTOMOBILE" = "ðŸš˜",
        /**
         * Emoji: ðŸš
         */
        "ONCOMING_BUS" = "ðŸš",
        /**
         * Emoji: ðŸš”
         */
        "ONCOMING_POLICE_CAR" = "ðŸš”",
        /**
         * Emoji: ðŸš–
         */
        "ONCOMING_TAXI" = "ðŸš–",
        /**
         * Emoji: 1ï¸âƒ£
         */
        "ONE" = "1ï¸âƒ£",
        /**
         * Emoji: ðŸ©±
         */
        "ONE_PIECE_SWIMSUIT" = "ðŸ©±",
        /**
         * Emoji: ðŸ§…
         */
        "ONION" = "ðŸ§…",
        /**
         * Emoji: ðŸ“‚
         */
        "OPEN_FILE_FOLDER" = "ðŸ“‚",
        /**
         * Emoji: ðŸ‘
         */
        "OPEN_HANDS" = "ðŸ‘",
        /**
         * Emoji: ðŸ˜®
         */
        "OPEN_MOUTH" = "ðŸ˜®",
        /**
         * Emoji: â›Ž
         */
        "OPHIUCHUS" = "â›Ž",
        /**
         * Emoji: ðŸ“™
         */
        "ORANGE_BOOK" = "ðŸ“™",
        /**
         * Emoji: ðŸŸ 
         */
        "ORANGE_CIRCLE" = "ðŸŸ ",
        /**
         * Emoji: ðŸ§¡
         */
        "ORANGE_HEART" = "ðŸ§¡",
        /**
         * Emoji: ðŸŸ§
         */
        "ORANGE_SQUARE" = "ðŸŸ§",
        /**
         * Emoji: ðŸ¦§
         */
        "ORANGUTAN" = "ðŸ¦§",
        /**
         * Emoji: â˜¦ï¸
         */
        "ORTHODOX_CROSS" = "â˜¦ï¸",
        /**
         * Emoji: ðŸ¦¦
         */
        "OTTER" = "ðŸ¦¦",
        /**
         * Emoji: ðŸ“¤
         */
        "OUTBOX_TRAY" = "ðŸ“¤",
        /**
         * Emoji: ðŸ¦‰
         */
        "OWL" = "ðŸ¦‰",
        /**
         * Emoji: ðŸ‚
         */
        "OX" = "ðŸ‚",
        /**
         * Emoji: ðŸ¦ª
         */
        "OYSTER" = "ðŸ¦ª",
        /**
         * Emoji: ðŸ“¦
         */
        "PACKAGE" = "ðŸ“¦",
        /**
         * Emoji: ðŸ¥˜
         *
         * Aliases: `SHALLOW_PAN_OF_FOOD`
         */
        "PAELLA" = "ðŸ¥˜",
        /**
         * Emoji: ðŸ“Ÿ
         */
        "PAGER" = "ðŸ“Ÿ",
        /**
         * Emoji: ðŸ“„
         */
        "PAGE_FACING_UP" = "ðŸ“„",
        /**
         * Emoji: ðŸ“ƒ
         */
        "PAGE_WITH_CURL" = "ðŸ“ƒ",
        /**
         * Emoji: ðŸ–Œï¸
         *
         * Aliases: `LOWER_LEFT_PAINTBRUSH`
         */
        "PAINTBRUSH" = "ðŸ–Œï¸",
        /**
         * Emoji: ðŸ¤²
         */
        "PALMS_UP_TOGETHER" = "ðŸ¤²",
        /**
         * Emoji: ðŸŒ´
         */
        "PALM_TREE" = "ðŸŒ´",
        /**
         * Emoji: ðŸ¥ž
         */
        "PANCAKES" = "ðŸ¥ž",
        /**
         * Emoji: ðŸ¼
         */
        "PANDA_FACE" = "ðŸ¼",
        /**
         * Emoji: ðŸ“Ž
         */
        "PAPERCLIP" = "ðŸ“Ž",
        /**
         * Emoji: ðŸ–‡ï¸
         *
         * Aliases: `LINKED_PAPERCLIPS`
         */
        "PAPERCLIPS" = "ðŸ–‡ï¸",
        /**
         * Emoji: ðŸª‚
         */
        "PARACHUTE" = "ðŸª‚",
        /**
         * Emoji: ðŸžï¸
         *
         * Aliases: `NATIONAL_PARK`
         */
        "PARK" = "ðŸžï¸",
        /**
         * Emoji: ðŸ…¿ï¸
         */
        "PARKING" = "ðŸ…¿ï¸",
        /**
         * Emoji: ðŸ¦œ
         */
        "PARROT" = "ðŸ¦œ",
        /**
         * Emoji: â›…
         */
        "PARTLY_SUNNY" = "â›…",
        /**
         * Emoji: ðŸ¥³
         */
        "PARTYING_FACE" = "ðŸ¥³",
        /**
         * Emoji: ã€½ï¸
         */
        "PART_ALTERNATION_MARK" = "ã€½ï¸",
        /**
         * Emoji: ðŸ›³ï¸
         *
         * Aliases: `CRUISE_SHIP`
         */
        "PASSENGER_SHIP" = "ðŸ›³ï¸",
        /**
         * Emoji: ðŸ›‚
         */
        "PASSPORT_CONTROL" = "ðŸ›‚",
        /**
         * Emoji: â¸ï¸
         *
         * Aliases: `DOUBLE_VERTICAL_BAR`
         */
        "PAUSE_BUTTON" = "â¸ï¸",
        /**
         * Emoji: ðŸ¾
         *
         * Aliases: `FEET`
         */
        "PAW_PRINTS" = "ðŸ¾",
        /**
         * Emoji: â˜®ï¸
         *
         * Aliases: `PEACE_SYMBOL`
         */
        "PEACE" = "â˜®ï¸",
        /**
         * Emoji: â˜®ï¸
         *
         * Aliases: `PEACE`
         */
        "PEACE_SYMBOL" = "â˜®ï¸",
        /**
         * Emoji: ðŸ‘
         */
        "PEACH" = "ðŸ‘",
        /**
         * Emoji: ðŸ¦š
         */
        "PEACOCK" = "ðŸ¦š",
        /**
         * Emoji: ðŸ¥œ
         *
         * Aliases: `SHELLED_PEANUT`
         */
        "PEANUTS" = "ðŸ¥œ",
        /**
         * Emoji: ðŸ
         */
        "PEAR" = "ðŸ",
        /**
         * Emoji: ðŸ“
         *
         * Aliases: `MEMO`
         */
        "PENCIL" = "ðŸ“",
        /**
         * Emoji: âœï¸
         */
        "PENCIL2" = "âœï¸",
        /**
         * Emoji: ðŸ§
         */
        "PENGUIN" = "ðŸ§",
        /**
         * Emoji: ðŸ˜”
         */
        "PENSIVE" = "ðŸ˜”",
        /**
         * Emoji: ðŸ–Šï¸
         *
         * Aliases: `LOWER_LEFT_BALLPOINT_PEN`
         */
        "PEN_BALLPOINT" = "ðŸ–Šï¸",
        /**
         * Emoji: ðŸ–‹ï¸
         *
         * Aliases: `LOWER_LEFT_FOUNTAIN_PEN`
         */
        "PEN_FOUNTAIN" = "ðŸ–‹ï¸",
        /**
         * Emoji: ðŸ§‘â€ðŸ¤â€ðŸ§‘
         */
        "PEOPLE_HOLDING_HANDS" = "ðŸ§‘â€ðŸ¤â€ðŸ§‘",
        /**
         * Emoji: ðŸ«‚
         */
        "PEOPLE_HUGGING" = "ðŸ«‚",
        /**
         * Emoji: ðŸ‘¯
         *
         * Aliases: `DANCERS`
         */
        "PEOPLE_WITH_BUNNY_EARS_PARTYING" = "ðŸ‘¯",
        /**
         * Emoji: ðŸ¤¼
         *
         * Aliases: `WRESTLERS`,`WRESTLING`
         */
        "PEOPLE_WRESTLING" = "ðŸ¤¼",
        /**
         * Emoji: ðŸŽ­
         */
        "PERFORMING_ARTS" = "ðŸŽ­",
        /**
         * Emoji: ðŸ˜£
         */
        "PERSEVERE" = "ðŸ˜£",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦²
         */
        "PERSON_BALD" = "ðŸ§‘â€ðŸ¦²",
        /**
         * Emoji: ðŸš´
         *
         * Aliases: `BICYCLIST`
         */
        "PERSON_BIKING" = "ðŸš´",
        /**
         * Emoji: â›¹ï¸
         *
         * Aliases: `BASKETBALL_PLAYER`,`PERSON_WITH_BALL`
         */
        "PERSON_BOUNCING_BALL" = "â›¹ï¸",
        /**
         * Emoji: ðŸ™‡
         *
         * Aliases: `BOW`
         */
        "PERSON_BOWING" = "ðŸ™‡",
        /**
         * Emoji: ðŸ§—
         */
        "PERSON_CLIMBING" = "ðŸ§—",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦±
         */
        "PERSON_CURLY_HAIR" = "ðŸ§‘â€ðŸ¦±",
        /**
         * Emoji: ðŸ¤¸
         *
         * Aliases: `CARTWHEEL`
         */
        "PERSON_DOING_CARTWHEEL" = "ðŸ¤¸",
        /**
         * Emoji: ðŸ¤¦
         *
         * Aliases: `FACE_PALM`,`FACEPALM`
         */
        "PERSON_FACEPALMING" = "ðŸ¤¦",
        /**
         * Emoji: ðŸ§‘â€ðŸ¼
         */
        "PERSON_FEEDING_BABY" = "ðŸ§‘â€ðŸ¼",
        /**
         * Emoji: ðŸ¤º
         *
         * Aliases: `FENCER`,`FENCING`
         */
        "PERSON_FENCING" = "ðŸ¤º",
        /**
         * Emoji: ðŸ™
         */
        "PERSON_FROWNING" = "ðŸ™",
        /**
         * Emoji: ðŸ™…
         *
         * Aliases: `NO_GOOD`
         */
        "PERSON_GESTURING_NO" = "ðŸ™…",
        /**
         * Emoji: ðŸ™†
         *
         * Aliases: `OK_WOMAN`
         */
        "PERSON_GESTURING_OK" = "ðŸ™†",
        /**
         * Emoji: ðŸ’‡
         *
         * Aliases: `HAIRCUT`
         */
        "PERSON_GETTING_HAIRCUT" = "ðŸ’‡",
        /**
         * Emoji: ðŸ’†
         *
         * Aliases: `MASSAGE`
         */
        "PERSON_GETTING_MASSAGE" = "ðŸ’†",
        /**
         * Emoji: ðŸŒï¸
         *
         * Aliases: `GOLFER`
         */
        "PERSON_GOLFING" = "ðŸŒï¸",
        /**
         * Emoji: ðŸ§˜
         */
        "PERSON_IN_LOTUS_POSITION" = "ðŸ§˜",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦½
         */
        "PERSON_IN_MANUAL_WHEELCHAIR" = "ðŸ§‘â€ðŸ¦½",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦¼
         */
        "PERSON_IN_MOTORIZED_WHEELCHAIR" = "ðŸ§‘â€ðŸ¦¼",
        /**
         * Emoji: ðŸ§–
         */
        "PERSON_IN_STEAMY_ROOM" = "ðŸ§–",
        /**
         * Emoji: ðŸ¤µ
         */
        "PERSON_IN_TUXEDO" = "ðŸ¤µ",
        /**
         * Emoji: ðŸ¤¹
         *
         * Aliases: `JUGGLING`,`JUGGLER`
         */
        "PERSON_JUGGLING" = "ðŸ¤¹",
        /**
         * Emoji: ðŸ§Ž
         */
        "PERSON_KNEELING" = "ðŸ§Ž",
        /**
         * Emoji: ðŸ‹ï¸
         *
         * Aliases: `LIFTER`,`WEIGHT_LIFTER`
         */
        "PERSON_LIFTING_WEIGHTS" = "ðŸ‹ï¸",
        /**
         * Emoji: ðŸšµ
         *
         * Aliases: `MOUNTAIN_BICYCLIST`
         */
        "PERSON_MOUNTAIN_BIKING" = "ðŸšµ",
        /**
         * Emoji: ðŸ¤¾
         *
         * Aliases: `HANDBALL`
         */
        "PERSON_PLAYING_HANDBALL" = "ðŸ¤¾",
        /**
         * Emoji: ðŸ¤½
         *
         * Aliases: `WATER_POLO`
         */
        "PERSON_PLAYING_WATER_POLO" = "ðŸ¤½",
        /**
         * Emoji: ðŸ™Ž
         *
         * Aliases: `PERSON_WITH_POUTING_FACE`
         */
        "PERSON_POUTING" = "ðŸ™Ž",
        /**
         * Emoji: ðŸ™‹
         *
         * Aliases: `RAISING_HAND`
         */
        "PERSON_RAISING_HAND" = "ðŸ™‹",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦°
         */
        "PERSON_RED_HAIR" = "ðŸ§‘â€ðŸ¦°",
        /**
         * Emoji: ðŸš£
         *
         * Aliases: `ROWBOAT`
         */
        "PERSON_ROWING_BOAT" = "ðŸš£",
        /**
         * Emoji: ðŸƒ
         *
         * Aliases: `RUNNER`
         */
        "PERSON_RUNNING" = "ðŸƒ",
        /**
         * Emoji: ðŸ¤·
         *
         * Aliases: `SHRUG`
         */
        "PERSON_SHRUGGING" = "ðŸ¤·",
        /**
         * Emoji: ðŸ§
         */
        "PERSON_STANDING" = "ðŸ§",
        /**
         * Emoji: ðŸ„
         *
         * Aliases: `SURFER`
         */
        "PERSON_SURFING" = "ðŸ„",
        /**
         * Emoji: ðŸŠ
         *
         * Aliases: `SWIMMER`
         */
        "PERSON_SWIMMING" = "ðŸŠ",
        /**
         * Emoji: ðŸ’
         *
         * Aliases: `INFORMATION_DESK_PERSON`
         */
        "PERSON_TIPPING_HAND" = "ðŸ’",
        /**
         * Emoji: ðŸš¶
         *
         * Aliases: `WALKING`
         */
        "PERSON_WALKING" = "ðŸš¶",
        /**
         * Emoji: ðŸ‘³
         *
         * Aliases: `MAN_WITH_TURBAN`
         */
        "PERSON_WEARING_TURBAN" = "ðŸ‘³",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦³
         */
        "PERSON_WHITE_HAIR" = "ðŸ§‘â€ðŸ¦³",
        /**
         * Emoji: â›¹ï¸
         *
         * Aliases: `PERSON_BOUNCING_BALL`,`BASKETBALL_PLAYER`
         */
        "PERSON_WITH_BALL" = "â›¹ï¸",
        /**
         * Emoji: ðŸ‘±
         *
         * Aliases: `BLOND_HAIRED_PERSON`
         */
        "PERSON_WITH_BLOND_HAIR" = "ðŸ‘±",
        /**
         * Emoji: ðŸ™Ž
         *
         * Aliases: `PERSON_POUTING`
         */
        "PERSON_WITH_POUTING_FACE" = "ðŸ™Ž",
        /**
         * Emoji: ðŸ§‘â€ðŸ¦¯
         */
        "PERSON_WITH_PROBING_CANE" = "ðŸ§‘â€ðŸ¦¯",
        /**
         * Emoji: ðŸ‘°
         */
        "PERSON_WITH_VEIL" = "ðŸ‘°",
        /**
         * Emoji: ðŸ§«
         */
        "PETRI_DISH" = "ðŸ§«",
        /**
         * Emoji: â›ï¸
         */
        "PICK" = "â›ï¸",
        /**
         * Emoji: ðŸ›»
         */
        "PICKUP_TRUCK" = "ðŸ›»",
        /**
         * Emoji: ðŸ¥§
         */
        "PIE" = "ðŸ¥§",
        /**
         * Emoji: ðŸ·
         */
        "PIG" = "ðŸ·",
        /**
         * Emoji: ðŸ–
         */
        "PIG2" = "ðŸ–",
        /**
         * Emoji: ðŸ½
         */
        "PIG_NOSE" = "ðŸ½",
        /**
         * Emoji: ðŸ’Š
         */
        "PILL" = "ðŸ’Š",
        /**
         * Emoji: ðŸ§‘â€âœˆï¸
         */
        "PILOT" = "ðŸ§‘â€âœˆï¸",
        /**
         * Emoji: ðŸ¤Œ
         */
        "PINCHED_FINGERS" = "ðŸ¤Œ",
        /**
         * Emoji: ðŸ¤
         */
        "PINCHING_HAND" = "ðŸ¤",
        /**
         * Emoji: ðŸ
         */
        "PINEAPPLE" = "ðŸ",
        /**
         * Emoji: ðŸ“
         *
         * Aliases: `TABLE_TENNIS`
         */
        "PING_PONG" = "ðŸ“",
        /**
         * Emoji: ðŸ´â€â˜ ï¸
         */
        "PIRATE_FLAG" = "ðŸ´â€â˜ ï¸",
        /**
         * Emoji: â™“
         */
        "PISCES" = "â™“",
        /**
         * Emoji: ðŸ•
         */
        "PIZZA" = "ðŸ•",
        /**
         * Emoji: ðŸª…
         */
        "PIÃ‘ATA" = "ðŸª…",
        /**
         * Emoji: ðŸª§
         */
        "PLACARD" = "ðŸª§",
        /**
         * Emoji: ðŸ›
         *
         * Aliases: `WORSHIP_SYMBOL`
         */
        "PLACE_OF_WORSHIP" = "ðŸ›",
        /**
         * Emoji: â¯ï¸
         */
        "PLAY_PAUSE" = "â¯ï¸",
        /**
         * Emoji: ðŸ¥º
         */
        "PLEADING_FACE" = "ðŸ¥º",
        /**
         * Emoji: ðŸª 
         */
        "PLUNGER" = "ðŸª ",
        /**
         * Emoji: ðŸ‘‡
         */
        "POINT_DOWN" = "ðŸ‘‡",
        /**
         * Emoji: ðŸ‘ˆ
         */
        "POINT_LEFT" = "ðŸ‘ˆ",
        /**
         * Emoji: ðŸ‘‰
         */
        "POINT_RIGHT" = "ðŸ‘‰",
        /**
         * Emoji: â˜ï¸
         */
        "POINT_UP" = "â˜ï¸",
        /**
         * Emoji: ðŸ‘†
         */
        "POINT_UP_2" = "ðŸ‘†",
        /**
         * Emoji: ðŸ»â€â„ï¸
         */
        "POLAR_BEAR" = "ðŸ»â€â„ï¸",
        /**
         * Emoji: ðŸš“
         */
        "POLICE_CAR" = "ðŸš“",
        /**
         * Emoji: ðŸ‘®
         *
         * Aliases: `COP`
         */
        "POLICE_OFFICER" = "ðŸ‘®",
        /**
         * Emoji: ðŸ’©
         *
         * Aliases: `POOP`,`SHIT`,`HANKEY`
         */
        "POO" = "ðŸ’©",
        /**
         * Emoji: ðŸ©
         */
        "POODLE" = "ðŸ©",
        /**
         * Emoji: ðŸ’©
         *
         * Aliases: `SHIT`,`HANKEY`,`POO`
         */
        "POOP" = "ðŸ’©",
        /**
         * Emoji: ðŸ¿
         */
        "POPCORN" = "ðŸ¿",
        /**
         * Emoji: ðŸ“¯
         */
        "POSTAL_HORN" = "ðŸ“¯",
        /**
         * Emoji: ðŸ“®
         */
        "POSTBOX" = "ðŸ“®",
        /**
         * Emoji: ðŸ£
         */
        "POST_OFFICE" = "ðŸ£",
        /**
         * Emoji: ðŸš°
         */
        "POTABLE_WATER" = "ðŸš°",
        /**
         * Emoji: ðŸ¥”
         */
        "POTATO" = "ðŸ¥”",
        /**
         * Emoji: ðŸª´
         */
        "POTTED_PLANT" = "ðŸª´",
        /**
         * Emoji: ðŸ‘
         */
        "POUCH" = "ðŸ‘",
        /**
         * Emoji: ðŸ—
         */
        "POULTRY_LEG" = "ðŸ—",
        /**
         * Emoji: ðŸ’·
         */
        "POUND" = "ðŸ’·",
        /**
         * Emoji: ðŸ˜¾
         */
        "POUTING_CAT" = "ðŸ˜¾",
        /**
         * Emoji: ðŸ™
         */
        "PRAY" = "ðŸ™",
        /**
         * Emoji: ðŸ“¿
         */
        "PRAYER_BEADS" = "ðŸ“¿",
        /**
         * Emoji: ðŸ¤°
         *
         * Aliases: `EXPECTING_WOMAN`
         */
        "PREGNANT_WOMAN" = "ðŸ¤°",
        /**
         * Emoji: ðŸ¥¨
         */
        "PRETZEL" = "ðŸ¥¨",
        /**
         * Emoji: â®ï¸
         *
         * Aliases: `TRACK_PREVIOUS`
         */
        "PREVIOUS_TRACK" = "â®ï¸",
        /**
         * Emoji: ðŸ¤´
         */
        "PRINCE" = "ðŸ¤´",
        /**
         * Emoji: ðŸ‘¸
         */
        "PRINCESS" = "ðŸ‘¸",
        /**
         * Emoji: ðŸ–¨ï¸
         */
        "PRINTER" = "ðŸ–¨ï¸",
        /**
         * Emoji: ðŸ¦¯
         */
        "PROBING_CANE" = "ðŸ¦¯",
        /**
         * Emoji: ðŸ“½ï¸
         *
         * Aliases: `FILM_PROJECTOR`
         */
        "PROJECTOR" = "ðŸ“½ï¸",
        /**
         * Emoji: ðŸ®
         *
         * Aliases: `CUSTARD`,`FLAN`
         */
        "PUDDING" = "ðŸ®",
        /**
         * Emoji: ðŸ‘Š
         */
        "PUNCH" = "ðŸ‘Š",
        /**
         * Emoji: ðŸŸ£
         */
        "PURPLE_CIRCLE" = "ðŸŸ£",
        /**
         * Emoji: ðŸ’œ
         */
        "PURPLE_HEART" = "ðŸ’œ",
        /**
         * Emoji: ðŸŸª
         */
        "PURPLE_SQUARE" = "ðŸŸª",
        /**
         * Emoji: ðŸ‘›
         */
        "PURSE" = "ðŸ‘›",
        /**
         * Emoji: ðŸ“Œ
         */
        "PUSHPIN" = "ðŸ“Œ",
        /**
         * Emoji: ðŸš®
         */
        "PUT_LITTER_IN_ITS_PLACE" = "ðŸš®",
        /**
         * Emoji: â“
         */
        "QUESTION" = "â“",
        /**
         * Emoji: ðŸ°
         */
        "RABBIT" = "ðŸ°",
        /**
         * Emoji: ðŸ‡
         */
        "RABBIT2" = "ðŸ‡",
        /**
         * Emoji: ðŸ¦
         */
        "RACCOON" = "ðŸ¦",
        /**
         * Emoji: ðŸŽ
         */
        "RACEHORSE" = "ðŸŽ",
        /**
         * Emoji: ðŸŽï¸
         *
         * Aliases: `RACING_CAR`
         */
        "RACE_CAR" = "ðŸŽï¸",
        /**
         * Emoji: ðŸŽï¸
         *
         * Aliases: `RACE_CAR`
         */
        "RACING_CAR" = "ðŸŽï¸",
        /**
         * Emoji: ðŸï¸
         *
         * Aliases: `MOTORCYCLE`
         */
        "RACING_MOTORCYCLE" = "ðŸï¸",
        /**
         * Emoji: ðŸ“»
         */
        "RADIO" = "ðŸ“»",
        /**
         * Emoji: â˜¢ï¸
         *
         * Aliases: `RADIOACTIVE_SIGN`
         */
        "RADIOACTIVE" = "â˜¢ï¸",
        /**
         * Emoji: â˜¢ï¸
         *
         * Aliases: `RADIOACTIVE`
         */
        "RADIOACTIVE_SIGN" = "â˜¢ï¸",
        /**
         * Emoji: ðŸ”˜
         */
        "RADIO_BUTTON" = "ðŸ”˜",
        /**
         * Emoji: ðŸ˜¡
         */
        "RAGE" = "ðŸ˜¡",
        /**
         * Emoji: ðŸ›¤ï¸
         *
         * Aliases: `RAILWAY_TRACK`
         */
        "RAILROAD_TRACK" = "ðŸ›¤ï¸",
        /**
         * Emoji: ðŸšƒ
         */
        "RAILWAY_CAR" = "ðŸšƒ",
        /**
         * Emoji: ðŸ›¤ï¸
         *
         * Aliases: `RAILROAD_TRACK`
         */
        "RAILWAY_TRACK" = "ðŸ›¤ï¸",
        /**
         * Emoji: ðŸŒˆ
         */
        "RAINBOW" = "ðŸŒˆ",
        /**
         * Emoji: ðŸ³ï¸â€ðŸŒˆ
         *
         * Aliases: `GAY_PRIDE_FLAG`
         */
        "RAINBOW_FLAG" = "ðŸ³ï¸â€ðŸŒˆ",
        /**
         * Emoji: ðŸ¤š
         *
         * Aliases: `BACK_OF_HAND`
         */
        "RAISED_BACK_OF_HAND" = "ðŸ¤š",
        /**
         * Emoji: âœ‹
         */
        "RAISED_HAND" = "âœ‹",
        /**
         * Emoji: ðŸ™Œ
         */
        "RAISED_HANDS" = "ðŸ™Œ",
        /**
         * Emoji: ðŸ–ï¸
         *
         * Aliases: `HAND_SPLAYED`
         */
        "RAISED_HAND_WITH_FINGERS_SPLAYED" = "ðŸ–ï¸",
        /**
         * Emoji: ðŸ––
         *
         * Aliases: `VULCAN`
         */
        "RAISED_HAND_WITH_PART_BETWEEN_MIDDLE_AND_RING_FINGERS" = "ðŸ––",
        /**
         * Emoji: ðŸ™‹
         *
         * Aliases: `PERSON_RAISING_HAND`
         */
        "RAISING_HAND" = "ðŸ™‹",
        /**
         * Emoji: ðŸ
         */
        "RAM" = "ðŸ",
        /**
         * Emoji: ðŸœ
         */
        "RAMEN" = "ðŸœ",
        /**
         * Emoji: ðŸ€
         */
        "RAT" = "ðŸ€",
        /**
         * Emoji: ðŸª’
         */
        "RAZOR" = "ðŸª’",
        /**
         * Emoji: ðŸ§¾
         */
        "RECEIPT" = "ðŸ§¾",
        /**
         * Emoji: âºï¸
         */
        "RECORD_BUTTON" = "âºï¸",
        /**
         * Emoji: â™»ï¸
         */
        "RECYCLE" = "â™»ï¸",
        /**
         * Emoji: ðŸš—
         */
        "RED_CAR" = "ðŸš—",
        /**
         * Emoji: ðŸ”´
         */
        "RED_CIRCLE" = "ðŸ”´",
        /**
         * Emoji: ðŸ§§
         */
        "RED_ENVELOPE" = "ðŸ§§",
        /**
         * Emoji: ðŸŸ¥
         */
        "RED_SQUARE" = "ðŸŸ¥",
        /**
         * Emoji: ðŸ‡¦
         */
        "REGIONAL_INDICATOR_A" = "ðŸ‡¦",
        /**
         * Emoji: ðŸ‡§
         */
        "REGIONAL_INDICATOR_B" = "ðŸ‡§",
        /**
         * Emoji: ðŸ‡¨
         */
        "REGIONAL_INDICATOR_C" = "ðŸ‡¨",
        /**
         * Emoji: ðŸ‡©
         */
        "REGIONAL_INDICATOR_D" = "ðŸ‡©",
        /**
         * Emoji: ðŸ‡ª
         */
        "REGIONAL_INDICATOR_E" = "ðŸ‡ª",
        /**
         * Emoji: ðŸ‡«
         */
        "REGIONAL_INDICATOR_F" = "ðŸ‡«",
        /**
         * Emoji: ðŸ‡¬
         */
        "REGIONAL_INDICATOR_G" = "ðŸ‡¬",
        /**
         * Emoji: ðŸ‡­
         */
        "REGIONAL_INDICATOR_H" = "ðŸ‡­",
        /**
         * Emoji: ðŸ‡®
         */
        "REGIONAL_INDICATOR_I" = "ðŸ‡®",
        /**
         * Emoji: ðŸ‡¯
         */
        "REGIONAL_INDICATOR_J" = "ðŸ‡¯",
        /**
         * Emoji: ðŸ‡°
         */
        "REGIONAL_INDICATOR_K" = "ðŸ‡°",
        /**
         * Emoji: ðŸ‡±
         */
        "REGIONAL_INDICATOR_L" = "ðŸ‡±",
        /**
         * Emoji: ðŸ‡²
         */
        "REGIONAL_INDICATOR_M" = "ðŸ‡²",
        /**
         * Emoji: ðŸ‡³
         */
        "REGIONAL_INDICATOR_N" = "ðŸ‡³",
        /**
         * Emoji: ðŸ‡´
         */
        "REGIONAL_INDICATOR_O" = "ðŸ‡´",
        /**
         * Emoji: ðŸ‡µ
         */
        "REGIONAL_INDICATOR_P" = "ðŸ‡µ",
        /**
         * Emoji: ðŸ‡¶
         */
        "REGIONAL_INDICATOR_Q" = "ðŸ‡¶",
        /**
         * Emoji: ðŸ‡·
         */
        "REGIONAL_INDICATOR_R" = "ðŸ‡·",
        /**
         * Emoji: ðŸ‡¸
         */
        "REGIONAL_INDICATOR_S" = "ðŸ‡¸",
        /**
         * Emoji: ðŸ‡¹
         */
        "REGIONAL_INDICATOR_T" = "ðŸ‡¹",
        /**
         * Emoji: ðŸ‡º
         */
        "REGIONAL_INDICATOR_U" = "ðŸ‡º",
        /**
         * Emoji: ðŸ‡»
         */
        "REGIONAL_INDICATOR_V" = "ðŸ‡»",
        /**
         * Emoji: ðŸ‡¼
         */
        "REGIONAL_INDICATOR_W" = "ðŸ‡¼",
        /**
         * Emoji: ðŸ‡½
         */
        "REGIONAL_INDICATOR_X" = "ðŸ‡½",
        /**
         * Emoji: ðŸ‡¾
         */
        "REGIONAL_INDICATOR_Y" = "ðŸ‡¾",
        /**
         * Emoji: ðŸ‡¿
         */
        "REGIONAL_INDICATOR_Z" = "ðŸ‡¿",
        /**
         * Emoji: Â®ï¸
         */
        "REGISTERED" = "Â®ï¸",
        /**
         * Emoji: â˜ºï¸
         */
        "RELAXED" = "â˜ºï¸",
        /**
         * Emoji: ðŸ˜Œ
         */
        "RELIEVED" = "ðŸ˜Œ",
        /**
         * Emoji: ðŸŽ—ï¸
         */
        "REMINDER_RIBBON" = "ðŸŽ—ï¸",
        /**
         * Emoji: ðŸ”
         */
        "REPEAT" = "ðŸ”",
        /**
         * Emoji: ðŸ”‚
         */
        "REPEAT_ONE" = "ðŸ”‚",
        /**
         * Emoji: ðŸš»
         */
        "RESTROOM" = "ðŸš»",
        /**
         * Emoji: ðŸ–•
         *
         * Aliases: `MIDDLE_FINGER`
         */
        "REVERSED_HAND_WITH_MIDDLE_FINGER_EXTENDED" = "ðŸ–•",
        /**
         * Emoji: ðŸ’ž
         */
        "REVOLVING_HEARTS" = "ðŸ’ž",
        /**
         * Emoji: âª
         */
        "REWIND" = "âª",
        /**
         * Emoji: ðŸ¦
         *
         * Aliases: `RHINOCEROS`
         */
        "RHINO" = "ðŸ¦",
        /**
         * Emoji: ðŸ¦
         *
         * Aliases: `RHINO`
         */
        "RHINOCEROS" = "ðŸ¦",
        /**
         * Emoji: ðŸŽ€
         */
        "RIBBON" = "ðŸŽ€",
        /**
         * Emoji: ðŸš
         */
        "RICE" = "ðŸš",
        /**
         * Emoji: ðŸ™
         */
        "RICE_BALL" = "ðŸ™",
        /**
         * Emoji: ðŸ˜
         */
        "RICE_CRACKER" = "ðŸ˜",
        /**
         * Emoji: ðŸŽ‘
         */
        "RICE_SCENE" = "ðŸŽ‘",
        /**
         * Emoji: ðŸ—¯ï¸
         *
         * Aliases: `ANGER_RIGHT`
         */
        "RIGHT_ANGER_BUBBLE" = "ðŸ—¯ï¸",
        /**
         * Emoji: ðŸ¤œ
         *
         * Aliases: `RIGHT_FIST`
         */
        "RIGHT_FACING_FIST" = "ðŸ¤œ",
        /**
         * Emoji: ðŸ¤œ
         *
         * Aliases: `RIGHT_FACING_FIST`
         */
        "RIGHT_FIST" = "ðŸ¤œ",
        /**
         * Emoji: ðŸ’
         */
        "RING" = "ðŸ’",
        /**
         * Emoji: ðŸª
         */
        "RINGED_PLANET" = "ðŸª",
        /**
         * Emoji: ðŸ¤–
         *
         * Aliases: `ROBOT_FACE`
         */
        "ROBOT" = "ðŸ¤–",
        /**
         * Emoji: ðŸ¤–
         *
         * Aliases: `ROBOT`
         */
        "ROBOT_FACE" = "ðŸ¤–",
        /**
         * Emoji: ðŸª¨
         */
        "ROCK" = "ðŸª¨",
        /**
         * Emoji: ðŸš€
         */
        "ROCKET" = "ðŸš€",
        /**
         * Emoji: ðŸ¤£
         *
         * Aliases: `ROLLING_ON_THE_FLOOR_LAUGHING`
         */
        "ROFL" = "ðŸ¤£",
        /**
         * Emoji: ðŸ—žï¸
         *
         * Aliases: `NEWSPAPER2`
         */
        "ROLLED_UP_NEWSPAPER" = "ðŸ—žï¸",
        /**
         * Emoji: ðŸŽ¢
         */
        "ROLLER_COASTER" = "ðŸŽ¢",
        /**
         * Emoji: ðŸ›¼
         */
        "ROLLER_SKATE" = "ðŸ›¼",
        /**
         * Emoji: ðŸ™„
         *
         * Aliases: `FACE_WITH_ROLLING_EYES`
         */
        "ROLLING_EYES" = "ðŸ™„",
        /**
         * Emoji: ðŸ¤£
         *
         * Aliases: `ROFL`
         */
        "ROLLING_ON_THE_FLOOR_LAUGHING" = "ðŸ¤£",
        /**
         * Emoji: ðŸ§»
         */
        "ROLL_OF_PAPER" = "ðŸ§»",
        /**
         * Emoji: ðŸ“
         */
        "ROOSTER" = "ðŸ“",
        /**
         * Emoji: ðŸŒ¹
         */
        "ROSE" = "ðŸŒ¹",
        /**
         * Emoji: ðŸµï¸
         */
        "ROSETTE" = "ðŸµï¸",
        /**
         * Emoji: ðŸš¨
         */
        "ROTATING_LIGHT" = "ðŸš¨",
        /**
         * Emoji: ðŸ“
         */
        "ROUND_PUSHPIN" = "ðŸ“",
        /**
         * Emoji: ðŸš£
         *
         * Aliases: `PERSON_ROWING_BOAT`
         */
        "ROWBOAT" = "ðŸš£",
        /**
         * Emoji: ðŸ‰
         */
        "RUGBY_FOOTBALL" = "ðŸ‰",
        /**
         * Emoji: ðŸƒ
         *
         * Aliases: `PERSON_RUNNING`
         */
        "RUNNER" = "ðŸƒ",
        /**
         * Emoji: ðŸŽ½
         */
        "RUNNING_SHIRT_WITH_SASH" = "ðŸŽ½",
        /**
         * Emoji: ðŸˆ‚ï¸
         */
        "SA" = "ðŸˆ‚ï¸",
        /**
         * Emoji: ðŸ§·
         */
        "SAFETY_PIN" = "ðŸ§·",
        /**
         * Emoji: ðŸ¦º
         */
        "SAFETY_VEST" = "ðŸ¦º",
        /**
         * Emoji: â™
         */
        "SAGITTARIUS" = "â™",
        /**
         * Emoji: â›µ
         */
        "SAILBOAT" = "â›µ",
        /**
         * Emoji: ðŸ¶
         */
        "SAKE" = "ðŸ¶",
        /**
         * Emoji: ðŸ¥—
         *
         * Aliases: `GREEN_SALAD`
         */
        "SALAD" = "ðŸ¥—",
        /**
         * Emoji: ðŸ§‚
         */
        "SALT" = "ðŸ§‚",
        /**
         * Emoji: ðŸ‘¡
         */
        "SANDAL" = "ðŸ‘¡",
        /**
         * Emoji: ðŸ¥ª
         */
        "SANDWICH" = "ðŸ¥ª",
        /**
         * Emoji: ðŸŽ…
         */
        "SANTA" = "ðŸŽ…",
        /**
         * Emoji: ðŸ¥»
         */
        "SARI" = "ðŸ¥»",
        /**
         * Emoji: ðŸ“¡
         */
        "SATELLITE" = "ðŸ“¡",
        /**
         * Emoji: ðŸ›°ï¸
         */
        "SATELLITE_ORBITAL" = "ðŸ›°ï¸",
        /**
         * Emoji: ðŸ˜†
         *
         * Aliases: `LAUGHING`
         */
        "SATISFIED" = "ðŸ˜†",
        /**
         * Emoji: ðŸ¦•
         */
        "SAUROPOD" = "ðŸ¦•",
        /**
         * Emoji: ðŸŽ·
         */
        "SAXOPHONE" = "ðŸŽ·",
        /**
         * Emoji: âš–ï¸
         */
        "SCALES" = "âš–ï¸",
        /**
         * Emoji: ðŸ§£
         */
        "SCARF" = "ðŸ§£",
        /**
         * Emoji: ðŸ«
         */
        "SCHOOL" = "ðŸ«",
        /**
         * Emoji: ðŸŽ’
         */
        "SCHOOL_SATCHEL" = "ðŸŽ’",
        /**
         * Emoji: ðŸ§‘â€ðŸ”¬
         */
        "SCIENTIST" = "ðŸ§‘â€ðŸ”¬",
        /**
         * Emoji: âœ‚ï¸
         */
        "SCISSORS" = "âœ‚ï¸",
        /**
         * Emoji: ðŸ›´
         */
        "SCOOTER" = "ðŸ›´",
        /**
         * Emoji: ðŸ¦‚
         */
        "SCORPION" = "ðŸ¦‚",
        /**
         * Emoji: â™
         */
        "SCORPIUS" = "â™",
        /**
         * Emoji: ðŸ´ó §ó ¢ó ³ó £ó ´ó ¿
         */
        "SCOTLAND" = "ðŸ´ó §ó ¢ó ³ó £ó ´ó ¿",
        /**
         * Emoji: ðŸ˜±
         */
        "SCREAM" = "ðŸ˜±",
        /**
         * Emoji: ðŸ™€
         */
        "SCREAM_CAT" = "ðŸ™€",
        /**
         * Emoji: ðŸª›
         */
        "SCREWDRIVER" = "ðŸª›",
        /**
         * Emoji: ðŸ“œ
         */
        "SCROLL" = "ðŸ“œ",
        /**
         * Emoji: ðŸ¦­
         */
        "SEAL" = "ðŸ¦­",
        /**
         * Emoji: ðŸ’º
         */
        "SEAT" = "ðŸ’º",
        /**
         * Emoji: ðŸ¥ˆ
         *
         * Aliases: `SECOND_PLACE_MEDAL`
         */
        "SECOND_PLACE" = "ðŸ¥ˆ",
        /**
         * Emoji: ðŸ¥ˆ
         *
         * Aliases: `SECOND_PLACE`
         */
        "SECOND_PLACE_MEDAL" = "ðŸ¥ˆ",
        /**
         * Emoji: ãŠ™ï¸
         */
        "SECRET" = "ãŠ™ï¸",
        /**
         * Emoji: ðŸŒ±
         */
        "SEEDLING" = "ðŸŒ±",
        /**
         * Emoji: ðŸ™ˆ
         */
        "SEE_NO_EVIL" = "ðŸ™ˆ",
        /**
         * Emoji: ðŸ¤³
         */
        "SELFIE" = "ðŸ¤³",
        /**
         * Emoji: ðŸ•â€ðŸ¦º
         */
        "SERVICE_DOG" = "ðŸ•â€ðŸ¦º",
        /**
         * Emoji: 7ï¸âƒ£
         */
        "SEVEN" = "7ï¸âƒ£",
        /**
         * Emoji: ðŸª¡
         */
        "SEWING_NEEDLE" = "ðŸª¡",
        /**
         * Emoji: ðŸ¤
         *
         * Aliases: `HANDSHAKE`
         */
        "SHAKING_HANDS" = "ðŸ¤",
        /**
         * Emoji: ðŸ¥˜
         *
         * Aliases: `PAELLA`
         */
        "SHALLOW_PAN_OF_FOOD" = "ðŸ¥˜",
        /**
         * Emoji: â˜˜ï¸
         */
        "SHAMROCK" = "â˜˜ï¸",
        /**
         * Emoji: ðŸ¦ˆ
         */
        "SHARK" = "ðŸ¦ˆ",
        /**
         * Emoji: ðŸ§
         */
        "SHAVED_ICE" = "ðŸ§",
        /**
         * Emoji: ðŸ‘
         */
        "SHEEP" = "ðŸ‘",
        /**
         * Emoji: ðŸš
         */
        "SHELL" = "ðŸš",
        /**
         * Emoji: ðŸ¥œ
         *
         * Aliases: `PEANUTS`
         */
        "SHELLED_PEANUT" = "ðŸ¥œ",
        /**
         * Emoji: ðŸ›¡ï¸
         */
        "SHIELD" = "ðŸ›¡ï¸",
        /**
         * Emoji: â›©ï¸
         */
        "SHINTO_SHRINE" = "â›©ï¸",
        /**
         * Emoji: ðŸš¢
         */
        "SHIP" = "ðŸš¢",
        /**
         * Emoji: ðŸ‘•
         */
        "SHIRT" = "ðŸ‘•",
        /**
         * Emoji: ðŸ’©
         *
         * Aliases: `POOP`,`HANKEY`,`POO`
         */
        "SHIT" = "ðŸ’©",
        /**
         * Emoji: ðŸ›ï¸
         */
        "SHOPPING_BAGS" = "ðŸ›ï¸",
        /**
         * Emoji: ðŸ›’
         *
         * Aliases: `SHOPPING_TROLLEY`
         */
        "SHOPPING_CART" = "ðŸ›’",
        /**
         * Emoji: ðŸ›’
         *
         * Aliases: `SHOPPING_CART`
         */
        "SHOPPING_TROLLEY" = "ðŸ›’",
        /**
         * Emoji: ðŸ©³
         */
        "SHORTS" = "ðŸ©³",
        /**
         * Emoji: ðŸš¿
         */
        "SHOWER" = "ðŸš¿",
        /**
         * Emoji: ðŸ¦
         */
        "SHRIMP" = "ðŸ¦",
        /**
         * Emoji: ðŸ¤·
         *
         * Aliases: `PERSON_SHRUGGING`
         */
        "SHRUG" = "ðŸ¤·",
        /**
         * Emoji: ðŸ¤«
         */
        "SHUSHING_FACE" = "ðŸ¤«",
        /**
         * Emoji: ðŸ¤¢
         *
         * Aliases: `NAUSEATED_FACE`
         */
        "SICK" = "ðŸ¤¢",
        /**
         * Emoji: ðŸ“¶
         */
        "SIGNAL_STRENGTH" = "ðŸ“¶",
        /**
         * Emoji: ðŸ¤˜
         *
         * Aliases: `METAL`
         */
        "SIGN_OF_THE_HORNS" = "ðŸ¤˜",
        /**
         * Emoji: ðŸ§‘â€ðŸŽ¤
         */
        "SINGER" = "ðŸ§‘â€ðŸŽ¤",
        /**
         * Emoji: 6ï¸âƒ£
         */
        "SIX" = "6ï¸âƒ£",
        /**
         * Emoji: ðŸ”¯
         */
        "SIX_POINTED_STAR" = "ðŸ”¯",
        /**
         * Emoji: ðŸ›¹
         */
        "SKATEBOARD" = "ðŸ›¹",
        /**
         * Emoji: ðŸ’€
         *
         * Aliases: `SKULL`
         */
        "SKELETON" = "ðŸ’€",
        /**
         * Emoji: ðŸŽ¿
         */
        "SKI" = "ðŸŽ¿",
        /**
         * Emoji: â›·ï¸
         */
        "SKIER" = "â›·ï¸",
        /**
         * Emoji: ðŸ’€
         *
         * Aliases: `SKELETON`
         */
        "SKULL" = "ðŸ’€",
        /**
         * Emoji: â˜ ï¸
         *
         * Aliases: `SKULL_CROSSBONES`
         */
        "SKULL_AND_CROSSBONES" = "â˜ ï¸",
        /**
         * Emoji: â˜ ï¸
         *
         * Aliases: `SKULL_AND_CROSSBONES`
         */
        "SKULL_CROSSBONES" = "â˜ ï¸",
        /**
         * Emoji: ðŸ¦¨
         */
        "SKUNK" = "ðŸ¦¨",
        /**
         * Emoji: ðŸ›·
         */
        "SLED" = "ðŸ›·",
        /**
         * Emoji: ðŸ˜´
         */
        "SLEEPING" = "ðŸ˜´",
        /**
         * Emoji: ðŸ›Œ
         */
        "SLEEPING_ACCOMMODATION" = "ðŸ›Œ",
        /**
         * Emoji: ðŸ˜ª
         */
        "SLEEPY" = "ðŸ˜ª",
        /**
         * Emoji: ðŸ•µï¸
         *
         * Aliases: `DETECTIVE`,`SPY`
         */
        "SLEUTH_OR_SPY" = "ðŸ•µï¸",
        /**
         * Emoji: ðŸ™
         *
         * Aliases: `SLIGHT_FROWN`
         */
        "SLIGHTLY_FROWNING_FACE" = "ðŸ™",
        /**
         * Emoji: ðŸ™‚
         *
         * Aliases: `SLIGHT_SMILE`
         */
        "SLIGHTLY_SMILING_FACE" = "ðŸ™‚",
        /**
         * Emoji: ðŸ™
         *
         * Aliases: `SLIGHTLY_FROWNING_FACE`
         */
        "SLIGHT_FROWN" = "ðŸ™",
        /**
         * Emoji: ðŸ™‚
         *
         * Aliases: `SLIGHTLY_SMILING_FACE`
         */
        "SLIGHT_SMILE" = "ðŸ™‚",
        /**
         * Emoji: ðŸ¦¥
         */
        "SLOTH" = "ðŸ¦¥",
        /**
         * Emoji: ðŸŽ°
         */
        "SLOT_MACHINE" = "ðŸŽ°",
        /**
         * Emoji: ðŸ›©ï¸
         *
         * Aliases: `AIRPLANE_SMALL`
         */
        "SMALL_AIRPLANE" = "ðŸ›©ï¸",
        /**
         * Emoji: ðŸ”¹
         */
        "SMALL_BLUE_DIAMOND" = "ðŸ”¹",
        /**
         * Emoji: ðŸ”¸
         */
        "SMALL_ORANGE_DIAMOND" = "ðŸ”¸",
        /**
         * Emoji: ðŸ”º
         */
        "SMALL_RED_TRIANGLE" = "ðŸ”º",
        /**
         * Emoji: ðŸ”»
         */
        "SMALL_RED_TRIANGLE_DOWN" = "ðŸ”»",
        /**
         * Emoji: ðŸ˜„
         */
        "SMILE" = "ðŸ˜„",
        /**
         * Emoji: ðŸ˜ƒ
         */
        "SMILEY" = "ðŸ˜ƒ",
        /**
         * Emoji: ðŸ˜º
         */
        "SMILEY_CAT" = "ðŸ˜º",
        /**
         * Emoji: ðŸ˜¸
         */
        "SMILE_CAT" = "ðŸ˜¸",
        /**
         * Emoji: ðŸ¥°
         */
        "SMILING_FACE_WITH_3_HEARTS" = "ðŸ¥°",
        /**
         * Emoji: ðŸ¥²
         */
        "SMILING_FACE_WITH_TEAR" = "ðŸ¥²",
        /**
         * Emoji: ðŸ˜ˆ
         */
        "SMILING_IMP" = "ðŸ˜ˆ",
        /**
         * Emoji: ðŸ˜
         */
        "SMIRK" = "ðŸ˜",
        /**
         * Emoji: ðŸ˜¼
         */
        "SMIRK_CAT" = "ðŸ˜¼",
        /**
         * Emoji: ðŸš¬
         */
        "SMOKING" = "ðŸš¬",
        /**
         * Emoji: ðŸŒ
         */
        "SNAIL" = "ðŸŒ",
        /**
         * Emoji: ðŸ
         */
        "SNAKE" = "ðŸ",
        /**
         * Emoji: ðŸ¤§
         *
         * Aliases: `SNEEZING_FACE`
         */
        "SNEEZE" = "ðŸ¤§",
        /**
         * Emoji: ðŸ¤§
         *
         * Aliases: `SNEEZE`
         */
        "SNEEZING_FACE" = "ðŸ¤§",
        /**
         * Emoji: ðŸ‚
         */
        "SNOWBOARDER" = "ðŸ‚",
        /**
         * Emoji: â„ï¸
         */
        "SNOWFLAKE" = "â„ï¸",
        /**
         * Emoji: â›„
         */
        "SNOWMAN" = "â›„",
        /**
         * Emoji: â˜ƒï¸
         */
        "SNOWMAN2" = "â˜ƒï¸",
        /**
         * Emoji: ðŸ”ï¸
         *
         * Aliases: `MOUNTAIN_SNOW`
         */
        "SNOW_CAPPED_MOUNTAIN" = "ðŸ”ï¸",
        /**
         * Emoji: ðŸ§¼
         */
        "SOAP" = "ðŸ§¼",
        /**
         * Emoji: ðŸ˜­
         */
        "SOB" = "ðŸ˜­",
        /**
         * Emoji: âš½
         */
        "SOCCER" = "âš½",
        /**
         * Emoji: ðŸ§¦
         */
        "SOCKS" = "ðŸ§¦",
        /**
         * Emoji: ðŸ¥Ž
         */
        "SOFTBALL" = "ðŸ¥Ž",
        /**
         * Emoji: ðŸ”œ
         */
        "SOON" = "ðŸ”œ",
        /**
         * Emoji: ðŸ†˜
         */
        "SOS" = "ðŸ†˜",
        /**
         * Emoji: ðŸ”‰
         */
        "SOUND" = "ðŸ”‰",
        /**
         * Emoji: ðŸ‘¾
         */
        "SPACE_INVADER" = "ðŸ‘¾",
        /**
         * Emoji: â™ ï¸
         */
        "SPADES" = "â™ ï¸",
        /**
         * Emoji: ðŸ
         */
        "SPAGHETTI" = "ðŸ",
        /**
         * Emoji: â‡ï¸
         */
        "SPARKLE" = "â‡ï¸",
        /**
         * Emoji: ðŸŽ‡
         */
        "SPARKLER" = "ðŸŽ‡",
        /**
         * Emoji: âœ¨
         */
        "SPARKLES" = "âœ¨",
        /**
         * Emoji: ðŸ’–
         */
        "SPARKLING_HEART" = "ðŸ’–",
        /**
         * Emoji: ðŸ”ˆ
         */
        "SPEAKER" = "ðŸ”ˆ",
        /**
         * Emoji: ðŸ—£ï¸
         *
         * Aliases: `SPEAKING_HEAD_IN_SILHOUETTE`
         */
        "SPEAKING_HEAD" = "ðŸ—£ï¸",
        /**
         * Emoji: ðŸ—£ï¸
         *
         * Aliases: `SPEAKING_HEAD`
         */
        "SPEAKING_HEAD_IN_SILHOUETTE" = "ðŸ—£ï¸",
        /**
         * Emoji: ðŸ™Š
         */
        "SPEAK_NO_EVIL" = "ðŸ™Š",
        /**
         * Emoji: ðŸ’¬
         */
        "SPEECH_BALLOON" = "ðŸ’¬",
        /**
         * Emoji: ðŸ—¨ï¸
         *
         * Aliases: `LEFT_SPEECH_BUBBLE`
         */
        "SPEECH_LEFT" = "ðŸ—¨ï¸",
        /**
         * Emoji: ðŸš¤
         */
        "SPEEDBOAT" = "ðŸš¤",
        /**
         * Emoji: ðŸ•·ï¸
         */
        "SPIDER" = "ðŸ•·ï¸",
        /**
         * Emoji: ðŸ•¸ï¸
         */
        "SPIDER_WEB" = "ðŸ•¸ï¸",
        /**
         * Emoji: ðŸ—“ï¸
         *
         * Aliases: `CALENDAR_SPIRAL`
         */
        "SPIRAL_CALENDAR_PAD" = "ðŸ—“ï¸",
        /**
         * Emoji: ðŸ—’ï¸
         *
         * Aliases: `NOTEPAD_SPIRAL`
         */
        "SPIRAL_NOTE_PAD" = "ðŸ—’ï¸",
        /**
         * Emoji: ðŸ§½
         */
        "SPONGE" = "ðŸ§½",
        /**
         * Emoji: ðŸ¥„
         */
        "SPOON" = "ðŸ¥„",
        /**
         * Emoji: ðŸ…
         *
         * Aliases: `MEDAL`
         */
        "SPORTS_MEDAL" = "ðŸ…",
        /**
         * Emoji: ðŸ•µï¸
         *
         * Aliases: `DETECTIVE`,`SLEUTH_OR_SPY`
         */
        "SPY" = "ðŸ•µï¸",
        /**
         * Emoji: ðŸ§´
         */
        "SQUEEZE_BOTTLE" = "ðŸ§´",
        /**
         * Emoji: ðŸ¦‘
         */
        "SQUID" = "ðŸ¦‘",
        /**
         * Emoji: ðŸŸï¸
         */
        "STADIUM" = "ðŸŸï¸",
        /**
         * Emoji: â­
         */
        "STAR" = "â­",
        /**
         * Emoji: ðŸŒŸ
         */
        "STAR2" = "ðŸŒŸ",
        /**
         * Emoji: ðŸŒ 
         */
        "STARS" = "ðŸŒ ",
        /**
         * Emoji: â˜ªï¸
         */
        "STAR_AND_CRESCENT" = "â˜ªï¸",
        /**
         * Emoji: âœ¡ï¸
         */
        "STAR_OF_DAVID" = "âœ¡ï¸",
        /**
         * Emoji: ðŸ¤©
         */
        "STAR_STRUCK" = "ðŸ¤©",
        /**
         * Emoji: ðŸš‰
         */
        "STATION" = "ðŸš‰",
        /**
         * Emoji: ðŸ—½
         */
        "STATUE_OF_LIBERTY" = "ðŸ—½",
        /**
         * Emoji: ðŸš‚
         */
        "STEAM_LOCOMOTIVE" = "ðŸš‚",
        /**
         * Emoji: ðŸ©º
         */
        "STETHOSCOPE" = "ðŸ©º",
        /**
         * Emoji: ðŸ²
         */
        "STEW" = "ðŸ²",
        /**
         * Emoji: â±ï¸
         */
        "STOPWATCH" = "â±ï¸",
        /**
         * Emoji: â¹ï¸
         */
        "STOP_BUTTON" = "â¹ï¸",
        /**
         * Emoji: ðŸ›‘
         *
         * Aliases: `OCTAGONAL_SIGN`
         */
        "STOP_SIGN" = "ðŸ›‘",
        /**
         * Emoji: ðŸ“
         */
        "STRAIGHT_RULER" = "ðŸ“",
        /**
         * Emoji: ðŸ“
         */
        "STRAWBERRY" = "ðŸ“",
        /**
         * Emoji: ðŸ˜›
         */
        "STUCK_OUT_TONGUE" = "ðŸ˜›",
        /**
         * Emoji: ðŸ˜
         */
        "STUCK_OUT_TONGUE_CLOSED_EYES" = "ðŸ˜",
        /**
         * Emoji: ðŸ˜œ
         */
        "STUCK_OUT_TONGUE_WINKING_EYE" = "ðŸ˜œ",
        /**
         * Emoji: ðŸ§‘â€ðŸŽ“
         */
        "STUDENT" = "ðŸ§‘â€ðŸŽ“",
        /**
         * Emoji: ðŸŽ™ï¸
         *
         * Aliases: `MICROPHONE2`
         */
        "STUDIO_MICROPHONE" = "ðŸŽ™ï¸",
        /**
         * Emoji: ðŸ¥™
         *
         * Aliases: `STUFFED_PITA`
         */
        "STUFFED_FLATBREAD" = "ðŸ¥™",
        /**
         * Emoji: ðŸ¥™
         *
         * Aliases: `STUFFED_FLATBREAD`
         */
        "STUFFED_PITA" = "ðŸ¥™",
        /**
         * Emoji: ðŸŒ»
         */
        "SUNFLOWER" = "ðŸŒ»",
        /**
         * Emoji: ðŸ˜Ž
         */
        "SUNGLASSES" = "ðŸ˜Ž",
        /**
         * Emoji: â˜€ï¸
         */
        "SUNNY" = "â˜€ï¸",
        /**
         * Emoji: ðŸŒ…
         */
        "SUNRISE" = "ðŸŒ…",
        /**
         * Emoji: ðŸŒ„
         */
        "SUNRISE_OVER_MOUNTAINS" = "ðŸŒ„",
        /**
         * Emoji: ðŸŒž
         */
        "SUN_WITH_FACE" = "ðŸŒž",
        /**
         * Emoji: ðŸ¦¸
         */
        "SUPERHERO" = "ðŸ¦¸",
        /**
         * Emoji: ðŸ¦¹
         */
        "SUPERVILLAIN" = "ðŸ¦¹",
        /**
         * Emoji: ðŸ„
         *
         * Aliases: `PERSON_SURFING`
         */
        "SURFER" = "ðŸ„",
        /**
         * Emoji: ðŸ£
         */
        "SUSHI" = "ðŸ£",
        /**
         * Emoji: ðŸšŸ
         */
        "SUSPENSION_RAILWAY" = "ðŸšŸ",
        /**
         * Emoji: ðŸ¦¢
         */
        "SWAN" = "ðŸ¦¢",
        /**
         * Emoji: ðŸ˜“
         */
        "SWEAT" = "ðŸ˜“",
        /**
         * Emoji: ðŸ’¦
         */
        "SWEAT_DROPS" = "ðŸ’¦",
        /**
         * Emoji: ðŸ˜…
         */
        "SWEAT_SMILE" = "ðŸ˜…",
        /**
         * Emoji: ðŸ 
         */
        "SWEET_POTATO" = "ðŸ ",
        /**
         * Emoji: ðŸŠ
         *
         * Aliases: `PERSON_SWIMMING`
         */
        "SWIMMER" = "ðŸŠ",
        /**
         * Emoji: ðŸ”£
         */
        "SYMBOLS" = "ðŸ”£",
        /**
         * Emoji: ðŸ•
         */
        "SYNAGOGUE" = "ðŸ•",
        /**
         * Emoji: ðŸ’‰
         */
        "SYRINGE" = "ðŸ’‰",
        /**
         * Emoji: ðŸ“
         *
         * Aliases: `PING_PONG`
         */
        "TABLE_TENNIS" = "ðŸ“",
        /**
         * Emoji: ðŸŒ®
         */
        "TACO" = "ðŸŒ®",
        /**
         * Emoji: ðŸŽ‰
         */
        "TADA" = "ðŸŽ‰",
        /**
         * Emoji: ðŸ¥¡
         */
        "TAKEOUT_BOX" = "ðŸ¥¡",
        /**
         * Emoji: ðŸ«”
         */
        "TAMALE" = "ðŸ«”",
        /**
         * Emoji: ðŸŽ‹
         */
        "TANABATA_TREE" = "ðŸŽ‹",
        /**
         * Emoji: ðŸŠ
         */
        "TANGERINE" = "ðŸŠ",
        /**
         * Emoji: â™‰
         */
        "TAURUS" = "â™‰",
        /**
         * Emoji: ðŸš•
         */
        "TAXI" = "ðŸš•",
        /**
         * Emoji: ðŸµ
         */
        "TEA" = "ðŸµ",
        /**
         * Emoji: ðŸ§‘â€ðŸ«
         */
        "TEACHER" = "ðŸ§‘â€ðŸ«",
        /**
         * Emoji: ðŸ«–
         */
        "TEAPOT" = "ðŸ«–",
        /**
         * Emoji: ðŸ§‘â€ðŸ’»
         */
        "TECHNOLOGIST" = "ðŸ§‘â€ðŸ’»",
        /**
         * Emoji: ðŸ§¸
         */
        "TEDDY_BEAR" = "ðŸ§¸",
        /**
         * Emoji: â˜Žï¸
         */
        "TELEPHONE" = "â˜Žï¸",
        /**
         * Emoji: ðŸ“ž
         */
        "TELEPHONE_RECEIVER" = "ðŸ“ž",
        /**
         * Emoji: ðŸ”­
         */
        "TELESCOPE" = "ðŸ”­",
        /**
         * Emoji: ðŸŽ¾
         */
        "TENNIS" = "ðŸŽ¾",
        /**
         * Emoji: â›º
         */
        "TENT" = "â›º",
        /**
         * Emoji: ðŸ§ª
         */
        "TEST_TUBE" = "ðŸ§ª",
        /**
         * Emoji: ðŸŒ¡ï¸
         */
        "THERMOMETER" = "ðŸŒ¡ï¸",
        /**
         * Emoji: ðŸ¤’
         *
         * Aliases: `FACE_WITH_THERMOMETER`
         */
        "THERMOMETER_FACE" = "ðŸ¤’",
        /**
         * Emoji: ðŸ¤”
         *
         * Aliases: `THINKING_FACE`
         */
        "THINKING" = "ðŸ¤”",
        /**
         * Emoji: ðŸ¤”
         *
         * Aliases: `THINKING`
         */
        "THINKING_FACE" = "ðŸ¤”",
        /**
         * Emoji: ðŸ¥‰
         *
         * Aliases: `THIRD_PLACE_MEDAL`
         */
        "THIRD_PLACE" = "ðŸ¥‰",
        /**
         * Emoji: ðŸ¥‰
         *
         * Aliases: `THIRD_PLACE`
         */
        "THIRD_PLACE_MEDAL" = "ðŸ¥‰",
        /**
         * Emoji: ðŸ©´
         */
        "THONG_SANDAL" = "ðŸ©´",
        /**
         * Emoji: ðŸ’­
         */
        "THOUGHT_BALLOON" = "ðŸ’­",
        /**
         * Emoji: ðŸ§µ
         */
        "THREAD" = "ðŸ§µ",
        /**
         * Emoji: 3ï¸âƒ£
         */
        "THREE" = "3ï¸âƒ£",
        /**
         * Emoji: ðŸ–±ï¸
         *
         * Aliases: `MOUSE_THREE_BUTTON`
         */
        "THREE_BUTTON_MOUSE" = "ðŸ–±ï¸",
        /**
         * Emoji: ðŸ‘Ž
         *
         * Aliases: `THUMBSDOWN`,`_-1`
         */
        "THUMBDOWN" = "ðŸ‘Ž",
        /**
         * Emoji: ðŸ‘Ž
         *
         * Aliases: `_-1`,`THUMBDOWN`
         */
        "THUMBSDOWN" = "ðŸ‘Ž",
        /**
         * Emoji: ðŸ‘
         *
         * Aliases: `_+1`,`THUMBUP`
         */
        "THUMBSUP" = "ðŸ‘",
        /**
         * Emoji: ðŸ‘
         *
         * Aliases: `THUMBSUP`,`_+1`
         */
        "THUMBUP" = "ðŸ‘",
        /**
         * Emoji: â›ˆï¸
         *
         * Aliases: `THUNDER_CLOUD_RAIN`
         */
        "THUNDER_CLOUD_AND_RAIN" = "â›ˆï¸",
        /**
         * Emoji: â›ˆï¸
         *
         * Aliases: `THUNDER_CLOUD_AND_RAIN`
         */
        "THUNDER_CLOUD_RAIN" = "â›ˆï¸",
        /**
         * Emoji: ðŸŽ«
         */
        "TICKET" = "ðŸŽ«",
        /**
         * Emoji: ðŸŽŸï¸
         *
         * Aliases: `ADMISSION_TICKETS`
         */
        "TICKETS" = "ðŸŽŸï¸",
        /**
         * Emoji: ðŸ¯
         */
        "TIGER" = "ðŸ¯",
        /**
         * Emoji: ðŸ…
         */
        "TIGER2" = "ðŸ…",
        /**
         * Emoji: â²ï¸
         *
         * Aliases: `TIMER_CLOCK`
         */
        "TIMER" = "â²ï¸",
        /**
         * Emoji: â²ï¸
         *
         * Aliases: `TIMER`
         */
        "TIMER_CLOCK" = "â²ï¸",
        /**
         * Emoji: ðŸ˜«
         */
        "TIRED_FACE" = "ðŸ˜«",
        /**
         * Emoji: â„¢ï¸
         */
        "TM" = "â„¢ï¸",
        /**
         * Emoji: ðŸš½
         */
        "TOILET" = "ðŸš½",
        /**
         * Emoji: ðŸ—¼
         */
        "TOKYO_TOWER" = "ðŸ—¼",
        /**
         * Emoji: ðŸ…
         */
        "TOMATO" = "ðŸ…",
        /**
         * Emoji: ðŸ‘…
         */
        "TONGUE" = "ðŸ‘…",
        /**
         * Emoji: ðŸ§°
         */
        "TOOLBOX" = "ðŸ§°",
        /**
         * Emoji: ðŸ› ï¸
         *
         * Aliases: `HAMMER_AND_WRENCH`
         */
        "TOOLS" = "ðŸ› ï¸",
        /**
         * Emoji: ðŸ¦·
         */
        "TOOTH" = "ðŸ¦·",
        /**
         * Emoji: ðŸª¥
         */
        "TOOTHBRUSH" = "ðŸª¥",
        /**
         * Emoji: ðŸ”
         */
        "TOP" = "ðŸ”",
        /**
         * Emoji: ðŸŽ©
         */
        "TOPHAT" = "ðŸŽ©",
        /**
         * Emoji: ðŸ–²ï¸
         */
        "TRACKBALL" = "ðŸ–²ï¸",
        /**
         * Emoji: â­ï¸
         *
         * Aliases: `NEXT_TRACK`
         */
        "TRACK_NEXT" = "â­ï¸",
        /**
         * Emoji: â®ï¸
         *
         * Aliases: `PREVIOUS_TRACK`
         */
        "TRACK_PREVIOUS" = "â®ï¸",
        /**
         * Emoji: ðŸšœ
         */
        "TRACTOR" = "ðŸšœ",
        /**
         * Emoji: ðŸš¥
         */
        "TRAFFIC_LIGHT" = "ðŸš¥",
        /**
         * Emoji: ðŸš‹
         */
        "TRAIN" = "ðŸš‹",
        /**
         * Emoji: ðŸš†
         */
        "TRAIN2" = "ðŸš†",
        /**
         * Emoji: ðŸšŠ
         */
        "TRAM" = "ðŸšŠ",
        /**
         * Emoji: ðŸ³ï¸â€âš§ï¸
         */
        "TRANSGENDER_FLAG" = "ðŸ³ï¸â€âš§ï¸",
        /**
         * Emoji: âš§
         */
        "TRANSGENDER_SYMBOL" = "âš§",
        /**
         * Emoji: ðŸš©
         */
        "TRIANGULAR_FLAG_ON_POST" = "ðŸš©",
        /**
         * Emoji: ðŸ“
         */
        "TRIANGULAR_RULER" = "ðŸ“",
        /**
         * Emoji: ðŸ”±
         */
        "TRIDENT" = "ðŸ”±",
        /**
         * Emoji: ðŸ˜¤
         */
        "TRIUMPH" = "ðŸ˜¤",
        /**
         * Emoji: ðŸšŽ
         */
        "TROLLEYBUS" = "ðŸšŽ",
        /**
         * Emoji: ðŸ†
         */
        "TROPHY" = "ðŸ†",
        /**
         * Emoji: ðŸ¹
         */
        "TROPICAL_DRINK" = "ðŸ¹",
        /**
         * Emoji: ðŸ 
         */
        "TROPICAL_FISH" = "ðŸ ",
        /**
         * Emoji: ðŸšš
         */
        "TRUCK" = "ðŸšš",
        /**
         * Emoji: ðŸŽº
         */
        "TRUMPET" = "ðŸŽº",
        /**
         * Emoji: ðŸŒ·
         */
        "TULIP" = "ðŸŒ·",
        /**
         * Emoji: ðŸ¥ƒ
         *
         * Aliases: `WHISKY`
         */
        "TUMBLER_GLASS" = "ðŸ¥ƒ",
        /**
         * Emoji: ðŸ¦ƒ
         */
        "TURKEY" = "ðŸ¦ƒ",
        /**
         * Emoji: ðŸ¢
         */
        "TURTLE" = "ðŸ¢",
        /**
         * Emoji: ðŸ“º
         */
        "TV" = "ðŸ“º",
        /**
         * Emoji: ðŸ”€
         */
        "TWISTED_RIGHTWARDS_ARROWS" = "ðŸ”€",
        /**
         * Emoji: 2ï¸âƒ£
         */
        "TWO" = "2ï¸âƒ£",
        /**
         * Emoji: ðŸ’•
         */
        "TWO_HEARTS" = "ðŸ’•",
        /**
         * Emoji: ðŸ‘¬
         */
        "TWO_MEN_HOLDING_HANDS" = "ðŸ‘¬",
        /**
         * Emoji: ðŸ‘­
         */
        "TWO_WOMEN_HOLDING_HANDS" = "ðŸ‘­",
        /**
         * Emoji: ðŸ¦–
         */
        "T_REX" = "ðŸ¦–",
        /**
         * Emoji: ðŸˆ¹
         */
        "U5272" = "ðŸˆ¹",
        /**
         * Emoji: ðŸˆ´
         */
        "U5408" = "ðŸˆ´",
        /**
         * Emoji: ðŸˆº
         */
        "U55B6" = "ðŸˆº",
        /**
         * Emoji: ðŸˆ¯
         */
        "U6307" = "ðŸˆ¯",
        /**
         * Emoji: ðŸˆ·ï¸
         */
        "U6708" = "ðŸˆ·ï¸",
        /**
         * Emoji: ðŸˆ¶
         */
        "U6709" = "ðŸˆ¶",
        /**
         * Emoji: ðŸˆµ
         */
        "U6E80" = "ðŸˆµ",
        /**
         * Emoji: ðŸˆš
         */
        "U7121" = "ðŸˆš",
        /**
         * Emoji: ðŸˆ¸
         */
        "U7533" = "ðŸˆ¸",
        /**
         * Emoji: ðŸˆ²
         */
        "U7981" = "ðŸˆ²",
        /**
         * Emoji: ðŸˆ³
         */
        "U7A7A" = "ðŸˆ³",
        /**
         * Emoji: â˜”
         */
        "UMBRELLA" = "â˜”",
        /**
         * Emoji: â˜‚ï¸
         */
        "UMBRELLA2" = "â˜‚ï¸",
        /**
         * Emoji: â›±ï¸
         *
         * Aliases: `BEACH_UMBRELLA`
         */
        "UMBRELLA_ON_GROUND" = "â›±ï¸",
        /**
         * Emoji: ðŸ˜’
         */
        "UNAMUSED" = "ðŸ˜’",
        /**
         * Emoji: ðŸ”ž
         */
        "UNDERAGE" = "ðŸ”ž",
        /**
         * Emoji: ðŸ¦„
         *
         * Aliases: `UNICORN_FACE`
         */
        "UNICORN" = "ðŸ¦„",
        /**
         * Emoji: ðŸ¦„
         *
         * Aliases: `UNICORN`
         */
        "UNICORN_FACE" = "ðŸ¦„",
        /**
         * Emoji: ðŸ‡ºðŸ‡³
         */
        "UNITED_NATIONS" = "ðŸ‡ºðŸ‡³",
        /**
         * Emoji: ðŸ”“
         */
        "UNLOCK" = "ðŸ”“",
        /**
         * Emoji: ðŸ†™
         */
        "UP" = "ðŸ†™",
        /**
         * Emoji: ðŸ™ƒ
         *
         * Aliases: `UPSIDE_DOWN_FACE`
         */
        "UPSIDE_DOWN" = "ðŸ™ƒ",
        /**
         * Emoji: ðŸ™ƒ
         *
         * Aliases: `UPSIDE_DOWN`
         */
        "UPSIDE_DOWN_FACE" = "ðŸ™ƒ",
        /**
         * Emoji: âš±ï¸
         *
         * Aliases: `FUNERAL_URN`
         */
        "URN" = "âš±ï¸",
        /**
         * Emoji: âœŒï¸
         */
        "V" = "âœŒï¸",
        /**
         * Emoji: ðŸ§›
         */
        "VAMPIRE" = "ðŸ§›",
        /**
         * Emoji: ðŸš¦
         */
        "VERTICAL_TRAFFIC_LIGHT" = "ðŸš¦",
        /**
         * Emoji: ðŸ“¼
         */
        "VHS" = "ðŸ“¼",
        /**
         * Emoji: ðŸ“³
         */
        "VIBRATION_MODE" = "ðŸ“³",
        /**
         * Emoji: ðŸ“¹
         */
        "VIDEO_CAMERA" = "ðŸ“¹",
        /**
         * Emoji: ðŸŽ®
         */
        "VIDEO_GAME" = "ðŸŽ®",
        /**
         * Emoji: ðŸŽ»
         */
        "VIOLIN" = "ðŸŽ»",
        /**
         * Emoji: â™
         */
        "VIRGO" = "â™",
        /**
         * Emoji: ðŸŒ‹
         */
        "VOLCANO" = "ðŸŒ‹",
        /**
         * Emoji: ðŸ
         */
        "VOLLEYBALL" = "ðŸ",
        /**
         * Emoji: ðŸ†š
         */
        "VS" = "ðŸ†š",
        /**
         * Emoji: ðŸ––
         *
         * Aliases: `RAISED_HAND_WITH_PART_BETWEEN_MIDDLE_AND_RING_FINGERS`
         */
        "VULCAN" = "ðŸ––",
        /**
         * Emoji: ðŸ§‡
         */
        "WAFFLE" = "ðŸ§‡",
        /**
         * Emoji: ðŸ´ó §ó ¢ó ·ó ¬ó ³ó ¿
         */
        "WALES" = "ðŸ´ó §ó ¢ó ·ó ¬ó ³ó ¿",
        /**
         * Emoji: ðŸš¶
         *
         * Aliases: `PERSON_WALKING`
         */
        "WALKING" = "ðŸš¶",
        /**
         * Emoji: ðŸŒ˜
         */
        "WANING_CRESCENT_MOON" = "ðŸŒ˜",
        /**
         * Emoji: ðŸŒ–
         */
        "WANING_GIBBOUS_MOON" = "ðŸŒ–",
        /**
         * Emoji: âš ï¸
         */
        "WARNING" = "âš ï¸",
        /**
         * Emoji: ðŸ—‘ï¸
         */
        "WASTEBASKET" = "ðŸ—‘ï¸",
        /**
         * Emoji: âŒš
         */
        "WATCH" = "âŒš",
        /**
         * Emoji: ðŸ‰
         */
        "WATERMELON" = "ðŸ‰",
        /**
         * Emoji: ðŸƒ
         */
        "WATER_BUFFALO" = "ðŸƒ",
        /**
         * Emoji: ðŸ¤½
         *
         * Aliases: `PERSON_PLAYING_WATER_POLO`
         */
        "WATER_POLO" = "ðŸ¤½",
        /**
         * Emoji: ðŸ‘‹
         */
        "WAVE" = "ðŸ‘‹",
        /**
         * Emoji: ã€°ï¸
         */
        "WAVY_DASH" = "ã€°ï¸",
        /**
         * Emoji: ðŸŒ’
         */
        "WAXING_CRESCENT_MOON" = "ðŸŒ’",
        /**
         * Emoji: ðŸŒ”
         */
        "WAXING_GIBBOUS_MOON" = "ðŸŒ”",
        /**
         * Emoji: ðŸš¾
         */
        "WC" = "ðŸš¾",
        /**
         * Emoji: ðŸ˜©
         */
        "WEARY" = "ðŸ˜©",
        /**
         * Emoji: ðŸ’’
         */
        "WEDDING" = "ðŸ’’",
        /**
         * Emoji: ðŸ‹ï¸
         *
         * Aliases: `PERSON_LIFTING_WEIGHTS`,`LIFTER`
         */
        "WEIGHT_LIFTER" = "ðŸ‹ï¸",
        /**
         * Emoji: ðŸ³
         */
        "WHALE" = "ðŸ³",
        /**
         * Emoji: ðŸ‹
         */
        "WHALE2" = "ðŸ‹",
        /**
         * Emoji: â™¿
         */
        "WHEELCHAIR" = "â™¿",
        /**
         * Emoji: â˜¸ï¸
         */
        "WHEEL_OF_DHARMA" = "â˜¸ï¸",
        /**
         * Emoji: ðŸ¥ƒ
         *
         * Aliases: `TUMBLER_GLASS`
         */
        "WHISKY" = "ðŸ¥ƒ",
        /**
         * Emoji: âœ…
         */
        "WHITE_CHECK_MARK" = "âœ…",
        /**
         * Emoji: âšª
         */
        "WHITE_CIRCLE" = "âšª",
        /**
         * Emoji: ðŸ’®
         */
        "WHITE_FLOWER" = "ðŸ’®",
        /**
         * Emoji: â˜¹ï¸
         *
         * Aliases: `FROWNING2`
         */
        "WHITE_FROWNING_FACE" = "â˜¹ï¸",
        /**
         * Emoji: ðŸ¤
         */
        "WHITE_HEART" = "ðŸ¤",
        /**
         * Emoji: â¬œ
         */
        "WHITE_LARGE_SQUARE" = "â¬œ",
        /**
         * Emoji: â—½
         */
        "WHITE_MEDIUM_SMALL_SQUARE" = "â—½",
        /**
         * Emoji: â—»ï¸
         */
        "WHITE_MEDIUM_SQUARE" = "â—»ï¸",
        /**
         * Emoji: â–«ï¸
         */
        "WHITE_SMALL_SQUARE" = "â–«ï¸",
        /**
         * Emoji: ðŸ”³
         */
        "WHITE_SQUARE_BUTTON" = "ðŸ”³",
        /**
         * Emoji: ðŸŒ¥ï¸
         *
         * Aliases: `WHITE_SUN_CLOUD`
         */
        "WHITE_SUN_BEHIND_CLOUD" = "ðŸŒ¥ï¸",
        /**
         * Emoji: ðŸŒ¦ï¸
         *
         * Aliases: `WHITE_SUN_RAIN_CLOUD`
         */
        "WHITE_SUN_BEHIND_CLOUD_WITH_RAIN" = "ðŸŒ¦ï¸",
        /**
         * Emoji: ðŸŒ¥ï¸
         *
         * Aliases: `WHITE_SUN_BEHIND_CLOUD`
         */
        "WHITE_SUN_CLOUD" = "ðŸŒ¥ï¸",
        /**
         * Emoji: ðŸŒ¦ï¸
         *
         * Aliases: `WHITE_SUN_BEHIND_CLOUD_WITH_RAIN`
         */
        "WHITE_SUN_RAIN_CLOUD" = "ðŸŒ¦ï¸",
        /**
         * Emoji: ðŸŒ¤ï¸
         *
         * Aliases: `WHITE_SUN_WITH_SMALL_CLOUD`
         */
        "WHITE_SUN_SMALL_CLOUD" = "ðŸŒ¤ï¸",
        /**
         * Emoji: ðŸŒ¤ï¸
         *
         * Aliases: `WHITE_SUN_SMALL_CLOUD`
         */
        "WHITE_SUN_WITH_SMALL_CLOUD" = "ðŸŒ¤ï¸",
        /**
         * Emoji: ðŸ¥€
         *
         * Aliases: `WILTED_ROSE`
         */
        "WILTED_FLOWER" = "ðŸ¥€",
        /**
         * Emoji: ðŸ¥€
         *
         * Aliases: `WILTED_FLOWER`
         */
        "WILTED_ROSE" = "ðŸ¥€",
        /**
         * Emoji: ðŸªŸ
         */
        "WINDOW" = "ðŸªŸ",
        /**
         * Emoji: ðŸŒ¬ï¸
         */
        "WIND_BLOWING_FACE" = "ðŸŒ¬ï¸",
        /**
         * Emoji: ðŸŽ
         */
        "WIND_CHIME" = "ðŸŽ",
        /**
         * Emoji: ðŸ·
         */
        "WINE_GLASS" = "ðŸ·",
        /**
         * Emoji: ðŸ˜‰
         */
        "WINK" = "ðŸ˜‰",
        /**
         * Emoji: ðŸº
         */
        "WOLF" = "ðŸº",
        /**
         * Emoji: ðŸ‘©
         */
        "WOMAN" = "ðŸ‘©",
        /**
         * Emoji: ðŸ‘š
         */
        "WOMANS_CLOTHES" = "ðŸ‘š",
        /**
         * Emoji: ðŸ¥¿
         */
        "WOMANS_FLAT_SHOE" = "ðŸ¥¿",
        /**
         * Emoji: ðŸ‘’
         */
        "WOMANS_HAT" = "ðŸ‘’",
        /**
         * Emoji: ðŸ‘©â€ðŸŽ¨
         */
        "WOMAN_ARTIST" = "ðŸ‘©â€ðŸŽ¨",
        /**
         * Emoji: ðŸ‘©â€ðŸš€
         */
        "WOMAN_ASTRONAUT" = "ðŸ‘©â€ðŸš€",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦²
         */
        "WOMAN_BALD" = "ðŸ‘©â€ðŸ¦²",
        /**
         * Emoji: ðŸš´â€â™€ï¸
         */
        "WOMAN_BIKING" = "ðŸš´â€â™€ï¸",
        /**
         * Emoji: â›¹ï¸â€â™€ï¸
         */
        "WOMAN_BOUNCING_BALL" = "â›¹ï¸â€â™€ï¸",
        /**
         * Emoji: ðŸ™‡â€â™€ï¸
         */
        "WOMAN_BOWING" = "ðŸ™‡â€â™€ï¸",
        /**
         * Emoji: ðŸ¤¸â€â™€ï¸
         */
        "WOMAN_CARTWHEELING" = "ðŸ¤¸â€â™€ï¸",
        /**
         * Emoji: ðŸ§—â€â™€ï¸
         */
        "WOMAN_CLIMBING" = "ðŸ§—â€â™€ï¸",
        /**
         * Emoji: ðŸ‘·â€â™€ï¸
         */
        "WOMAN_CONSTRUCTION_WORKER" = "ðŸ‘·â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ³
         */
        "WOMAN_COOK" = "ðŸ‘©â€ðŸ³",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦±
         */
        "WOMAN_CURLY_HAIRED" = "ðŸ‘©â€ðŸ¦±",
        /**
         * Emoji: ðŸ•µï¸â€â™€ï¸
         */
        "WOMAN_DETECTIVE" = "ðŸ•µï¸â€â™€ï¸",
        /**
         * Emoji: ðŸ§â€â™€ï¸
         */
        "WOMAN_ELF" = "ðŸ§â€â™€ï¸",
        /**
         * Emoji: ðŸ¤¦â€â™€ï¸
         */
        "WOMAN_FACEPALMING" = "ðŸ¤¦â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ­
         */
        "WOMAN_FACTORY_WORKER" = "ðŸ‘©â€ðŸ­",
        /**
         * Emoji: ðŸ§šâ€â™€ï¸
         */
        "WOMAN_FAIRY" = "ðŸ§šâ€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸŒ¾
         */
        "WOMAN_FARMER" = "ðŸ‘©â€ðŸŒ¾",
        /**
         * Emoji: ðŸ‘©â€ðŸ¼
         */
        "WOMAN_FEEDING_BABY" = "ðŸ‘©â€ðŸ¼",
        /**
         * Emoji: ðŸ‘©â€ðŸš’
         */
        "WOMAN_FIREFIGHTER" = "ðŸ‘©â€ðŸš’",
        /**
         * Emoji: ðŸ™â€â™€ï¸
         */
        "WOMAN_FROWNING" = "ðŸ™â€â™€ï¸",
        /**
         * Emoji: ðŸ§žâ€â™€ï¸
         */
        "WOMAN_GENIE" = "ðŸ§žâ€â™€ï¸",
        /**
         * Emoji: ðŸ™…â€â™€ï¸
         */
        "WOMAN_GESTURING_NO" = "ðŸ™…â€â™€ï¸",
        /**
         * Emoji: ðŸ™†â€â™€ï¸
         */
        "WOMAN_GESTURING_OK" = "ðŸ™†â€â™€ï¸",
        /**
         * Emoji: ðŸ’†â€â™€ï¸
         */
        "WOMAN_GETTING_FACE_MASSAGE" = "ðŸ’†â€â™€ï¸",
        /**
         * Emoji: ðŸ’‡â€â™€ï¸
         */
        "WOMAN_GETTING_HAIRCUT" = "ðŸ’‡â€â™€ï¸",
        /**
         * Emoji: ðŸŒï¸â€â™€ï¸
         */
        "WOMAN_GOLFING" = "ðŸŒï¸â€â™€ï¸",
        /**
         * Emoji: ðŸ’‚â€â™€ï¸
         */
        "WOMAN_GUARD" = "ðŸ’‚â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€âš•ï¸
         */
        "WOMAN_HEALTH_WORKER" = "ðŸ‘©â€âš•ï¸",
        /**
         * Emoji: ðŸ§˜â€â™€ï¸
         */
        "WOMAN_IN_LOTUS_POSITION" = "ðŸ§˜â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦½
         */
        "WOMAN_IN_MANUAL_WHEELCHAIR" = "ðŸ‘©â€ðŸ¦½",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦¼
         */
        "WOMAN_IN_MOTORIZED_WHEELCHAIR" = "ðŸ‘©â€ðŸ¦¼",
        /**
         * Emoji: ðŸ§–â€â™€ï¸
         */
        "WOMAN_IN_STEAMY_ROOM" = "ðŸ§–â€â™€ï¸",
        /**
         * Emoji: ðŸ¤µâ€â™€ï¸
         */
        "WOMAN_IN_TUXEDO" = "ðŸ¤µâ€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€âš–ï¸
         */
        "WOMAN_JUDGE" = "ðŸ‘©â€âš–ï¸",
        /**
         * Emoji: ðŸ¤¹â€â™€ï¸
         */
        "WOMAN_JUGGLING" = "ðŸ¤¹â€â™€ï¸",
        /**
         * Emoji: ðŸ§Žâ€â™€ï¸
         */
        "WOMAN_KNEELING" = "ðŸ§Žâ€â™€ï¸",
        /**
         * Emoji: ðŸ‹ï¸â€â™€ï¸
         */
        "WOMAN_LIFTING_WEIGHTS" = "ðŸ‹ï¸â€â™€ï¸",
        /**
         * Emoji: ðŸ§™â€â™€ï¸
         */
        "WOMAN_MAGE" = "ðŸ§™â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ”§
         */
        "WOMAN_MECHANIC" = "ðŸ‘©â€ðŸ”§",
        /**
         * Emoji: ðŸšµâ€â™€ï¸
         */
        "WOMAN_MOUNTAIN_BIKING" = "ðŸšµâ€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ’¼
         */
        "WOMAN_OFFICE_WORKER" = "ðŸ‘©â€ðŸ’¼",
        /**
         * Emoji: ðŸ‘©â€âœˆï¸
         */
        "WOMAN_PILOT" = "ðŸ‘©â€âœˆï¸",
        /**
         * Emoji: ðŸ¤¾â€â™€ï¸
         */
        "WOMAN_PLAYING_HANDBALL" = "ðŸ¤¾â€â™€ï¸",
        /**
         * Emoji: ðŸ¤½â€â™€ï¸
         */
        "WOMAN_PLAYING_WATER_POLO" = "ðŸ¤½â€â™€ï¸",
        /**
         * Emoji: ðŸ‘®â€â™€ï¸
         */
        "WOMAN_POLICE_OFFICER" = "ðŸ‘®â€â™€ï¸",
        /**
         * Emoji: ðŸ™Žâ€â™€ï¸
         */
        "WOMAN_POUTING" = "ðŸ™Žâ€â™€ï¸",
        /**
         * Emoji: ðŸ™‹â€â™€ï¸
         */
        "WOMAN_RAISING_HAND" = "ðŸ™‹â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦°
         */
        "WOMAN_RED_HAIRED" = "ðŸ‘©â€ðŸ¦°",
        /**
         * Emoji: ðŸš£â€â™€ï¸
         */
        "WOMAN_ROWING_BOAT" = "ðŸš£â€â™€ï¸",
        /**
         * Emoji: ðŸƒâ€â™€ï¸
         */
        "WOMAN_RUNNING" = "ðŸƒâ€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ”¬
         */
        "WOMAN_SCIENTIST" = "ðŸ‘©â€ðŸ”¬",
        /**
         * Emoji: ðŸ¤·â€â™€ï¸
         */
        "WOMAN_SHRUGGING" = "ðŸ¤·â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸŽ¤
         */
        "WOMAN_SINGER" = "ðŸ‘©â€ðŸŽ¤",
        /**
         * Emoji: ðŸ§â€â™€ï¸
         */
        "WOMAN_STANDING" = "ðŸ§â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸŽ“
         */
        "WOMAN_STUDENT" = "ðŸ‘©â€ðŸŽ“",
        /**
         * Emoji: ðŸ¦¸â€â™€ï¸
         */
        "WOMAN_SUPERHERO" = "ðŸ¦¸â€â™€ï¸",
        /**
         * Emoji: ðŸ¦¹â€â™€ï¸
         */
        "WOMAN_SUPERVILLAIN" = "ðŸ¦¹â€â™€ï¸",
        /**
         * Emoji: ðŸ„â€â™€ï¸
         */
        "WOMAN_SURFING" = "ðŸ„â€â™€ï¸",
        /**
         * Emoji: ðŸŠâ€â™€ï¸
         */
        "WOMAN_SWIMMING" = "ðŸŠâ€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ«
         */
        "WOMAN_TEACHER" = "ðŸ‘©â€ðŸ«",
        /**
         * Emoji: ðŸ‘©â€ðŸ’»
         */
        "WOMAN_TECHNOLOGIST" = "ðŸ‘©â€ðŸ’»",
        /**
         * Emoji: ðŸ’â€â™€ï¸
         */
        "WOMAN_TIPPING_HAND" = "ðŸ’â€â™€ï¸",
        /**
         * Emoji: ðŸ§›â€â™€ï¸
         */
        "WOMAN_VAMPIRE" = "ðŸ§›â€â™€ï¸",
        /**
         * Emoji: ðŸš¶â€â™€ï¸
         */
        "WOMAN_WALKING" = "ðŸš¶â€â™€ï¸",
        /**
         * Emoji: ðŸ‘³â€â™€ï¸
         */
        "WOMAN_WEARING_TURBAN" = "ðŸ‘³â€â™€ï¸",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦³
         */
        "WOMAN_WHITE_HAIRED" = "ðŸ‘©â€ðŸ¦³",
        /**
         * Emoji: ðŸ§•
         */
        "WOMAN_WITH_HEADSCARF" = "ðŸ§•",
        /**
         * Emoji: ðŸ‘©â€ðŸ¦¯
         */
        "WOMAN_WITH_PROBING_CANE" = "ðŸ‘©â€ðŸ¦¯",
        /**
         * Emoji: ðŸ‘°â€â™€ï¸
         *
         * Aliases: `BRIDE_WITH_VEIL`
         */
        "WOMAN_WITH_VEIL" = "ðŸ‘°â€â™€ï¸",
        /**
         * Emoji: ðŸ§Ÿâ€â™€ï¸
         */
        "WOMAN_ZOMBIE" = "ðŸ§Ÿâ€â™€ï¸",
        /**
         * Emoji: ðŸšº
         */
        "WOMENS" = "ðŸšº",
        /**
         * Emoji: ðŸ‘¯â€â™€ï¸
         */
        "WOMEN_WITH_BUNNY_EARS_PARTYING" = "ðŸ‘¯â€â™€ï¸",
        /**
         * Emoji: ðŸ¤¼â€â™€ï¸
         */
        "WOMEN_WRESTLING" = "ðŸ¤¼â€â™€ï¸",
        /**
         * Emoji: ðŸªµ
         */
        "WOOD" = "ðŸªµ",
        /**
         * Emoji: ðŸ¥´
         */
        "WOOZY_FACE" = "ðŸ¥´",
        /**
         * Emoji: ðŸ—ºï¸
         *
         * Aliases: `MAP`
         */
        "WORLD_MAP" = "ðŸ—ºï¸",
        /**
         * Emoji: ðŸª±
         */
        "WORM" = "ðŸª±",
        /**
         * Emoji: ðŸ˜Ÿ
         */
        "WORRIED" = "ðŸ˜Ÿ",
        /**
         * Emoji: ðŸ›
         *
         * Aliases: `PLACE_OF_WORSHIP`
         */
        "WORSHIP_SYMBOL" = "ðŸ›",
        /**
         * Emoji: ðŸ”§
         */
        "WRENCH" = "ðŸ”§",
        /**
         * Emoji: ðŸ¤¼
         *
         * Aliases: `PEOPLE_WRESTLING`,`WRESTLING`
         */
        "WRESTLERS" = "ðŸ¤¼",
        /**
         * Emoji: ðŸ¤¼
         *
         * Aliases: `PEOPLE_WRESTLING`,`WRESTLERS`
         */
        "WRESTLING" = "ðŸ¤¼",
        /**
         * Emoji: âœï¸
         */
        "WRITING_HAND" = "âœï¸",
        /**
         * Emoji: âŒ
         */
        "X" = "âŒ",
        /**
         * Emoji: ðŸ§¶
         */
        "YARN" = "ðŸ§¶",
        /**
         * Emoji: ðŸ¥±
         */
        "YAWNING_FACE" = "ðŸ¥±",
        /**
         * Emoji: ðŸŸ¡
         */
        "YELLOW_CIRCLE" = "ðŸŸ¡",
        /**
         * Emoji: ðŸ’›
         */
        "YELLOW_HEART" = "ðŸ’›",
        /**
         * Emoji: ðŸŸ¨
         */
        "YELLOW_SQUARE" = "ðŸŸ¨",
        /**
         * Emoji: ðŸ’´
         */
        "YEN" = "ðŸ’´",
        /**
         * Emoji: â˜¯ï¸
         */
        "YIN_YANG" = "â˜¯ï¸",
        /**
         * Emoji: ðŸª€
         */
        "YO_YO" = "ðŸª€",
        /**
         * Emoji: ðŸ˜‹
         */
        "YUM" = "ðŸ˜‹",
        /**
         * Emoji: ðŸ¤ª
         */
        "ZANY_FACE" = "ðŸ¤ª",
        /**
         * Emoji: âš¡
         */
        "ZAP" = "âš¡",
        /**
         * Emoji: ðŸ¦“
         */
        "ZEBRA" = "ðŸ¦“",
        /**
         * Emoji: 0ï¸âƒ£
         */
        "ZERO" = "0ï¸âƒ£",
        /**
         * Emoji: ðŸ¤
         *
         * Aliases: `ZIPPER_MOUTH_FACE`
         */
        "ZIPPER_MOUTH" = "ðŸ¤",
        /**
         * Emoji: ðŸ¤
         *
         * Aliases: `ZIPPER_MOUTH`
         */
        "ZIPPER_MOUTH_FACE" = "ðŸ¤",
        /**
         * Emoji: ðŸ§Ÿ
         */
        "ZOMBIE" = "ðŸ§Ÿ",
        /**
         * Emoji: ðŸ’¤
         */
        "ZZZ" = "ðŸ’¤",
        /**
         * Emoji: ðŸ‘
         *
         * Aliases: `THUMBSUP`,`THUMBUP`
         */
        "_+1" = "ðŸ‘",
        /**
         * Emoji: ðŸ‘Ž
         *
         * Aliases: `THUMBSDOWN`,`THUMBDOWN`
         */
        "_-1" = "ðŸ‘Ž",
        /**
         * Emoji: ðŸ’¯
         */
        "_100" = "ðŸ’¯",
        /**
         * Emoji: ðŸ”¢
         */
        "_1234" = "ðŸ”¢",
      }
    }
  }