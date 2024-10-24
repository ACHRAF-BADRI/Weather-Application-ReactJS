import Link from "next/link";
import Navbar from '../component/weatherNavbar';
import Footer from '../component/weatherFooter';

const AutrePage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mt-4" id="container">
        <div id="main">
          <header className="text-center mb-4">
            <h1>Autre</h1>
          </header>

          <div className="contact mb-4 p-4 border rounded">
            <h2>ACHRAF EL BADRI</h2>
            <p>Email: achraf1@gmail.com</p>
            <p>Phone: (33) 555-7490-99</p>
          </div>

          <div className="text-center mt-4 mb-5">
            <Link href="/app" legacyBehavior>
              <a className="btn btn-primary mr-2 bg-dark border-dark">Home</a>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AutrePage;
