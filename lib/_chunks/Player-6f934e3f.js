var _templateObject, _templateObject2, _templateObject3;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import MuxVideo from '@mux/mux-video-react';
import { Dialog, Stack, Button, Text, Card } from '@sanity/ui';
import { MediaControlBar, MediaPosterImage, MediaController, MediaLoadingIndicator, MediaPlayButton, MediaMuteButton, MediaTimeDisplay, MediaTimeRange, MediaDurationDisplay, MediaFullscreenButton } from 'media-chrome/dist/react';
import { useCallback, useId, useMemo, useState, useRef, useEffect } from 'react';
import { PatchEvent, unset } from 'sanity';
import { useClient, deleteAsset, getPlaybackId, getPlaybackPolicy, generateJwt, VideoThumbnail, getPosterSrc, UploadProgress } from './index-27150740.js';
import { getDevicePixelRatio } from 'use-device-pixel-ratio';
import styled from 'styled-components';
const useCancelUpload = (asset, onChange) => {
  const client = useClient();
  return useCallback(() => {
    if (!asset) {
      return;
    }
    onChange(PatchEvent.from(unset()));
    if (asset.assetId) {
      deleteAsset(client, asset.assetId);
    }
    if (asset._id) {
      client.delete(asset._id);
    }
  }, [asset, client, onChange]);
};
function getVideoSrc(_ref) {
  let {
    asset,
    client
  } = _ref;
  const playbackId = getPlaybackId(asset);
  const searchParams = new URLSearchParams();
  if (getPlaybackPolicy(asset) === "signed") {
    const token = generateJwt(client, playbackId, "v");
    searchParams.set("token", token);
  }
  return "https://stream.mux.com/".concat(playbackId, ".m3u8?").concat(searchParams);
}
var name = "sanity-plugin-mux-input";
var version = "2.1.1";
var description = "An input component that integrates Sanity Studio with Mux video encoding/hosting service.";
var keywords = ["sanity", "video", "mux", "input", "plugin", "sanity-plugin", "media"];
var homepage = "https://github.com/sanity-io/sanity-plugin-mux-input#readme";
var bugs = {
  url: "https://github.com/sanity-io/sanity-plugin-mux-input/issues"
};
var repository = {
  type: "git",
  url: "git@github.com:sanity-io/sanity-plugin-mux-input.git"
};
var license = "MIT";
var author = "Sanity.io <hello@sanity.io>";
var sideEffects = false;
var type = "module";
var exports = {
  ".": {
    types: "./lib/index.d.ts",
    source: "./src/index.ts",
    require: "./lib/index.cjs",
    node: {
      "import": "./lib/index.cjs.js",
      require: "./lib/index.cjs"
    },
    "import": "./lib/index.js",
    "default": "./lib/index.js"
  },
  "./package.json": "./package.json"
};
var main = "./lib/index.cjs";
var module = "./lib/index.js";
var source = "./src/index.ts";
var types = "./lib/index.d.ts";
var files = ["src", "lib", "sanity.json", "v2-incompatible.js"];
var scripts = {
  build: "run-s clean && plugin-kit verify-package --silent && pkg-utils build --strict && pkg-utils --strict",
  clean: "rimraf lib",
  dev: "next dev",
  format: "prettier --write --cache --ignore-unknown .",
  "link-watch": "plugin-kit link-watch",
  lint: "eslint .",
  prepare: "husky install || true",
  prepublishOnly: "run-s build",
  test: "npm run lint && npm run type-check && npm run build",
  "type-check": "tsc --noEmit",
  watch: "pkg-utils watch --strict"
};
var dependencies = {
  "@mux/mux-video-react": "^0.7.7",
  "@mux/upchunk": "^3",
  "@sanity/icons": "^2",
  "@sanity/incompatible-plugin": "^1",
  "@sanity/ui": "^1",
  "@sanity/uuid": "^3",
  classnames: "^2.3.2",
  "jsonwebtoken-esm": "^1.0.5",
  "media-chrome": "^0.21.0",
  motion: "^10",
  rxjs: "^7",
  "scroll-into-view-if-needed": "^3",
  "suspend-react": "^0.0.10",
  swr: "^2.1.0",
  "use-device-pixel-ratio": "^1.1.2",
  "use-error-boundary": "^2.0.6"
};
var devDependencies = {
  "@commitlint/cli": "^17.4.4",
  "@commitlint/config-conventional": "^17.4.4",
  "@sanity/pkg-utils": "^2.2.13",
  "@sanity/plugin-kit": "^3.1.7",
  "@sanity/semantic-release-preset": "^4.0.0",
  "@sanity/vision": "^3.6.0",
  "@types/react": "^18.0.28",
  "@types/styled-components": "^5.1.26",
  "@typescript-eslint/eslint-plugin": "^5.54.1",
  "@typescript-eslint/parser": "^5.54.1",
  "cz-conventional-changelog": "^3.3.0",
  eslint: "^8.36.0",
  "eslint-config-prettier": "^8.7.0",
  "eslint-config-react-app": "^7.0.1",
  "eslint-config-sanity": "^6.0.0",
  "eslint-plugin-import": "^2.27.5",
  "eslint-plugin-prettier": "^4.2.1",
  "eslint-plugin-react": "^7.32.2",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-simple-import-sort": "^10.0.0",
  husky: "^8.0.3",
  "lint-staged": "^13.2.0",
  next: "^13.2.4",
  "next-sanity": "^4.1.5",
  "npm-run-all": "^4.1.5",
  prettier: "^2.8.4",
  "prettier-plugin-packagejson": "^2.4.3",
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  "react-is": "^18.2.0",
  rimraf: "^5.0.0",
  sanity: "^3.6.0",
  "styled-components": "^5.3.9",
  "type-fest": "^3.6.1",
  typescript: "^5.0.2"
};
var peerDependencies = {
  react: "^18",
  sanity: "^3",
  "styled-components": "^5.2"
};
var engines = {
  node: ">=14"
};
var publishConfig = {
  access: "public"
};
var sanityExchangeUrl = "https://www.sanity.io/plugins/sanity-plugin-mux-input";
var pluginPkg = {
  name: name,
  version: version,
  description: description,
  keywords: keywords,
  homepage: homepage,
  bugs: bugs,
  repository: repository,
  license: license,
  author: author,
  sideEffects: sideEffects,
  type: type,
  exports: exports,
  main: main,
  module: module,
  source: source,
  types: types,
  files: files,
  scripts: scripts,
  dependencies: dependencies,
  devDependencies: devDependencies,
  peerDependencies: peerDependencies,
  engines: engines,
  publishConfig: publishConfig,
  sanityExchangeUrl: sanityExchangeUrl
};
function EditThumbnailDialog(_ref2) {
  let {
    asset,
    getCurrentTime,
    setDialogState
  } = _ref2;
  const client = useClient();
  const dialogId = "EditThumbnailDialog".concat(useId());
  const nextTime = useMemo(() => getCurrentTime(), [getCurrentTime]);
  const assetWithNewThumbnail = useMemo(() => ({
    ...asset,
    thumbTime: nextTime
  }), [asset, nextTime]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSave = useCallback(() => {
    setSaving(true);
    client.patch(asset._id).set({
      thumbTime: nextTime
    }).commit({
      returnDocuments: false
    }).then(() => void setDialogState(false)).catch(setError).finally(() => void setSaving(false));
  }, [client, asset._id, nextTime, setDialogState]);
  const width = 300 * getDevicePixelRatio({
    maxDpr: 2
  });
  if (error) {
    throw error;
  }
  return /* @__PURE__ */jsx(Dialog, {
    id: dialogId,
    header: "Edit thumbnail",
    onClose: () => setDialogState(false),
    footer: /* @__PURE__ */jsx(Stack, {
      padding: 3,
      children: /* @__PURE__ */jsx(Button, {
        mode: "ghost",
        tone: "primary",
        loading: saving,
        onClick: handleSave,
        text: "Set new thumbnail"
      }, "thumbnail")
    }),
    children: /* @__PURE__ */jsxs(Stack, {
      space: 3,
      padding: 3,
      children: [/* @__PURE__ */jsxs(Stack, {
        space: 2,
        children: [/* @__PURE__ */jsx(Text, {
          size: 1,
          weight: "semibold",
          children: "Current:"
        }), /* @__PURE__ */jsx(VideoThumbnail, {
          asset,
          width
        })]
      }), /* @__PURE__ */jsxs(Stack, {
        space: 2,
        children: [/* @__PURE__ */jsx(Text, {
          size: 1,
          weight: "semibold",
          children: "New:"
        }), /* @__PURE__ */jsx(VideoThumbnail, {
          asset: assetWithNewThumbnail,
          width
        })]
      })]
    })
  });
}
function getStoryboardSrc(_ref3) {
  let {
    asset,
    client
  } = _ref3;
  const playbackId = getPlaybackId(asset);
  const searchParams = new URLSearchParams();
  if (getPlaybackPolicy(asset) === "signed") {
    const token = generateJwt(client, playbackId, "s");
    searchParams.set("token", token);
  }
  return "https://image.mux.com/".concat(playbackId, "/storyboard.vtt?").concat(searchParams);
}
const VideoContainer = styled(Card)(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  position: relative;\n  min-height: 150px;\n  aspect-ratio: 16 / 9;\n  overflow: hidden;\n  border-radius: 1px;\n  media-airplay-button[media-airplay-unavailable] {\n    display: none;\n  }\n  media-volume-range[media-volume-unavailable] {\n    display: none;\n  }\n  media-pip-button[media-pip-unavailable] {\n    display: none;\n  }\n  media-controller {\n    --media-control-background: transparent;\n    --media-control-hover-background: transparent;\n    --media-range-track-background-color: rgba(255, 255, 255, 0.5);\n    --media-range-track-border-radius: 3px;\n    width: 100%;\n    height: 100%;\n    background-color: transparent;\n  }\n  media-control-bar {\n    --media-button-icon-width: 18px;\n    --media-preview-time-margin: 0px;\n  }\n  media-control-bar:not([slot]) :is([role='button'], [role='switch'], button) {\n    height: 44px;\n  }\n  .size-extra-small media-control-bar [role='button'],\n  .size-extra-small media-control-bar [role='switch'] {\n    height: auto;\n    padding: 4.4% 3.2%;\n  }\n  .mxp-spacer {\n    flex-grow: 1;\n    height: 100%;\n    background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));\n  }\n  media-controller::part(vertical-layer) {\n    transition: background-color 1s;\n  }\n  media-controller:is([media-paused], :not([user-inactive]))::part(vertical-layer) {\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: background-color 0.25s;\n  }\n  .mxp-center-controls {\n    --media-background-color: transparent;\n    --media-button-icon-width: 100%;\n    --media-button-icon-height: auto;\n    pointer-events: none;\n    width: 100%;\n    display: flex;\n    flex-flow: row;\n    align-items: center;\n    justify-content: center;\n  }\n  .mxp-center-controls media-play-button {\n    --media-control-background: transparent;\n    --media-control-hover-background: transparent;\n    padding: 0;\n    width: max(27px, min(9%, 90px));\n  }\n  .mxp-center-controls media-seek-backward-button,\n  .mxp-center-controls media-seek-forward-button {\n    --media-control-background: transparent;\n    --media-control-hover-background: transparent;\n    padding: 0;\n    margin: 0 10%;\n    width: min(7%, 70px);\n  }\n  media-loading-indicator {\n    --media-loading-icon-width: 100%;\n    --media-button-icon-height: auto;\n    pointer-events: none;\n    position: absolute;\n    width: min(15%, 150px);\n    display: flex;\n    flex-flow: row;\n    align-items: center;\n    justify-content: center;\n  }\n  /* Intentionally don't target the div for transition but the children\n of the div. Prevents messing with media-chrome's autohide feature. */\n  media-loading-indicator + div * {\n    transition: opacity 0.15s;\n    opacity: 1;\n  }\n  media-loading-indicator[media-loading]:not([media-paused]) ~ div > * {\n    opacity: 0;\n    transition-delay: 400ms;\n  }\n  media-volume-range {\n    width: min(100%, 100px);\n  }\n  media-time-display {\n    white-space: nowrap;\n  }\n  :is(media-time-display, media-text-display, media-playback-rate-button) {\n    color: inherit;\n  }\n  media-controller:fullscreen media-control-bar[slot='top-chrome'] {\n    /* Hide menus and buttons that trigger modals when in full-screen */\n    display: none;\n  }\n  video {\n    background: transparent;\n  }\n  media-controller:not(:fullscreen) video {\n    aspect-ratio: 16 / 9;\n  }\n  media-controller:not(:-webkit-full-screen) video {\n    aspect-ratio: 16 / 9;\n  }\n"])));
const StyledCenterControls = styled.div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n  && {\n    --media-background-color: transparent;\n    --media-button-icon-width: 100%;\n    --media-button-icon-height: auto;\n    pointer-events: none;\n    width: 100%;\n    display: flex;\n    flex-flow: row;\n    align-items: center;\n    justify-content: center;\n    media-play-button {\n      --media-control-background: transparent;\n      --media-control-hover-background: transparent;\n      padding: 0;\n      width: max(27px, min(9%, 90px));\n    }\n  }\n"])));
const TopControls = styled(MediaControlBar)(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n  justify-content: flex-end;\n  button {\n    height: auto;\n  }\n"])));
function PosterImage(_ref4) {
  let {
    asset
  } = _ref4;
  const client = useClient();
  const ref = useRef(null);
  const src = useMemo(() => getPosterSrc({
    client,
    asset,
    width: 1920,
    height: 1080
  }), [client, asset]);
  useEffect(() => {
    var _a;
    if (ref.current) {
      const style = document.createElement("style");
      style.innerHTML = "img { object-fit: contain; }";
      if ((_a = ref.current) == null ? void 0 : _a.shadowRoot) {
        ref.current.shadowRoot.appendChild(style);
      }
    }
  }, []);
  return /* @__PURE__ */jsx(MediaPosterImage, {
    ref,
    slot: "poster",
    src
  });
}
function ThumbnailsMetadataTrack(_ref5) {
  let {
    asset
  } = _ref5;
  const client = useClient();
  const [src] = useState(() => getStoryboardSrc({
    asset,
    client
  }));
  return /* @__PURE__ */jsx("track", {
    label: "thumbnails",
    default: true,
    kind: "metadata",
    src
  });
}
const MuxVideoOld = _ref6 => {
  let {
    asset,
    buttons,
    readOnly,
    onChange,
    dialogState,
    setDialogState
  } = _ref6;
  var _a, _b, _c, _d;
  const client = useClient();
  const isLoading = useMemo(() => {
    if ((asset == null ? void 0 : asset.status) === "preparing") {
      return "Preparing the video";
    }
    if ((asset == null ? void 0 : asset.status) === "waiting_for_upload") {
      return "Waiting for upload to start";
    }
    if ((asset == null ? void 0 : asset.status) === "waiting") {
      return "Processing upload";
    }
    if ((asset == null ? void 0 : asset.status) === "ready") {
      return false;
    }
    if (typeof (asset == null ? void 0 : asset.status) === "undefined") {
      return false;
    }
    return true;
  }, [asset]);
  const isPreparingStaticRenditions = useMemo(() => {
    var _a2, _b2, _c2, _d2;
    if (((_b2 = (_a2 = asset == null ? void 0 : asset.data) == null ? void 0 : _a2.static_renditions) == null ? void 0 : _b2.status) === "preparing") {
      return true;
    }
    if (((_d2 = (_c2 = asset == null ? void 0 : asset.data) == null ? void 0 : _c2.static_renditions) == null ? void 0 : _d2.status) === "ready") {
      return false;
    }
    return false;
  }, [(_b = (_a = asset == null ? void 0 : asset.data) == null ? void 0 : _a.static_renditions) == null ? void 0 : _b.status]);
  const videoSrc = useMemo(() => asset.playbackId && getVideoSrc({
    client,
    asset
  }), [asset, client]);
  const [error, setError] = useState(null);
  const handleError = useCallback(event => setError(event.currentTarget.error), []);
  const playRef = useRef(null);
  const muteRef = useRef(null);
  const video = useRef(null);
  const getCurrentTime = useCallback(() => {
    var _a2, _b2;
    return (_b2 = (_a2 = video.current) == null ? void 0 : _a2.currentTime) != null ? _b2 : 0;
  }, [video]);
  const handleCancelUpload = useCancelUpload(asset, onChange);
  useEffect(() => {
    var _a2, _b2;
    const style = document.createElement("style");
    style.innerHTML = "button svg { vertical-align: middle; }";
    if ((_a2 = playRef.current) == null ? void 0 : _a2.shadowRoot) {
      playRef.current.shadowRoot.appendChild(style);
    }
    if ((_b2 = muteRef == null ? void 0 : muteRef.current) == null ? void 0 : _b2.shadowRoot) {
      muteRef.current.shadowRoot.appendChild(style.cloneNode(true));
    }
  }, []);
  useEffect(() => {
    var _a2, _b2, _c2;
    if ((asset == null ? void 0 : asset.status) === "errored") {
      handleCancelUpload();
      throw new Error((_c2 = (_b2 = (_a2 = asset.data) == null ? void 0 : _a2.errors) == null ? void 0 : _b2.messages) == null ? void 0 : _c2.join(" "));
    }
  }, [(_d = (_c = asset.data) == null ? void 0 : _c.errors) == null ? void 0 : _d.messages, asset == null ? void 0 : asset.status, handleCancelUpload]);
  const signedToken = useMemo(() => {
    try {
      const url = new URL(videoSrc);
      return url.searchParams.get("token");
    } catch {
      return false;
    }
  }, [videoSrc]);
  if (error) {
    throw error;
  }
  if (!asset || !asset.status) {
    return null;
  }
  if (isLoading) {
    return /* @__PURE__ */jsx(UploadProgress, {
      progress: 100,
      filename: asset == null ? void 0 : asset.filename,
      text: isLoading !== true && isLoading || "Waiting for Mux to complete the file",
      onCancel: readOnly ? void 0 : () => handleCancelUpload()
    });
  }
  return /* @__PURE__ */jsxs(Fragment, {
    children: [/* @__PURE__ */jsxs(VideoContainer, {
      shadow: 1,
      tone: "transparent",
      scheme: "dark",
      children: [/* @__PURE__ */jsxs(MediaController, {
        children: [/* @__PURE__ */jsx(MuxVideo, {
          playsInline: true,
          ref: video,
          playbackId: "".concat(asset.playbackId).concat(signedToken ? "?token=".concat(signedToken) : ""),
          onError: handleError,
          slot: "media",
          preload: "metadata",
          crossOrigin: "anonymous",
          metadata: {
            player_name: "Sanity Admin Dashboard",
            player_version: pluginPkg.version,
            page_type: "Preview Player"
          },
          children: /* @__PURE__ */jsx(ThumbnailsMetadataTrack, {
            asset
          })
        }), /* @__PURE__ */jsx(PosterImage, {
          asset
        }), /* @__PURE__ */jsx(MediaLoadingIndicator, {
          slot: "centered-chrome",
          noAutoHide: true
        }), /* @__PURE__ */jsx(StyledCenterControls, {
          slot: "centered-chrome",
          children: /* @__PURE__ */jsx(MediaPlayButton, {})
        }), buttons && /* @__PURE__ */jsx(TopControls, {
          slot: "top-chrome",
          children: buttons
        }), /* @__PURE__ */jsxs(MediaControlBar, {
          children: [/* @__PURE__ */jsx(MediaMuteButton, {}), /* @__PURE__ */jsx(MediaTimeDisplay, {}), /* @__PURE__ */jsx(MediaTimeRange, {}), /* @__PURE__ */jsx(MediaDurationDisplay, {}), /* @__PURE__ */jsx(MediaFullscreenButton, {})]
        })]
      }), isPreparingStaticRenditions && /* @__PURE__ */jsx(Card, {
        padding: 2,
        radius: 1,
        style: {
          background: "var(--card-fg-color)",
          position: "absolute",
          top: "0.5em",
          left: "0.5em"
        },
        children: /* @__PURE__ */jsx(Text, {
          size: 1,
          style: {
            color: "var(--card-bg-color)"
          },
          children: "MUX is preparing static renditions, please stand by"
        })
      })]
    }), dialogState === "edit-thumbnail" && /* @__PURE__ */jsx(EditThumbnailDialog, {
      asset,
      getCurrentTime,
      setDialogState
    })]
  });
};
export { MuxVideoOld as default };
//# sourceMappingURL=Player-6f934e3f.js.map
