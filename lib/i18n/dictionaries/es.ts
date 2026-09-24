import type { TranslationDict } from "../types";

const es: TranslationDict = {
  locale: {
    name: "Español",
    short: "ES",
  },

  nav: {
    biografia: "(Auto)biografía",
    proyectos: "Proyectos",
    opinion: "Opinión",
    productos: "Productos",
    productosLabel: "Hub de productos — alexendros.dev",
    menuLabel: "Abrir menú",
    menuCloseLabel: "Cerrar menú",
    navLabel: "Navegación principal",
    logoLabel: "Alexendros — volver al inicio",
    skipToContent: "Saltar al contenido",
    now: "Ahora",
  },

  hero: {
    eyebrow: "Valencia · pensamiento, libertad y vida digital",
    signature: "Alexendros. Grandes soluciones de un ingenio no previsto.",
    lead: "Espacio personal y libre de dinero. Aquí escribo y pienso en voz alta. Lo que se vende vive en {link}.",
    leadLink: "alexendros.dev",
    tagline: "Ánimo de todo tipo. Lucro ni idea de quién es.",
    ctaContact: "Escríbeme",
    ctaAbout: "Conóceme",
  },

  sections: {
    biografia: {
      title: "(Auto)biografía",
      p1: "Me llamo Alejandro Domingo Agustí. En la red respondo a Alexendros. Nací en Valencia y he pasado por oficios distintos: hostelería, gestión y, más tarde, el trabajo con pantallas. Aprendí a leer personas y negocios antes que a hablar de herramientas.",
      p2: "Este sitio es mi espacio libre de dinero: aquí no se vende nada. Escribo sobre libertad, atención, soberanía personal y la vida digital sin filtros. Si buscas lo comercial, está en {link}. Si quieres lo que pienso, quédate.",
      p2Link: "alexendros.dev",
      p3: "Creo en elegir con criterio, en no entregar lo crítico a quien no te conoce y en escribir para quien sospecha de las narrativas cómodas. Este proyecto es sencillo a propósito: un sitio claro, sin ruido y sin pedir nada a cambio.",
    },
    publicaciones: {
      title: "Últimas piezas",
      desc: "Lo último en {proyectosLink} y {opinionLink}.",
      proyectosLabel: "Proyectos",
      opinionLabel: "Opinión",
      empty: "No hay publicaciones aún.",
    },
  },

  footer: {
    legalNavLabel: "Navegación legal",
    avisoLegal: "Aviso legal",
    privacidad: "Privacidad",
    cookies: "Cookies",
    seguridad: "Seguridad",
    hubProductos: "Hub de productos → alexendros.dev",
    hubLabel: "Hub de productos — alexendros.dev",
    copyright:
      "· Alejandro Domingo Agustí · Anticomercial: cópialo, úsalo, compártelo. No comercies con ello. F.A.F.O.",
    quote: "¿De qué sirve el dinero a quien no sabe usarlo? Ya lo tengo yo.",
  },

  antiMonetization: {
    text: "Este espacio es libre de {strong}. Sin anuncios, sin afiliados, sin tracking.",
    strong: "monetización",
    link: "Lo comercial vive en alexendros.dev",
    dismissLabel: "Cerrar aviso de espacio libre de monetización",
    regionLabel: "Aviso de espacio libre de monetización",
  },

  theme: {
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
    ariaLabel: "Tema actual: {theme}. Click para cambiar.",
  },

  localeToggle: {
    ariaLabel: "Idioma actual: {locale}. Cambiar idioma.",
  },

  collection: {
    label: "Colección",
    empty: "No hay artículos publicados aún.",
    backHome: "← Volver al inicio",
  },

  article: {
    backProyectos: "← Volver a Proyectos",
    backOpinion: "← Volver a Opinión",
    tagsLabel: "Etiquetas",
    minutesShort: "min de lectura",
    tocTitle: "En este artículo",
  },

  now: {
    title: "/now",
    desc: "Qué estoy haciendo ahora. Inspirado por la idea de Derek Sivers (sive.rs/now).",
    lastUpdatedPrefix: "Actualizado:",
    sectionBuilding: "En marcha",
    buildingItems:
      "Este sitio, siempre en evolución · El hub comercial en alexendros.dev, fuera de este espacio",
    sectionReading: "Leyendo",
    readingItems: "La renta básica — Daniel Raventós · Technopoly — Neil Postman",
    sectionFocus: "Enfoque",
    focusItems:
      "Escribir con voz humana · Soberanía personal en lo digital · Menos ruido, más criterio",
    footerBack: "← Volver al inicio",
    empty: "Actualización en progreso — vuelve pronto.",
  },

  tags: {
    indexTitle: "Etiquetas",
    detailLabel: "Etiqueta",
    indexEmpty: "No hay etiquetas aún.",
    backToTags: "← Todas las etiquetas",
    countLabelOne: "etiqueta",
    countLabelMany: "etiquetas",
    detailCountOne: "artículo con esta etiqueta",
    detailCountMany: "artículos con esta etiqueta",
  },

  pwa: {
    updateReady: "Nueva versión disponible",
    updateApply: "Actualizar",
    updateDismiss: "Más tarde",
  },

  search: {
    trigger: "Buscar",
    triggerAria: "Abrir búsqueda",
    placeholder: "Busca en artículos...",
    noResults: 'No se encontraron resultados para "{query}".',
    results: '{count} resultado(s) para "{query}"',
    sectionProyectos: "Proyectos",
    sectionOpinion: "Opinión",
    shortcut: "Buscar (Ctrl/⌘K)",
    loadError: "No se pudo cargar el índice de búsqueda. Intenta de nuevo más tarde.",
    loading: "Cargando índice de búsqueda...",
    clear: "Limpiar búsqueda",
  },

  errors: {
    notFoundTitle: "Página no encontrada",
    notFoundDesc: "Esta página no existe o fue movida.",
    notFoundCta: "Volver al inicio",
    errorTitle: "Algo salió mal",
    errorDesc: "Ha ocurrido un error inesperado. Intenta de nuevo.",
    errorCta: "Volver al inicio",
  },

  contact: {
    fabLabel: "Acciones de contacto",
    emailLabel: "Enviar correo",
    telegramLabel: "Telegram",
    statusPreparacion: "En preparación",
    statusProximamente: "Próximamente",
    contactame: "Contáctame",
  },
};

export default es;
