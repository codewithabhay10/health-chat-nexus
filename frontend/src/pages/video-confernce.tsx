import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";

// FastAPI speech-to-text endpoint used to build the live transcript.
const TRANSCRIBE_ENDPOINT = "https://database-tval.onrender.com/record";

// The route param can arrive as "123" or, from older links, "123&from=doctor".
// Pull the real appointment id and the optional "from"/"roomID" hints out of it.
function parseParam(raw: string | undefined) {
  const [idPart, ...rest] = (raw ?? "").split("&");
  const tail = new URLSearchParams(rest.join("&"));
  const search = new URLSearchParams(window.location.search);
  return {
    id: idPart || "",
    from: tail.get("from") || search.get("from") || "patient",
    roomOverride: tail.get("roomID") || search.get("roomID") || "",
  };
}

const VideoConference: React.FC = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const { id, from, roomOverride } = parseParam(appointmentId);
  // A deterministic room name so the doctor and patient land in the SAME call.
  const roomName =
    roomOverride || `HealthChat-${id || Math.floor(Math.random() * 100000)}`;
  const displayName = from === "doctor" ? "Doctor" : "Patient";
  const returnPath = from === "doctor" ? "/doctor-dashboard" : "/patient-dashboard";

  // ─── Live transcript: record the mic in 3s chunks and POST to the STT endpoint ───
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let activeStream: MediaStream | null = null;

    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        activeStream = stream;
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          if (audioChunks.current.length === 0) return;
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          try {
            const response = await fetch(TRANSCRIBE_ENDPOINT, {
              method: "POST",
              headers: { Accept: "application/json" },
              body: formData,
            });
            if (response.ok) {
              const data = await response.json();
              if (data.transcription && data.transcription !== "Transcription failed:") {
                setTranscript((prev) => (prev + " " + data.transcription).trim());
              }
            }
          } catch {
            /* transcription is best-effort; ignore network failures */
          }
        };

        mediaRecorder.start();
        // Flush a chunk every 3 seconds for a near-live transcript.
        interval = setInterval(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            mediaRecorder.start();
            audioChunks.current = [];
          }
        }, 3000);
      } catch {
        /* mic unavailable: silently skip the live transcript */
      }
    }

    startRecording();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      activeStream?.getTracks().forEach((track) => track.stop());
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        userInfo={{ displayName, email: "" }}
        configOverwrite={{
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          disableThirdPartyRequests: true,
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
        }}
        onReadyToClose={() => navigate(returnPath)}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100vh";
          iframeRef.style.width = "100vw";
        }}
      />

      {/* Live transcript overlay (best-effort; powered by the FastAPI /record endpoint) */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 8,
          padding: 12,
          minWidth: 200,
          maxWidth: 400,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
          fontSize: 16,
          pointerEvents: "none",
        }}
      >
        <strong>Live Transcript:</strong>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{transcript}</div>
      </div>
    </div>
  );
};

export default VideoConference;
