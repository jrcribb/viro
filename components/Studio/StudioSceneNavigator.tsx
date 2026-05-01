import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroScene } from "../ViroScene";
import { ViroXRSceneNavigator } from "../ViroXRSceneNavigator";
import { isQuest } from "../Utilities/ViroPlatform";
import { VRQuestNavigatorBridge } from "../Utilities/VRQuestNavigatorBridge";
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
 */
export function StudioSceneNavigator({
  sceneId,
  worldAlignment = "Gravity",
  autofocus = true,
  style,
  onSceneReady,
  onError,
  onSceneChange,
  onExitViro,
}: StudioSceneNavigatorProps) {
  const navigatorRef = useRef<any>(null);
  const loadedSceneIdRef = useRef<string | null>(null);
  const sceneDataRef = useRef<StudioSceneResponse | null>(null);
  const [vrRelaunchTick, setVrRelaunchTick] = useState(0);

  const onSceneReadyRef = useRef(onSceneReady);
  const onErrorRef = useRef(onError);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneReadyRef.current = onSceneReady;
  onErrorRef.current = onError;
  onSceneChangeRef.current = onSceneChange;

  // On Quest relaunch: fire setVrRelaunchTick when viewTag goes null → non-null,
  // meaning VRActivity has mounted a fresh ViroVRSceneNavigator and is ready.
  useEffect(() => {
    if (!isQuest) return;
    let prevTag: number | null = VRQuestNavigatorBridge.getViewTag();
    return VRQuestNavigatorBridge.onViewTag((tag) => {
      if (prevTag === null && tag !== null) {
        setVrRelaunchTick((t) => t + 1);
      }
      prevTag = tag;
    });
  }, []);

  // On Quest: replace the top scene so the stack stays clean across relaunches.
  // On AR:    push onto the navigator stack as before.
  const applyScene = useCallback((sceneData: StudioSceneResponse) => {
    const nav = navigatorRef.current?.arSceneNavigator;
    if (!nav) return;
    const sceneEntry = {
      scene: StudioARScene,
      passProps: {
        sceneData,
        onReady: onSceneReadyRef.current,
        onSceneChange: onSceneChangeRef.current,
      },
    };
    if (isQuest) {
      nav.replace(sceneEntry);
    } else {
      nav.push(sceneEntry);
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

      // Scene already fetched — on Quest relaunch just re-apply to the fresh navigator.
      if (loadedSceneIdRef.current === resolvedSceneId) {
        if (sceneDataRef.current) applyScene(sceneDataRef.current);
        return;
      }

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
      sceneDataRef.current = sceneData;
      applyScene(sceneData);
    },
    [resolveSceneId, applyScene]
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
  }, [sceneId, loadScene, vrRelaunchTick]);

  return (
    <ViroXRSceneNavigator
      ref={navigatorRef}
      arInitialScene={{ scene: LoadingARScene }}
      vrInitialScene={{ scene: LoadingVRScene }}
      worldAlignment={worldAlignment}
      autofocus={autofocus}
      onExitViro={onExitViro}
      style={style ?? StyleSheet.absoluteFill}
    />
  );
}
