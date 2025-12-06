import { useParams } from "react-router-dom";
import LoginModal from "./LoginModal.jsx";

export default function LoginModalWrapper() {
  const { token } = useParams(); 

  return (
    <LoginModal open={true} openResetByLink={true} tokenFromLink={token}/>
  );
}
