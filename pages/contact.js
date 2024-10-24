import Navbar from '../component/weatherNavbar';
import Footer from '../component/weatherFooter';

const ContactPage = () => {
  return (
    <div>
      <Navbar/>
      <div id="container" className="container">
        <div id="main">
          <h1>Contact Us</h1>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" className="form-control" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" className="form-control" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea id="message" name="message" rows="5" className="form-control" required></textarea>
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary mr-2 bg-dark border-dark">Submit</button>
            </div>
          </form>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ContactPage;
