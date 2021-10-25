export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type UrlQuery = { [key: string]: any };

export function addQuery(url: string, query?: UrlQuery): string {
  if (query) {
    const params = new URLSearchParams();
    for (let key in query) {
      if (query[key] !== undefined) {
        params.append(key, query[key]);
      }
    }
    const string = params.toString();
    if (string) {
      if (url.includes("?")) {
        url += "&" + string;
      } else {
        url += "?" + string;
      }
    }
  }
  return url;
}

export function anyToCamelCase(object: any, skip?: Array<string>): any {
  if (object === null) {
    return object;
  }
  if (typeof object === "object") {
    if (Array.isArray(object)) {
      const obj: Array<any> = [];
      for (let value of object) {
        obj.push(anyToCamelCase(value));
      }
      return obj;
    } else {
      const obj: { [key: string]: any } = {};
      for (let key in object) {
        if (skip && skip.includes(key)) {
          obj[key] = object[key];
        } else {
          obj[toCamelCase(key)] = anyToCamelCase(object[key]);
        }
      }
      return obj;
    }
  }
  return object;
}

export function getAcronym(name?: string): string {
  if (name != null) {
    return name.replace(/\w+/g, (match) => match[0]).replace(/\s/g, "");
  }
  return "";
}

export function rgbToInt(r: number, g: number, b: number): number {
  return ((r & 0x0ff) << 16) | ((g & 0x0ff) << 8) | (b & 0x0ff);
}

export function toCamelCase(value: string): string {
  if (!value.includes("_")) {
    return value;
  }
  value = value
    .split("_")
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase())
    .join("");
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function getFormatFromHash(
  hash: string,
  format?: null | string,
  defaultFormat: string = ImageFormats.PNG
): string {
  if (format) {
    format = format.toLowerCase();
  } else {
    format = defaultFormat;
    if (hash.startsWith("a_")) {
      format = ImageFormats.GIF;
    }
  }
  if (!IMAGE_FORMATS.includes(format)) {
    throw new Error(`Invalid format: '${format}', valid: ${IMAGE_FORMATS}`);
  }
  return format;
}

const QuotesAll = {
  '"': '"',
  "'": "'",
  "’": "’",
  "‚": "‛",
  "“": "”",
  "„": "‟",
  "「": "」",
  "『": "』",
  "〝": "〞",
  "﹁": "﹂",
  "﹃": "﹄",
  "＂": "＂",
  "｢": "｣",
  "«": "»",
  "《": "》",
  "〈": "〉",
};

const Quotes = {
  END: Object.values(QuotesAll),
  START: Object.keys(QuotesAll),
};

export function getFirstArgument(value: string): [string, string] {
  let result = value.slice(0, 1);
  value = value.slice(1);

  // check to see if this word starts with any of the quote starts
  // if yes, then continue onto the next word
  if (Quotes.START.includes(result)) {
    let index = value.indexOf((QuotesAll as any)[result], 1);
    if (index !== -1) {
      result = value.slice(0, index);
      value = value.slice(index + 1).trim();
      return [result, value];
    }
  }
  // check for the next space, if not then we consume the whole thing
  let index = value.indexOf(" ");
  if (index === -1) {
    result += value.slice(0, value.length);
    value = "";
  } else {
    result += value.slice(0, index);
    value = value.slice(index).trim();
  }
  return [result, value];
}

export function hexToInt(hex: string): number {
  return parseInt(hex.replace(/#/, ""), 16);
}

export function intToHex(int: number, hashtag?: boolean): string {
  return (hashtag ? "#" : "") + int.toString(16).padStart(6, "0");
}

export function intToRGB(int: number): {
  r: number;
  g: number;
  b: number;
} {
  return {
    r: (int >> 16) & 0x0ff,
    g: (int >> 8) & 0x0ff,
    b: int & 0x0ff,
  };
}

export interface DiscordRegexMatch {
  animated?: boolean;
  channelId?: string;
  guildId?: string;
  id?: string;
  language?: string;
  matched: string;
  mentionType?: string;
  messageId?: string;
  name?: string;
  text?: string;
}

export interface DiscordRegexPayload {
  match: {
    regex: RegExp;
    type: string;
  };
  matches: Array<DiscordRegexMatch>;
}

export function regex(
  type: string,
  content: string,
  onlyFirst: boolean = false
): DiscordRegexPayload {
  type = String(type || "").toUpperCase();
  const regex = (DiscordRegex as any)[type];
  if (regex === undefined) {
    throw new Error(`Unknown regex type: ${type}`);
  }
  regex.lastIndex = 0;

  const payload: DiscordRegexPayload = {
    match: { regex, type },
    matches: [],
  };

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(content))) {
    const result: DiscordRegexMatch = { matched: match[0] };
    switch (type) {
      case DiscordRegexNames.EMOJI:
        {
          result.name = match[1] as string;
          result.id = match[2] as string;
          result.animated = content.startsWith("<a:");
        }
        break;
      case DiscordRegexNames.JUMP_CHANNEL:
        {
          result.guildId = match[1] as string;
          result.channelId = match[2] as string;
        }
        break;
      case DiscordRegexNames.JUMP_CHANNEL_MESSAGE:
        {
          result.guildId = match[1] as string;
          result.channelId = match[2] as string;
          result.messageId = match[3] as string;
        }
        break;
      case DiscordRegexNames.MENTION_CHANNEL:
      case DiscordRegexNames.MENTION_ROLE:
        {
          result.id = match[1] as string;
        }
        break;
      case DiscordRegexNames.MENTION_USER:
        {
          result.id = match[2] as string;
          result.mentionType = match[1] as string;
        }
        break;
      case DiscordRegexNames.TEXT_CODEBLOCK:
        {
          result.language = match[2] as string;
          result.text = match[3] as string;
        }
        break;
      case DiscordRegexNames.TEXT_BOLD:
      case DiscordRegexNames.TEXT_CODESTRING:
      case DiscordRegexNames.TEXT_ITALICS:
      case DiscordRegexNames.TEXT_SNOWFLAKE:
      case DiscordRegexNames.TEXT_SPOILER:
      case DiscordRegexNames.TEXT_STRIKE:
      case DiscordRegexNames.TEXT_UNDERLINE:
      case DiscordRegexNames.TEXT_URL:
        {
          result.text = match[1] as string;
        }
        break;
      default: {
        throw new Error(`Unknown regex type: ${type}`);
      }
    }
    payload.matches.push(result);

    if (onlyFirst) {
      break;
    }
  }
  regex.lastIndex = 0;
  return payload;
}
export enum DiscordRegexNames {
  EMOJI = "EMOJI",
  JUMP_CHANNEL = "JUMP_CHANNEL",
  JUMP_CHANNEL_MESSAGE = "JUMP_CHANNEL_MESSAGE",
  MENTION_CHANNEL = "MENTION_CHANNEL",
  MENTION_ROLE = "MENTION_ROLE",
  MENTION_USER = "MENTION_USER",
  TEXT_BOLD = "TEXT_BOLD",
  TEXT_CODEBLOCK = "TEXT_CODEBLOCK",
  TEXT_CODESTRING = "TEXT_CODESTRING",
  TEXT_ITALICS = "TEXT_ITALICS",
  TEXT_SNOWFLAKE = "TEXT_SNOWFLAKE",
  TEXT_SPOILER = "TEXT_SPOILER",
  TEXT_STRIKE = "TEXT_STRIKE",
  TEXT_UNDERLINE = "TEXT_UNDERLINE",
  TEXT_URL = "TEXT_URL",
}
export enum ImageFormats {
  GIF = "gif",
  JPEG = "jpeg",
  JPG = "jpg",
  PNG = "png",
  WEBP = "webp",
}
export const IMAGE_FORMATS: ReadonlyArray<string> = Object.values(ImageFormats);
export const DiscordRegex = {
  [DiscordRegexNames.EMOJI]: /<a?:(\w+):(\d+)>/g,
  [DiscordRegexNames.JUMP_CHANNEL]:
    /^(?:https?):\/\/(?:(?:(?:canary|ptb)\.)?(?:discord|discordapp)\.com\/channels\/)(\@me|\d+)\/(\d+)$/g,
  [DiscordRegexNames.JUMP_CHANNEL_MESSAGE]:
    /^(?:https?):\/\/(?:(?:(?:canary|ptb)\.)?(?:discord|discordapp)\.com\/channels\/)(\@me|\d+)\/(\d+)\/(\d+)$/g,
  [DiscordRegexNames.MENTION_CHANNEL]: /<#(\d+)>/g,
  [DiscordRegexNames.MENTION_ROLE]: /<@&(\d+)>/g,
  [DiscordRegexNames.MENTION_USER]: /<@(!?)(\d+)>/g,
  [DiscordRegexNames.TEXT_BOLD]: /\*\*([\s\S]+?)\*\*/g,
  [DiscordRegexNames.TEXT_CODEBLOCK]:
    /```(([a-z0-9-]+?)\n+)?\n*([^]+?)\n*```/gi,
  [DiscordRegexNames.TEXT_CODESTRING]: /`([\s\S]+?)`/g,
  [DiscordRegexNames.TEXT_ITALICS]: /_([\s\S]+?)_|\*([\s\S]+?)\*/g,
  [DiscordRegexNames.TEXT_SNOWFLAKE]: /(\d+)/g,
  [DiscordRegexNames.TEXT_SPOILER]: /\|\|([\s\S]+?)\|\|/g,
  [DiscordRegexNames.TEXT_STRIKE]: /~~([\s\S]+?)~~(?!_)/g,
  [DiscordRegexNames.TEXT_UNDERLINE]: /__([\s\S]+?)__/g,
  [DiscordRegexNames.TEXT_URL]: /((?:https?):\/\/[^\s<]+[^<.,:;"'\]\s])/g,
};
export function normalize(object: { [key: string]: any }) {
  for (const key in object) {
    object[key] = key;
  }
  return Object.freeze(object);
}

export function guildIdToShardId(
  guildId: string,
  shardCount: number = 0
): number {
  return Math.round(+guildId / (1 << 22)) % shardCount;
}

export type URIEncodeWrapFunc = (...args: Array<any>) => string;
export type URIEncodeWrapped = { [key: string]: any };

const safeCharacter = "@";
export function URIEncodeWrap(unsafe: URIEncodeWrapped): URIEncodeWrapped {
  const safe: URIEncodeWrapped = {};
  for (let key in unsafe) {
    const path = unsafe[key];
    if (typeof path !== "function") {
      safe[key] = path;
      continue;
    }
    safe[key] = <URIEncodeWrapFunc>((...args) => {
      args = args.map((arg) => {
        if (!arg) {
          return arg;
        }
        const value = String(arg);
        if (!value.includes(safeCharacter)) {
          return encodeURIComponent(value);
        }
        return value
          .split("")
          .map((char) => {
            return char === safeCharacter ? char : encodeURIComponent(char);
          })
          .join("");
      });
      return path(...args);
    });
  }
  return Object.freeze(safe);
}
