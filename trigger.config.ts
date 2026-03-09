import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_audio_notes", // Replace with your actual project ID from Trigger.dev dashboard
  dirs: ["./src/trigger"],
  maxDuration: 300, // 5 minutes max for audio transcription tasks
});
