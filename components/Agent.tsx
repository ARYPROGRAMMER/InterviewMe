"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  userPhotoURL,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    // Track the last received message for display in the transcript
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      setLastMessage(lastMsg.content);
    }
  }, [messages]);

  // Optimize transcript updates by using a memoized value
  const displayMessage = React.useMemo(() => {
    return (
      lastMessage ||
      (callStatus === CallStatus.ACTIVE ? "Interview in progress..." : "")
    );
  }, [lastMessage, callStatus]);

  const handleGenerateFeedback = React.useCallback(
    async (messages: SavedMessage[]) => {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    },
    [interviewId, userId, router]
  );

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    type,
    userId,
    handleGenerateFeedback,
  ]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Failed to start the interview. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          {callStatus === CallStatus.ACTIVE && (
            <p className="text-primary-200 text-sm animate-pulse mt-2">
              {isSpeaking ? "Speaking..." : "Listening..."}
            </p>
          )}

          {callStatus === CallStatus.CONNECTING && (
            <p className="status-indicator">
              Connecting to your interview session...
            </p>
          )}
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src={userPhotoURL || "/user-avatar.png"}
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px] border-2 border-primary-200/30 shadow-md"
            />
            <h3>{userName}</h3>
            {callStatus === CallStatus.ACTIVE && !isSpeaking && (
              <p className="text-primary-200 text-sm animate-pulse mt-2">
                Your turn to speak
              </p>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 ? (
        <div className="transcript-border mt-6">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {displayMessage}
            </p>
          </div>
        </div>
      ) : (
        callStatus === CallStatus.ACTIVE && (
          <div className="transcript-border mt-6">
            <div className="transcript">
              <p className="animate-pulse">Interview starting...</p>
            </div>
          </div>
        )
      )}

      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative flex items-center gap-2">
              {callStatus === "INACTIVE" && (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5 9-9"></path>
                  </svg>
                  Start Interview
                </>
              )}
              {callStatus === "CONNECTING" && (
                <>
                  <span className="animate-pulse">Connecting...</span>
                </>
              )}
              {callStatus === "FINISHED" && "Try Again"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              End Interview
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
