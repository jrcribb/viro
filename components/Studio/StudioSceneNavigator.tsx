import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroScene } from "../ViroScene";
import { ViroXRSceneNavigator } from "../ViroXRSceneNavigator";
import { isQuest } from "../Utilities/ViroPlatform";
import { StudioARScene } from "./StudioARScene";
import { StudioProjectApiResponse, StudioSceneResponse } from "./types";
import { VRTStudioModule } from "./VRTStudioModule";

function LoadingARScene() { return <ViroARScene />; }
function LoadingVRScene() { return <ViroScene />; }

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
}

/**
 * Cross-reality Studio scene navigator. Renders a Studio-authored scene on
 * both AR devices (iOS / non-Quest Android) and Meta Quest (VR).
 *
 * Opening-scene resolution order:
 *   1. `sceneId` prop → use it directly
 *   2. Native project (RVProjectId from manifest) → use `opening_scene.id`
 *   3. Fallback → first scene in the project's scene list
 */
export function StudioSceneNavigator({
  sceneId,
  worldAlignment = "Gravity",
  autofocus = true,
  style,
  onSceneReady,
  onError,
  onSceneChange,
}: StudioSceneNavigatorProps) {
  const navigatorRef = useRef<any>(null);
  const loadedSceneIdRef = useRef<string | null>(null);

  const onSceneReadyRef = useRef(onSceneReady);
  const onErrorRef = useRef(onError);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneReadyRef.current = onSceneReady;
  onErrorRef.current = onError;
  onSceneChangeRef.current = onSceneChange;

  const pushScene = useCallback((sceneData: StudioSceneResponse) => {
    if (isQuest) {
      navigatorRef.current?.sceneNavigator?.push({
        scene: StudioARScene,
        passProps: {
          sceneData,
          onReady: onSceneReadyRef.current,
          onSceneChange: onSceneChangeRef.current,
        },
      });
    } else {
      navigatorRef.current?.arSceneNavigator?.push({
        scene: StudioARScene,
        passProps: {
          sceneData,
          onReady: onSceneReadyRef.current,
          onSceneChange: onSceneChangeRef.current,
        },
      });
    }
  }, []);

  const resolveSceneId = useCallback(async (): Promise<string> => {
    if (sceneId) return sceneId;

    const projectResult = await VRTStudioModule.rvGetProject();
    if (!projectResult.success) {
      throw new Error(projectResult.error ?? "rvGetProject failed");
    }
    if (typeof projectResult.data !== "string") {
      throw new Error("rvGetProject returned no data");
    }

    const { project } = JSON.parse(projectResult.data) as StudioProjectApiResponse;

    if (project.opening_scene?.id) {
      return project.opening_scene.id;
    }
    if (project.scenes.length > 0) {
      return project.scenes[0].id;
    }
    throw new Error(`Project ${project.id} has no scenes`);
  }, [sceneId]);

  const loadScene = useCallback(
    async (isCancelled: () => boolean) => {
      // Wait one frame to ensure the native view is mounted.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (isCancelled()) return;

      const resolvedSceneId = await resolveSceneId();
      if (isCancelled()) return;

      if (loadedSceneIdRef.current === resolvedSceneId) return;

      const result = await VRTStudioModule.rvGetScene(resolvedSceneId);
      if (isCancelled()) return;
      if (!result.success) {
        throw new Error(result.error ?? "rvGetScene failed");
      }
      if (typeof result.data !== "string") {
        throw new Error("rvGetScene returned no data");
      }

      const sceneData: StudioSceneResponse = JSON.parse(result.data);
      if (isCancelled()) return;

      loadedSceneIdRef.current = resolvedSceneId;
      pushScene(sceneData);
    },
    [resolveSceneId, pushScene]
  );

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    loadScene(isCancelled).catch((e: unknown) => {
      if (cancelled) return;
      const err = e instanceof Error ? e : new Error(String(e));
      const handler = onErrorRef.current;
      if (handler) handler(err);
      else console.error("[Studio] Failed to load scene:", err);
    });

    return () => { cancelled = true; };
  }, [sceneId, loadScene]);

  return (
    <ViroXRSceneNavigator
      ref={navigatorRef}
      arInitialScene={{ scene: LoadingARScene }}
      vrInitialScene={{ scene: LoadingVRScene }}
      worldAlignment={worldAlignment}
      autofocus={autofocus}
      style={style ?? StyleSheet.absoluteFill}
    />
  );
}
