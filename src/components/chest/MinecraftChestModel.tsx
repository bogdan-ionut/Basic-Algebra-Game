import React, { useMemo } from 'react';
import '@google/model-viewer';

type MinecraftChestModelProps = {
  filled: number;
  total: number;
};

const modelSrcFromEnv = (import.meta.env.VITE_MINECRAFT_CHEST_MODEL_URL as string | undefined)?.trim();

export const MINECRAFT_CHEST_MODEL_SRC = modelSrcFromEnv && modelSrcFromEnv.length > 0
  ? modelSrcFromEnv
  : `${import.meta.env.BASE_URL}assets/minecraft-faithful/models/chest.glb`;

export function MinecraftChestModel({ filled, total }: MinecraftChestModelProps) {
  const progress = Math.min(Math.max(total > 0 ? filled / total : 0, 0), 1);
  const exposure = useMemo(() => 1 + progress * 0.25, [progress]);

  return (
    <div className="absolute inset-x-5 top-1 bottom-7 rounded-xl border-4 border-[#0a0f17] bg-[radial-gradient(circle_at_50%_20%,rgba(31,72,115,0.55),rgba(2,7,15,0.95))] shadow-[inset_0_0_0_3px_#1a3959,0_14px_24px_rgba(0,0,0,0.55)] overflow-hidden">
      <model-viewer
        src={MINECRAFT_CHEST_MODEL_SRC}
        camera-controls
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="18deg"
        camera-orbit="35deg 70deg 105%"
        min-camera-orbit="auto auto 80%"
        max-camera-orbit="auto auto 140%"
        field-of-view="26deg"
        shadow-intensity="1"
        exposure={exposure.toFixed(2)}
        interaction-prompt="none"
        touch-action="pan-y"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
