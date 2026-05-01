import * as React from "react";
import { ViewStyle } from "react-native";
interface StudioSceneNavigatorProps {
    /**
     * UUID of a specific scene to load. If omitted, the navigator fetches the
     * project configured in the app manifest and uses its opening scene.
     */
    sceneId?: string;
    worldAlignment?: "Gravity" | "GravityAndHeading" | "Camera";
    autofocus?: boolean;
    style?: ViewStyle;
    onSceneReady?: () => void;
    onError?: (err: Error) => void;
    onSceneChange?: (sceneId: string, sceneName: string) => void;
    onExitViro?: () => void;
}
/**
 * Cross-reality Studio scene navigator. Renders a Studio-authored scene on
 * both AR devices (iOS / non-Quest Android) and Meta Quest (VR).
 *
 * Opening-scene resolution order:
 *   1. `sceneId` prop → use it directly
 *   2. Native project (RVProjectId from manifest) → use `opening_scene.id`
 *   3. Fallback → first scene in the project's scene list
 *
 * On Quest, ViroXRSceneNavigator is not rendered until the scene data is
 * ready. This means VRActivity always launches with the actual content scene
 * as its initial scene, avoiding the LoadingVRScene → replace timing race.
 */
export declare function StudioSceneNavigator({ sceneId, worldAlignment, autofocus, style, onSceneReady, onError, onSceneChange, onExitViro, }: StudioSceneNavigatorProps): React.JSX.Element;
export {};
