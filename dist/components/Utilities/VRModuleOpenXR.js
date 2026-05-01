"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VRModuleOpenXR = void 0;
exports.exitVRScene = exitVRScene;
exports.useVRViewTag = useVRViewTag;
const react_1 = require("react");
const react_native_1 = require("react-native");
const VRQuestNavigatorBridge_1 = require("./VRQuestNavigatorBridge");
/**
 * Finishes VRActivity and returns the user to the panel (MainActivity).
 * Safe to call on any platform — no-op when VRLauncher is unavailable.
 */
function exitVRScene() {
    VRQuestNavigatorBridge_1.VRQuestNavigatorBridge.setVRActive(false);
    react_native_1.NativeModules.VRLauncher
        ?.exitVRScene?.();
}
/**
 * Typed reference to the VRModuleOpenXR native module.
 * undefined when not running on Meta Quest (no-op calls are safe via optional chaining).
 */
exports.VRModuleOpenXR = react_native_1.NativeModules.VRModuleOpenXR ?? undefined;
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
function useVRViewTag() {
    const [tag, setTag] = (0, react_1.useState)(() => VRQuestNavigatorBridge_1.VRQuestNavigatorBridge.getViewTag());
    (0, react_1.useEffect)(() => VRQuestNavigatorBridge_1.VRQuestNavigatorBridge.onViewTag(setTag), []);
    return tag;
}
