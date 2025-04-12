import { cn, getTechLogos } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {techIcons.map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex-center transition-all duration-200 hover:scale-110 hover:z-10 hover:bg-dark-200 border border-transparent hover:border-primary-200/30",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>
          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}

      {techStack.length > 3 && (
        <div className="relative group bg-dark-300 rounded-full p-2 flex-center -ml-3 transition-all duration-200 hover:scale-110 hover:z-10 hover:bg-dark-200 border border-transparent hover:border-primary-200/30">
          <span className="tech-tooltip">
            {techStack.length - 3} more technologies
          </span>
          <span className="text-xs text-primary-200 font-bold">
            +{techStack.length - 3}
          </span>
        </div>
      )}
    </div>
  );
};

export default DisplayTechIcons;
