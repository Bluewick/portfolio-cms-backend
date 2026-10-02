const CRAWLER_SIGNATURES = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /Pinterest/i,
  /Googlebot/i,
  /bingbot/i,
  /Applebot/i,
  /YandexBot/i,
  /DuckDuckBot/i,
];

/**
 * Checks if the request's User-Agent header belongs to a known social crawler or search bot.
 */
export const is_social_crawler = (user_agent = "") => {
  if (!user_agent || typeof user_agent !== "string") {
    return false;
  }
  return CRAWLER_SIGNATURES.some((pattern) => pattern.test(user_agent));
};