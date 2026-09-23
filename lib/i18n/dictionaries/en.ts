import type { TranslationDict } from "../types";

const en: TranslationDict = {
  locale: {
    name: "English",
    short: "EN",
  },

  nav: {
    biografia: "(Auto)biography",
    proyectos: "Projects",
    opinion: "Opinion",
    productos: "Products",
    productosLabel: "Product hub — alexendros.dev",
    menuLabel: "Open menu",
    menuCloseLabel: "Close menu",
    navLabel: "Main navigation",
    logoLabel: "Alexendros — back to home",
    skipToContent: "Skip to content",
    now: "Now",
  },

  hero: {
    eyebrow: "Valencia · thought, freedom & digital life",
    signature: "Alexendros. Great solutions from unforeseen ingenuity.",
    lead: "A personal, money-free space. I write and think out loud here. The commercial side lives at {link}.",
    leadLink: "alexendros.dev",
    tagline: "All kinds of spirit. Profit — no idea who that is.",
    ctaContact: "Write to me",
    ctaAbout: "Get to know me",
  },

  sections: {
    biografia: {
      title: "(Auto)biography",
      p1: "My name is Alejandro Domingo Agustí. Online I go by Alexendros. I was born in Valencia and have worked in different trades: hospitality, management, and later screen work. I learned to read people and businesses before talking about tools.",
      p2: "This site is my money-free space: nothing is sold here. I write about freedom, attention, personal sovereignty and digital life without filters. If you want the commercial side, it's at {link}. If you want what I think, stay.",
      p2Link: "alexendros.dev",
      p3: "I believe in choosing with criteria, in not handing what's critical to strangers, and in writing for those who distrust comfortable narratives. This project is deliberately simple: a clear site, without noise, asking for nothing in return.",
    },
    publicaciones: {
      title: "Latest pieces",
      desc: "The latest from {proyectosLink} and {opinionLink}.",
      proyectosLabel: "Projects",
      opinionLabel: "Opinion",
      empty: "No posts yet.",
    },
  },

  footer: {
    legalNavLabel: "Legal navigation",
    avisoLegal: "Legal notice",
    privacidad: "Privacy",
    cookies: "Cookies",
    seguridad: "Security",
    hubProductos: "Product hub → alexendros.dev",
    hubLabel: "Product hub — alexendros.dev",
    copyright:
      "· Alejandro Domingo Agustí · Anti-commercial: copy it, use it, share it. Don't trade with it. F.A.F.O.",
    quote: "What use is money to those who don't know how to use it? I already have it.",
  },

  antiMonetization: {
    text: "This space is free of {strong}. No ads, no affiliates, no tracking.",
    strong: "monetization",
    link: "The commercial stuff lives at alexendros.dev",
    dismissLabel: "Close monetization-free notice",
  },

  theme: {
    system: "System",
    light: "Light",
    dark: "Dark",
    ariaLabel: "Current theme: {theme}. Click to change.",
  },

  localeToggle: {
    ariaLabel: "Current language: {locale}. Change language.",
  },

  collection: {
    label: "Collection",
    empty: "No articles published yet.",
    backHome: "← Back to home",
  },

  article: {
    backProyectos: "← Back to Projects",
    backOpinion: "← Back to Opinion",
    tagsLabel: "Tags",
    minutesShort: "min read",
    tocTitle: "On this page",
  },

  now: {
    title: "/now",
    desc: "What I'm doing now. Inspired by Derek Sivers' idea (sive.rs/now).",
    lastUpdatedPrefix: "Updated:",
    sectionBuilding: "In progress",
    buildingItems:
      "This site, always evolving · The commercial hub at alexendros.dev, outside this space",
    sectionReading: "Reading",
    readingItems: "La renta básica — Daniel Raventós · Technopoly — Neil Postman",
    sectionFocus: "Focus",
    focusItems:
      "Writing in a human voice · Personal digital sovereignty · Less noise, more judgment",
    footerBack: "← Back to home",
    empty: "Update in progress — check back soon.",
  },

  tags: {
    indexTitle: "Tags",
    detailLabel: "Tag",
    indexEmpty: "No tags yet.",
    backToTags: "← All tags",
    countLabelOne: "tag",
    countLabelMany: "tags",
    detailCountOne: "article with this tag",
    detailCountMany: "articles with this tag",
  },

  pwa: {
    updateReady: "New version available",
    updateApply: "Update",
    updateDismiss: "Later",
  },

  search: {
    trigger: "Search",
    triggerAria: "Open search",
    placeholder: "Search articles...",
    noResults: 'No results found for "{query}".',
    results: '{count} result(s) for "{query}"',
    sectionProyectos: "Projects",
    sectionOpinion: "Opinion",
    shortcut: "Search (⌘K)",
    loadError: "Could not load the search index. Please try again later.",
    loading: "Loading search index...",
    clear: "Clear search",
  },

  errors: {
    notFoundTitle: "Page not found",
    notFoundDesc: "This page doesn't exist or has moved.",
    notFoundCta: "Back to home",
    errorTitle: "Something went wrong",
    errorDesc: "An unexpected error occurred. Please try again.",
    errorCta: "Back to home",
  },

  contact: {
    fabLabel: "Contact actions",
    emailLabel: "Send email",
    telegramLabel: "Telegram",
    statusPreparacion: "Preparing",
    statusProximamente: "Coming soon",
    contactame: "Contact me",
  },
};

export default en;
