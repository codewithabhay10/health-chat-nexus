import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6" id = "footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-health-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">HC</span>
              </div>
              <span className="font-semibold text-xl">HealthChat</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Breaking language barriers in healthcare with multilingual AI and professional support.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span className="text-xs">Change language</span>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {["Features", "AI Chatbot", "For Patients", "For Doctors", "Security"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {["About Us", "Careers", "Blog", "Press", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {["Terms", "Privacy", "Cookies", "Licenses", "Settings"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HealthChat. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "Facebook", "Instagram"].map((social) => (
              <a key={social} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
