export const SITE = {
  website: "https://www.embeddedk8.com/", // replace this with your deployed domain
  author: "Kasia Zalewska",
  profile: "https://www.embeddedk8.com/",
  desc: "My blog about embedded systems. Personal thoughts, experiments, and notes on RTOS, ARM microcontrollers, and programming",
  title: "Kasia Zalewska",
  ogImage: "ov.png",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 20,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Bangkok", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
