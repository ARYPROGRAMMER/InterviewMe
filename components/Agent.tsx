"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK", // New state for feedback generation
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
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const AUTO_HANGUP_SILENCE_THRESHOLD = 45000; // Increased from 30000 to 45000 ms to give users more time
  const userSpeakingRef = useRef(false);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SPEAKING_DEBOUNCE = 1200; // Reduced from 1500 to 1200ms for faster response
  
  // New references for optimizing message processing
  const messageQueueRef = useRef<SavedMessage[]>([]);
  const processingRef = useRef(false);
  const aiResponseRef = useRef<string>("");
  const aiPartialResponseRef = useRef<string>("");
  const transcriptUpdateTimeRef = useRef<number>(Date.now());
  const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to process messages in queue without overwhelming React rendering
  const processMessageQueue = () => {
    if (messageQueueRef.current.length === 0) {
      processingRef.current = false;
      return;
    }

    processingRef.current = true;
    const message = messageQueueRef.current.shift();
    
    // Only update state if we have an actual message
    if (message) {
      // Batch updates if multiple messages are coming in rapid succession
      const currentTime = Date.now();
      const timeSinceLastUpdate = currentTime - transcriptUpdateTimeRef.current;
      
      // If many updates are coming rapidly, batch them for performance
      if (timeSinceLastUpdate < 100 && messageQueueRef.current.length > 0) {
        // Schedule next message processing
        setTimeout(() => {
          // Update messages state with the current message
          setMessages((prev) => [...prev, message]);
          transcriptUpdateTimeRef.current = Date.now();
          
          // Process next message in queue
          processMessageQueue();
        }, 50);
      } else {
        // Update immediately if not too many updates
        setMessages((prev) => [...prev, message]);
        transcriptUpdateTimeRef.current = Date.now();
        
        // Process next message with minimal delay
        setTimeout(processMessageQueue, 10);
      }
    } else {
      // No message, just mark as not processing
      processingRef.current = false;
    }
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      // Update lastInteractionTime for any message to prevent premature hangup
      setLastInteractionTime(Date.now());
      
      if (message.type === "transcript") {
        // Handle partial transcripts for immediate display
        if (message.transcriptType === "partial") {
          if (message.role === "user") {
            // User partial transcripts
            setPartialTranscript(message.transcript);
            // When user is speaking (even partially), mark as active to prevent AI interruption
            userSpeakingRef.current = true;
            // Clear any pending timeouts when new partial transcript arrives
            if (speakingTimeoutRef.current) {
              clearTimeout(speakingTimeoutRef.current);
            }
          } else if (message.role === "assistant") {
            // AI partial transcripts - show streaming captions
            aiPartialResponseRef.current = message.transcript;
            // Update live captions with minimal delay
            if (!captionTimeoutRef.current) {
              captionTimeoutRef.current = setTimeout(() => {
                setPartialTranscript(aiPartialResponseRef.current);
                captionTimeoutRef.current = null;
              }, 50); // Small delay for performance, not noticeable to users
            }
          }
        }
        
        // Process final transcripts
        if (message.transcriptType === "final") {
          const newMessage = { role: message.role, content: message.transcript };
          
          // Add message to queue for processing
          messageQueueRef.current.push(newMessage);
          
          // Process message queue if not already processing
          if (!processingRef.current) {
            processMessageQueue();
          }
          
          if (message.role === "user") {
            // Set a timeout before considering the user has finished speaking
            // to avoid VAPI interrupting during brief pauses
            speakingTimeoutRef.current = setTimeout(() => {
              userSpeakingRef.current = false;
              setPartialTranscript("");
            }, SPEAKING_DEBOUNCE);
          } else {
            // For AI messages, clear any partial response
            aiPartialResponseRef.current = "";
            if (captionTimeoutRef.current) {
              clearTimeout(captionTimeoutRef.current);
              captionTimeoutRef.current = null;
            }
            
            // Immediately set final message for better UX - no delay
            setLastMessage(message.transcript);
            setPartialTranscript("");
            
            // For generation type, check if the AI indicates completion
            if (type === "generate" && message.role === "assistant") {
              const lowerCaseContent = message.transcript.toLowerCase();
              if (
                lowerCaseContent.includes("your interview has been created") ||
                lowerCaseContent.includes("interview has been generated") ||
                lowerCaseContent.includes("interview is now ready") ||
                lowerCaseContent.includes("finished creating") ||
                lowerCaseContent.includes("successfully created your interview") ||
                lowerCaseContent.includes("interview is ready for you") ||
                lowerCaseContent.includes("completed creating your interview") ||
                lowerCaseContent.includes("all set with your interview") ||
                lowerCaseContent.includes("interview is all set up")
              ) {
                // Auto hang up after interview creation is complete
                handleDisconnect();
              }
            }
          }

          // Check if user asks to end the call or hang up
          if (message.role === "user") {
            const lowerCaseContent = message.transcript.toLowerCase();
            if (
              lowerCaseContent.includes("end interview") ||
              lowerCaseContent.includes("hang up") ||
              lowerCaseContent.includes("end call") ||
              lowerCaseContent.includes("finish interview") ||
              lowerCaseContent.includes("stop interview") ||
              lowerCaseContent.includes("that's all") ||
              lowerCaseContent.includes("i'm done") ||
              lowerCaseContent.includes("im done") ||
              lowerCaseContent.includes("terminate interview") ||
              lowerCaseContent.includes("thank you for your time") ||
              lowerCaseContent.includes("conclude") ||
              lowerCaseContent.includes("wrap up") ||
              lowerCaseContent.includes("finish up") ||
              lowerCaseContent.includes("goodbye") ||
              lowerCaseContent.includes("bye") ||
              lowerCaseContent.includes("thanks for the interview") ||
              lowerCaseContent.includes("thanks that's all") ||
              lowerCaseContent.includes("that's it") ||
              lowerCaseContent.includes("end the generation") ||
              lowerCaseContent.includes("thanks for generating") ||
              lowerCaseContent.includes("stop generating") ||
              lowerCaseContent.includes("looks good") ||
              lowerCaseContent.includes("that sounds good")
            ) {
              handleDisconnect();
            }
          }
        }
      }
    };

    const onSpeechStart = () => {
      // Clear any pending timeouts to prevent false speech end detection
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }

      setIsSpeaking(true);
      setLastInteractionTime(Date.now());

      // For user speech detection
      if (!isSpeaking) {
        userSpeakingRef.current = true;
      }
    };

    const onSpeechEnd = () => {
      // Add a delay before considering speech truly ended to handle brief pauses
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        userSpeakingRef.current = false;
      }, SPEAKING_DEBOUNCE);

      setLastInteractionTime(Date.now());
    };

    const onError = (error: Error) => {
      console.log("Error:", error);

      // Handle "Meeting has ended" error gracefully
      if (error.message && error.message.includes("Meeting has ended")) {
        console.log("Meeting ended normally, handling gracefully");
        // If we're already in FINISHED state, don't trigger another state change
        if (callStatus !== CallStatus.FINISHED) {
          setCallStatus(CallStatus.FINISHED);
        }
      } else {
        // For other errors, show a notification to the user
        toast.error("There was an issue with the call. Please try again.");
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      // Clean up all timeouts
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }

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

  // Optimize transcript display to show partial transcripts immediately
  const displayMessage = React.useMemo(() => {
    // Show partial transcript if available
    if (partialTranscript) {
      return partialTranscript;
    }

    // Otherwise show the last message or a default message
    return (
      lastMessage ||
      (callStatus === CallStatus.ACTIVE ? "Interview in progress..." : "")
    );
  }, [lastMessage, callStatus, partialTranscript]);

  const handleGenerateFeedback = React.useCallback(
    async (messages: SavedMessage[]) => {
      setCallStatus(CallStatus.GENERATING_FEEDBACK);
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        callStatus === CallStatus.ACTIVE &&
        Date.now() - lastInteractionTime > AUTO_HANGUP_SILENCE_THRESHOLD
      ) {
        handleDisconnect();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus, lastInteractionTime]);

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
      {callStatus === CallStatus.GENERATING_FEEDBACK && (
        <div className="fixed inset-0 bg-dark-300/80 flex items-center justify-center z-50">
          <div className="bg-dark-200 p-8 rounded-xl shadow-lg flex flex-col items-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-200 mb-4"></div>
            <h3 className="text-xl font-semibold text-primary-100 mb-2">
              Generating Your Feedback
            </h3>
            <p className="text-center text-light-100/80">
              Please wait while our AI analyzes your interview and prepares
              detailed feedback. This may take a moment...
            </p>
          </div>
        </div>
      )}

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

      {callStatus === CallStatus.ACTIVE ||
      messages.length > 0 ||
      partialTranscript ? (
        <div className="transcript-border mt-6">
          <div className="transcript">
            <p
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
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative flex items-center gap-2">
              {callStatus === CallStatus.INACTIVE && (
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
              {callStatus === CallStatus.CONNECTING && (
                <>
                  <span className="animate-pulse">Connecting...</span>
                </>
              )}
              {callStatus === CallStatus.FINISHED && "Try Again"}
              {callStatus === CallStatus.GENERATING_FEEDBACK && (
                <>
                  <span className="animate-pulse">Generating Feedback...</span>
                </>
              )}
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
