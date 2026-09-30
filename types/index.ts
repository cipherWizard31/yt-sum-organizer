export interface Video {
  id: string
  user_id: string
  title: string
  video_url: string
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
