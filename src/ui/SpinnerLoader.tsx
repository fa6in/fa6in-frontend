

import { HashLoader } from "react-spinners";

function SpinnerLoader() {
  return (
    <div className="flex justify-center items-center fixed inset-0 bg-white bg-opacity-50 z-50">
      <div className="flex flex-col justify-center items-center">
        <HashLoader color="#141317" size={100} />
      </div>
    </div>
  );
}

export default SpinnerLoader;