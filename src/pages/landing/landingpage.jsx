/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  Public landing page for Shree Ambaji Mata Temple.
 *  Content is edited in ./landingdata.js
 *
 */

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import TrustStrip from "./components/truststrip";
import About from "./components/about";
import DarshanTimings from "./components/darshantimings";
import Services from "./components/services";
import DonationCTA from "./components/donationcta";
import Testimonials from "./components/testimonials";
import Gallery from "./components/gallery";
import FAQ from "./components/faq";
import FinalCTA from "./components/finalcta";
import Footer from "./components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-light">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <About />
        <DarshanTimings />
        <Services />
        <DonationCTA />
        <Testimonials />
        <Gallery />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
