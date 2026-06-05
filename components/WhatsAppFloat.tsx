import { MessageCircle } from "lucide-react";

const whatsappNumber = "5581994616516";
const whatsappMessage = "olá vim do site e gostaria de mais informações!";

export function WhatsAppFloat() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
