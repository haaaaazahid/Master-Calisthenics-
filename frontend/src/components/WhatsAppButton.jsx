import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/918433599778"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full text-3xl z-50 hover:scale-110 transition"
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppButton;