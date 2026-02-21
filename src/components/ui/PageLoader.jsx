import LogoLoader from "./LogoLoader";

const PageLoader = () => {
 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl">
   <div className="flex flex-col items-center gap-4">
    <LogoLoader size={72} />
    <p className="text-[#002b11]/40 text-xs font-medium tracking-widest uppercase">
     Loading
    </p>
   </div>
  </div>
 );
};

export default PageLoader;
