<p align="center" style="background-colour: #CCCCCC;">
  <a href="https://www.reactvision.xyz/">
    <img src="https://avatars.githubusercontent.com/u/74572641?s=200&v=4" alt="ReactVision logo" width="120px" height="120px">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@reactvision/react-viro">
    <img src="https://img.shields.io/npm/v/@reactvision/react-viro" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@reactvision/react-viro">
    <img src="https://img.shields.io/npm/dm/@reactvision/react-viro?colour=purple" alt="downloads">
  </a>
  <a href="https://discord.gg/yqqEGUjK">
    <img src="https://img.shields.io/discord/774471080713781259?label=Discord" alt="Discord">
  </a>
</p>

# ViroReact, By ReactVision

ViroReact is the most widely used open-source library for building Augmented Reality (AR) and Virtual Reality (VR) experiences with React Native. Write your app once in TypeScript and ship it natively across mobile AR and VR headsets — no new engine, no new language, no months of ramp-up.

ViroReact is MIT licensed and free forever.

## Supported Platforms

| Platform         | Support      |
| ---------------- | ------------ |
| iOS (ARKit)      | ✅ Supported |
| Android (ARCore) | ✅ Supported |
| Meta Horizon OS  | ✅ Supported |

ViroReact works with both **React Native CLI** and **Expo** projects.

## Installation

```bash
npm install @reactvision/react-viro
```

For Expo projects, the easiest way to start is to clone the official starter kit:

- **Expo + TypeScript starter kit:** <https://github.com/ReactVision/expo-starter-kit-typescript>
- **React Native CLI starter kit:** <https://github.com/ReactVision/starter-kit>

For step-by-step setup instructions, including platform-specific permissions and build configuration, see the full installation guide in the docs: <https://viro-community.readme.io/docs/installation-instructions>

## Features

ViroReact ships with a complete spatial computing toolkit out of the box — no third-party plugins, no paid add-ons.

**Tracking and anchoring**

- AR plane detection with horizontal and vertical surface anchors
- Image and object recognition triggers
- Cloud Anchors for persistent, multi-user shared AR content _(Platform feature)_
- Geospatial Anchors that pin content to real-world latitude, longitude, and altitude _(Platform feature)_

**Rendering**

- PBR lighting, HDR environment maps, and real-time shadow casting
- 360° photo and video environments
- Portal rendering for immersive pass-through experiences
- OBJ, FBX, and GLTF/GLB model loading with embedded animations
- Custom procedural geometry and custom GPU shaders

**Interaction and motion**

- Built-in physics engine with dynamic and static bodies, collision callbacks
- Particle system for fire, smoke, rain, snow, confetti, and other effects
- Declarative animation system with sequencing and chaining
- Full input event system: tap, drag, pinch, rotate, fuse, hover

**Audio**

- Spatial audio, 360° sound fields, and positioned 3D audio

## Platform Features

Cloud Anchors, Geospatial Anchors, and AI-powered 3D asset creation are powered by **ReactVision Platform** — managed cloud infrastructure built directly into ViroReact. Add your `rvApiKey` and `rvProjectId` and the platform handles hosting, resolution, and geospatial infrastructure for you.

You can get a Studio account, which includes Platform access, for free at <https://studio.reactvision.xyz>.

- Cloud Anchors guide: <https://viro-community.readme.io/docs/cloud-anchors>
- Geospatial Anchors guide: <https://viro-community.readme.io/docs/geospatial-anchors>

## Documentation

- Full API reference and guides: <https://viro-community.readme.io/docs/overview>
- Getting started tutorial: <https://updates.reactvision.xyz/get-started-with-the-viroreact-and-expo-starter-kit-a9ca88803e5a>

## Community

Discord is the best place to find the team and other developers building with ViroReact:

<a href="https://discord.gg/A6TaFNqwVc">
  <img src="https://discordapp.com/api/guilds/774471080713781259/widget.png?style=banner2" />
</a>

## Enterprise Support and Partners

For teams adopting XR at scale, the ReactVision team works directly with you on architecture, migrations from 8th Wall or Unity, performance audits, and shipping production experiences. <https://reactvision.xyz/contact>

For independent agencies and consultants vetted by the ReactVision team: <https://reactvision.xyz/partners>

## Supporters

A huge thank you to everyone who supports ongoing development by sponsoring us on GitHub: <https://github.com/sponsors/ReactVision>

- [Device Cloud](https://devicecloud.dev/)
- [Looking Glass](http://looking-glass.space)
- [@lentesta](https://github.com/lentesta)

## Powered by

[![JetBrains logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jetbrains.svg)](https://jb.gg/OpenSource)

JetBrains supports ViroReact development through their [Open Source program](https://jb.gg/OpenSource).

## Find Out More

- Website: <https://reactvision.xyz>
- ViroReact: <https://reactvision.xyz/viro-react>
- ReactVision Studio: <https://studio.reactvision.xyz>
- Blog: <https://updates.reactvision.xyz>

## A little history…

ViroReact was originally developed by Viro Media and open-sourced in 2019. In late 2020, the Viro Community formed to maintain and modernise the project, keeping it compatible with current React Native versions. In January 2025, Morrow Digital acquired the project to invest in its future, and in late 2025 ReactVision was spun out as an independent company with a full-time team building the next generation of XR tooling.

---

MIT licensed. © ReactVision, Inc.
