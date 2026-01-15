/**
 * Hooks 统一导出
 */

export * from "./use-debounce";
export * from "./use-local-storage";
export * from "./use-media-query";
export * from "./use-click-outside";
export * from "./use-text-selection";
export * from "./use-highlights";
// use-mobile exports useIsMobile which conflicts with use-media-query
// Import directly if needed: import { useIsMobile } from "@/hooks/use-mobile"

