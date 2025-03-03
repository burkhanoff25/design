"use client";

import React from 'react';
import { I18nProvider as I18nContextProvider } from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nContextProvider>{children}</I18nContextProvider>;
}