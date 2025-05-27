import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FcHighPriority, FcLock } from "react-icons/fc";
import notFoundImage from "../assets/images/not.png"; // Remplacez par votre image

type ErrorPageProps = {
  status?: "404" | "403" | "error";
  message?: string;
};

function ErrorPage({ status = "error", message = "Something went wrong" }: ErrorPageProps) {
  const navigate = useNavigate();

  const errorConfig = {
    "404": {
      title: "404",
      subTitle: "Désolé, la page que vous cherchez n'existe pas.",
      icon: <img src={notFoundImage} alt="404 Not Found" className="w-[300px] mx-auto mb-6" />,
    },
    "403": {
      title: "403",
      subTitle: "Désolé, vous n'êtes pas autorisé à accéder à cette page.",
      icon: <FcLock className="text-8xl mx-auto mb-6" />,
    },
    error: {
      title: "Erreur",
      subTitle: message,
      icon: <FcHighPriority className="text-8xl mx-auto mb-6" />,
    },
  };

  const { title, subTitle, icon } = errorConfig[status] || errorConfig["error"];

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 ">
      <div className="text-center   shadow-lg p-8 rounded-lg max-w-md">
        {icon}
        <h1 className="text-4xl font-bold  text-main-color">{title}</h1>
        <p className="text-lg text-main-color">{subTitle}</p>
        <Button
          type="primary"

          className="!w-full h-[50px]  auth-button mt-7 bg-main-color"
          onClick={() => navigate("/login")}
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;