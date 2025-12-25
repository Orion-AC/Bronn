import { Navbar } from '../components/landing/Navbar';
import { ModularHero } from '../components/landing/ModularHero';
import { WorkflowStory } from '../components/landing/WorkflowStory';
import { VisualBuilderSection } from '../components/landing/VisualBuilderSection';
import { BentoGrid } from '../components/landing/BentoGrid';
import { TrustedBy } from '../components/landing/TrustedBy';
import { AliveSection } from '../components/landing/AliveSection';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
    return (
        <div className="bg-black min-h-screen text-white selection:bg-indigo-500/30 font-sans">
            <Navbar />
            <ModularHero />
            <TrustedBy />
            <WorkflowStory />
            <VisualBuilderSection />
            <BentoGrid />
            <AliveSection />
            <Footer />
        </div>
    );
};
