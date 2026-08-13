import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationList from "@/components/NotificationList";

export default function Notifications() {
  return <div className="min-h-screen bg-background text-foreground"><Navbar /><main className="container py-8 md:py-12"><NotificationList /></main><Footer /></div>;
}
