import * as React from "react";
import { AppState, NativeModules, ViewProps } from "react-native";
import { ViroARSceneNavigator } from "./AR/ViroARSceneNavigator";
import { isQuest } from "./Utilities/ViroPlatform";
import { VRQuestNavigatorBridge } from "./Utilities/VRQuestNavigatorBridge";

const VRLauncher = NativeModules.VRLauncher as
  | { launchVRScene?: () => void }
  | undefined;

type SceneFactory = { scene: () => React.JSX.Element };

type Props = ViewProps & {
  /**
   * Scene used on both AR and VR platforms when no platform-specific scene is provided.
   * Most apps want a different scene per platform — pass `arInitialScene` and
   * `vrInitialScene` instead in that case.
   */
  initialScene?: SceneFactory;

  /** Scene mounted on iOS / non-Quest Android (rendered via ViroARSceneNavigator). */
  arInitialScene?: SceneFactory;

  /**
   * Scene mounted on Meta Quest (rendered via ViroVRSceneNavigator in VRActivity).
   * On Quest, this scene is forwarded to VRActivity via VRQuestNavigatorBridge
   * rather than rendered inline, because OpenXR exclusive display requires the
   * VR intent category on the host Activity.
   */
  vrInitialScene?: SceneFactory;

  // ── Forwarded to ViroARSceneNavigator ──────────────────────────────────────
  worldAlignment?: "Gravity" | "GravityAndHeading" | "Camera";
  autofocus?: boolean;
  videoQuality?: "High" | "Low";
  numberOfTrackedImages?: number;

  // ── Forwarded to ViroVRSceneNavigator (Quest path via bridge) ──────────────
  vrModeEnabled?: boolean;
  passthroughEnabled?: boolean;
  handTrackingEnabled?: boolean;
  onExitViro?: () => void;

  // ── Common ─────────────────────────────────────────────────────────────────
  viroAppProps?: any;
  hdrEnabled?: boolean;
  pbrEnabled?: boolean;
  bloomEnabled?: boolean;
  shadowsEnabled?: boolean;
  multisamplingEnabled?: boolean;
  debug?: boolean;
};

/**
 * Cross-reality scene navigator. Picks the right underlying navigator at runtime:
 *
 *  - **iOS / non-Quest Android** → `ViroARSceneNavigator` (rendered inline)
 *  - **Meta Quest** → launches VRActivity via `VRLauncher.launchVRScene()` and
 *    forwards all navigator operations (push/pop/etc.) to the
 *    `ViroVRSceneNavigator` running there via `VRQuestNavigatorBridge`.
 *    Render output is null — VRActivity owns the display.
 *
 * Pass `arInitialScene` / `vrInitialScene` when the AR and VR scenes differ.
 * When only `initialScene` is provided it is used for both modes.
 *
 * Renderer flags (`hdrEnabled`, `pbrEnabled`, `bloomEnabled`, `shadowsEnabled`,
 * `passthroughEnabled`, etc.) are forwarded to ViroVRSceneNavigator on Quest
 * via the intent bridge.
 */
export const ViroXRSceneNavigator = React.forwardRef<unknown, Props>(
  function ViroXRSceneNavigator(props, ref) {
    const {
      initialScene,
      arInitialScene,
      vrInitialScene,
      // VR-only renderer config — forwarded via bridge on Quest
      hdrEnabled,
      pbrEnabled,
      bloomEnabled,
      shadowsEnabled,
      multisamplingEnabled,
      vrModeEnabled,
      passthroughEnabled,
      handTrackingEnabled,
      onExitViro,
      debug,
      ...rest
    } = props;

    // Inner ref used on the AR path to capture the ViroARSceneNavigator instance.
    const arRef = React.useRef<ViroARSceneNavigator>(null);

    // Expose navigator interface on the ref.
    // Quest: proxy push/pop/etc. through VRQuestNavigatorBridge to VRActivity.
    // AR:    expose the underlying ViroARSceneNavigator instance directly.
    React.useImperativeHandle(ref, () => {
      if (isQuest) {
        const bridgeNav = {
          push:    (scene: any) => VRQuestNavigatorBridge.dispatchOp({ type: "push",    scene }),
          replace: (scene: any) => VRQuestNavigatorBridge.dispatchOp({ type: "replace", scene }),
          jump:    (scene: any) => VRQuestNavigatorBridge.dispatchOp({ type: "jump",    scene }),
          pop:     ()           => VRQuestNavigatorBridge.dispatchOp({ type: "pop"              }),
          popN:    (n: number)  => VRQuestNavigatorBridge.dispatchOp({ type: "popN",   n       }),
        };
        return { sceneNavigator: bridgeNav, arSceneNavigator: bridgeNav };
      }
      return arRef.current as any;
    }, []);

    // Track AppState so we can detect background → active transitions.
    const appStateRef = React.useRef(AppState.currentState);

    // On Quest: register the intent (scene + renderer config) then launch VRActivity.
    // Also re-launch when the app returns from background (e.g. Quest system menu),
    // because VRActivity auto-finishes when MainActivity resumes.
    React.useEffect(() => {
      if (!isQuest) return;
      const scene = vrInitialScene ?? initialScene;
      if (scene) {
        VRQuestNavigatorBridge.setIntent(scene, {
          hdrEnabled,
          pbrEnabled,
          bloomEnabled,
          shadowsEnabled,
          multisamplingEnabled,
          vrModeEnabled,
          passthroughEnabled,
          handTrackingEnabled,
          onExitViro,
          debug,
        });
      }
      VRQuestNavigatorBridge.setVRActive(true);
      VRLauncher?.launchVRScene?.();

      const sub = AppState.addEventListener("change", (nextState) => {
        const prev = appStateRef.current;
        appStateRef.current = nextState;
        // Re-launch VR when the app returns from being backgrounded by the system
        // (Quest menu, home, recents). Explicit exitVRScene() clears isVRActive()
        // before finishing VRActivity, so Activity-transition-driven background→active
        // cycles are ignored here.
        if (prev !== "active" && nextState === "active" && VRQuestNavigatorBridge.isVRActive()) {
          VRQuestNavigatorBridge.setVRActive(true);
          VRLauncher?.launchVRScene?.();
        }
      });
      return () => sub.remove();
    }, []);

    // Quest renders nothing here — VRActivity owns the display.
    if (isQuest) return null;

    const scene = arInitialScene ?? initialScene;
    if (!scene) {
      console.warn(
        "[Viro] ViroXRSceneNavigator requires `arInitialScene` or `initialScene`."
      );
      return null;
    }
    return (
      <ViroARSceneNavigator
        ref={arRef}
        initialScene={scene}
        {...rest}
      />
    );
  }
);
