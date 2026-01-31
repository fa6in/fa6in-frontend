import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FcHighPriority, FcLock } from "react-icons/fc";
import notFoundImage from "../assets/images/not.png";

type ErrorPageProps = {
  status?: "404" | "403" | "error";
  message?: string;
};

function ErrorPage({
  status = "404",
  message = "هذه الصفحة غير موجودة.",
}: ErrorPageProps) {
  const navigate = useNavigate();

  const errorConfig = {
    "404": {
      title: "404",
      subTitle: "هذه الصفحة غير موجودة.",
      icon: (
        <img
          src={notFoundImage}
          alt="404"
          className="w-[300px] mx-auto mb-6"
        />
      ),
    },
    "403": {
      title: "403",
      subTitle: "عذرًا، لا تملك الصلاحية للوصول إلى هذه الصفحة.",
      icon: <FcLock className="text-8xl mx-auto mb-6" />,
    },
    error: {
      title: "خطأ",
      subTitle: message,
      icon: <FcHighPriority className="text-8xl mx-auto mb-6" />,
    },
  };

  const { title, subTitle, icon } =
    errorConfig[status] || errorConfig["404"];

  return (
    <div
      dir="rtl"
      className="flex h-screen items-center justify-center bg-gray-100"
    >
      <div className="text-center shadow-lg p-8 rounded-lg max-w-md bg-white">
        {icon}

        <h1 className="text-4xl font-bold text-main-color mb-2">
          {title}
        </h1>

        <p className="text-lg text-main-color">
          {subTitle}
        </p>

        <Button
          type="primary"
          className="!w-full h-[50px] auth-button mt-7 bg-main-color"
          onClick={() => navigate("/login")}
        >
          العودة إلى الصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
