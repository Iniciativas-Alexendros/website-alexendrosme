"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocalePrefix, withLocalePrefix } from "@/lib/i18n/locale-path";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Next Link that prefixes `/en` when on the English tree. */
export function LocaleLink({ href, ...rest }: Props) {
  const prefix = useLocalePrefix();
  return <Link href={withLocalePrefix(prefix, href)} {...rest} />;
}
