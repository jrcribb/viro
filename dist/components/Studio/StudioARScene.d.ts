import * as React from "react";
import { StudioSceneResponse } from "./types";
interface StudioARSceneProps {
    sceneNavigator?: any;
    sceneData: StudioSceneResponse | null;
    onReady?: () => void;
    onError?: (err: Error) => void;
    onSceneChange?: (sceneId: string, sceneName: string) => void;
}
/**
 * Outer gate: keeps the hooks-bearing inner component out of the tree until
 * sceneData is available, avoiding a Rules of Hooks violation.
 */
export declare const StudioARScene: React.FC<StudioARSceneProps>;
export {};
