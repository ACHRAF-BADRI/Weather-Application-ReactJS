import Link from "next/link";
import { useEffect } from "react";

const Navbar = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.bootstrapInitialized) {
      const script = document.createElement('script');
      script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
      script.onload = () => {
        const popperScript = document.createElement('script');
        popperScript.src = "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js";
        popperScript.onload = () => {
          const bootstrapScript = document.createElement('script');
          bootstrapScript.src = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js";
          document.body.appendChild(bootstrapScript);
        };
        document.body.appendChild(popperScript);
      };
      document.body.appendChild(script);

      window.bootstrapInitialized = true;
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link href="/index" legacyBehavior>
          <a className="navbar-brand">Weather App</a>
        </Link>
        <span className="navbar-text">by EL BADRI ACHRAF</span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link href="/index" legacyBehavior>
                <a className="btn btn-primary mr-2 bg-dark border-dark">Home</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" legacyBehavior>
                <a className="btn btn-primary mr-2 bg-dark border-dark">Contact</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/other" legacyBehavior>
                <a className="btn btn-primary mr-2 bg-dark border-dark">Other</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: black;
          border-radius: 4px;
        }

        .btn {
          border-radius: 17px;
        }

        .btn-outline-light:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
