import Footer from "./_components/footer";
import Heading from "./_components/heading";
import Heroes from "./_components/heroes";

const LandingPage = () => {
  return (
    <div className="min-h-ful flex flex-col">
      <div className="h-full flex flex-col items-center justify-center flex-1 md:justify-start gap-y-8 text-center dark:bg-[#1F1F1F]">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
