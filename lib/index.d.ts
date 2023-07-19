import type {PartialDeep} from 'type-fest'
import {Plugin as Plugin_2} from 'sanity'
import type {SanityDocument} from 'sanity'

declare interface Config {
  /**
   * Enable static renditions by setting this to 'standard'
   * @see {@link https://docs.mux.com/guides/video/enable-static-mp4-renditions#why-enable-mp4-support}
   * @defaultValue 'none'
   */
  mp4_support: 'none' | 'standard'
}

export declare const defaultConfig: Config

declare interface MuxAsset {
  id: string
  created_at: string
  status: 'preparing' | 'ready' | 'errored'
  duration: number
  max_stored_resolution: 'Audio only' | 'SD' | 'HD' | 'FHD' | 'UHD'
  max_stored_frame_rate: -1 | number
  aspect_ratio: `${number}:${number}`
  playback_ids: MuxPlaybackId[]
  tracks: MuxTrack[]
  errors?: MuxErrors
  upload_id: string
  is_live?: boolean
  passthrough: string
  live_stream_id?: string
  master?: {
    status: 'ready' | 'preparing' | 'errored'
    url: string
  }
  master_access: 'temporary' | 'none'
  mp4_support: 'standard' | 'none'
  source_asset_id?: string
  normalize_audio?: boolean
  static_renditions?: {
    status: 'ready' | 'preparing' | 'disabled' | 'errored'
    files: {
      name: 'low.mp4' | 'medium.mp4' | 'high.mp4' | 'audio.m4a'
      ext: 'mp4' | 'm4a'
      height: number
      width: number
      bitrate: number
      filesize: number
    }[]
  }
  recording_times?: {
    started_at: string
    duration: number
    type: 'content' | 'slate'
  }[]
  non_standard_input_reasons?: {
    video_codec?: string
    audio_codec?: string
    video_gop_size?: 'high'
    video_frame_rate?: string
    video_resolution?: string
    video_bitrate?: 'high'
    pixel_aspect_ratio?: string
    video_edit_list?: 'non-standard'
    audio_edit_list?: 'non-standard'
    unexpected_media_file_parameters?: 'non-standard'
    test?: boolean
  }
}

declare interface MuxAudioTrack {
  type: 'audio'
  id: string
  duration?: number
  max_channels: number
  max_channel_layout: 'stereo' | string
}

declare interface MuxErrors {
  type: string
  messages: string[]
}

export declare const muxInput: Plugin_2<void | Partial<Config>>

declare interface MuxPlaybackId {
  id: string
  policy: PlaybackPolicy
}

declare type MuxTrack = MuxVideoTrack | MuxAudioTrack

declare interface MuxVideoTrack {
  type: 'video'
  id: string
  max_width: number
  max_height: number
  max_frame_rate: -1 | number
  duration?: number
}

declare type PlaybackPolicy = 'signed' | 'public'

export declare interface VideoAssetDocument extends Partial<SanityDocument> {
  type?: 'mux.videoAsset'
  status?: string
  assetId?: string
  playbackId?: string
  filename?: string
  thumbTime?: number
  data?: PartialDeep<MuxAsset>
}

export {}
