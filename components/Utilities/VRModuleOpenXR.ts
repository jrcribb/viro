import { useEffect, useState } from "react";
import { NativeModules } from "react-native";
import { VRQuestNavigatorBridge } from "./VRQuestNavigatorBridge";

/**
 * Finishes VRActivity and returns the user to the panel (MainActivity).
 * Safe to call on any platform — no-op when VRLauncher is unavailable.
 */
export function exitVRScene(): void {
  VRQuestNavigatorBridge.setVRActive(false);
  (NativeModules.VRLauncher as { exitVRScene?: () => void } | undefined)
    ?.exitVRScene?.();
}

export type VRModuleOpenXRType = {
  recenterTracking?: (viewTag: number) => void;
  setPassthroughEnabled?: (viewTag: number, enabled: boolean) => void;
};

/**
 * Typed reference to the VRModuleOpenXR native module.
 * undefined when not running on Meta Quest (no-op calls are safe via optional chaining).
 */
export const VRModuleOpenXR =
  (NativeModules.VRModuleOpenXR as VRModuleOpenXRType | undefined) ?? undefined;

/**
 * Returns the live viewTag of the ViroVRSceneNavigator running in VRActivity,
 * kept in sync via VRQuestNavigatorBridge.  null until ViroQuestEntryPoint has
 * mounted and published the tag.
 *
 * Use this inside VR scenes when you need to call VRModuleOpenXR methods:
 *
 * ```tsx
 * function MyVRScene() {
 *   const viewTag = useVRViewTag();
 *   const recenter = () => {
 *     if (viewTag != null) VRModuleOpenXR?.recenterTracking?.(viewTag);
 *   };
 *   return <ViroScene>...</ViroScene>;
 * }
 * ```
 */
export function useVRViewTag(): number | null {
  const [tag, setTag] = useState<number | null>(
    () => VRQuestNavigatorBridge.getViewTag()
  );
  useEffect(() => VRQuestNavigatorBridge.onViewTag(setTag), []);
  return tag;
}
