

// import { MoonLoader } from "react-spinners";

function SpinnerLoader() {
  return (
    // <div className="flex justify-center items-center fixed inset-0 bg-white bg-opacity-50 z-50">
    //   <div className="flex flex-col justify-center items-center">
    //     <MoonLoader  color="#17ab5b" size={50} />
    //   </div>
    // </div>
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main-color"></div>
    </div>
  );
}

export default SpinnerLoader;