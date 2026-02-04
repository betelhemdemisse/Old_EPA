import Page_404 from "../assets/404_page.png";
import { useNavigate } from "react-router-dom";
import { getHomeRoute } from "../utils/getHomeRoute";

export default function NotFoundPage({ permissions = [] }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const homeRoute = getHomeRoute(permissions);
    navigate(homeRoute, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <img
        src={Page_404}
        alt="404 - Page Not Found"
        className="max-w-md w-full mb-6"
      />

      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Page Not Found
      </h1>

      <p className="text-gray-500 text-center mb-6">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={handleGoHome}
        className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
      >
        Go Home
      </button>
    </div>
  );
}
