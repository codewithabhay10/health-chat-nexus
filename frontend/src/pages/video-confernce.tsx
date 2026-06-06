import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

function getUrlParams(url: string): Record<string, string> {
  const urlStr = url.split("?")[1];
  const urlSearchParams = new URLSearchParams(urlStr);
  return Object.fromEntries(urlSearchParams.entries());
}

const ZegoVideoConference: React.FC = () => {
  // Force reload once on navigation to this page
  useEffect(() => {
    if (!sessionStorage.getItem("videoConferenceReloaded")) {
      sessionStorage.setItem("videoConferenceReloaded", "true");
      window.location.reload();
    } else {
      sessionStorage.removeItem("videoConferenceReloaded");
    }
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Live transcript state
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Start recording and send audio chunks every few seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunks.current.length === 0) return;
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const response = await fetch("https://database-tval.onrender.com/record", {
              method: "POST",
              headers: { "Accept": "application/json" },
              body: formData,
            });
            if (response.ok) {
              const data = await response.json();
              if (data.transcription == "Transcription failed:") {
                setTranscript((prev) => prev);
              } else {
                setTranscript((prev) => prev + " " + data.transcription);
              }
            }
          } catch (err) {
            // Optionally handle error
          }
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Send audio every 5 seconds
        interval = setInterval(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            mediaRecorder.start();
            audioChunks.current = [];
          }
        }, 3000);
      } catch (err) {
        // Optionally handle error
      }
    }

    // Start recording when component mounts
    startRecording();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const roomID =
      getUrlParams(window.location.href)["roomID"] ||
      Math.floor(Math.random() * 10000).toString();

    // Construct the final meeting link
    const meetingLink =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?roomID=" +
      roomID;

    // Save the meeting id and final link in localStorage
    localStorage.setItem("meeting_id", roomID);
    localStorage.setItem("meeting_link", meetingLink);

    const userID = Math.floor(Math.random() * 10000).toString();
    const userName = "userName" + userID;
    const appID = 158654939;
    const serverSecret = "23f26c9aa0de1a0defdc90161441bbf9";
    const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const zp = window.ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: rootRef.current,
      onLeaveRoom: () => {
        navigate("/patient-dashboard");
      },
      sharedLinks: [
        {
          name: "Personal link",
          url: meetingLink,
        },
      ],
      scenario: {
        mode: window.ZegoUIKitPrebuilt.VideoConference,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      maxUsers: 2,
      layout: "Auto",
      showLayoutButton: false,
    });
  }, [navigate]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        id="root"
        ref={rootRef}
        style={{ width: "100vw", height: "100vh" }}
      ></div>
      {/* Transcript Box */}
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
        }}
      >
        <strong>Live Transcript:</strong>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{transcript}</div>
      </div>
    </div>
  );
};

export default ZegoVideoConference;
