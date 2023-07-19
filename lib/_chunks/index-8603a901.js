var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15, _templateObject16, _templateObject17, _templateObject18, _templateObject19, _templateObject20, _templateObject21, _templateObject22;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { useDocumentValues, isReference, useClient as useClient$1, useProjectId, useDataset, MediaPreview, PatchEvent, setIfMissing, set, unset, LinearProgress, definePlugin } from 'sanity';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { useState, useMemo, memo, Suspense, useRef, useLayoutEffect, useId, useCallback, useEffect, isValidElement, createElement, forwardRef, lazy, Component, useReducer } from 'react';
import useSWR from 'swr';
import { Observable, defer, concat, of, throwError, from, Subject } from 'rxjs';
import { switchMap, mergeMap, catchError, mergeMapTo, takeUntil, tap } from 'rxjs/operators';
import { uuid } from '@sanity/uuid';
import { UpChunk } from '@mux/upchunk';
import { Card, Box, Spinner, Grid, Inline, useClickOutside, MenuButton, Button, Menu, MenuItem, useToast, Dialog, Stack, Flex, Checkbox, Text, Tooltip, Popover, Label as Label$1, MenuDivider, rem, Code, TextInput, Heading } from '@sanity/ui';
import { UnknownIcon, LockIcon, EllipsisVerticalIcon, TrashIcon, DownloadIcon, EditIcon, UploadIcon, SearchIcon, PlugIcon, ResetIcon, DocumentVideoIcon } from '@sanity/icons';
import { animate } from 'motion';
import styled, { css } from 'styled-components';
import { getDevicePixelRatio } from 'use-device-pixel-ratio';
import { suspend, clear, preload } from 'suspend-react';
import { useErrorBoundary } from 'use-error-boundary';
import scrollIntoView from 'scroll-into-view-if-needed';
const path$1 = ["assetId", "data", "playbackId", "status", "thumbTime", "filename"];
const useAssetDocumentValues = asset => useDocumentValues(isReference(asset) ? asset._ref : "", path$1);
function useClient() {
  return useClient$1({
    apiVersion: "2022-09-14"
  });
}
function useDialogState() {
  return useState(false);
}
const useMuxPolling = asset => {
  var _a, _b;
  const client = useClient();
  const projectId = useProjectId();
  const dataset = useDataset();
  const shouldFetch = useMemo(() => {
    var _a2, _b2;
    return !!(asset == null ? void 0 : asset.assetId) && ((asset == null ? void 0 : asset.status) === "preparing" || ((_b2 = (_a2 = asset == null ? void 0 : asset.data) == null ? void 0 : _a2.static_renditions) == null ? void 0 : _b2.status) === "preparing");
  }, [asset == null ? void 0 : asset.assetId, (_b = (_a = asset == null ? void 0 : asset.data) == null ? void 0 : _a.static_renditions) == null ? void 0 : _b.status, asset == null ? void 0 : asset.status]);
  return useSWR(shouldFetch ? "/".concat(projectId, "/addons/mux/assets/").concat(dataset, "/data/").concat(asset == null ? void 0 : asset.assetId) : null, async () => {
    const {
      data
    } = await client.request({
      url: "/addons/mux/assets/".concat(dataset, "/data/").concat(asset.assetId),
      withCredentials: true,
      method: "GET"
    });
    client.patch(asset._id).set({
      status: data.status,
      data
    }).commit({
      returnDocuments: false
    });
  }, {
    refreshInterval: 2e3,
    refreshWhenHidden: true,
    dedupingInterval: 1e3
  });
};
const name = "mux-input";
const cacheNs = "sanity-plugin-mux-input";
const muxSecretsDocumentId = "secrets.mux";
const path = ["token", "secretKey", "enableSignedUrls", "signingKeyId", "signingKeyPrivate"];
const useSecretsDocumentValues = () => {
  const {
    error,
    isLoading,
    value
  } = useDocumentValues(muxSecretsDocumentId, path);
  const cache = useMemo(() => {
    const exists = Boolean(value);
    const secrets = {
      token: (value == null ? void 0 : value.token) || null,
      secretKey: (value == null ? void 0 : value.secretKey) || null,
      enableSignedUrls: (value == null ? void 0 : value.enableSignedUrls) || false,
      signingKeyId: (value == null ? void 0 : value.signingKeyId) || null,
      signingKeyPrivate: (value == null ? void 0 : value.signingKeyPrivate) || null
    };
    return {
      isInitialSetup: !exists,
      needsSetup: !(secrets == null ? void 0 : secrets.token) || !(secrets == null ? void 0 : secrets.secretKey),
      secrets
    };
  }, [value]);
  return {
    error,
    isLoading,
    value: cache
  };
};
function createUpChunkObservable(uuid, uploadUrl, source) {
  return new Observable(subscriber => {
    const upchunk = UpChunk.createUpload({
      endpoint: uploadUrl,
      file: source,
      dynamicChunkSize: true
      // changes the chunk size based on network speeds
    });

    const successHandler = () => {
      subscriber.next({
        type: "success",
        id: uuid
      });
      subscriber.complete();
    };
    const errorHandler = data => subscriber.error(new Error(data.detail.message));
    const progressHandler = data => {
      return subscriber.next({
        type: "progress",
        percent: data.detail
      });
    };
    const offlineHandler = () => {
      upchunk.pause();
      subscriber.next({
        type: "pause",
        id: uuid
      });
    };
    const onlineHandler = () => {
      upchunk.resume();
      subscriber.next({
        type: "resume",
        id: uuid
      });
    };
    upchunk.on("success", successHandler);
    upchunk.on("error", errorHandler);
    upchunk.on("progress", progressHandler);
    upchunk.on("offline", offlineHandler);
    upchunk.on("online", onlineHandler);
    return () => upchunk.abort();
  });
}
function deleteAsset(client, assetId) {
  const {
    dataset
  } = client.config();
  return client.request({
    url: "/addons/mux/assets/".concat(dataset, "/").concat(assetId),
    withCredentials: true,
    method: "DELETE"
  });
}
function getAsset(client, assetId) {
  const {
    dataset
  } = client.config();
  return client.request({
    url: "/addons/mux/assets/".concat(dataset, "/data/").concat(assetId),
    withCredentials: true,
    method: "GET"
  });
}
function saveSecrets(client, token, secretKey, enableSignedUrls, signingKeyId, signingKeyPrivate) {
  const doc = {
    _id: "secrets.mux",
    _type: "mux.apiKey",
    token,
    secretKey,
    enableSignedUrls,
    signingKeyId,
    signingKeyPrivate
  };
  return client.createOrReplace(doc);
}
function createSigningKeys(client) {
  const {
    dataset
  } = client.config();
  return client.request({
    url: "/addons/mux/signing-keys/".concat(dataset),
    withCredentials: true,
    method: "POST"
  });
}
function testSecrets(client) {
  const {
    dataset
  } = client.config();
  return client.request({
    url: "/addons/mux/secrets/".concat(dataset, "/test"),
    withCredentials: true,
    method: "GET"
  });
}
async function haveValidSigningKeys(client, signingKeyId, signingKeyPrivate) {
  if (!(signingKeyId && signingKeyPrivate)) {
    return false;
  }
  const {
    dataset
  } = client.config();
  try {
    const res = await client.request({
      url: "/addons/mux/signing-keys/".concat(dataset, "/").concat(signingKeyId),
      withCredentials: true,
      method: "GET"
    });
    return !!(res.data && res.data.id);
  } catch (e) {
    console.error("Error fetching signingKeyId", signingKeyId, "assuming it is not valid");
    return false;
  }
}
function testSecretsObservable(client) {
  const {
    dataset
  } = client.config();
  return defer(() => client.observable.request({
    url: "/addons/mux/secrets/".concat(dataset, "/test"),
    withCredentials: true,
    method: "GET"
  }));
}
function cancelUpload(client, uuid) {
  return client.observable.request({
    url: "/addons/mux/uploads/".concat(client.config().dataset, "/").concat(uuid),
    withCredentials: true,
    method: "DELETE"
  });
}
function uploadUrl(config, client, url) {
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return testUrl(url).pipe(switchMap(validUrl => {
    return concat(of({
      type: "url",
      url: validUrl
    }), testSecretsObservable(client).pipe(switchMap(json => {
      if (!json || !json.status) {
        return throwError(new Error("Invalid credentials"));
      }
      const uuid$1 = uuid();
      const {
        enableSignedUrls
      } = options;
      const muxBody = {
        input: validUrl,
        playback_policy: [enableSignedUrls ? "signed" : "public"],
        mp4_support: config.mp4_support
      };
      const query = {
        muxBody: JSON.stringify(muxBody),
        filename: validUrl.split("/").slice(-1)[0]
      };
      const dataset = client.config().dataset;
      return defer(() => client.observable.request({
        url: "/addons/mux/assets/".concat(dataset),
        withCredentials: true,
        method: "POST",
        headers: {
          "MUX-Proxy-UUID": uuid$1,
          "Content-Type": "application/json"
        },
        query
      })).pipe(mergeMap(result => {
        const asset = result && result.results && result.results[0] && result.results[0].document || null;
        if (!asset) {
          return throwError(new Error("No asset document returned"));
        }
        return of({
          type: "success",
          id: uuid$1,
          asset
        });
      }));
    })));
  }));
}
function uploadFile(config, client, file) {
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return testFile(file).pipe(switchMap(fileOptions => {
    return concat(of({
      type: "file",
      file: fileOptions
    }), testSecretsObservable(client).pipe(switchMap(json => {
      if (!json || !json.status) {
        return throwError(new Error("Invalid credentials"));
      }
      const uuid$1 = uuid();
      const {
        enableSignedUrls
      } = options;
      const body = {
        mp4_support: config.mp4_support,
        playback_policy: [enableSignedUrls ? "signed" : "public"]
      };
      return concat(of({
        type: "uuid",
        uuid: uuid$1
      }), defer(() => client.observable.request({
        url: "/addons/mux/uploads/".concat(client.config().dataset),
        withCredentials: true,
        method: "POST",
        headers: {
          "MUX-Proxy-UUID": uuid$1,
          "Content-Type": "application/json"
        },
        body
      })).pipe(mergeMap(result => {
        return createUpChunkObservable(uuid$1, result.upload.url, file).pipe(
        // eslint-disable-next-line no-warning-comments
        // @TODO type the observable events
        // eslint-disable-next-line max-nested-callbacks
        mergeMap(event => {
          if (event.type !== "success") {
            return of(event);
          }
          return from(updateAssetDocumentFromUpload(client, uuid$1)).pipe(
          // eslint-disable-next-line max-nested-callbacks
          mergeMap(doc => of({
            ...event,
            asset: doc
          })));
        }),
        // eslint-disable-next-line max-nested-callbacks
        catchError(err => {
          return cancelUpload(client, uuid$1).pipe(mergeMapTo(throwError(err)));
        }));
      })));
    })));
  }));
}
function getUpload(client, assetId) {
  const {
    dataset
  } = client.config();
  return client.request({
    url: "/addons/mux/uploads/".concat(dataset, "/").concat(assetId),
    withCredentials: true,
    method: "GET"
  });
}
function pollUpload(client, uuid) {
  const maxTries = 10;
  let pollInterval;
  let tries = 0;
  let assetId;
  let upload;
  return new Promise((resolve, reject) => {
    pollInterval = setInterval(async () => {
      try {
        upload = await getUpload(client, uuid);
      } catch (err) {
        reject(err);
        return;
      }
      assetId = upload && upload.data && upload.data.asset_id;
      if (assetId) {
        clearInterval(pollInterval);
        resolve(upload);
      }
      if (tries > maxTries) {
        clearInterval(pollInterval);
        reject(new Error("Upload did not finish"));
      }
      tries++;
    }, 2e3);
  });
}
async function updateAssetDocumentFromUpload(client, uuid) {
  let upload;
  let asset;
  try {
    upload = await pollUpload(client, uuid);
  } catch (err) {
    return Promise.reject(err);
  }
  try {
    asset = await getAsset(client, upload.data.asset_id);
  } catch (err) {
    return Promise.reject(err);
  }
  const doc = {
    _id: uuid,
    _type: "mux.videoAsset",
    status: asset.data.status,
    data: asset.data,
    assetId: asset.data.id,
    playbackId: asset.data.playback_ids[0].id,
    uploadId: upload.data.id
  };
  return client.createOrReplace(doc).then(() => {
    return doc;
  });
}
function testFile(file) {
  if (typeof window !== "undefined" && file instanceof window.File) {
    const fileOptions = optionsFromFile({}, file);
    return of(fileOptions);
  }
  return throwError(new Error("Invalid file"));
}
function testUrl(url) {
  const error = new Error("Invalid URL");
  if (typeof url !== "string") {
    return throwError(error);
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch (err) {
    return throwError(error);
  }
  if (parsed && !parsed.protocol.match(/http:|https:/)) {
    return throwError(error);
  }
  return of(url);
}
function optionsFromFile(opts, file) {
  if (typeof window === "undefined" || !(file instanceof window.File)) {
    return opts;
  }
  return {
    name: opts.preserveFilename === false ? void 0 : file.name,
    type: file.type
  };
}
function extractDroppedFiles(dataTransfer) {
  const files = Array.from(dataTransfer.files || []);
  const items = Array.from(dataTransfer.items || []);
  if (files && files.length > 0) {
    return Promise.resolve(files);
  }
  return normalizeItems(items).then(arr => arr.flat());
}
function normalizeItems(items) {
  return Promise.all(items.map(item => {
    if (item.kind === "file" && item.webkitGetAsEntry) {
      let entry;
      try {
        entry = item.webkitGetAsEntry();
      } catch (err) {
        return [item.getAsFile()];
      }
      if (!entry) {
        return [];
      }
      return entry.isDirectory ? walk(entry) : [item.getAsFile()];
    }
    if (item.kind === "file") {
      const file = item.getAsFile();
      return Promise.resolve(file ? [file] : []);
    }
    return new Promise(resolve => item.getAsString(resolve)).then(str => str ? [new File([str], "unknown.txt", {
      type: item.type
    })] : []);
  }));
}
function isFile(entry) {
  return entry.isFile;
}
function isDirectory(entry) {
  return entry.isDirectory;
}
function walk(entry) {
  if (isFile(entry)) {
    return new Promise(resolve => entry.file(resolve)).then(file => [file]);
  }
  if (isDirectory(entry)) {
    const dir = entry.createReader();
    return new Promise(resolve => dir.readEntries(resolve)).then(entries => entries.filter(entr => !entr.name.startsWith("."))).then(entries => Promise.all(entries.map(walk)).then(arr => arr.flat()));
  }
  return Promise.resolve([]);
}
const _id = "secrets.mux";
function readSecrets(client) {
  const {
    projectId,
    dataset
  } = client.config();
  return suspend(async () => {
    const data = await client.fetch( /* groq */"*[_id == $_id][0]{\n        token,\n        secretKey,\n        enableSignedUrls,\n        signingKeyId,\n        signingKeyPrivate\n      }", {
      _id
    });
    return {
      token: (data == null ? void 0 : data.token) || null,
      secretKey: (data == null ? void 0 : data.secretKey) || null,
      enableSignedUrls: Boolean(data == null ? void 0 : data.enableSignedUrls) || false,
      signingKeyId: (data == null ? void 0 : data.signingKeyId) || null,
      signingKeyPrivate: (data == null ? void 0 : data.signingKeyPrivate) || null
    };
  }, [cacheNs, _id, projectId, dataset]);
}
function generateJwt(client, playbackId, aud, payload) {
  const {
    signingKeyId,
    signingKeyPrivate
  } = readSecrets(client);
  if (!signingKeyId) {
    throw new TypeError("Missing signingKeyId");
  }
  if (!signingKeyPrivate) {
    throw new TypeError("Missing signingKeyPrivate");
  }
  const {
    sign
  } = suspend(() => import('jsonwebtoken-esm'), ["jsonwebtoken-esm"]);
  return sign(payload ? JSON.parse(JSON.stringify(payload, (_, v) => v != null ? v : void 0)) : {}, atob(signingKeyPrivate), {
    algorithm: "RS256",
    keyid: signingKeyId,
    audience: aud,
    subject: playbackId,
    noTimestamp: true,
    expiresIn: "12h"
  });
}
function getPlaybackId(asset) {
  if (!(asset == null ? void 0 : asset.playbackId)) {
    console.error("Asset is missing a playbackId", {
      asset
    });
    throw new TypeError("Missing playbackId");
  }
  return asset.playbackId;
}
function getPlaybackPolicy(asset) {
  var _a, _b, _c, _d;
  return (_d = (_c = (_b = (_a = asset.data) == null ? void 0 : _a.playback_ids) == null ? void 0 : _b[0]) == null ? void 0 : _c.policy) != null ? _d : "public";
}
function getAnimatedPosterSrc(_ref) {
  let {
    asset,
    client,
    height,
    width,
    start = asset.thumbTime ? Math.max(0, asset.thumbTime - 2.5) : 0,
    end = start + 5,
    fps = 15
  } = _ref;
  const params = {
    height,
    width,
    start,
    end,
    fps
  };
  const playbackId = getPlaybackId(asset);
  let searchParams = new URLSearchParams(JSON.parse(JSON.stringify(params, (_, v) => v != null ? v : void 0)));
  if (getPlaybackPolicy(asset) === "signed") {
    const token = generateJwt(client, playbackId, "g", params);
    searchParams = new URLSearchParams({
      token
    });
  }
  return "https://image.mux.com/".concat(playbackId, "/animated.gif?").concat(searchParams);
}
function getPosterSrc(_ref2) {
  let {
    asset,
    client,
    fit_mode,
    height,
    time = asset.thumbTime,
    width
  } = _ref2;
  const params = {
    fit_mode,
    height,
    time,
    width
  };
  const playbackId = getPlaybackId(asset);
  let searchParams = new URLSearchParams(JSON.parse(JSON.stringify(params, (_, v) => v != null ? v : void 0)));
  if (getPlaybackPolicy(asset) === "signed") {
    const token = generateJwt(client, playbackId, "t", params);
    searchParams = new URLSearchParams({
      token
    });
  }
  return "https://image.mux.com/".concat(playbackId, "/thumbnail.png?").concat(searchParams);
}
const mediaDimensions = {
  aspect: 16 / 9
};
const ImageLoader = memo(function ImageLoader2(_ref3) {
  let {
    alt,
    src,
    height,
    width,
    aspectRatio
  } = _ref3;
  suspend(async () => {
    const img = new Image(width, height);
    img.decoding = "async";
    img.src = src;
    await img.decode();
  }, ["sanity-plugin-mux-input", "image", src]);
  return /* @__PURE__ */jsx("img", {
    alt,
    src,
    height,
    width,
    style: {
      aspectRatio
    }
  });
});
const VideoMediaPreview = styled(MediaPreview)(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  img {\n    object-fit: cover;\n  }\n"])));
const VideoMediaPreviewSignedSubtitle = _ref4 => {
  let {
    solo
  } = _ref4;
  return /* @__PURE__ */jsxs(Inline, {
    space: 1,
    style: {
      marginTop: solo ? "-1.35em" : void 0,
      marginBottom: solo ? void 0 : "0.35rem"
    },
    children: [/* @__PURE__ */jsx(LockIcon, {}), "Signed playback policy"]
  });
};
const PosterImage = _ref5 => {
  let {
    asset,
    height,
    width,
    showTip
  } = _ref5;
  const client = useClient();
  const src = getPosterSrc({
    asset,
    client,
    height,
    width,
    fit_mode: "smartcrop"
  });
  const subtitle = useMemo(() => showTip && getPlaybackPolicy(asset) === "signed" ? /* @__PURE__ */jsx(VideoMediaPreviewSignedSubtitle, {
    solo: true
  }) : void 0, [asset, showTip]);
  return /* @__PURE__ */jsx(VideoMediaPreview, {
    mediaDimensions,
    subtitle,
    title: /* @__PURE__ */jsx(Fragment, {
      children: null
    }),
    media: /* @__PURE__ */jsx(ImageLoader, {
      alt: "",
      src,
      height,
      width
    })
  });
};
const VideoThumbnail = memo(function VideoThumbnail2(_ref6) {
  let {
    asset,
    width,
    showTip
  } = _ref6;
  const {
    ErrorBoundary,
    didCatch,
    error
  } = useErrorBoundary();
  const height = Math.round(width * 9 / 16);
  const subtitle = useMemo(() => showTip && getPlaybackPolicy(asset) === "signed" ? /* @__PURE__ */jsx(VideoMediaPreviewSignedSubtitle, {}) : void 0, [showTip, asset]);
  if (didCatch) {
    return /* @__PURE__ */jsx(VideoMediaPreview, {
      subtitle: error.message,
      mediaDimensions,
      title: "Error when loading thumbnail",
      media: /* @__PURE__ */jsx(Card, {
        radius: 2,
        height: "fill",
        style: {
          position: "relative",
          width: "100%"
        },
        children: /* @__PURE__ */jsx(Box, {
          style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          },
          children: /* @__PURE__ */jsx(UnknownIcon, {})
        })
      })
    });
  }
  return /* @__PURE__ */jsx(ErrorBoundary, {
    children: /* @__PURE__ */jsx(Suspense, {
      fallback: /* @__PURE__ */jsx(VideoMediaPreview, {
        isPlaceholder: true,
        title: "Loading thumbnail...",
        subtitle,
        mediaDimensions
      }),
      children: /* @__PURE__ */jsx(PosterImage, {
        showTip,
        asset,
        height,
        width
      })
    })
  });
});
const AnimatedVideoMediaPreview = styled(MediaPreview)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n  img {\n    object-fit: contain;\n  }\n"])));
const AnimatedPosterImage = _ref7 => {
  let {
    asset,
    width
  } = _ref7;
  const client = useClient();
  const src = getAnimatedPosterSrc({
    asset,
    client,
    width
  });
  return /* @__PURE__ */jsx(AnimatedVideoMediaPreview, {
    withBorder: false,
    mediaDimensions,
    media: /* @__PURE__ */jsx(ImageLoader, {
      alt: "",
      src,
      width,
      aspectRatio: "16:9"
    })
  });
};
const AnimatedVideoThumbnail = memo(function AnimatedVideoThumbnail2(_ref8) {
  let {
    asset,
    width
  } = _ref8;
  const {
    ErrorBoundary,
    didCatch
  } = useErrorBoundary();
  if (didCatch) {
    return null;
  }
  return /* @__PURE__ */jsx(ErrorBoundary, {
    children: /* @__PURE__ */jsx(Suspense, {
      fallback: /* @__PURE__ */jsx(FancyBackdrop, {
        children: /* @__PURE__ */jsx(VideoMediaPreview, {
          mediaDimensions,
          withBorder: false,
          media: /* @__PURE__ */jsx(Spinner, {
            muted: true
          })
        })
      }),
      children: /* @__PURE__ */jsx(Card, {
        height: "fill",
        tone: "transparent",
        children: /* @__PURE__ */jsx(AnimatedPosterImage, {
          asset,
          width
        })
      })
    })
  });
});
const FancyBackdrop = styled(Box)(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n  backdrop-filter: blur(8px) brightness(0.5) saturate(2);\n  mix-blend-mode: color-dodge;\n"])));
const ThumbGrid = styled(Grid)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));\n"])));
const CardLoadMore = styled(Card)(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n  border-top: 1px solid var(--card-border-color);\n  position: sticky;\n  bottom: 0;\n  z-index: 200;\n"])));
function AssetActionsMenu(props) {
  const {
    asset
  } = props;
  const id = useId();
  const [dialogState, setDialogState] = useState();
  const [open, setOpen] = useState(false);
  const [menuElement, setMenuRef] = useState(null);
  const handleDelete = useCallback(() => setDialogState("confirm-delete"), []);
  const handleClick = useCallback(() => {
    setDialogState(false);
    setOpen(true);
  }, [setDialogState]);
  const handleClose = useCallback(() => {
    setDialogState(false);
    setOpen(false);
  }, [setDialogState]);
  useEffect(() => {
    if (open && dialogState) {
      setOpen(false);
    }
  }, [dialogState, open]);
  useClickOutside(useCallback(() => setOpen(false), []), [menuElement]);
  return /* @__PURE__ */jsxs(Fragment, {
    children: [/* @__PURE__ */jsx(MenuButton, {
      id: "".concat(id, "-asset-menu"),
      button: /* @__PURE__ */jsx(Button, {
        icon: EllipsisVerticalIcon,
        mode: "ghost",
        onClick: handleClick,
        padding: 2
      }),
      menu: /* @__PURE__ */jsx(Menu, {
        ref: setMenuRef,
        children: /* @__PURE__ */jsx(MenuItem, {
          tone: "critical",
          icon: TrashIcon,
          text: "Delete",
          onClick: handleDelete
        })
      }),
      portal: true,
      placement: "right"
    }), dialogState === "confirm-delete" && /* @__PURE__ */jsx(DeleteDialog, {
      asset,
      onClose: handleClose
    })]
  });
}
function DeleteDialog(props) {
  const {
    asset,
    onClose
  } = props;
  const client = useClient();
  const {
    push: pushToast
  } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [deleteOnMux, setDeleteOnMux] = useState(false);
  const id = useId();
  const width = 200 * getDevicePixelRatio({
    maxDpr: 2
  });
  const handleDelete = useCallback(async () => {
    var _a, _b, _c;
    setDeleting(true);
    try {
      if (asset == null ? void 0 : asset._id) {
        await client.delete(asset._id);
      }
      if (deleteOnMux && (asset == null ? void 0 : asset.assetId)) {
        await deleteAsset(client, asset.assetId);
      }
      (_c = (_b = (_a = document.querySelector("[data-id=\"".concat(asset._id, "\"]"))) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.setAttribute) == null ? void 0 : _c.call(_b, "hidden", "true");
    } catch (err) {
      console.error("Failed during delete", err);
      pushToast({
        closable: true,
        description: err == null ? void 0 : err.message,
        duration: 5e3,
        title: "Uncaught error",
        status: "error"
      });
    } finally {
      setDeleting(false);
      onClose();
    }
  }, [asset._id, asset.assetId, client, deleteOnMux, onClose, pushToast]);
  return /* @__PURE__ */jsx(Dialog, {
    onClose,
    id: "".concat(id, "-confirm-delete"),
    header: "Delete video",
    footer: /* @__PURE__ */jsxs(Grid, {
      padding: 2,
      gap: 2,
      columns: 2,
      children: [/* @__PURE__ */jsx(Button, {
        mode: "bleed",
        text: "Cancel",
        onClick: onClose
      }), /* @__PURE__ */jsx(Button, {
        text: "Delete",
        tone: "critical",
        icon: TrashIcon,
        onClick: handleDelete,
        loading: deleting
      })]
    }),
    width: 1,
    children: /* @__PURE__ */jsx(Stack, {
      paddingX: 0,
      paddingY: 0,
      space: 1,
      children: /* @__PURE__ */jsx(Card, {
        paddingX: [2, 3, 4],
        paddingY: [3, 3, 3, 4],
        children: /* @__PURE__ */jsxs(Grid, {
          columns: 3,
          gap: 3,
          children: [/* @__PURE__ */jsx(Flex, {
            style: {
              gridColumn: "span 2"
            },
            align: "center",
            children: /* @__PURE__ */jsx(Box, {
              padding: 4,
              children: /* @__PURE__ */jsxs(Stack, {
                space: 4,
                children: [/* @__PURE__ */jsxs(Flex, {
                  align: "center",
                  as: "label",
                  children: [/* @__PURE__ */jsx(Checkbox, {
                    checked: deleteOnMux,
                    onChange: () => setDeleteOnMux(prev => !prev)
                  }), /* @__PURE__ */jsx(Text, {
                    style: {
                      margin: "0 10px"
                    },
                    children: "Delete asset on Mux"
                  })]
                }), /* @__PURE__ */jsxs(Flex, {
                  align: "center",
                  as: "label",
                  children: [/* @__PURE__ */jsx(Checkbox, {
                    disabled: true,
                    checked: true
                  }), /* @__PURE__ */jsx(Text, {
                    style: {
                      margin: "0 10px"
                    },
                    children: "Delete video from dataset"
                  })]
                })]
              })
            })
          }), /* @__PURE__ */jsx(VideoThumbnail, {
            asset,
            width,
            showTip: true
          })]
        })
      })
    })
  });
}
function VideoSource(_ref9) {
  let {
    assets,
    isLoading,
    isLastPage,
    onSelect,
    onLoadMore
  } = _ref9;
  const handleClick = useCallback(event => onSelect(event.currentTarget.dataset.id), [onSelect]);
  const handleKeyPress = useCallback(event => {
    if (event.key === "Enter") {
      onSelect(event.currentTarget.dataset.id);
    }
  }, [onSelect]);
  const width = 200 * getDevicePixelRatio({
    maxDpr: 2
  });
  return /* @__PURE__ */jsxs(Fragment, {
    children: [/* @__PURE__ */jsxs(Box, {
      padding: 4,
      children: [/* @__PURE__ */jsx(ThumbGrid, {
        gap: 2,
        children: assets.map(asset => /* @__PURE__ */jsx(VideoSourceItem, {
          asset,
          onClick: handleClick,
          onKeyPress: handleKeyPress,
          width
        }, asset._id))
      }), isLoading && assets.length === 0 && /* @__PURE__ */jsx(Flex, {
        justify: "center",
        children: /* @__PURE__ */jsx(Spinner, {
          muted: true
        })
      }), !isLoading && assets.length === 0 && /* @__PURE__ */jsx(Text, {
        align: "center",
        muted: true,
        children: "No videos"
      })]
    }), assets.length > 0 && !isLastPage && /* @__PURE__ */jsx(CardLoadMore, {
      tone: "default",
      padding: 4,
      children: /* @__PURE__ */jsx(Flex, {
        direction: "column",
        children: /* @__PURE__ */jsx(Button, {
          type: "button",
          icon: DownloadIcon,
          loading: isLoading,
          onClick: onLoadMore,
          text: "Load more",
          tone: "primary"
        })
      })
    })]
  });
}
const _VideoSourceItem = _ref10 => {
  let {
    asset,
    onClick,
    onKeyPress,
    width
  } = _ref10;
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || hover === null) {
      return;
    }
    if (hover) {
      animate(ref.current, {
        opacity: 1
      });
    } else {
      animate(ref.current, {
        opacity: 0
      });
    }
  }, [hover]);
  return /* @__PURE__ */jsxs(Box, {
    height: "fill",
    style: {
      position: "relative"
    },
    children: [/* @__PURE__ */jsxs(Card, {
      as: "button",
      "data-id": asset._id,
      onClick,
      onKeyPress,
      tabIndex: 0,
      radius: 2,
      padding: 1,
      style: {
        lineHeight: 0,
        position: "relative"
      },
      __unstable_focusRing: true,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      children: [/* @__PURE__ */jsx(VideoThumbnail, {
        asset,
        width,
        showTip: true
      }), (asset == null ? void 0 : asset.playbackId) && /* @__PURE__ */jsx(AnimateWrapper, {
        tone: "transparent",
        ref,
        margin: 1,
        radius: 1,
        children: hover !== null && /* @__PURE__ */jsx(AnimatedVideoThumbnail, {
          asset,
          width
        })
      })]
    }), /* @__PURE__ */jsx(ActionsAssetsContainer, {
      children: /* @__PURE__ */jsx(AssetActionsMenu, {
        asset
      })
    })]
  });
};
const VideoSourceItem = memo(_VideoSourceItem);
const AnimateWrapper = styled(Card)(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  will-change: opacity;\n  background: transparent;\n  background-color: hsl(0deg 0% 0% / 33%);\n  opacity: 0;\n  pointer-events: none;\n"])));
const ActionsAssetsContainer = styled.div(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n  box-sizing: border-box;\n  position: absolute;\n  z-index: 300;\n  opacity: 0;\n  top: 7px;\n  right: 7px;\n\n  button:hover + &,\n  button:focus-visible + &,\n  &:hover,\n  &:focus-visible {\n    opacity: 1;\n  }\n"])));
const PER_PAGE = 200;
function createQuery() {
  let start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  let end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PER_PAGE;
  return (/* groq */"*[_type == \"mux.videoAsset\"] | order(_updatedAt desc) [".concat(start, "...").concat(end, "]")
  );
}
function SelectAssets(_ref11) {
  let {
    asset,
    onChange,
    setDialogState
  } = _ref11;
  const client = useClient();
  const pageNoRef = useRef(0);
  const [isLastPage, setLastPage] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const fetchPage = useCallback(pageNo => {
    const start = pageNo * PER_PAGE;
    const end = start + PER_PAGE;
    setLoading(true);
    return client.fetch(createQuery(start, end)).then(result => {
      setLastPage(result.length < PER_PAGE);
      setAssets(prev => prev.concat(result));
    }).finally(() => setLoading(false));
  }, [client]);
  const handleSelect = useCallback(id => {
    const selected = assets.find(doc => doc._id === id);
    if (!selected) {
      throw new TypeError("Failed to find video asset with id: ".concat(id));
    }
    onChange(PatchEvent.from([setIfMissing({
      asset: {}
    }), set({
      _type: "reference",
      _weak: true,
      _ref: selected._id
    }, ["asset"])]));
    setDialogState(false);
  }, [assets, onChange, setDialogState]);
  const handleLoadMore = useCallback(() => {
    fetchPage(++pageNoRef.current);
  }, [fetchPage]);
  useEffect(() => void fetchPage(pageNoRef.current), [fetchPage]);
  return /* @__PURE__ */jsx(VideoSource, {
    onSelect: handleSelect,
    assets,
    isLastPage,
    isLoading,
    onLoadMore: handleLoadMore
  });
}
function InputBrowser(_ref12) {
  let {
    setDialogState,
    asset,
    onChange
  } = _ref12;
  const id = "InputBrowser".concat(useId());
  const handleClose = useCallback(() => setDialogState(false), [setDialogState]);
  return /* @__PURE__ */jsx(Dialog, {
    scheme: "dark",
    __unstable_autoFocus: true,
    header: "Select video",
    id,
    onClose: handleClose,
    width: 2,
    children: /* @__PURE__ */jsx(SelectAssets, {
      asset,
      onChange,
      setDialogState
    })
  });
}
var reactIsExports = {};
var reactIs = {
  get exports() {
    return reactIsExports;
  },
  set exports(v) {
    reactIsExports = v;
  }
};
var reactIs_production_min = {};

/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_production_min;
function requireReactIs_production_min() {
  if (hasRequiredReactIs_production_min) return reactIs_production_min;
  hasRequiredReactIs_production_min = 1;
  var b = Symbol.for("react.element"),
    c = Symbol.for("react.portal"),
    d = Symbol.for("react.fragment"),
    e = Symbol.for("react.strict_mode"),
    f = Symbol.for("react.profiler"),
    g = Symbol.for("react.provider"),
    h = Symbol.for("react.context"),
    k = Symbol.for("react.server_context"),
    l = Symbol.for("react.forward_ref"),
    m = Symbol.for("react.suspense"),
    n = Symbol.for("react.suspense_list"),
    p = Symbol.for("react.memo"),
    q = Symbol.for("react.lazy"),
    t = Symbol.for("react.offscreen"),
    u;
  u = Symbol.for("react.module.reference");
  function v(a) {
    if ("object" === typeof a && null !== a) {
      var r = a.$$typeof;
      switch (r) {
        case b:
          switch (a = a.type, a) {
            case d:
            case f:
            case e:
            case m:
            case n:
              return a;
            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case h:
                case l:
                case q:
                case p:
                case g:
                  return a;
                default:
                  return r;
              }
          }
        case c:
          return r;
      }
    }
  }
  reactIs_production_min.ContextConsumer = h;
  reactIs_production_min.ContextProvider = g;
  reactIs_production_min.Element = b;
  reactIs_production_min.ForwardRef = l;
  reactIs_production_min.Fragment = d;
  reactIs_production_min.Lazy = q;
  reactIs_production_min.Memo = p;
  reactIs_production_min.Portal = c;
  reactIs_production_min.Profiler = f;
  reactIs_production_min.StrictMode = e;
  reactIs_production_min.Suspense = m;
  reactIs_production_min.SuspenseList = n;
  reactIs_production_min.isAsyncMode = function () {
    return !1;
  };
  reactIs_production_min.isConcurrentMode = function () {
    return !1;
  };
  reactIs_production_min.isContextConsumer = function (a) {
    return v(a) === h;
  };
  reactIs_production_min.isContextProvider = function (a) {
    return v(a) === g;
  };
  reactIs_production_min.isElement = function (a) {
    return "object" === typeof a && null !== a && a.$$typeof === b;
  };
  reactIs_production_min.isForwardRef = function (a) {
    return v(a) === l;
  };
  reactIs_production_min.isFragment = function (a) {
    return v(a) === d;
  };
  reactIs_production_min.isLazy = function (a) {
    return v(a) === q;
  };
  reactIs_production_min.isMemo = function (a) {
    return v(a) === p;
  };
  reactIs_production_min.isPortal = function (a) {
    return v(a) === c;
  };
  reactIs_production_min.isProfiler = function (a) {
    return v(a) === f;
  };
  reactIs_production_min.isStrictMode = function (a) {
    return v(a) === e;
  };
  reactIs_production_min.isSuspense = function (a) {
    return v(a) === m;
  };
  reactIs_production_min.isSuspenseList = function (a) {
    return v(a) === n;
  };
  reactIs_production_min.isValidElementType = function (a) {
    return "string" === typeof a || "function" === typeof a || a === d || a === f || a === e || a === m || a === n || a === t || "object" === typeof a && null !== a && (a.$$typeof === q || a.$$typeof === p || a.$$typeof === g || a.$$typeof === h || a.$$typeof === l || a.$$typeof === u || void 0 !== a.getModuleId) ? !0 : !1;
  };
  reactIs_production_min.typeOf = v;
  return reactIs_production_min;
}
var reactIs_development = {};

/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_development;
function requireReactIs_development() {
  if (hasRequiredReactIs_development) return reactIs_development;
  hasRequiredReactIs_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function () {
      // ATTENTION
      // When adding new symbols to this file,
      // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
      // The Symbol used to tag the ReactElement-like types.
      var REACT_ELEMENT_TYPE = Symbol.for('react.element');
      var REACT_PORTAL_TYPE = Symbol.for('react.portal');
      var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
      var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
      var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
      var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
      var REACT_CONTEXT_TYPE = Symbol.for('react.context');
      var REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');
      var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
      var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
      var REACT_MEMO_TYPE = Symbol.for('react.memo');
      var REACT_LAZY_TYPE = Symbol.for('react.lazy');
      var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');

      // -----------------------------------------------------------------------------

      var enableScopeAPI = false; // Experimental Create Event Handle API.
      var enableCacheElement = false;
      var enableTransitionTracing = false; // No known bugs, but needs performance testing

      var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
      // stuff. Intended to enable React core members to more easily debug scheduling
      // issues in DEV builds.

      var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
      }
      function isValidElementType(type) {
        if (typeof type === 'string' || typeof type === 'function') {
          return true;
        } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).

        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === 'object' && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE ||
          // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
            return true;
          }
        }
        return false;
      }
      function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
          var $$typeof = object.$$typeof;
          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;
              switch (type) {
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                case REACT_SUSPENSE_LIST_TYPE:
                  return type;
                default:
                  var $$typeofType = type && type.$$typeof;
                  switch ($$typeofType) {
                    case REACT_SERVER_CONTEXT_TYPE:
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;
                    default:
                      return $$typeof;
                  }
              }
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }
        return undefined;
      }
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var SuspenseList = REACT_SUSPENSE_LIST_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;
      var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

            console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
          }
        }
        return false;
      }
      function isConcurrentMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
            hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

            console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
          }
        }
        return false;
      }
      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }
      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }
      function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }
      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }
      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }
      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }
      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }
      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }
      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }
      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }
      function isSuspenseList(object) {
        return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
      }
      reactIs_development.ContextConsumer = ContextConsumer;
      reactIs_development.ContextProvider = ContextProvider;
      reactIs_development.Element = Element;
      reactIs_development.ForwardRef = ForwardRef;
      reactIs_development.Fragment = Fragment;
      reactIs_development.Lazy = Lazy;
      reactIs_development.Memo = Memo;
      reactIs_development.Portal = Portal;
      reactIs_development.Profiler = Profiler;
      reactIs_development.StrictMode = StrictMode;
      reactIs_development.Suspense = Suspense;
      reactIs_development.SuspenseList = SuspenseList;
      reactIs_development.isAsyncMode = isAsyncMode;
      reactIs_development.isConcurrentMode = isConcurrentMode;
      reactIs_development.isContextConsumer = isContextConsumer;
      reactIs_development.isContextProvider = isContextProvider;
      reactIs_development.isElement = isElement;
      reactIs_development.isForwardRef = isForwardRef;
      reactIs_development.isFragment = isFragment;
      reactIs_development.isLazy = isLazy;
      reactIs_development.isMemo = isMemo;
      reactIs_development.isPortal = isPortal;
      reactIs_development.isProfiler = isProfiler;
      reactIs_development.isStrictMode = isStrictMode;
      reactIs_development.isSuspense = isSuspense;
      reactIs_development.isSuspenseList = isSuspenseList;
      reactIs_development.isValidElementType = isValidElementType;
      reactIs_development.typeOf = typeOf;
    })();
  }
  return reactIs_development;
}
(function (module) {
  if (process.env.NODE_ENV === 'production') {
    module.exports = requireReactIs_production_min();
  } else {
    module.exports = requireReactIs_development();
  }
})(reactIs);
function focusRingBorderStyle(border) {
  return "inset 0 0 0 ".concat(border.width, "px ").concat(border.color);
}
function focusRingStyle(opts) {
  const {
    base,
    border,
    focusRing
  } = opts;
  const focusRingOutsetWidth = focusRing.offset + focusRing.width;
  const focusRingInsetWidth = 0 - focusRing.offset;
  const bgColor = base ? base.bg : "var(--card-bg-color)";
  return [focusRingInsetWidth > 0 && "inset 0 0 0 ".concat(focusRingInsetWidth, "px var(--card-focus-ring-color)"), border && focusRingBorderStyle(border), focusRingInsetWidth < 0 && "0 0 0 ".concat(0 - focusRingInsetWidth, "px ").concat(bgColor), focusRingOutsetWidth > 0 && "0 0 0 ".concat(focusRingOutsetWidth, "px var(--card-focus-ring-color)")].filter(Boolean).join(",");
}
const FileButton = styled(MenuItem)(_ref13 => {
  let {
    theme
  } = _ref13;
  const {
    focusRing
  } = theme.sanity;
  const base = theme.sanity.color.base;
  const border = {
    width: 1,
    color: "var(--card-border-color)"
  };
  return css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n    position: relative;\n\n    &:not([data-disabled='true']) {\n      &:focus-within {\n        box-shadow: ", ";\n      }\n    }\n\n    & input {\n      overflow: hidden;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      position: absolute;\n      min-width: 0;\n      display: block;\n      appearance: none;\n      padding: 0;\n      margin: 0;\n      border: 0;\n      opacity: 0;\n    }\n  "])), focusRingStyle({
    base,
    border,
    focusRing
  }));
});
const FileInputMenuItem = React.forwardRef(function FileInputMenuItem2(props, forwardedRef) {
  const {
    icon,
    id: idProp,
    accept,
    capture,
    fontSize,
    multiple,
    onSelect,
    padding = 3,
    space = 3,
    textAlign,
    text,
    disabled,
    ...rest
  } = props;
  const idHook = useId();
  const id = idProp || idHook;
  const handleChange = React.useCallback(event => {
    if (onSelect && event.target.files) {
      onSelect(Array.from(event.target.files));
    }
  }, [onSelect]);
  const content = /* @__PURE__ */jsxs(Flex, {
    align: "center",
    justify: "flex-start",
    padding,
    children: [icon && /* @__PURE__ */jsx(Box, {
      marginRight: text ? space : void 0,
      children: /* @__PURE__ */jsxs(Text, {
        size: fontSize,
        children: [isValidElement(icon) && icon, reactIsExports.isValidElementType(icon) && createElement(icon)]
      })
    }), text && /* @__PURE__ */jsx(Text, {
      align: textAlign,
      size: fontSize,
      textOverflow: "ellipsis",
      children: text
    })]
  });
  return /* @__PURE__ */jsxs(FileButton, {
    ...rest,
    htmlFor: id,
    padding: 0,
    fontSize: 2,
    disabled,
    ref: forwardedRef,
    children: [content, /* @__PURE__ */jsx("input", {
      "data-testid": "file-button-input",
      accept,
      capture,
      id,
      multiple,
      onChange: handleChange,
      type: "file",
      value: "",
      disabled
    })]
  });
});
const LockCard = styled(Card)(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n  position: absolute;\n  top: 0;\n  left: 0;\n  opacity: 0.6;\n  mix-blend-mode: screen;\n  background: transparent;\n"])));
const LockButton = styled(Button)(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["\n  background: transparent;\n  color: white;\n"])));
function PlayerActionsMenu(props) {
  const {
    asset,
    readOnly,
    dialogState,
    setDialogState,
    onChange,
    onUpload
  } = props;
  const [open, setOpen] = useState(false);
  const [menuElement, setMenuRef] = useState(null);
  const isSigned = useMemo(() => getPlaybackPolicy(asset) === "signed", [asset]);
  const onReset = useCallback(() => onChange(PatchEvent.from(unset([]))), [onChange]);
  useEffect(() => {
    if (open && dialogState) {
      setOpen(false);
    }
  }, [dialogState, open]);
  useClickOutside(useCallback(() => setOpen(false), []), [menuElement]);
  return /* @__PURE__ */jsxs(Inline, {
    space: 1,
    padding: 2,
    children: [isSigned && /* @__PURE__ */jsx(Tooltip, {
      content: /* @__PURE__ */jsx(Box, {
        padding: 2,
        children: /* @__PURE__ */jsx(Text, {
          muted: true,
          size: 1,
          children: "Signed playback policy"
        })
      }),
      placement: "right",
      portal: true,
      children: /* @__PURE__ */jsx(LockCard, {
        radius: 2,
        margin: 2,
        scheme: "dark",
        tone: "positive",
        children: /* @__PURE__ */jsx(LockButton, {
          icon: LockIcon,
          mode: "bleed",
          tone: "positive"
        })
      })
    }), !readOnly && /* @__PURE__ */jsx(Button, {
      icon: EditIcon,
      mode: "ghost",
      onClick: () => setDialogState("edit-thumbnail")
    }), /* @__PURE__ */jsx(Popover, {
      content: /* @__PURE__ */jsxs(Menu, {
        ref: setMenuRef,
        children: [/* @__PURE__ */jsx(Box, {
          padding: 2,
          children: /* @__PURE__ */jsx(Label$1, {
            muted: true,
            size: 1,
            children: "Replace"
          })
        }), /* @__PURE__ */jsx(FileInputMenuItem, {
          accept: "video/*",
          icon: UploadIcon,
          mode: "bleed",
          onSelect: onUpload,
          text: "Upload",
          disabled: readOnly,
          fontSize: 2
        }), /* @__PURE__ */jsx(MenuItem, {
          icon: SearchIcon,
          text: "Browse",
          onClick: () => setDialogState("select-video")
        }), /* @__PURE__ */jsx(MenuDivider, {}), /* @__PURE__ */jsx(MenuItem, {
          icon: PlugIcon,
          text: "Configure API",
          onClick: () => setDialogState("secrets")
        }), /* @__PURE__ */jsx(MenuDivider, {}), /* @__PURE__ */jsx(MenuItem, {
          tone: "critical",
          icon: ResetIcon,
          text: "Clear field",
          onClick: onReset,
          disabled: readOnly
        })]
      }),
      portal: true,
      open,
      children: /* @__PURE__ */jsx(Button, {
        icon: EllipsisVerticalIcon,
        mode: "ghost",
        onClick: () => {
          setDialogState(false);
          setOpen(true);
        }
      })
    })]
  });
}
var PlayerActionsMenu$1 = memo(PlayerActionsMenu);
function withFocusRing(component) {
  return styled(component)(props => {
    const border = {
      width: props.$border ? 1 : 0,
      color: "var(--card-border-color)"
    };
    return css(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["\n        --card-focus-box-shadow: ", ";\n\n        border-radius: ", ";\n        outline: none;\n        box-shadow: var(--card-focus-box-shadow);\n\n        &:focus {\n          --card-focus-box-shadow: ", ";\n        }\n      "])), focusRingBorderStyle(border), rem(props.theme.sanity.radius[1]), focusRingStyle({
      base: props.theme.sanity.color.base,
      border,
      focusRing: props.theme.sanity.focusRing
    }));
  });
}
const ctrlKey = 17;
const cmdKey = 91;
const UploadCardWithFocusRing = withFocusRing(Card);
const UploadCard$1 = forwardRef((_ref14, forwardedRef) => {
  let {
    children,
    tone,
    onPaste,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver
  } = _ref14;
  const ctrlDown = useRef(false);
  const inputRef = useRef(null);
  const handleKeyDown = useCallback(event => {
    if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
      ctrlDown.current = true;
    }
    const vKey = 86;
    if (ctrlDown.current && event.keyCode == vKey) {
      inputRef.current.focus();
    }
  }, []);
  const handleKeyUp = useCallback(event => {
    if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
      ctrlDown.current = false;
    }
  }, []);
  return /* @__PURE__ */jsxs(UploadCardWithFocusRing, {
    tone,
    height: "fill",
    ref: forwardedRef,
    padding: 0,
    radius: 2,
    shadow: 0,
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onPaste,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    children: [/* @__PURE__ */jsx(HiddenInput$1, {
      ref: inputRef,
      onPaste
    }), children]
  });
});
const HiddenInput$1 = styled.input.attrs({
  type: "text"
})(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n  position: absolute;\n  border: 0;\n  color: white;\n  opacity: 0;\n\n  &:focus {\n    outline: none;\n  }\n"])));
const HiddenInput = styled.input(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["\n  overflow: hidden;\n  width: 0.1px;\n  height: 0.1px;\n  opacity: 0;\n  position: absolute;\n  z-index: -1;\n"])));
const Label = styled.label(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["\n  position: relative;\n"])));
const FileInputButton = _ref15 => {
  let {
    onSelect,
    ...props
  } = _ref15;
  const inputId = "FileSelect".concat(useId());
  const inputRef = useRef(null);
  const handleSelect = useCallback(event => {
    if (onSelect) {
      onSelect(event.target.files);
    }
  }, [onSelect]);
  const handleButtonClick = useCallback(() => {
    var _a;
    return (_a = inputRef.current) == null ? void 0 : _a.click();
  }, []);
  return /* @__PURE__ */jsxs(Label, {
    htmlFor: inputId,
    children: [/* @__PURE__ */jsx(HiddenInput, {
      accept: "video/*",
      ref: inputRef,
      tabIndex: 0,
      type: "file",
      id: inputId,
      onChange: handleSelect,
      value: ""
    }), /* @__PURE__ */jsx(Button, {
      onClick: handleButtonClick,
      mode: "default",
      tone: "primary",
      style: {
        width: "100%"
      },
      ...props
    })]
  });
};
const UploadCard = styled(Card)(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["\n  && {\n    border-style: dashed;\n  }\n"])));
const ConfigureApiBox = styled(Box)(_templateObject16 || (_templateObject16 = _taggedTemplateLiteral(["\n  position: absolute;\n  top: 0;\n  right: 0;\n"])));
function UploadPlaceholder(props) {
  const {
    setDialogState,
    readOnly,
    onSelect,
    hovering,
    needsSetup
  } = props;
  const handleBrowse = useCallback(() => setDialogState("select-video"), [setDialogState]);
  const handleConfigureApi = useCallback(() => setDialogState("secrets"), [setDialogState]);
  return /* @__PURE__ */jsx(Box, {
    style: {
      padding: 1,
      position: "relative"
    },
    height: "stretch",
    children: /* @__PURE__ */jsxs(UploadCard, {
      sizing: "border",
      height: "fill",
      tone: readOnly ? "transparent" : "inherit",
      border: true,
      padding: 3,
      style: hovering ? {
        borderColor: "transparent"
      } : void 0,
      children: [/* @__PURE__ */jsx(ConfigureApiBox, {
        padding: 3,
        children: /* @__PURE__ */jsx(Button, {
          padding: 3,
          radius: 3,
          tone: needsSetup ? "critical" : void 0,
          onClick: handleConfigureApi,
          icon: PlugIcon,
          mode: "bleed"
        })
      }), /* @__PURE__ */jsxs(Flex, {
        align: "center",
        justify: "space-between",
        gap: 4,
        direction: ["column", "column", "row"],
        paddingY: [2, 2, 0],
        sizing: "border",
        height: "fill",
        children: [/* @__PURE__ */jsxs(Flex, {
          align: "center",
          justify: "center",
          gap: 2,
          flex: 1,
          children: [/* @__PURE__ */jsx(Flex, {
            justify: "center",
            children: /* @__PURE__ */jsx(Text, {
              muted: true,
              children: /* @__PURE__ */jsx(DocumentVideoIcon, {})
            })
          }), /* @__PURE__ */jsx(Flex, {
            justify: "center",
            children: /* @__PURE__ */jsx(Text, {
              size: 1,
              muted: true,
              children: "Drag video or paste URL here"
            })
          })]
        }), /* @__PURE__ */jsxs(Inline, {
          space: 2,
          children: [/* @__PURE__ */jsx(FileInputButton, {
            mode: "ghost",
            tone: "default",
            icon: UploadIcon,
            text: "Upload",
            onSelect
          }), /* @__PURE__ */jsx(Button, {
            mode: "ghost",
            icon: SearchIcon,
            text: "Select",
            onClick: handleBrowse
          })]
        })]
      })]
    })
  });
}
const CardWrapper = styled(Card)(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["\n  min-height: 82px;\n  box-sizing: border-box;\n"])));
const FlexWrapper = styled(Flex)(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["\n  text-overflow: ellipsis;\n  overflow: hidden;\n"])));
const LeftSection = styled(Stack)(_templateObject19 || (_templateObject19 = _taggedTemplateLiteral(["\n  position: relative;\n  width: 60%;\n"])));
const CodeWrapper = styled(Code)(_templateObject20 || (_templateObject20 = _taggedTemplateLiteral(["\n  position: relative;\n  width: 100%;\n\n  code {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    position: relative;\n    max-width: 200px;\n  }\n"])));
const UploadProgress = _ref16 => {
  let {
    progress = 100,
    onCancel,
    filename,
    text = "Uploading"
  } = _ref16;
  return /* @__PURE__ */jsx(CardWrapper, {
    tone: "primary",
    padding: 4,
    border: true,
    height: "fill",
    children: /* @__PURE__ */jsxs(FlexWrapper, {
      align: "center",
      justify: "space-between",
      height: "fill",
      direction: "row",
      gap: 2,
      children: [/* @__PURE__ */jsxs(LeftSection, {
        children: [/* @__PURE__ */jsx(Flex, {
          justify: "center",
          gap: [3, 3, 2, 2],
          direction: ["column", "column", "row"],
          children: /* @__PURE__ */jsx(Text, {
            size: 1,
            children: /* @__PURE__ */jsxs(Inline, {
              space: 2,
              children: [text, /* @__PURE__ */jsx(CodeWrapper, {
                size: 1,
                children: filename ? filename : "..."
              })]
            })
          })
        }), /* @__PURE__ */jsx(Card, {
          marginTop: 3,
          radius: 5,
          shadow: 1,
          children: /* @__PURE__ */jsx(LinearProgress, {
            value: progress
          })
        })]
      }), onCancel ? /* @__PURE__ */jsx(Button, {
        fontSize: 2,
        text: "Cancel upload",
        mode: "ghost",
        tone: "critical",
        onClick: onCancel
      }) : null]
    })
  });
};
const Player = lazy(() => import('./Player-c3fcb3e5.js'));
class MuxVideoInputUploader extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      isDraggingOver: false,
      invalidPaste: false,
      invalidFile: false,
      uploadProgress: null,
      fileInfo: null,
      uuid: null,
      error: null,
      url: null
    };
    this.dragEnteredEls = [];
    this.ctrlDown = false;
    // eslint-disable-next-line no-warning-comments
    // @TODO add proper typings for the return values of uploadFile and uploadUrl
    this.upload = null;
    this.container = React.createRef();
    this.handleProgress = evt => {
      this.setState({
        uploadProgress: evt.percent
      });
    };
    this.onUpload = files => {
      this.setState({
        uploadProgress: 0,
        fileInfo: null,
        uuid: null
      });
      this.upload = uploadFile(this.props.config, this.props.client, files[0], {
        enableSignedUrls: this.props.secrets.enableSignedUrls
      }).pipe(takeUntil(this.onCancelUploadButtonClick$.pipe(tap(() => {
        if (this.state.uuid) {
          this.props.client.delete(this.state.uuid);
        }
      })))).subscribe({
        complete: () => {
          this.setState({
            error: null,
            uploadProgress: null,
            uuid: null
          });
        },
        next: event => {
          this.handleUploadEvent(event);
        },
        error: err => {
          this.setState({
            error: err,
            uploadProgress: null,
            uuid: null
          });
        }
      });
    };
    // eslint-disable-next-line no-warning-comments
    // @TODO add proper typings for the Observable events
    this.handleUploadEvent = event => {
      switch (event.type) {
        case "success":
          return this.handleUploadSuccess(event.asset);
        case "progress":
          return this.handleProgress(event);
        case "file":
          return this.setState({
            fileInfo: event.file
          });
        case "uuid":
          return this.setState({
            uuid: event.uuid
          });
        case "url":
          return this.setState({
            url: event.url,
            uploadProgress: 100
          });
        default:
          return null;
      }
    };
    this.handleUploadSuccess = asset => {
      this.setState({
        uploadProgress: 100
      });
      this.props.onChange(PatchEvent.from([setIfMissing({
        asset: {}
      }), set({
        _type: "reference",
        _weak: true,
        _ref: asset._id
      }, ["asset"])]));
    };
    this.handlePaste = event => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const url = clipboardData.getData("text");
      const options = {
        enableSignedUrls: this.props.secrets.enableSignedUrls
      };
      this.upload = uploadUrl(this.props.config, this.props.client, url, options).subscribe({
        complete: () => {
          this.setState({
            error: null,
            uploadProgress: null,
            url: null
          });
        },
        next: sEvent => {
          this.handleUploadEvent(sEvent);
        },
        error: err => {
          let error;
          if (!err.message.toLowerCase().match("invalid url")) {
            error = err;
          }
          this.setState({
            invalidPaste: true,
            error
          }, () => {
            setTimeout(() => {
              this.setState({
                invalidPaste: false,
                uploadProgress: null
              });
            }, 2e3);
          });
        }
      });
    };
    this.handleDrop = event => {
      this.setState({
        isDraggingOver: false
      });
      event.preventDefault();
      event.stopPropagation();
      extractDroppedFiles(event.nativeEvent.dataTransfer).then(files => {
        if (files) {
          this.onUpload(files);
        }
      });
    };
    this.handleDragOver = event => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.handleDragEnter = event => {
      var _a, _b;
      event.stopPropagation();
      this.dragEnteredEls.push(event.target);
      this.setState({
        isDraggingOver: true
      });
      const type = (_b = (_a = event.dataTransfer.items) == null ? void 0 : _a[0]) == null ? void 0 : _b.type;
      this.setState({
        invalidFile: !type.startsWith("video/")
      });
    };
    this.handleDragLeave = event => {
      event.stopPropagation();
      const idx = this.dragEnteredEls.indexOf(event.target);
      if (idx > -1) {
        this.dragEnteredEls.splice(idx, 1);
      }
      if (this.dragEnteredEls.length === 0) {
        this.setState({
          isDraggingOver: false
        });
      }
    };
  }
  componentWillUnmount() {
    this.unSubscribeToUpload();
  }
  componentDidMount() {
    const events$ = new Subject();
    this.onCancelUploadButtonClick$ = events$.asObservable();
    this.handleCancelUploadButtonClick = event => events$.next(event);
  }
  unSubscribeToUpload() {
    if (this.upload && !this.upload.closed) {
      this.upload.unsubscribe();
    }
  }
  render() {
    var _a;
    if (this.state.uploadProgress !== null) {
      return /* @__PURE__ */jsx(UploadProgress, {
        onCancel: this.handleCancelUploadButtonClick,
        progress: this.state.uploadProgress,
        filename: ((_a = this.state.fileInfo) == null ? void 0 : _a.name) || this.state.url
      });
    }
    if (this.state.error) {
      throw this.state.error;
    }
    return /* @__PURE__ */jsxs(Fragment, {
      children: [/* @__PURE__ */jsx(UploadCard$1, {
        tone: this.state.isDraggingOver && (this.state.invalidPaste || this.state.invalidFile) ? "critical" : this.state.isDraggingOver ? "positive" : void 0,
        onDrop: this.handleDrop,
        onDragOver: this.handleDragOver,
        onDragLeave: this.handleDragLeave,
        onDragEnter: this.handleDragEnter,
        onPaste: this.handlePaste,
        ref: this.container,
        children: this.props.asset ? /* @__PURE__ */jsx(Player, {
          readOnly: this.props.readOnly,
          asset: this.props.asset,
          onChange: this.props.onChange,
          dialogState: this.props.dialogState,
          setDialogState: this.props.setDialogState,
          buttons: /* @__PURE__ */jsx(PlayerActionsMenu$1, {
            asset: this.props.asset,
            dialogState: this.props.dialogState,
            setDialogState: this.props.setDialogState,
            onChange: this.props.onChange,
            onUpload: this.onUpload,
            readOnly: this.props.readOnly
          })
        }) : /* @__PURE__ */jsx(UploadPlaceholder, {
          hovering: this.state.isDraggingOver,
          onSelect: this.onUpload,
          readOnly: this.props.readOnly,
          setDialogState: this.props.setDialogState,
          needsSetup: this.props.needsSetup
        })
      }), this.props.dialogState === "select-video" && /* @__PURE__ */jsx(InputBrowser, {
        asset: this.props.asset,
        onChange: this.props.onChange,
        setDialogState: this.props.setDialogState
      })]
    });
  }
}
const useSaveSecrets = (client, secrets) => {
  return useCallback(async _ref17 => {
    let {
      token,
      secretKey,
      enableSignedUrls
    } = _ref17;
    let {
      signingKeyId,
      signingKeyPrivate
    } = secrets;
    try {
      await saveSecrets(client, token, secretKey, enableSignedUrls, signingKeyId, signingKeyPrivate);
      const valid = await testSecrets(client);
      if (!(valid == null ? void 0 : valid.status) && token && secretKey) {
        throw new Error("Invalid secrets");
      }
    } catch (err) {
      console.error("Error while trying to save secrets:", err);
      throw err;
    }
    if (enableSignedUrls) {
      const hasValidSigningKeys = await haveValidSigningKeys(client, signingKeyId, signingKeyPrivate);
      if (!hasValidSigningKeys) {
        try {
          const {
            data
          } = await createSigningKeys(client);
          signingKeyId = data.id;
          signingKeyPrivate = data.private_key;
          await saveSecrets(client, token, secretKey, enableSignedUrls, signingKeyId, signingKeyPrivate);
        } catch (err) {
          console.log("Error while creating and saving signing key:", err == null ? void 0 : err.message);
          throw err;
        }
      }
    }
    return {
      token,
      secretKey,
      enableSignedUrls,
      signingKeyId,
      signingKeyPrivate
    };
  }, [client, secrets]);
};
function init(_ref18) {
  let {
    token,
    secretKey,
    enableSignedUrls
  } = _ref18;
  return {
    submitting: false,
    error: null,
    // Form inputs don't set the state back to null when clearing a field, but uses empty strings
    // This ensures the `dirty` check works correctly
    token: token != null ? token : "",
    secretKey: secretKey != null ? secretKey : "",
    enableSignedUrls: enableSignedUrls != null ? enableSignedUrls : false
  };
}
function reducer(state, action) {
  switch (action == null ? void 0 : action.type) {
    case "submit":
      return {
        ...state,
        submitting: true,
        error: null
      };
    case "error":
      return {
        ...state,
        submitting: false,
        error: action.payload
      };
    case "reset":
      return init(action.payload);
    case "change":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      };
    default:
      throw new Error("Unknown action type: ".concat(action == null ? void 0 : action.type));
  }
}
const useSecretsFormState = secrets => useReducer(reducer, secrets, init);
const ids = ["title", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r"];
function MuxLogo(_ref19) {
  let {
    height = 26
  } = _ref19;
  const id = useId();
  const [titleId, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r] = useMemo(() => ids.map(field => "".concat(id, "-").concat(field)), [id]);
  return /* @__PURE__ */jsxs("svg", {
    "aria-labelledby": titleId,
    role: "img",
    xmlns: "http://www.w3.org/2000/svg",
    xmlSpace: "preserve",
    viewBox: "92.08878326416016 102.66712188720703 692.76123046875 219.99948120117188",
    style: {
      height: "".concat(height, "px")
    },
    children: [/* @__PURE__ */jsx("title", {
      id: titleId,
      children: "Mux Logo"
    }), /* @__PURE__ */jsxs("defs", {
      children: [/* @__PURE__ */jsxs("linearGradient", {
        id: c,
        spreadMethod: "pad",
        gradientTransform: "matrix(528.38055 0 0 -528.38055 63.801 159.5)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: d,
        spreadMethod: "pad",
        gradientTransform: "matrix(523.66766 0 0 -523.66766 67.897 159.5)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: g,
        spreadMethod: "pad",
        gradientTransform: "rotate(180 296.075 79.75) scale(524.84045)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: i,
        spreadMethod: "pad",
        gradientTransform: "matrix(524.84045 0 0 -524.84045 63.801 159.5)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: j,
        spreadMethod: "pad",
        gradientTransform: "matrix(523.08514 0 0 -523.08514 67.897 224.446)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: k,
        spreadMethod: "pad",
        gradientTransform: "matrix(524.84045 0 0 -524.84045 63.801 94.553)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: l,
        spreadMethod: "pad",
        gradientTransform: "matrix(524.84045 0 0 -524.84045 63.801 159.5)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: m,
        spreadMethod: "pad",
        gradientTransform: "matrix(524.84045 0 0 -524.84045 63.801 94.554)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: p,
        spreadMethod: "pad",
        gradientTransform: "matrix(521.97632 0 0 -521.97632 69.067 191.973)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: q,
        spreadMethod: "pad",
        gradientTransform: "matrix(523.09039 0 0 -523.09039 67.312 191.973)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsxs("linearGradient", {
        id: r,
        spreadMethod: "pad",
        gradientTransform: "matrix(524.84045 0 0 -524.84045 63.801 159.5)",
        gradientUnits: "userSpaceOnUse",
        y2: 0,
        x2: 1,
        y1: 0,
        x1: 0,
        children: [/* @__PURE__ */jsx("stop", {
          offset: 0,
          style: {
            stopOpacity: 1,
            stopColor: "#ff4e00"
          }
        }), /* @__PURE__ */jsx("stop", {
          offset: 1,
          style: {
            stopOpacity: 1,
            stopColor: "#ff1791"
          }
        })]
      }), /* @__PURE__ */jsx("clipPath", {
        id: a,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M0 319h657.706V0H0Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: b,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M423.64 242h164.999V77H423.64Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: e,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M0 319h657.706V0H0Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: f,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M311.3 242h93.031V77H311.3Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: h,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M198.96 242h35.106V77H198.96Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: n,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M0 319h657.706V0H0Z"
        })
      }), /* @__PURE__ */jsx("clipPath", {
        id: o,
        clipPathUnits: "userSpaceOnUse",
        children: /* @__PURE__ */jsx("path", {
          d: "M69.067 242H169.12V141.947H69.067Z"
        })
      })]
    }), /* @__PURE__ */jsx("g", {
      clipPath: "url(#".concat(a, ")"),
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)",
      children: /* @__PURE__ */jsx("g", {
        style: {
          opacity: 0.69999701
        },
        clipPath: "url(#".concat(b, ")"),
        children: /* @__PURE__ */jsx("path", {
          style: {
            fill: "url(#".concat(c, ")"),
            stroke: "none"
          },
          d: "M558.674 82.142c6.855-6.855 17.969-6.855 24.824 0 6.854 6.855 6.854 17.969 0 24.823L453.605 236.858c-6.855 6.855-17.969 6.855-24.824 0s-6.855-17.969 0-24.823z"
        })
      })
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(d, ")"),
        stroke: "none"
      },
      d: "M558.674 236.858 428.781 106.966c-6.855-6.855-6.855-17.969 0-24.825 6.855-6.854 17.969-6.854 24.823 0l129.894 129.894c6.854 6.855 6.854 17.968 0 24.823A17.498 17.498 0 0 1 571.086 242a17.495 17.495 0 0 1-12.412-5.142",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsxs("g", {
      clipPath: "url(#".concat(e, ")"),
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)",
      children: [/* @__PURE__ */jsx("g", {
        style: {
          opacity: 0.69999701
        },
        clipPath: "url(#".concat(f, ")"),
        children: /* @__PURE__ */jsx("path", {
          style: {
            fill: "url(#".concat(g, ")"),
            stroke: "none"
          },
          d: "M328.853 112.107c22.297 0 40.372 18.075 40.372 40.372v71.315c0 10.054 7.505 18.206 17.554 18.206 10.048 0 17.552-8.152 17.552-18.206v-71.315c0-41.686-33.793-75.479-75.478-75.479-9.694 0-17.553 7.859-17.553 17.554 0 9.694 7.859 17.553 17.553 17.553"
        })
      }), /* @__PURE__ */jsx("g", {
        style: {
          opacity: 0.69999701
        },
        clipPath: "url(#".concat(h, ")"),
        children: /* @__PURE__ */jsx("path", {
          style: {
            fill: "url(#".concat(i, ")"),
            stroke: "none"
          },
          d: "M216.513 242c-10.049 0-17.553-8.152-17.553-18.206V95.206c0-10.054 7.504-18.206 17.553-18.206 10.048 0 17.553 8.152 17.553 18.206v128.588c0 10.054-7.505 18.206-17.553 18.206"
        })
      })]
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(j, ")"),
        stroke: "none"
      },
      d: "M369.225 224.447c0-9.694 7.859-17.553 17.553-17.553 9.695 0 17.553 7.859 17.553 17.553s-7.858 17.552-17.553 17.552c-9.694 0-17.553-7.858-17.553-17.552",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(k, ")"),
        stroke: "none"
      },
      d: "M553.532 94.554c0-9.695 7.859-17.554 17.553-17.554 9.695 0 17.554 7.859 17.554 17.554 0 9.694-7.859 17.552-17.554 17.552-9.694 0-17.553-7.858-17.553-17.552",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(l, ")"),
        stroke: "none"
      },
      d: "M69.067 223.794V95.206C69.067 85.152 76.571 77 86.62 77c10.048 0 17.553 8.152 17.553 18.206v128.588c0 10.055-7.505 18.205-17.553 18.205-10.049 0-17.553-8.15-17.553-18.205",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(m, ")"),
        stroke: "none"
      },
      d: "M198.96 94.554c0-9.695 7.859-17.554 17.553-17.554 9.695 0 17.554 7.859 17.554 17.554 0 9.694-7.859 17.553-17.554 17.553-9.694 0-17.553-7.859-17.553-17.553",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsx("g", {
      clipPath: "url(#".concat(n, ")"),
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)",
      children: /* @__PURE__ */jsx("g", {
        style: {
          opacity: 0.69999701
        },
        clipPath: "url(#".concat(o, ")"),
        children: /* @__PURE__ */jsx("path", {
          style: {
            fill: "url(#".concat(p, ")"),
            stroke: "none"
          },
          d: "M139.155 147.088c6.855-6.855 17.969-6.855 24.824 0s6.855 17.969 0 24.824l-64.947 64.946c-6.855 6.855-17.969 6.855-24.824 0s-6.855-17.969 0-24.823z"
        })
      })
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(q, ")"),
        stroke: "none"
      },
      d: "m204.101 236.858-64.947-64.946c-6.854-6.855-6.854-17.969 0-24.824 6.856-6.855 17.97-6.855 24.824 0l64.947 64.947c6.855 6.855 6.855 17.968 0 24.823A17.495 17.495 0 0 1 216.513 242a17.498 17.498 0 0 1-12.412-5.142",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    }), /* @__PURE__ */jsx("path", {
      style: {
        fill: "url(#".concat(r, ")"),
        stroke: "none"
      },
      d: "M253.374 223.794v-71.315c0-41.685 33.793-75.479 75.479-75.479 9.695 0 17.553 7.859 17.553 17.554 0 9.694-7.858 17.553-17.553 17.553-22.297 0-40.372 18.075-40.372 40.372v71.315c0 10.055-7.505 18.205-17.554 18.205s-17.553-8.15-17.553-18.205",
      transform: "matrix(1.33333 0 0 -1.33333 0 425.333)"
    })]
  });
}
const Logo = styled.span(_templateObject21 || (_templateObject21 = _taggedTemplateLiteral(["\n  display: inline-block;\n  height: 0.8em;\n  margin-right: 1em;\n  transform: translate(0.3em, -0.2em);\n"])));
const Header = () => /* @__PURE__ */jsxs(Fragment, {
  children: [/* @__PURE__ */jsx(Logo, {
    children: /* @__PURE__ */jsx(MuxLogo, {
      height: 13
    })
  }), "API Credentials"]
});
function FormField(props) {
  const {
    children,
    title,
    description,
    inputId
  } = props;
  return /* @__PURE__ */jsxs(Stack, {
    space: 1,
    children: [/* @__PURE__ */jsx(Flex, {
      align: "flex-end",
      children: /* @__PURE__ */jsx(Box, {
        flex: 1,
        paddingY: 2,
        children: /* @__PURE__ */jsx(Stack, {
          space: 2,
          children: /* @__PURE__ */jsxs(Flex, {
            children: [/* @__PURE__ */jsx(Text, {
              as: "label",
              htmlFor: inputId,
              weight: "semibold",
              size: 1,
              children: title || /* @__PURE__ */jsx("em", {
                children: "Untitled"
              })
            }), description && /* @__PURE__ */jsx(Text, {
              muted: true,
              size: 1,
              children: description
            })]
          })
        })
      })
    }), /* @__PURE__ */jsx("div", {
      children
    })]
  });
}
var FormField$1 = memo(FormField);
const fieldNames = ["token", "secretKey", "enableSignedUrls"];
function ConfigureApi(_ref20) {
  let {
    secrets,
    setDialogState
  } = _ref20;
  var _a, _b;
  const client = useClient();
  const [state, dispatch] = useSecretsFormState(secrets);
  const hasSecretsInitially = useMemo(() => secrets.token && secrets.secretKey, [secrets]);
  const handleClose = useCallback(() => setDialogState(false), [setDialogState]);
  const dirty = useMemo(() => secrets.token !== state.token || secrets.secretKey !== state.secretKey || secrets.enableSignedUrls !== state.enableSignedUrls, [secrets, state]);
  const id = "ConfigureApi".concat(useId());
  const [tokenId, secretKeyId, enableSignedUrlsId] = useMemo(() => fieldNames.map(field => "".concat(id, "-").concat(field)), [id]);
  const firstField = useRef(null);
  const handleSaveSecrets = useSaveSecrets(client, secrets);
  const saving = useRef(false);
  const handleSubmit = useCallback(event => {
    event.preventDefault();
    if (!saving.current && event.currentTarget.reportValidity()) {
      saving.current = true;
      dispatch({
        type: "submit"
      });
      const {
        token,
        secretKey,
        enableSignedUrls
      } = state;
      handleSaveSecrets({
        token,
        secretKey,
        enableSignedUrls
      }).then(savedSecrets => {
        const {
          projectId,
          dataset
        } = client.config();
        clear([cacheNs, _id, projectId, dataset]);
        preload(() => Promise.resolve(savedSecrets), [cacheNs, _id, projectId, dataset]);
        setDialogState(false);
      }).catch(err => dispatch({
        type: "error",
        payload: err.message
      })).finally(() => {
        saving.current = false;
      });
    }
  }, [client, dispatch, handleSaveSecrets, setDialogState, state]);
  const handleChangeToken = useCallback(event => {
    dispatch({
      type: "change",
      payload: {
        name: "token",
        value: event.currentTarget.value
      }
    });
  }, [dispatch]);
  const handleChangeSecretKey = useCallback(event => {
    dispatch({
      type: "change",
      payload: {
        name: "secretKey",
        value: event.currentTarget.value
      }
    });
  }, [dispatch]);
  const handleChangeEnableSignedUrls = useCallback(event => {
    dispatch({
      type: "change",
      payload: {
        name: "enableSignedUrls",
        value: event.currentTarget.checked
      }
    });
  }, [dispatch]);
  useEffect(() => {
    if (firstField.current) {
      firstField.current.focus();
    }
  }, [firstField]);
  return /* @__PURE__ */jsx(Dialog, {
    id,
    onClose: handleClose,
    header: /* @__PURE__ */jsx(Header, {}),
    width: 0,
    children: /* @__PURE__ */jsx(Box, {
      padding: 4,
      style: {
        position: "relative"
      },
      children: /* @__PURE__ */jsx("form", {
        onSubmit: handleSubmit,
        noValidate: true,
        children: /* @__PURE__ */jsxs(Stack, {
          space: 4,
          children: [!hasSecretsInitially && /* @__PURE__ */jsx(Card, {
            padding: [3, 3, 3],
            radius: 2,
            shadow: 1,
            tone: "primary",
            children: /* @__PURE__ */jsxs(Stack, {
              space: 3,
              children: [/* @__PURE__ */jsxs(Text, {
                size: 1,
                children: ["To set up a new access token, go to your", " ", /* @__PURE__ */jsx("a", {
                  href: "https://dashboard.mux.com/settings/access-tokens",
                  target: "_blank",
                  rel: "noreferrer noopener",
                  children: "account on mux.com"
                }), "."]
              }), /* @__PURE__ */jsxs(Text, {
                size: 1,
                children: ["The access token needs permissions: ", /* @__PURE__ */jsx("strong", {
                  children: "Mux Video "
                }), "(Full Access) and ", /* @__PURE__ */jsx("strong", {
                  children: "Mux Data"
                }), " (Read)", /* @__PURE__ */jsx("br", {}), "The credentials will be stored safely in a hidden document only available to editors."]
              })]
            })
          }), /* @__PURE__ */jsx(FormField$1, {
            title: "Access Token",
            inputId: tokenId,
            children: /* @__PURE__ */jsx(TextInput, {
              id: tokenId,
              ref: firstField,
              onChange: handleChangeToken,
              type: "text",
              value: (_a = state.token) != null ? _a : "",
              required: !!state.secretKey || state.enableSignedUrls
            })
          }), /* @__PURE__ */jsx(FormField$1, {
            title: "Secret Key",
            inputId: secretKeyId,
            children: /* @__PURE__ */jsx(TextInput, {
              id: secretKeyId,
              onChange: handleChangeSecretKey,
              type: "text",
              value: (_b = state.secretKey) != null ? _b : "",
              required: !!state.token || state.enableSignedUrls
            })
          }), /* @__PURE__ */jsxs(Stack, {
            space: 4,
            children: [/* @__PURE__ */jsxs(Flex, {
              align: "center",
              children: [/* @__PURE__ */jsx(Checkbox, {
                id: enableSignedUrlsId,
                onChange: handleChangeEnableSignedUrls,
                checked: state.enableSignedUrls,
                style: {
                  display: "block"
                }
              }), /* @__PURE__ */jsx(Box, {
                flex: 1,
                paddingLeft: 3,
                children: /* @__PURE__ */jsx(Text, {
                  children: /* @__PURE__ */jsx("label", {
                    htmlFor: enableSignedUrlsId,
                    children: "Enable Signed Urls"
                  })
                })
              })]
            }), secrets.signingKeyId && state.enableSignedUrls ? /* @__PURE__ */jsx(Card, {
              padding: [3, 3, 3],
              radius: 2,
              shadow: 1,
              tone: "caution",
              children: /* @__PURE__ */jsxs(Stack, {
                space: 3,
                children: [/* @__PURE__ */jsx(Text, {
                  size: 1,
                  children: "The signing key ID that Sanity will use is:"
                }), /* @__PURE__ */jsx(Code, {
                  size: 1,
                  children: secrets.signingKeyId
                }), /* @__PURE__ */jsxs(Text, {
                  size: 1,
                  children: ["This key is only used for previewing content in the Sanity UI.", /* @__PURE__ */jsx("br", {}), "You should generate a different key to use in your application server."]
                })]
              })
            }) : null]
          }), /* @__PURE__ */jsxs(Inline, {
            space: 2,
            children: [/* @__PURE__ */jsx(Button, {
              text: "Save",
              disabled: !dirty,
              loading: state.submitting,
              tone: "primary",
              mode: "default",
              type: "submit"
            }), /* @__PURE__ */jsx(Button, {
              disabled: state.submitting,
              text: "Cancel",
              mode: "bleed",
              onClick: handleClose
            })]
          }), state.error && /* @__PURE__ */jsx(Card, {
            padding: [3, 3, 3],
            radius: 2,
            shadow: 1,
            tone: "critical",
            children: /* @__PURE__ */jsx(Text, {
              children: state.error
            })
          })]
        })
      })
    })
  });
}
var ConfigureApi$1 = memo(ConfigureApi);
function ErrorBoundaryCard(props) {
  const {
    children,
    schemaType
  } = props;
  const {
    push: pushToast
  } = useToast();
  const errorRef = useRef(null);
  const {
    ErrorBoundary,
    didCatch,
    error,
    reset
  } = useErrorBoundary({
    onDidCatch: (err, errorInfo) => {
      console.group(err.toString());
      console.groupCollapsed("console.error");
      console.error(err);
      console.groupEnd();
      if (err.stack) {
        console.groupCollapsed("error.stack");
        console.log(err.stack);
        console.groupEnd();
      }
      if (errorInfo == null ? void 0 : errorInfo.componentStack) {
        console.groupCollapsed("errorInfo.componentStack");
        console.log(errorInfo.componentStack);
        console.groupEnd();
      }
      console.groupEnd();
      pushToast({
        status: "error",
        title: "Plugin crashed",
        description: /* @__PURE__ */jsx(Flex, {
          align: "center",
          children: /* @__PURE__ */jsxs(Inline, {
            space: 1,
            children: ["An error happened while rendering", /* @__PURE__ */jsx(Button, {
              padding: 1,
              fontSize: 1,
              style: {
                transform: "translateY(1px)"
              },
              mode: "ghost",
              text: schemaType.title,
              onClick: () => {
                if (errorRef.current) {
                  scrollIntoView(errorRef.current, {
                    behavior: "smooth",
                    scrollMode: "if-needed",
                    block: "center"
                  });
                }
              }
            })]
          })
        })
      });
    }
  });
  const handleRetry = useCallback(() => {
    clear([name]);
    reset();
  }, [reset]);
  if (didCatch) {
    return /* @__PURE__ */jsx(Card, {
      ref: errorRef,
      paddingX: [2, 3, 4, 4],
      height: "fill",
      shadow: 1,
      overflow: "auto",
      children: /* @__PURE__ */jsx(Flex, {
        justify: "flex-start",
        align: "center",
        height: "fill",
        children: /* @__PURE__ */jsxs(Grid, {
          columns: 1,
          gap: [2, 3, 4, 4],
          children: [/* @__PURE__ */jsxs(Heading, {
            as: "h1",
            children: ["The ", /* @__PURE__ */jsx("code", {
              children: name
            }), " plugin crashed"]
          }), (error == null ? void 0 : error.message) && /* @__PURE__ */jsx(Card, {
            padding: 3,
            tone: "critical",
            shadow: 1,
            radius: 2,
            children: /* @__PURE__ */jsx(Text, {
              children: error.message
            })
          }), /* @__PURE__ */jsx(Inline, {
            children: /* @__PURE__ */jsx(Button, {
              onClick: handleRetry,
              text: "Retry"
            })
          })]
        })
      })
    });
  }
  return /* @__PURE__ */jsx(ErrorBoundary, {
    children
  });
}
var ErrorBoundaryCard$1 = memo(ErrorBoundaryCard);
const AspectRatioCard = styled(Card)(_templateObject22 || (_templateObject22 = _taggedTemplateLiteral(["\n  aspect-ratio: 16 / 9;\n  position: relative;\n  width: 100%;\n"])));
const InputFallback = () => {
  return /* @__PURE__ */jsx("div", {
    style: {
      padding: 1
    },
    children: /* @__PURE__ */jsx(Card, {
      shadow: 1,
      sizing: "border",
      style: {
        aspectRatio: "16/9",
        width: "100%",
        borderRadius: "1px"
      },
      children: /* @__PURE__ */jsxs(Flex, {
        align: "center",
        direction: "column",
        height: "fill",
        justify: "center",
        children: [/* @__PURE__ */jsx(Spinner, {
          muted: true
        }), /* @__PURE__ */jsx(Box, {
          marginTop: 3,
          children: /* @__PURE__ */jsx(Text, {
            align: "center",
            muted: true,
            size: 1,
            children: "Loading\u2026"
          })
        })]
      })
    })
  });
};
function Onboard(props) {
  const {
    setDialogState
  } = props;
  const handleOpen = useCallback(() => setDialogState("secrets"), [setDialogState]);
  return /* @__PURE__ */jsx(Fragment, {
    children: /* @__PURE__ */jsx("div", {
      style: {
        padding: 2
      },
      children: /* @__PURE__ */jsx(Card, {
        display: "flex",
        sizing: "border",
        style: {
          aspectRatio: "16/9",
          width: "100%",
          boxShadow: "var(--card-bg-color) 0 0 0 2px"
        },
        paddingX: [2, 3, 4, 4],
        radius: 1,
        tone: "transparent",
        children: /* @__PURE__ */jsx(Flex, {
          justify: "flex-start",
          align: "center",
          children: /* @__PURE__ */jsxs(Grid, {
            columns: 1,
            gap: [2, 3, 4, 4],
            children: [/* @__PURE__ */jsx(Inline, {
              paddingY: 1,
              children: /* @__PURE__ */jsx("div", {
                style: {
                  height: "32px"
                },
                children: /* @__PURE__ */jsx(MuxLogo, {})
              })
            }), /* @__PURE__ */jsx(Inline, {
              paddingY: 1,
              children: /* @__PURE__ */jsx(Heading, {
                size: [0, 1, 2, 2],
                children: "Upload and preview videos directly from your studio."
              })
            }), /* @__PURE__ */jsx(Inline, {
              paddingY: 1,
              children: /* @__PURE__ */jsx(Button, {
                mode: "ghost",
                icon: PlugIcon,
                text: "Configure API",
                onClick: handleOpen
              })
            })]
          })
        })
      })
    })
  });
}
const Input = props => {
  var _a;
  const client = useClient();
  const secretDocumentValues = useSecretsDocumentValues();
  const assetDocumentValues = useAssetDocumentValues((_a = props.value) == null ? void 0 : _a.asset);
  const poll = useMuxPolling(props.readOnly ? void 0 : (assetDocumentValues == null ? void 0 : assetDocumentValues.value) || void 0);
  const [dialogState, setDialogState] = useDialogState();
  const error = secretDocumentValues.error || assetDocumentValues.error || poll.error;
  if (error) {
    throw error;
  }
  const isLoading = secretDocumentValues.isLoading || assetDocumentValues.isLoading;
  return /* @__PURE__ */jsx(AspectRatioCard, {
    children: /* @__PURE__ */jsx(ErrorBoundaryCard$1, {
      schemaType: props.schemaType,
      children: /* @__PURE__ */jsx(Suspense, {
        fallback: /* @__PURE__ */jsx(InputFallback, {}),
        children: isLoading ? /* @__PURE__ */jsx(InputFallback, {}) : /* @__PURE__ */jsxs(Fragment, {
          children: [secretDocumentValues.value.needsSetup && !assetDocumentValues.value ? /* @__PURE__ */jsx(Onboard, {
            setDialogState
          }) : /* @__PURE__ */jsx(MuxVideoInputUploader, {
            ...props,
            config: props.config,
            onChange: props.onChange,
            client,
            secrets: secretDocumentValues.value.secrets,
            asset: assetDocumentValues.value,
            dialogState,
            setDialogState,
            needsSetup: secretDocumentValues.value.needsSetup
          }), dialogState === "secrets" && /* @__PURE__ */jsx(ConfigureApi$1, {
            setDialogState,
            secrets: secretDocumentValues.value.secrets
          })]
        })
      })
    })
  });
};
var Input$1 = memo(Input);
function muxVideoCustomRendering(config) {
  return {
    components: {
      input: props => /* @__PURE__ */jsx(Input$1, {
        config,
        ...props
      })
    },
    preview: {
      select: {
        filename: "asset.filename",
        playbackId: "asset.playbackId",
        status: "asset.status",
        assetId: "asset.assetId",
        thumbTime: "asset.thumbTime",
        data: "asset.data"
      },
      prepare: asset => {
        const {
          filename,
          playbackId,
          status
        } = asset;
        return {
          title: filename || playbackId || "",
          subtitle: status ? "status: ".concat(status) : null,
          media: asset.playbackId ? /* @__PURE__ */jsx(VideoThumbnail, {
            asset,
            width: 64
          }) : null
        };
      }
    }
  };
}
const muxVideo = {
  name: "mux.video",
  type: "object",
  title: "Video asset reference",
  fields: [{
    title: "Video",
    name: "asset",
    type: "reference",
    weak: true,
    to: [{
      type: "mux.videoAsset"
    }]
  }]
};
const muxVideoAsset = {
  name: "mux.videoAsset",
  type: "object",
  title: "Video asset",
  fields: [{
    type: "string",
    name: "status"
  }, {
    type: "string",
    name: "assetId"
  }, {
    type: "string",
    name: "playbackId"
  }, {
    type: "string",
    name: "filename"
  }, {
    type: "number",
    name: "thumbTime"
  }]
};
const defaultConfig = {
  mp4_support: "none"
};
const muxInput = definePlugin(userConfig => {
  const config = {
    ...defaultConfig,
    ...userConfig
  };
  return {
    name: "mux-input",
    schema: {
      types: [muxVideoAsset, {
        ...muxVideo,
        ...muxVideoCustomRendering(config)
      }]
    }
  };
});
export { UploadProgress, VideoThumbnail, defaultConfig, deleteAsset, generateJwt, getPlaybackId, getPlaybackPolicy, getPosterSrc, muxInput, useClient };
//# sourceMappingURL=index-8603a901.js.map
