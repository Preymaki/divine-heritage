import HeroSection from '@components/home/HeroSection'
import TrustIndicators from '@components/home/TrustIndicators'
import AboutPreview from '@components/home/AboutPreview'
import ServicesSection from '@components/home/ServicesSection'
import WhyChooseUs from '@components/home/WhyChooseUs'
import MeetChildminder from '@components/home/MeetChildminder'
import DailyActivities from '@components/home/DailyActivities'
import GalleryPreview from '@components/home/GalleryPreview'
import TestimonialsSection from '@components/home/TestimonialsSection'
import FAQsSection from '@components/home/FAQsSection'
import CTASection from '@components/home/CTASection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <AboutPreview />
      <ServicesSection />
      <WhyChooseUs />
      <MeetChildminder />
      <DailyActivities />
      <GalleryPreview />
      <TestimonialsSection />
      <FAQsSection />
      <CTASection />
    </>
  )
}
