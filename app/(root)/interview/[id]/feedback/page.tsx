import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold text-primary-100">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5 bg-dark-200/50 px-6 py-3 rounded-full shadow-md">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold text-lg">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="card-border w-full">
        <div className="card p-6">
          <p className="text-xl leading-relaxed italic text-light-100">
            {feedback?.finalAssessment}
          </p>
        </div>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-6">
        <h2 className="border-b border-light-400/30 pb-2">
          Breakdown of the Interview:
        </h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div
            key={index}
            className="bg-dark-200/30 p-5 rounded-xl hover:bg-dark-200/50 transition-colors duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-xl text-primary-100">
                {index + 1}. {category.name}
              </p>
              <div className="bg-dark-300 px-4 py-1 rounded-full">
                <p className="font-bold text-primary-200">
                  {category.score}/100
                </p>
              </div>
            </div>
            <p className="text-light-100/90">{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-dark-200/30 p-6 rounded-xl">
          <h3 className="text-primary-100 mb-4 flex items-center gap-2">
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
              <path d="M5 12l5 5 9-9"></path>
            </svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="pl-2">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-dark-200/30 p-6 rounded-xl">
          <h3 className="text-primary-100 mb-4 flex items-center gap-2">
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
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="pl-2">
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="buttons mt-8">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Page;
