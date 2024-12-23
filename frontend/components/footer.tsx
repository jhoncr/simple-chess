import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-500">
              {" "}
              Created with{" "}
              <Heart size={24} className="inline-block text-red-500" /> by{" "}
              <a
                href="https://x.com/J3Cordeiro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors  underline-offset-4 underline"
              >
                Jhon
              </a>
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="https://github.com/jhoncr/simple-chess"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaGithub className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://x.com/J3Cordeiro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaTwitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://linkedin.com/in/cordeiroj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaLinkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
