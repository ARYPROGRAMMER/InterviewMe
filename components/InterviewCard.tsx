import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && id
      ? await getFeedbackByInterviewId({
          interviewId: id,
          userId,
        })
      : null;
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 bg-light-600/80 backdrop-blur-sm rounded-bl-lg">
            <p className="badge-text">{normalizedType}</p>
          </div>

          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-cover size-[90px] border-2 border-primary-200/30 shadow-md"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIGZpbGw9IiMxNzE1MzIiLz48L3N2Zz4="
          />

          <h3 className="mt-5 capitalize text-primary-100">{role} Interview</h3>

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                alt="calendar"
                width={22}
                height={22}
              />

              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="start" width={22} height={22} />

              <p
                className={
                  feedback?.totalScore ? "text-primary-200 font-semibold" : ""
                }
              >
                {feedback?.totalScore || "---"}/100
              </p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken the interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary">
            <Link
              href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}
            >
              {feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
