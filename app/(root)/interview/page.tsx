import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import React from "react";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="blue-gradient-dark rounded-xl p-6 shadow-lg mb-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-dark-200 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-200"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="text-2xl">Generate a Custom Interview</h3>
          </div>

          <p className="text-light-100/90 mb-6">
            Our AI will create a personalized interview based on your
            preferences. Simply interact with the AI assistant to specify the
            job role, experience level, and technical focus. The system will
            generate tailored questions for your practice session.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-300/40 p-4 rounded-lg flex flex-col items-center text-center border border-primary-200/10">
              <div className="bg-dark-200 p-2 rounded-full mb-3">
                <Image src="/profile.svg" alt="role" width={20} height={20} />
              </div>
              <h4 className="text-primary-100 font-semibold mb-1">
                Specify Role
              </h4>
              <p className="text-sm">
                Tell the AI which job position you're preparing for
              </p>
            </div>

            <div className="bg-dark-300/40 p-4 rounded-lg flex flex-col items-center text-center border border-primary-200/10">
              <div className="bg-dark-200 p-2 rounded-full mb-3">
                <Image src="/file.svg" alt="tech" width={20} height={20} />
              </div>
              <h4 className="text-primary-100 font-semibold mb-1">
                Choose Tech Stack
              </h4>
              <p className="text-sm">
                Specify the technologies relevant to your target position
              </p>
            </div>

            <div className="bg-dark-300/40 p-4 rounded-lg flex flex-col items-center text-center border border-primary-200/10">
              <div className="bg-dark-200 p-2 rounded-full mb-3">
                <Image src="/star.svg" alt="focus" width={20} height={20} />
              </div>
              <h4 className="text-primary-100 font-semibold mb-1">
                Select Focus
              </h4>
              <p className="text-sm">
                Choose between technical, behavioral, or mixed questions
              </p>
            </div>
          </div>

          <div className="bg-dark-300/30 p-4 rounded-lg border border-primary-200/10">
            <h4 className="text-md font-semibold flex items-center gap-2 mb-2 text-primary-100">
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              How It Works
            </h4>
            <p className="text-sm text-light-100/80">
              When you click "Start Interview" below, our AI will guide you
              through a conversation to gather the details needed to create your
              custom interview. After the generation process, you'll be
              redirected to your dashboard where you can take the newly created
              interview.
            </p>
          </div>
        </div>
      </div>

      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        type="generate"
        userPhotoURL={user?.photoURL}
      />
    </>
  );
};

export default Page;
