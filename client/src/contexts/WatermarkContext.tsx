import { createContext, useContext } from "react";
import { trpc } from "@/lib/trpc";

export type WatermarkSettings = {
  isEnabled: boolean;
  watermarkText: string;
  logoUrl: string | null;
  logoKey?: string | null;
};

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  isEnabled: true,
  watermarkText: "ANABOLICS AFRICA",
  logoUrl: null,
  logoKey: null,
};

const WatermarkContext = createContext<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);

export function WatermarkProvider({ children }: { children: React.ReactNode }) {
  const settingsQuery = trpc.watermark.get.useQuery(undefined, {
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  const settings: WatermarkSettings = {
    ...DEFAULT_WATERMARK_SETTINGS,
    ...settingsQuery.data,
  };

  return <WatermarkContext.Provider value={settings}>{children}</WatermarkContext.Provider>;
}

export function useWatermark() {
  return useContext(WatermarkContext);
}
