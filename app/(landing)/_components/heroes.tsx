import React from "react";
import Image from "next/image";

const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl m-0">
      <div className="flex items-center">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]">
          <Image
            src="/landing-documents.svg"
            fill
            className="object-contain"
            alt="Landing Documents"
          />
          {/* TODO: Change image for dark mode when found. Fix overflow image in dark mode. */}
        </div>
      </div>
    </div>
  );
};

export default Heroes;
