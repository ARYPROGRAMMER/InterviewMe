import Agent from "@/components/Agent";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import { getRandomInterviewCover } from "@/lib/utils";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const interview = await getInterviewById(id);
  const user = await getCurrentUser();

  if (!interview) redirect("/");

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-4 justify-between items-center bg-dark-200/30 p-4 rounded-xl shadow-md">
          <div className="flex flex-row gap-4 items-center max-sm:flex-col">
            <div className="flex flex-row gap-4 items-center">
              <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={40}
                height={40}
                className="rounded-full object-cover size-[50px] border-2 border-primary-200/30 shadow-md"
              />
              <div>
                <h3 className="capitalize">{interview.role}</h3>
                <p className="text-sm text-light-100/70">
                  Experience Level:{" "}
                  <span className="text-primary-200 capitalize">
                    {interview.level}
                  </span>
                </p>
              </div>
            </div>
            <DisplayTechIcons techStack={interview.techstack} />
          </div>

          <p className="bg-dark-200 px-4 rounded-full py-2 h-fit capitalize text-primary-200 font-semibold border border-primary-200/20">
            {interview.type}
          </p>
        </div>

        <div className="blue-gradient-dark p-6 rounded-xl shadow-md mb-4">
          <h3 className="text-xl mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
            Interview Instructions
          </h3>
          <ul className="space-y-2 mb-4">
            <li>
              This is a simulated interview for a{" "}
              <span className="text-primary-200 capitalize">
                {interview.role}
              </span>{" "}
              position
            </li>
            <li>Speak clearly and answer as if you're in a real interview</li>
            <li>When you're ready, click the "Start Interview" button below</li>
            <li>
              You can end the interview at any time by clicking "End Interview"
            </li>
            <li>
              After completion, you'll receive detailed feedback on your
              performance
            </li>
          </ul>

          <div className="bg-dark-300/50 p-4 rounded-lg border border-primary-200/10">
            <h4 className="text-md font-semibold mb-2 text-primary-100">
              Interview Focus:{" "}
              <span className="capitalize">{interview.type}</span>
            </h4>
            <p className="text-sm text-light-100/80">
              This interview contains {interview.questions.length} questions
              focusing on {interview.type.toLowerCase()} aspects of the role.
            </p>
          </div>
        </div>
      </div>

      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        userPhotoURL={user?.photoURL}
      />
    </>
  );
};

export default Page;
