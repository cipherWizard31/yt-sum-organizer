export interface Video {
  id: string
  user_id: string
  title: string
  video_url: string
  folder_id: string | null
  created_at: string
}

export interface TimestampNote {
  id: string
  video_id: string
  user_id: string
  time_in_seconds: number
  note_text: string
  created_at: string
}

export interface Summary {
  id: string
  video_id: string
  user_id: string
  summary_text: string
  created_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  created_at: string
}
